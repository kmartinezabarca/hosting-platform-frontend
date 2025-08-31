import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sessionsService from '../services/sessionsService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener sesiones/dispositivos activos
 */
export const useSessions = (options = {}) => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsService.getSessions,
    select: (data) => data.data || [],
    ...queryConfigs.session, // Usar configuración para datos de sesión
    ...options,
    onError: (error) => {
      console.error("Error al obtener sesiones activas", error);
    },
  });
};

/**
 * Hook para cerrar sesión en un dispositivo específico
 */
export const useLogoutSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionsService.logoutSession,
    onMutate: async (sessionId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['sessions'] });
      
      // Snapshot del estado anterior
      const previousSessions = queryClient.getQueryData(['sessions']);
      
      // Optimistic update: remover sesión inmediatamente
      queryClient.setQueryData(['sessions'], (old) => ({
        ...old,
        data: old?.data?.filter(session => 
          (session.uuid || session.id) !== sessionId
        ) || []
      }));
      
      return { previousSessions };
    },
    onError: (err, sessionId, context) => {
      // Revertir en caso de error
      queryClient.setQueryData(['sessions'], context.previousSessions);
      console.error("Error al cerrar sesión", err);
    },
    onSettled: () => {
      // Refetch para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

/**
 * Hook para cerrar sesión en otros dispositivos
 */
export const useLogoutOtherSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionsService.logoutOtherSessions,
    onSuccess: () => {
      // Invalidar sesiones tras logout masivo
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      console.error("Error al cerrar otras sesiones", error);
    },
  });
};

