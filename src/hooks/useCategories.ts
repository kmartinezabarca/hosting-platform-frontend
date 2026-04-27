import { useQuery } from '@tanstack/react-query';
import categoriesService from '../services/categoriesService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener todas las categorías
 */
export const useCategories = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
    select: (data: any) => data.data || [],
    ...queryConfigs.static,
    ...options,
  });
};

/**
 * Hook para obtener categorías con planes incluidos
 */
export const useCategoriesWithPlans = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['categoriesWithPlans'],
    queryFn: categoriesService.getCategoriesWithPlans,
    select: (data: any) => data.data || [],
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook para obtener categoría por slug
 */
export const useCategoryBySlug = (slug: any, options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getCategoryBySlug(slug),
    select: (data: any) => data.data,
    ...queryConfigs.static,
    enabled: !!slug,
    ...options,
  });
};
