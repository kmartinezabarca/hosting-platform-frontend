import { useQuery } from '@tanstack/react-query';
import servicePlansService from '../services/servicePlansService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener planes de servicio
 */
export const useServicePlans = (categoryId: any = null, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['servicePlans', categoryId],
    queryFn: () => servicePlansService.getServicePlans(categoryId),
    select: (data: any) => data.data || [],
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook para obtener planes de servicio por slug de categoría
 */
export const useServicePlansByCategorySlug = (categorySlug: any, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['servicePlansByCategory', categorySlug],
    queryFn: () => servicePlansService.getServicePlansByCategorySlug(categorySlug),
    select: (data: any) => data.data || [],
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!categorySlug,
    ...options,
  });
};

/**
 * Hook para obtener plan de servicio específico
 */
export const useServicePlan = (uuid: any, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['servicePlan', uuid],
    queryFn: () => servicePlansService.getServicePlan(uuid),
    select: (data: any) => data.data,
    ...queryConfigs.static,
    enabled: !!uuid,
    ...options,
  });
};
