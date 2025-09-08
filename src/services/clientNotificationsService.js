// src/services/clientNotificationsService.js
import apiClient from './apiClient';

const cleanParams = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );

const clientNotificationsService = {
  // GET /notifications (acepta filtros/paginación si existen)
  async list(params = {}) {
    const qs = new URLSearchParams(cleanParams(params)).toString();
    const res = await apiClient.get(`/notifications${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  // PUT /notifications/{id}/read
  async markRead(notificationId) {
    const res = await apiClient.put(`/notifications/${notificationId}/read`);
    return res.data;
  },

  // PUT /notifications/mark-all-read
  async markAllRead() {
    const res = await apiClient.put('/notifications/mark-all-read');
    return res.data;
  },

  // DELETE /notifications/{id}
  async remove(notificationId) {
    const res = await apiClient.delete(`/notifications/${notificationId}`);
    return res.data;
  },

  // GET /notifications/unread-count
  async unreadCount() {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data; // { count } o { data: { count } }
  },
};

export default clientNotificationsService;
