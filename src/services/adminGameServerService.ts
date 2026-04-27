import apiClient from './apiClient';

const adminGameServerService = {
  /** Lista paginada de game servers */
  getGameServers: async (params = {}) => {
    const response = await apiClient.get('/admin/game-servers', { params });
    return response.data;
  },

  /** Detalle de un game server */
  getGameServer: async (id) => {
    const response = await apiClient.get(`/admin/game-servers/${id}`);
    return response.data;
  },

  /** Re-aprovisionar */
  provision: async (id) => {
    const response = await apiClient.post(`/admin/game-servers/${id}/provision`);
    return response.data;
  },

  /** Suspender */
  suspend: async (id) => {
    const response = await apiClient.post(`/admin/game-servers/${id}/suspend`);
    return response.data;
  },

  /** Reactivar */
  unsuspend: async (id) => {
    const response = await apiClient.post(`/admin/game-servers/${id}/unsuspend`);
    return response.data;
  },

  /** Reinstalar (destructivo) */
  reinstall: async (id) => {
    const response = await apiClient.post(`/admin/game-servers/${id}/reinstall`);
    return response.data;
  },

  /** Eliminar permanentemente */
  delete: async (id) => {
    const response = await apiClient.delete(`/admin/game-servers/${id}`);
    return response.data;
  },
};

export default adminGameServerService;
