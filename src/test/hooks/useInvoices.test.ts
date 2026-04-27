import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  useInvoices,
  useInvoiceStats,
  usePaymentMethods,
  useProcessPayment,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
  useUpdateInvoiceFiscalData,
} from '../../hooks/useInvoices';
import { queryWrapper, createTestQueryClient } from '../utils';
import { server } from '../mocks/server';

const API = 'http://localhost:8000/api';

// ─── useInvoices ─────────────────────────────────────────────────────────────

describe('useInvoices', () => {
  it('obtiene la lista de facturas paginada', async () => {
    const { result } = renderHook(() => useInvoices({}), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invoices = result.current.data as any[];
    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBeGreaterThanOrEqual(1);
    expect(invoices[0]).toMatchObject({
      invoice_number: 'INV-2025-001',
      status: 'paid',
    });
  });

  it('devuelve array vacío si no hay facturas', async () => {
    server.use(
      http.get(`${API}/invoices`, () =>
        HttpResponse.json({ data: { data: [], current_page: 1, last_page: 1, total: 0 } })
      )
    );

    const { result } = renderHook(() => useInvoices({}), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it('expone isError si el servidor falla', async () => {
    server.use(
      http.get(`${API}/invoices`, () =>
        HttpResponse.json({ message: 'Error interno' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useInvoices({}), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useInvoiceStats ─────────────────────────────────────────────────────────

describe('useInvoiceStats', () => {
  it('obtiene las estadísticas de facturas', async () => {
    const { result } = renderHook(() => useInvoiceStats(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      total_paid: expect.any(Number),
      total_pending: expect.any(Number),
    });
  });
});

// ─── usePaymentMethods ───────────────────────────────────────────────────────

describe('usePaymentMethods', () => {
  it('obtiene los métodos de pago del usuario', async () => {
    const { result } = renderHook(() => usePaymentMethods(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const methods = result.current.data as any[];
    expect(methods).toHaveLength(1);
    expect(methods[0]).toMatchObject({
      brand: 'visa',
      last4: '4242',
      is_default: true,
    });
  });

  it('devuelve array vacío si no hay métodos', async () => {
    server.use(
      http.get(`${API}/payments/methods`, () =>
        HttpResponse.json({ data: [] })
      )
    );

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it('maneja error 401 sin romper la app', async () => {
    server.use(
      http.get(`${API}/payments/methods`, () =>
        HttpResponse.json({ message: 'No autenticado' }, { status: 401 })
      )
    );

    const { result } = renderHook(() => usePaymentMethods(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useProcessPayment ───────────────────────────────────────────────────────

describe('useProcessPayment', () => {
  it('procesa un pago exitosamente e invalida facturas', async () => {
    const qc = createTestQueryClient();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useProcessPayment(), { wrapper: queryWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync({
        invoice_uuid: 'inv-uuid-2',
        payment_method_id: 'pm_test_visa',
      });
    });

    expect(result.current.isSuccess).toBe(true);
    // onSuccess debe llamar invalidateQueries para refrescar facturas y transacciones
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['invoices'] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['transactions'] }));
  });

  it('falla si el pago es rechazado (402)', async () => {
    server.use(
      http.post(`${API}/payments/process`, () =>
        HttpResponse.json({ message: 'Tarjeta rechazada' }, { status: 402 })
      )
    );

    const { result } = renderHook(() => useProcessPayment(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ invoice_uuid: 'inv-uuid-2', payment_method_id: 'pm_bad' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('falla con 422 si faltan datos requeridos', async () => {
    server.use(
      http.post(`${API}/payments/process`, () =>
        HttpResponse.json({ message: 'Datos inválidos', errors: { invoice_uuid: ['required'] } }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useProcessPayment(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({} as any);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useSetDefaultPaymentMethod ──────────────────────────────────────────────

describe('useSetDefaultPaymentMethod', () => {
  it('establece un método de pago como predeterminado e invalida caché', async () => {
    const qc = createTestQueryClient();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useSetDefaultPaymentMethod(), { wrapper: queryWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync(2);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['paymentMethods'] })
    );
  });

  it('falla si el método no existe (404)', async () => {
    server.use(
      http.put(`${API}/payments/methods/:id`, () =>
        HttpResponse.json({ message: 'No encontrado' }, { status: 404 })
      )
    );

    const { result } = renderHook(() => useSetDefaultPaymentMethod(), { wrapper: queryWrapper() });

    act(() => { result.current.mutate(999); });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useDeletePaymentMethod ──────────────────────────────────────────────────

describe('useDeletePaymentMethod', () => {
  it('elimina un método de pago e invalida caché', async () => {
    const qc = createTestQueryClient();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useDeletePaymentMethod(), { wrapper: queryWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync(1);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['paymentMethods'] })
    );
  });

  it('falla si el método no existe (404)', async () => {
    server.use(
      http.delete(`${API}/payments/methods/:id`, () =>
        HttpResponse.json({ message: 'No encontrado' }, { status: 404 })
      )
    );

    const { result } = renderHook(() => useDeletePaymentMethod(), { wrapper: queryWrapper() });

    act(() => { result.current.mutate(999); });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('falla si se intenta eliminar el único método de pago (422)', async () => {
    server.use(
      http.delete(`${API}/payments/methods/:id`, () =>
        HttpResponse.json({ message: 'No puedes eliminar el único método de pago' }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useDeletePaymentMethod(), { wrapper: queryWrapper() });

    act(() => { result.current.mutate(1); });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useUpdateInvoiceFiscalData ──────────────────────────────────────────────

describe('useUpdateInvoiceFiscalData', () => {
  it('actualiza datos fiscales de una factura dentro de la ventana de 72h', async () => {
    const qc = createTestQueryClient();
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateInvoiceFiscalData(), { wrapper: queryWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync({
        uuid: 'inv-uuid',
        rfc: 'XAXX010101000',
        business_name: 'Mi Empresa SA',
        postal_code: '06600',
        fiscal_regime_code: '612',
        cfdi_use_code: 'G03',
      });
    });

    expect(result.current.isSuccess).toBe(true);
    // onSuccess debe invalidar la caché de facturas para reflejar el nuevo estado CFDI
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['invoices'] })
    );
  });

  it('falla si la ventana de 72h expiró (422)', async () => {
    server.use(
      http.put(`${API}/invoices/:uuid/fiscal-data`, () =>
        HttpResponse.json({ message: 'La ventana para actualizar datos fiscales ha expirado' }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useUpdateInvoiceFiscalData(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ uuid: 'inv-uuid', rfc: 'XAXX010101000' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('falla si el RFC es inválido (422)', async () => {
    server.use(
      http.put(`${API}/invoices/:uuid/fiscal-data`, () =>
        HttpResponse.json({ message: 'RFC inválido', errors: { rfc: ['El RFC no tiene el formato correcto'] } }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useUpdateInvoiceFiscalData(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ uuid: 'inv-uuid', rfc: 'INVALIDO' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
