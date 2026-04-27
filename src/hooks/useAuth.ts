import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';

/**
 * Hook para iniciar sesión
 */
export const useLogin = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

/**
 * Hook para iniciar sesión con Google
 */
export const useLoginWithGoogle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

/**
 * Hook para registrar usuario
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data && data.user) {
        queryClient.setQueryData(['auth', 'me'], { data: data.user });
      } else {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    },
    onError: (error) => {
      console.error("Error al registrar usuario", error);
    },
  });
};

/**
 * Hook para verificar 2FA
 */
export const useVerify2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.verify2FA,
    onSuccess: (data) => {
      if (data && data.user) {
        queryClient.setQueryData(['auth', 'me'], { data: data.user });
      } else {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    },
    onError: (error) => {
      console.error("Error al verificar 2FA", error);
    },
  });
};

/**
 * Hook para cerrar sesión
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al cerrar sesión", error);
    },
  });
};

