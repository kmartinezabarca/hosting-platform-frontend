import api from './api';

const adminTicketsService = {
  // Obtener todos los tickets (admin)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.category) queryParams.append('category', params.category);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/tickets?${queryString}` : '/admin/tickets';
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener un ticket específico
  getById: async (id) => {
    const response = await api.get(`/admin/tickets/${id}`);
    return response.data;
  },

  // Crear nuevo ticket
  create: async (ticketData) => {
    const response = await api.post('/admin/tickets', ticketData);
    return response.data;
  },

  // Actualizar ticket
  update: async (id, ticketData) => {
    const response = await api.put(`/admin/tickets/${id}`, ticketData);
    return response.data;
  },

  // Eliminar ticket
  delete: async (id) => {
    const response = await api.delete(`/admin/tickets/${id}`);
    return response.data;
  },

  // Cambiar estado del ticket
  changeStatus: async (id, status) => {
    const response = await api.patch(`/admin/tickets/${id}/status`, { status });
    return response.data;
  },

  // Cambiar prioridad del ticket
  changePriority: async (id, priority) => {
    const response = await api.patch(`/admin/tickets/${id}/priority`, { priority });
    return response.data;
  },

  // Asignar ticket a un agente
  assign: async (id, agentId) => {
    const response = await api.patch(`/admin/tickets/${id}/assign`, { agent_id: agentId });
    return response.data;
  },

  // Agregar respuesta al ticket
  addReply: async (id, replyData) => {
    const response = await api.post(`/admin/tickets/${id}/replies`, replyData);
    return response.data;
  },

  // Obtener respuestas del ticket
  getReplies: async (id) => {
    const response = await api.get(`/admin/tickets/${id}/replies`);
    return response.data;
  },

  // Cerrar ticket
  close: async (id, reason) => {
    const response = await api.patch(`/admin/tickets/${id}/close`, { reason });
    return response.data;
  },

  // Reabrir ticket
  reopen: async (id, reason) => {
    const response = await api.patch(`/admin/tickets/${id}/reopen`, { reason });
    return response.data;
  },

  // Obtener estadísticas de tickets
  getStats: async () => {
    const response = await api.get('/admin/tickets/stats');
    return response.data;
  },

  // Obtener tickets por usuario
  getByUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/tickets`);
    return response.data;
  },

  // Obtener tickets asignados a un agente
  getByAgent: async (agentId) => {
    const response = await api.get(`/admin/agents/${agentId}/tickets`);
    return response.data;
  },

  // Obtener tickets por prioridad
  getByPriority: async (priority) => {
    const response = await api.get(`/admin/tickets/priority/${priority}`);
    return response.data;
  },

  // Obtener categorías de tickets
  getCategories: async () => {
    const response = await api.get('/admin/tickets/categories');
    return response.data;
  },

  // Obtener agentes disponibles
  getAgents: async () => {
    const response = await api.get('/admin/tickets/agents');
    return response.data;
  },

  // Obtener métricas de rendimiento
  getPerformanceMetrics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.agent_id) queryParams.append('agent_id', params.agent_id);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/tickets/performance?${queryString}` : '/admin/tickets/performance';
    
    const response = await api.get(url);
    return response.data;
  }
};

export default adminTicketsService;

