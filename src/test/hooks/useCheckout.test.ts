import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { usePaymentMethods } from '../../hooks/useCheckout';
import { queryWrapper } from '../utils';
import { server } from '../mocks/server';

const API = 'http://localhost:8000/api';

describe('usePaymentMethods', () => {
  it('obtiene los métodos de pago del usuario', async () => {
    const { result } = renderHook(() => usePaymentMethods(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0]).toMatchObject({ brand: 'visa', last4: '4242' });
  });

  it('devuelve arreglo vacío si no hay métodos de pago', async () => {
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
