import apiClient from './apiClient';

/**
 * Servicio para operaciones relacionadas con planes de servicio
 */
const servicePlansService = {
  /**
   * Obtener todos los planes de servicio
   */
  getServicePlans: async (categoryId = null) => {
    const endpoint = categoryId 
      ? `/service-plans?category_id=${categoryId}` 
      : '/service-plans';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Obtener planes de servicio por slug de categoría
   */
  getServicePlansByCategorySlug: async (categorySlug) => {
    const response = await apiClient.get(`/service-plans/category/${categorySlug}`);
    return response.data;
  },

  /**
   * Obtener plan de servicio específico por UUID
   */
  getServicePlan: async (uuid) => {
    const response = await apiClient.get(`/service-plans/${uuid}`);
    return response.data;
  },
};

export default servicePlansService;

