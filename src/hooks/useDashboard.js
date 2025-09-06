import { useQuery } from '@tanstack/react-query';
// Asegúrate de que el nombre del servicio importado sea el correcto.
// Si tu servicio se llama dashboardService, úsalo.
import { dashboardService } from '../services/dashboardService'; 

/**
 * Hook para obtener estadísticas del dashboard.
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'], 
    queryFn: () => dashboardService.getStats(),
    select: (response) => response.data, 
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener los servicios del usuario para el dashboard.
 */
export const useDashboardServices = () => {
  return useQuery({
    queryKey: ['dashboard', 'services'],
    queryFn: () => dashboardService.getServices(),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener la actividad reciente del dashboard.
 */
export const useDashboardActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardService.getActivity(),
    select: (response) => response.data,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: true,
  });
};
