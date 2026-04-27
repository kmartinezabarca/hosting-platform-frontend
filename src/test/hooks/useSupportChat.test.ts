import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useSupportChat, useUnreadChatCount } from '../../hooks/useSupportChat';
import { queryWrapper } from '../utils';
import { server } from '../mocks/server';

const API = 'http://localhost:8000/api';

// Mock de AuthContext y echoService
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uuid: 'test-uuid', id: 1 },
    isAuthenticated: true,
    isAuthReady: true,
  }),
}));

vi.mock('../../services/echoService', () => ({
  getEcho: () => ({
    private: () => ({
      listen: vi.fn().mockReturnThis(),
      stopListening: vi.fn().mockReturnThis(),
      error: vi.fn().mockReturnThis(),
      subscribed: vi.fn().mockReturnThis(),
    }),
    connector: { pusher: { connection: { bind: vi.fn(), unbind: vi.fn() } } },
  }),
}));

describe('useSupportChat', () => {
  it('obtiene la sala de soporte del usuario', async () => {
    const { result } = renderHook(() => useSupportChat(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isLoadingRoom).toBe(false));

    expect(result.current.supportRoom).toMatchObject({ id: 42, uuid: 'room-uuid' });
  });

  it('obtiene mensajes cuando hay sala disponible', async () => {
    const { result } = renderHook(() => useSupportChat(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.messages.length).toBeGreaterThan(0));

    expect(result.current.messages[0]).toMatchObject({
      message: 'Hola, necesito ayuda',
    });
  });

  it('devuelve error cuando falla la obtención de sala', async () => {
    server.use(
      http.get(`${API}/chat/support-room`, () =>
        HttpResponse.json({ message: 'No autorizado' }, { status: 401 })
      )
    );

    const { result } = renderHook(() => useSupportChat(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.roomError).toBeTruthy());
  });

  it('no fetchea si el usuario no está autenticado', async () => {
    vi.doMock('../../context/AuthContext', () => ({
      useAuth: () => ({ user: null, isAuthenticated: false, isAuthReady: true }),
    }));

    // Con enabled=false no debe disparar ninguna query
    const { result } = renderHook(() => useSupportChat({ enabled: false }), {
      wrapper: queryWrapper(),
    });

    expect(result.current.isLoadingRoom).toBe(false);
    expect(result.current.supportRoom).toBeUndefined();
  });
});

describe('useUnreadChatCount', () => {
  it('obtiene el contador de mensajes no leídos', async () => {
    const { result } = renderHook(() => useUnreadChatCount(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.unreadCount).toBe(3);
  });

  it('devuelve 0 cuando la respuesta falla', async () => {
    server.use(
      http.get(`${API}/chat/unread-count`, () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useUnreadChatCount(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // El valor por defecto es 0
    expect(result.current.unreadCount).toBe(0);
  });
});
