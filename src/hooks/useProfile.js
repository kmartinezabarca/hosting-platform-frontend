import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import profileService from '../services/profileService';
import { useAuth } from '@/context/AuthContext';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener información del perfil del usuario
 */
export const useProfile = (options = {}) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    select: (data) => data.data,
    ...queryConfigs.sensitive, // Usar configuración para datos sensibles
    ...options,
    onError: (error) => {
      console.error("Error al obtener datos del perfil", error);
    },
  });
};

/**
 * Hook para actualizar información del perfil
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileService.updateProfile,
    onMutate: async (newProfile) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      
      // Snapshot del estado anterior
      const previousProfile = queryClient.getQueryData(['profile']);
      
      // Optimistic update
      queryClient.setQueryData(['profile'], (old) => ({
        ...old,
        data: { ...old?.data, ...newProfile }
      }));
      
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // Revertir en caso de error
      queryClient.setQueryData(['profile'], context.previousProfile);
      console.error("Error al actualizar perfil", err);
    },
    onSettled: () => {
      // Refetch para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

/**
 * Hook para subir avatar del usuario
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: (data) => {
      const newAvatarUrl = data.data.avatar_url;
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      queryClient.setQueryData(['profile'], (old) => ({
        ...old,
        data: { ...old?.data, avatar_url: newAvatarUrl }
      }));
      queryClient.setQueryData(['auth', 'me'], (old) => ({
        ...old,
        data: { ...old?.data, avatar_url: newAvatarUrl }
      }));
    },
    onError: (error) => {
      console.error("Error al subir avatar", error);
    },
  });
};

/**
 * Hook para obtener información de seguridad
 */
export const useSecurity = (options = {}) => {
  return useQuery({
    queryKey: ['security'],
    queryFn: profileService.getSecurity,
    select: (data) => data.data,
    ...queryConfigs.sensitive, // Usar configuración para datos sensibles
    ...options,
    onError: (error) => {
      console.error("Error al obtener datos de seguridad", error);
    },
  });
};

/**
 * Hook para actualizar contraseña
 */
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileService.updatePassword,
    onSuccess: () => {
      // Invalidar datos de seguridad tras cambio de contraseña
      queryClient.invalidateQueries({ queryKey: ['security'] });
    },
    onError: (error) => {
      console.error("Error al actualizar contraseña", error);
    },
  });
};

