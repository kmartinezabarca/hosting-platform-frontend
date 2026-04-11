import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useLogin, useLogout, useRegister, useVerify2FA } from '../../hooks/useAuth';
import { queryWrapper, createTestQueryClient } from '../utils';
import { server } from '../mocks/server';

const API = 'http://localhost:8000/api';

describe('useLogin', () => {
  it('llama a /auth/login y devuelve los datos del usuario', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@roke.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('falla si el servidor responde 422', async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ message: 'Credenciales inválidas' }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useLogin(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ email: 'bad@roke.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useLogout', () => {
  it('llama a /auth/logout y limpia la cache de auth', async () => {
    const qc = createTestQueryClient();
    qc.setQueryData(['auth', 'me'], { data: { id: 1, email: 'test@roke.com' } });

    const { result } = renderHook(() => useLogout(), { wrapper: queryWrapper(qc) });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Tras removeQueries el dato queda undefined (no null)
    expect(qc.getQueryData(['auth', 'me'])).toBeUndefined();
  });
});

describe('useRegister', () => {
  it('registra un usuario nuevo exitosamente', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({
        first_name: 'Nuevo',
        last_name: 'Usuario',
        email: 'nuevo@roke.com',
        password: 'password123',
        password_confirmation: 'password123',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('falla si el email ya está registrado', async () => {
    server.use(
      http.post(`${API}/auth/register`, () =>
        HttpResponse.json({ message: 'El email ya está en uso' }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useRegister(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ email: 'existente@roke.com', password: '123' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useVerify2FA', () => {
  it('verifica el código 2FA correctamente', async () => {
    const { result } = renderHook(() => useVerify2FA(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ code: '123456' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('falla si el código 2FA es inválido', async () => {
    server.use(
      http.post(`${API}/auth/2fa/verify`, () =>
        HttpResponse.json({ message: 'Código inválido' }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useVerify2FA(), { wrapper: queryWrapper() });

    act(() => {
      result.current.mutate({ code: '000000' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
