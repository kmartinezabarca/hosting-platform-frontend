import api from './api';

const adminServicesService = {
  // Obtener todos los servicios (admin)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.plan_id) queryParams.append('plan_id', params.plan_id);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/services?${queryString}` : '/admin/services';
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener un servicio específico
  getById: async (id) => {
    const response = await api.get(`/admin/services/${id}`);
    return response.data;
  },

  // Crear nuevo servicio
  create: async (serviceData) => {
    const response = await api.post('/admin/services', serviceData);
    return response.data;
  },

  // Actualizar servicio
  update: async (id, serviceData) => {
    const response = await api.put(`/admin/services/${id}`, serviceData);
    return response.data;
  },

  // Eliminar servicio
  delete: async (id) => {
    const response = await api.delete(`/admin/services/${id}`);
    return response.data;
  },

  // Cambiar estado del servicio
  changeStatus: async (id, status) => {
    const response = await api.patch(`/admin/services/${id}/status`, { status });
    return response.data;
  },

  // Suspender servicio
  suspend: async (id, reason) => {
    const response = await api.patch(`/admin/services/${id}/suspend`, { reason });
    return response.data;
  },

  // Reactivar servicio
  reactivate: async (id) => {
    const response = await api.patch(`/admin/services/${id}/reactivate`);
    return response.data;
  },

  // Obtener estadísticas de servicios
  getStats: async () => {
    const response = await api.get('/admin/services/stats');
    return response.data;
  },

  // Obtener servicios por usuario
  getByUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/services`);
    return response.data;
  },

  // Obtener historial de un servicio
  getHistory: async (id) => {
    const response = await api.get(`/admin/services/${id}/history`);
    return response.data;
  }
};

export default adminServicesService;

