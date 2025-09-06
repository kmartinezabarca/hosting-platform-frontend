import apiClient from './apiClient';

const adminDashboardService = {
  // Obtener estadísticas generales del dashboard
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Obtener usuarios con filtros
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/users?${queryParams}`);
    return response.data;
  },

  // Obtener servicios con filtros
  getServices: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/services?${queryParams}`);
    return response.data;
  },

  // Obtener facturas con filtros
  getInvoices: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/invoices?${queryParams}`);
    return response.data;
  },

  // Obtener tickets con filtros
  getTickets: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/tickets?${queryParams}`);
    return response.data;
  },

  // Gestión de usuarios
  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // Gestión de servicios
  updateServiceStatus: async (serviceId, status, reason) => {
    const response = await apiClient.put(`/admin/services/${serviceId}/status`, { status, reason });
    return response.data;
  },

  // Gestión de facturas
  createInvoice: async (invoiceData) => {
    const response = await apiClient.post('/admin/invoices', invoiceData);
    return response.data;
  },

  updateInvoice: async (invoiceId, invoiceData) => {
    const response = await apiClient.put(`/admin/invoices/${invoiceId}`, invoiceData);
    return response.data;
  },

  updateInvoiceStatus: async (invoiceId, status, notes) => {
    const response = await apiClient.put(`/admin/invoices/${invoiceId}/status`, { status, notes });
    return response.data;
  },

  markInvoiceAsPaid: async (invoiceId, paymentMethod, notes) => {
    const response = await apiClient.post(`/admin/invoices/${invoiceId}/mark-paid`, { payment_method: paymentMethod, notes });
    return response.data;
  },

  sendInvoiceReminder: async (invoiceId) => {
    const response = await apiClient.post(`/admin/invoices/${invoiceId}/send-reminder`);
    return response.data;
  },

  cancelInvoice: async (invoiceId, reason) => {
    const response = await apiClient.post(`/admin/invoices/${invoiceId}/cancel`, { reason });
    return response.data;
  },

  // Gestión de tickets
  updateTicketStatus: async (ticketId, status) => {
    const response = await apiClient.put(`/admin/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  updateTicketPriority: async (ticketId, priority) => {
    const response = await apiClient.put(`/admin/tickets/${ticketId}/priority`, { priority });
    return response.data;
  },

  assignTicket: async (ticketId, assignedTo, status) => {
    const response = await apiClient.post(`/admin/tickets/${ticketId}/assign`, { assigned_to: assignedTo, status });
    return response.data;
  },

  addTicketReply: async (ticketId, message, isInternal = false) => {
    const response = await apiClient.post(`/admin/tickets/${ticketId}/reply`, { message, is_internal: isInternal });
    return response.data;
  },

  getTicketCategories: async () => {
    const response = await apiClient.get('/admin/tickets/categories');
    return response.data;
  },

  getSupportAgents: async () => {
    const response = await apiClient.get('/admin/support-agents');
    return response.data;
  }
};

export default adminDashboardService;

