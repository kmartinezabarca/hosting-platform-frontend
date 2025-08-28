import api from './api';

const adminInvoicesService = {
  // Obtener todas las facturas (admin)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/invoices?${queryString}` : '/admin/invoices';
    
    const response = await api.get(url);
    return response.data;
  },

  // Obtener una factura específica
  getById: async (id) => {
    const response = await api.get(`/admin/invoices/${id}`);
    return response.data;
  },

  // Crear nueva factura
  create: async (invoiceData) => {
    const response = await api.post('/admin/invoices', invoiceData);
    return response.data;
  },

  // Actualizar factura
  update: async (id, invoiceData) => {
    const response = await api.put(`/admin/invoices/${id}`, invoiceData);
    return response.data;
  },

  // Eliminar factura
  delete: async (id) => {
    const response = await api.delete(`/admin/invoices/${id}`);
    return response.data;
  },

  // Marcar factura como pagada
  markAsPaid: async (id, paymentData) => {
    const response = await api.patch(`/admin/invoices/${id}/mark-paid`, paymentData);
    return response.data;
  },

  // Marcar factura como vencida
  markAsOverdue: async (id) => {
    const response = await api.patch(`/admin/invoices/${id}/mark-overdue`);
    return response.data;
  },

  // Cancelar factura
  cancel: async (id, reason) => {
    const response = await api.patch(`/admin/invoices/${id}/cancel`, { reason });
    return response.data;
  },

  // Enviar recordatorio de pago
  sendReminder: async (id) => {
    const response = await api.post(`/admin/invoices/${id}/send-reminder`);
    return response.data;
  },

  // Generar PDF de factura
  generatePdf: async (id) => {
    const response = await api.get(`/admin/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Obtener estadísticas de facturas
  getStats: async () => {
    const response = await api.get('/admin/invoices/stats');
    return response.data;
  },

  // Obtener facturas por usuario
  getByUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/invoices`);
    return response.data;
  },

  // Obtener facturas vencidas
  getOverdue: async () => {
    const response = await api.get('/admin/invoices/overdue');
    return response.data;
  },

  // Obtener reporte de ingresos
  getRevenueReport: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/invoices/revenue-report?${queryString}` : '/admin/invoices/revenue-report';
    
    const response = await api.get(url);
    return response.data;
  }
};

export default adminInvoicesService;

