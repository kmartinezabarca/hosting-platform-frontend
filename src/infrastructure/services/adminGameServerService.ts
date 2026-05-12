import apiClient from '@infrastructure/api/apiClient';

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

  // ── Consola / Runtime ────────────────────────────────────────────────────

  /** Credenciales WebSocket de Wings */
  getWebSocket: async (id: number | string) => {
    const response = await apiClient.get(`/admin/game-servers/${id}/websocket`);
    return response.data;
  },

  /** Métricas en tiempo real */
  getUsage: async (id: number | string) => {
    const response = await apiClient.get(`/admin/game-servers/${id}/usage`);
    return response.data;
  },

  /** Señal de poder: start | stop | restart | kill */
  sendPower: async (id: number | string, signal: 'start' | 'stop' | 'restart' | 'kill') => {
    const response = await apiClient.post(`/admin/game-servers/${id}/power`, { signal });
    return response.data;
  },

  /** Enviar comando a la consola */
  sendCommand: async (id: number | string, command: string) => {
    const response = await apiClient.post(`/admin/game-servers/${id}/command`, { command });
    return response.data;
  },

  // ── File manager (admin bypass) ──────────────────────────────────────────────

  listFiles: async (id: number | string, directory: string) => {
    const response = await apiClient.get(`/admin/game-servers/${id}/files/list`, { params: { directory } });
    return response.data;
  },

  getUploadUrl: async (id: number | string) => {
    const response = await apiClient.get(`/admin/game-servers/${id}/files/upload`);
    return response.data;
  },

  deleteFiles: async (id: number | string, directory: string, files: string[]) => {
    await apiClient.post(`/admin/game-servers/${id}/files/delete`, { root: directory, files });
  },

  getDownloadUrl: async (id: number | string, directory: string, fileName: string) => {
    const cleanPath = `${directory.replace(/\/$/, '')}/${fileName}`.replace('//', '/');
    const response = await apiClient.get(`/admin/game-servers/${id}/files/download`, {
      params: { file: encodeURIComponent(cleanPath) },
    });
    return response.data;
  },
};

export default adminGameServerService;
