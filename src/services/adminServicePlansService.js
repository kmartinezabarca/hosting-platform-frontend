import apiClient from './apiClient';

const adminServicePlansService = {
  // Obtener todos los planes de servicio (admin)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/service-plans?${queryString}` : '/admin/service-plans';

    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener un plan de servicio específico
  getById: async (uuid) => {
    const response = await apiClient.get(`/admin/service-plans/${uuid}`);
    return response.data;
  },

  // Crear nuevo plan de servicio
  create: async (planData) => {
    const response = await apiClient.post('/admin/service-plans', planData);
    return response.data;
  },

  // Actualizar plan de servicio
  update: async (uuid, planData) => {
    const response = await apiClient.put(`/admin/service-plans/${uuid}`, planData);
    return response.data;
  },

  // Eliminar plan de servicio
  delete: async (uuid) => {
    const response = await apiClient.delete(`/admin/service-plans/${uuid}`);
    return response.data;
  },

  // Obtener categorías de planes de servicio
  getCategories: async () => {
    const response = await apiClient.get('/admin/service-plans/categories');
    return response.data;
  },

  // Obtener ciclos de facturación
  getBillingCycles: async () => {
    const response = await apiClient.get('/admin/billing-cycles');
    return response.data;
  },
};

export default adminServicePlansService;


