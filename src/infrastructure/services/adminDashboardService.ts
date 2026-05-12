import apiClient from '@infrastructure/api/apiClient';

const adminDashboardService = {
  async getStats() {
    const res = await apiClient.get('/admin/dashboard/stats');
    return res.data;
  },

  async getUsers(params: Record<string, unknown> = {}) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiClient.get(`/admin/users${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async createUser(userData: Record<string, unknown>) {
    const res = await apiClient.post('/admin/users', userData);
    return res.data;
  },

  async updateUser(userId: number | string, userData: Record<string, unknown>) {
    const res = await apiClient.put(`/admin/users/${userId}`, userData);
    return res.data;
  },

  async deleteUser(userId: number | string) {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return res.data;
  },

  async updateUserStatus(userId: number | string, status: string) {
    const res = await apiClient.put(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  async getServices(params: Record<string, unknown> = {}) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiClient.get(`/admin/services${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async updateServiceStatus(serviceId: number | string, status: string, reason?: string) {
    const res = await apiClient.put(`/admin/services/${serviceId}/status`, { status, reason });
    return res.data;
  },

  async getInvoices(params: Record<string, unknown> = {}) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiClient.get(`/admin/invoices${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async createInvoice(data: Record<string, unknown>) {
    const res = await apiClient.post('/admin/invoices', data);
    return res.data;
  },

  async updateInvoiceStatus(invoiceId: number | string, status: string, notes?: string) {
    const res = await apiClient.put(`/admin/invoices/${invoiceId}/status`, { status, notes });
    return res.data;
  },

  async markInvoiceAsPaid(invoiceId: number | string, paymentMethod: string, notes?: string) {
    const res = await apiClient.post(`/admin/invoices/${invoiceId}/mark-paid`, { payment_method: paymentMethod, notes });
    return res.data;
  },

  async getTickets(params: Record<string, unknown> = {}) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const res = await apiClient.get(`/admin/tickets${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async updateTicketStatus(ticketId: number | string, status: string) {
    const res = await apiClient.put(`/admin/tickets/${ticketId}/status`, { status });
    return res.data;
  },

  async assignTicket(ticketId: number | string, assignedTo: number | string, status?: string) {
    const res = await apiClient.post(`/admin/tickets/${ticketId}/assign`, { assigned_to: assignedTo, status });
    return res.data;
  },

  async addTicketReply(ticketId: number | string, message: string, isInternal?: boolean) {
    const res = await apiClient.post(`/admin/tickets/${ticketId}/reply`, { message, is_internal: isInternal });
    return res.data;
  },

  async getTicketCategories() {
    const res = await apiClient.get('/admin/tickets/categories');
    return res.data;
  },

  async getSupportAgents() {
    const res = await apiClient.get('/admin/support-agents');
    return res.data;
  },
};

export default adminDashboardService;
