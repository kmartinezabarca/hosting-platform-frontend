import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  useDashboardStats,
  useDashboardServices,
  useDashboardActivity,
} from '../../hooks/useDashboard';
import { queryWrapper } from '../utils';
import { server } from '../mocks/server';

const API = 'http://localhost:8000/api';

// ─── useDashboardStats ───────────────────────────────────────────────────────

describe('useDashboardStats', () => {
  it('obtiene las estadísticas reales del dashboard', async () => {
    const { result } = renderHook(() => useDashboardStats(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data as any;
    expect(data).toMatchObject({
      active_services: 3,
      total_domains:   5,
      open_tickets:    1,
    });
    expect(typeof data.monthly_spend).toBe('number');
  });

  it('expone isError cuando el servidor devuelve 500', async () => {
    server.use(
      http.get(`${API}/dashboard/stats`, () =>
        HttpResponse.json({ message: 'Error interno' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useDashboardStats(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('no reintenta automáticamente en caso de error', async () => {
    let callCount = 0;
    server.use(
      http.get(`${API}/dashboard/stats`, () => {
        callCount++;
        return HttpResponse.json({ message: 'Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDashboardStats(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // retry: false → solo 1 llamada
    expect(callCount).toBe(1);
  });
});

// ─── useDashboardServices ────────────────────────────────────────────────────

describe('useDashboardServices', () => {
  it('obtiene la lista de servicios del usuario para el dashboard', async () => {
    const { result } = renderHook(() => useDashboardServices(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data0 = result.current.data as any;
    expect(Array.isArray(data0)).toBe(true);
    expect(data0).toHaveLength(3);
    expect(data0[0]).toMatchObject({ uuid: 'svc-1', status: 'active' });
  });

  it('identifica correctamente los game servers', async () => {
    const { result } = renderHook(() => useDashboardServices(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const gameServer = (result.current.data as any[]).find((s: any) => s.is_game_server);
    expect(gameServer).toBeDefined();
    expect(gameServer.type).toBe('game_server');
  });

  it('devuelve array vacío si el usuario no tiene servicios', async () => {
    server.use(
      http.get(`${API}/dashboard/services`, () =>
        HttpResponse.json({ data: [] })
      )
    );

    const { result } = renderHook(() => useDashboardServices(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it('expone isError si el servidor falla', async () => {
    server.use(
      http.get(`${API}/dashboard/services`, () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      )
    );

    const { result } = renderHook(() => useDashboardServices(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useDashboardActivity ────────────────────────────────────────────────────

describe('useDashboardActivity', () => {
  it('obtiene la actividad reciente del usuario', async () => {
    const { result } = renderHook(() => useDashboardActivity(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const dataAct = result.current.data as any[];
    expect(Array.isArray(dataAct)).toBe(true);
    expect(dataAct.length).toBeGreaterThanOrEqual(1);

    const firstItem = dataAct[0];
    expect(firstItem).toHaveProperty('type');
    expect(firstItem).toHaveProperty('description');
    expect(firstItem).toHaveProperty('created_at');
  });

  it('devuelve array vacío si no hay actividad', async () => {
    server.use(
      http.get(`${API}/dashboard/activity`, () =>
        HttpResponse.json({ data: [] })
      )
    );

    const { result } = renderHook(() => useDashboardActivity(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it('expone isError si el servidor falla', async () => {
    server.use(
      http.get(`${API}/dashboard/activity`, () =>
        HttpResponse.error()
      )
    );

    const { result } = renderHook(() => useDashboardActivity(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
