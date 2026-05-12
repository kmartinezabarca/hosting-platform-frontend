import apiClient from '@infrastructure/api/apiClient';

const adminNotificationsService = {
  async getNotifications(params: Record<string, any> = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ) as Record<string, string>
    ).toString();
    const res = await apiClient.get(`/admin/notifications${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async getStats() {
    const res = await apiClient.get('/admin/notifications/stats');
    return res.data;
  },

  async broadcast(payload: any) {
    const res = await apiClient.post('/admin/notifications/broadcast', payload);
    return res.data;
  },

  async sendToUser(userId: any, payload: any) {
    const res = await apiClient.post(`/admin/notifications/send-to-user/${userId}`, payload);
    return res.data;
  },

  async markAsRead(notificationId: string) {
    const res = await apiClient.put(`/admin/notifications/${notificationId}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.put('/admin/notifications/mark-all-read');
    return res.data;
  },

  async archive(notificationId: string) {
    const res = await apiClient.put(`/admin/notifications/${notificationId}/archive`);
    return res.data;
  },

  async unarchive(notificationId: string) {
    const res = await apiClient.put(`/admin/notifications/${notificationId}/unarchive`);
    return res.data;
  },

  async archiveAllRead() {
    const res = await apiClient.put('/admin/notifications/archive-all-read');
    return res.data;
  },

  async delete(notificationId: string) {
    const res = await apiClient.delete(`/admin/notifications/${notificationId}`);
    return res.data;
  },

  async deleteAllArchived() {
    const res = await apiClient.delete('/admin/notifications/archived');
    return res.data;
  },
};

export default adminNotificationsService;
