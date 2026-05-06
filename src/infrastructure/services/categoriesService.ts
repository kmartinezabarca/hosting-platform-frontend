import apiClient from '@presentation/components/features/apiClient';
import type { ApiResponse } from '@core/entities/api';
import type { ServicePlan } from '@core/entities/models';

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  plans?: ServicePlan[];
  [key: string]: unknown;
}

/**
 * Servicio para operaciones relacionadas con categorías
 */
const categoriesService = {
  /**
   * Obtener todas las categorías
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  /**
   * Obtener categorías con sus planes incluidos
   */
  getCategoriesWithPlans: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories/with-plans');
    return response.data;
  },

  /**
   * Obtener categoría por slug
   */
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return response.data;
  },
};

export default categoriesService;
