import apiClient from './apiClient';

const adminNotificationsService = {
  // Lista (acepta filtros/paginación)
  // Ej: { page, per_page, read: '0|1', type: 'system|billing|...' }
  async getNotifications(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    ).toString();
    const res = await apiClient.get(`/admin/notifications${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  // Stats (cuentas, etc.)
  async getStats() {
    const res = await apiClient.get('/admin/notifications/stats');
    return res.data;
  },

  // Broadcast masivo
  async broadcast(payload) {
    const res = await apiClient.post('/admin/notifications/broadcast', payload);
    return res.data;
  },

  // Enviar a usuario
  async sendToUser(userId, payload) {
    const res = await apiClient.post(`/admin/notifications/send-to-user/${userId}`, payload);
    return res.data;
  },

  // Marcar como leída
  async markAsRead(notificationId) {
    const res = await apiClient.put(`/admin/notifications/${notificationId}/read`);
    return res.data;
  },

  // Marcar todas como leídas
  async markAllAsRead() {
    const res = await apiClient.put('/admin/notifications/mark-all-read');
    return res.data;
  },

  // Eliminar
  async delete(notificationId) {
    const res = await apiClient.delete(`/admin/notifications/${notificationId}`);
    return res.data;
  },
};

export default adminNotificationsService;