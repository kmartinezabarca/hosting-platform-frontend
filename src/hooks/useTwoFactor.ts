import { useMutation, useQueryClient } from '@tanstack/react-query';
import twoFactorService from '../services/twoFactorService';

/**
 * Hook para generar código QR y secreto de 2FA
 */
export const useGenerate2FA = () => {
  return useMutation({
    mutationFn: twoFactorService.generate2FA,
    onError: (error) => {
      console.error("Error al generar 2FA", error);
    },
  });
};

/**
 * Hook para habilitar 2FA
 */
export const useEnable2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: twoFactorService.enable2FA,
    onSuccess: () => {
      // Invalidar datos de seguridad y perfil tras habilitar 2FA
      queryClient.invalidateQueries({ queryKey: ['security'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error("Error al habilitar 2FA", error);
    },
  });
};

/**
 * Hook para deshabilitar 2FA
 */
export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: twoFactorService.disable2FA,
    onSuccess: () => {
      // Invalidar datos de seguridad y perfil tras deshabilitar 2FA
      queryClient.invalidateQueries({ queryKey: ['security'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error("Error al deshabilitar 2FA", error);
    },
  });
};

