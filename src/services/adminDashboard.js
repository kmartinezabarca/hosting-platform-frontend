import api from './api';

const adminDashboardService = {
  // Obtener estadísticas generales del dashboard
  getStats: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/stats?period=${period}`);
    return response.data;
  },

  // Obtener datos para gráficos de ingresos
  getRevenueChart: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/revenue-chart?period=${period}`);
    return response.data;
  },

  // Obtener distribución de servicios
  getServicesDistribution: async () => {
    const response = await api.get('/admin/dashboard/services-distribution');
    return response.data;
  },

  // Obtener distribución de tickets por prioridad
  getTicketsPriority: async () => {
    const response = await api.get('/admin/dashboard/tickets-priority');
    return response.data;
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/admin/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  },

  // Obtener estado del sistema
  getSystemHealth: async () => {
    const response = await api.get('/admin/dashboard/system-health');
    return response.data;
  },

  // Obtener métricas de usuarios
  getUsersMetrics: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/users-metrics?period=${period}`);
    return response.data;
  },

  // Obtener métricas de servicios
  getServicesMetrics: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/services-metrics?period=${period}`);
    return response.data;
  },

  // Obtener métricas de ingresos
  getRevenueMetrics: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/revenue-metrics?period=${period}`);
    return response.data;
  },

  // Obtener métricas de tickets
  getTicketsMetrics: async (period = 'month') => {
    const response = await api.get(`/admin/dashboard/tickets-metrics?period=${period}`);
    return response.data;
  }
};

export default adminDashboardService;

