import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener estadísticas del dashboard
 */
export const useDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getDashboardStats,
    select: (data) => data.data,
    ...queryConfigs.dynamic, // Usar configuración para datos dinámicos
    ...options,
    onError: (error) => {
      console.error("Error al obtener estadísticas del dashboard", error);
    },
  });
};

