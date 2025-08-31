import { useQuery } from '@tanstack/react-query';
import categoriesService from '../services/categoriesService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener todas las categorías
 */
export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
    select: (data) => data.data || [],
    ...queryConfigs.static, // Usar configuración para datos estáticos
    ...options,
    onError: (error) => {
      console.error("Error al obtener categorías", error);
    },
  });
};

/**
 * Hook para obtener categorías con planes incluidos
 */
export const useCategoriesWithPlans = (options = {}) => {
  return useQuery({
    queryKey: ['categoriesWithPlans'],
    queryFn: categoriesService.getCategoriesWithPlans,
    select: (data) => data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutos (menos cache que datos estáticos puros)
    cacheTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    ...options,
    onError: (error) => {
      console.error("Error al obtener categorías con planes", error);
    },
  });
};

/**
 * Hook para obtener categoría por slug
 */
export const useCategoryBySlug = (slug, options = {}) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getCategoryBySlug(slug),
    select: (data) => data.data,
    ...queryConfigs.static, // Usar configuración para datos estáticos
    enabled: !!slug, // Solo ejecutar si hay slug
    ...options,
    onError: (error) => {
      console.error(`Error al obtener categoría ${slug}`, error);
    },
  });
};

