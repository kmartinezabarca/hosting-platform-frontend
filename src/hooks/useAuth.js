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
      // Limpiar cache al hacer login exitoso
      queryClient.clear();
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
      // Limpiar cache al hacer login exitoso con Google
      queryClient.clear();
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
  return useMutation({
    mutationFn: authService.register,
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
      // Limpiar cache al verificar 2FA exitosamente
      queryClient.clear();
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
      // Limpiar todo el cache al hacer logout
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Error al cerrar sesión", error);
    },
  });
};

