import apiClient from './apiClient';

const usersService = {
  // Obtener todos los usuarios (admin)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener un usuario específico
  getById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  create: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Cambiar estado del usuario
  changeStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // Obtener estadísticas de usuarios
  getStats: async () => {
    const response = await apiClient.get('/admin/users/stats');
    return response.data;
  },

  // Obtener actividad reciente de usuarios
  getRecentActivity: async (limit = 10) => {
    const response = await apiClient.get(`/admin/users/recent-activity?limit=${limit}`);
    return response.data;
  }
};

export default usersService;

