import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';

/**
 * Hook para iniciar sesión
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      // Al hacer login, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al iniciar sesión", error);
    },
  });
};

/**
 * Hook para iniciar sesión con Google
 */
export const useLoginWithGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: () => {
      // Al hacer login, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error("Error al iniciar sesión con Google", error);
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
    onSuccess: () => {
      // Al registrarse, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
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
    onSuccess: () => {
      // Al verificar 2FA, invalidamos la query del usuario para que se refresque.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
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
      // Al hacer logout, removemos la query del usuario de la caché.
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      // Opcional: setear los datos a null para una actualización instantánea en la UI
      queryClient.setQueryData(['auth', 'me'], null);
    },
    onError: (error) => {
      console.error("Error al cerrar sesión", error);
    },
  });
};

