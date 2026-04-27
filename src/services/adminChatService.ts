import apiClient from './apiClient';

const adminChatService = {
  // Salas
  async getActiveRooms() {
    const res = await apiClient.get('/admin/chat/active-rooms');
    return res.data;
  },
  async getAllRooms() {
    const res = await apiClient.get('/admin/chat/all-rooms');
    return res.data;
  },

  // Stats / unread
  async getStats() {
    const res = await apiClient.get('/admin/chat/stats');
    return res.data;
  },
  async getUnreadCount() {
    const res = await apiClient.get('/admin/chat/unread-count');
    return res.data; // { count: number } (normaliza en el hook)
  },

  // Mensajes
  async getMessages(chatRoomId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiClient.get(
      `/admin/chat/${chatRoomId}/messages${qs ? `?${qs}` : ''}`
    );
    return res.data;
  },
  async sendMessage(chatRoomId, message) {
    const res = await apiClient.post(`/admin/chat/${chatRoomId}/messages`, { message });
    return res.data;
  },

  // Acciones sobre salas
  async assignRoom(chatRoomId, agentId) {
    const res = await apiClient.put(`/admin/chat/${chatRoomId}/assign`, { agent_id: agentId });
    return res.data;
  },
  async closeRoom(chatRoomId) {
    const res = await apiClient.put(`/admin/chat/${chatRoomId}/close`);
    return res.data;
  },
  async reopenRoom(chatRoomId) {
    const res = await apiClient.put(`/admin/chat/${chatRoomId}/reopen`);
    return res.data;
  },
};

export default adminChatService;