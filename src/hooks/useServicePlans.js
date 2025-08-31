import { useQuery } from '@tanstack/react-query';
import servicePlansService from '../services/servicePlansService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener planes de servicio
 */
export const useServicePlans = (categoryId = null, options = {}) => {
  return useQuery({
    queryKey: ['servicePlans', categoryId],
    queryFn: () => servicePlansService.getServicePlans(categoryId),
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    ...options,
    onError: (error) => {
      console.error("Error al obtener planes de servicio", error);
    },
  });
};

/**
 * Hook para obtener planes de servicio por slug de categoría
 */
export const useServicePlansByCategorySlug = (categorySlug, options = {}) => {
  return useQuery({
    queryKey: ['servicePlansByCategory', categorySlug],
    queryFn: () => servicePlansService.getServicePlansByCategorySlug(categorySlug),
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    enabled: !!categorySlug, // Solo ejecutar si hay categorySlug
    ...options,
    onError: (error) => {
      console.error(`Error al obtener planes para categoría ${categorySlug}`, error);
    },
  });
};

/**
 * Hook para obtener plan de servicio específico
 */
export const useServicePlan = (uuid, options = {}) => {
  return useQuery({
    queryKey: ['servicePlan', uuid],
    queryFn: () => servicePlansService.getServicePlan(uuid),
    select: (data) => data.data,
    ...queryConfigs.static, // Usar configuración para datos estáticos
    enabled: !!uuid, // Solo ejecutar si hay uuid
    ...options,
    onError: (error) => {
      console.error(`Error al obtener plan ${uuid}`, error);
    },
  });
};

