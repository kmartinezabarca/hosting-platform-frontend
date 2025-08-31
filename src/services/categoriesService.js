import apiClient from './apiClient';

/**
 * Servicio para operaciones relacionadas con categorías
 */
const categoriesService = {
  /**
   * Obtener todas las categorías
   */
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  /**
   * Obtener categorías con sus planes incluidos
   */
  getCategoriesWithPlans: async () => {
    const response = await apiClient.get('/categories/with-plans');
    return response.data;
  },

  /**
   * Obtener categoría por slug
   */
  getCategoryBySlug: async (slug) => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },
};

export default categoriesService;

