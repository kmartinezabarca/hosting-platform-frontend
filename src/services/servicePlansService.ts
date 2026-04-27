import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { ServicePlan } from '@/types/models';

/**
 * Servicio para operaciones relacionadas con planes de servicio
 */
const servicePlansService = {
  /**
   * Obtener todos los planes de servicio
   */
  getServicePlans: async (categoryId: string | number | null = null): Promise<ApiResponse<ServicePlan[]>> => {
    const endpoint = categoryId
      ? `/service-plans?category_id=${categoryId}`
      : '/service-plans';
    const response = await apiClient.get<ApiResponse<ServicePlan[]>>(endpoint);
    return response.data;
  },

  /**
   * Obtener planes de servicio por slug de categoría
   */
  getServicePlansByCategorySlug: async (categorySlug: string): Promise<ApiResponse<ServicePlan[]>> => {
    const response = await apiClient.get<ApiResponse<ServicePlan[]>>(`/service-plans/category/${categorySlug}`);
    return response.data;
  },

  /**
   * Obtener plan de servicio específico por UUID
   */
  getServicePlan: async (uuid: string): Promise<ApiResponse<ServicePlan>> => {
    const response = await apiClient.get<ApiResponse<ServicePlan>>(`/service-plans/${uuid}`);
    return response.data;
  },
};

export default servicePlansService;
