// src/services/supportChatService.js
import apiClient from './apiClient';

const supportChatService = {
  // Sala de soporte (crea/recupera la sala activa del usuario)
  async getSupportRoom() {
    const res = await apiClient.get('/chat/support-room');
    return res.data;
  },

  // Mensajes de una sala (opcionalmente soporta paginación si el backend la expone)
  async getMessages(chatRoomId, params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )
    ).toString();
    const res = await apiClient.get(`/chat/${chatRoomId}/messages${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  // Enviar mensaje
  async sendMessage(chatRoomId, message) {
    const res = await apiClient.post(`/chat/${chatRoomId}/messages`, { message });
    return res.data;
  },

  // Marcar chat como leído
  async markAsRead(chatRoomId) {
    const res = await apiClient.put(`/chat/${chatRoomId}/read`);
    return res.data;
  },

  // Cerrar sala
  async closeRoom(chatRoomId) {
    const res = await apiClient.put(`/chat/${chatRoomId}/close`);
    return res.data;
  },

  // Contador de no leídos (del usuario autenticado)
  async getUnreadCount() {
    const res = await apiClient.get('/chat/unread-count');
    return res.data; // se normaliza en el hook
  },
};

export default supportChatService;
