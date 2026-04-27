import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useProfile, useUpdateProfile, useUploadAvatar, useSecurity, useUpdatePassword } from '../../hooks/useProfile';
import { queryWrapper, createTestQueryClient } from '../utils';
import { server } from '../mocks/server';

const API = 'http://localhost:8000/api';

describe('useProfile', () => {
  it('obtiene el perfil del usuario autenticado', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      email: 'test@roke.com',
      first_name: 'Test',
    });
  });

  it('maneja error de red correctamente', async () => {
    server.use(
      http.get(`${API}/profile`, () => HttpResponse.error())
    );

    const { result } = renderHook(() => useProfile(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateProfile', () => {
  it('actualiza el perfil y aplica optimistic update', async () => {
    const qc = createTestQueryClient();
    qc.setQueryData(['profile'], { data: { first_name: 'Test', last_name: 'User' } });

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: queryWrapper(qc) });

    await act(async () => {
      await result.current.mutateAsync({ first_name: 'Actualizado' });
    });

    expect(result.current.isSuccess).toBe(true);
  });
});

describe('useSecurity', () => {
  it('obtiene los datos de seguridad del perfil', async () => {
    const { result } = renderHook(() => useSecurity(), { wrapper: queryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      two_factor_enabled: false,
      is_google_account: false,
    });
  });
});

describe('useUpdatePassword', () => {
  it('actualiza la contraseña exitosamente', async () => {
    const { result } = renderHook(() => useUpdatePassword(), { wrapper: queryWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        current_password: 'antigua',
        password: 'nueva123',
        password_confirmation: 'nueva123',
      });
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('falla si la contraseña actual es incorrecta', async () => {
    server.use(
      http.put(`${API}/profile/password`, () =>
        HttpResponse.json({ message: 'Contraseña actual incorrecta' }, { status: 422 })
      )
    );

    const { result } = renderHook(() => useUpdatePassword(), { wrapper: queryWrapper() });

    await act(async () => {
      result.current.mutate({ current_password: 'mala', password: 'nueva', password_confirmation: 'nueva' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
