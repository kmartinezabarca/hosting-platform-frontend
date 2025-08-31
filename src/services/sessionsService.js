import apiClient from './apiClient';

/**
 * Servicio para operaciones relacionadas con sesiones y dispositivos
 */
const sessionsService = {
  /**
   * Obtener lista de dispositivos/sesiones activas
   */
  getSessions: async () => {
    const response = await apiClient.get('/profile/devices');
    return response.data;
  },

  /**
   * Cerrar sesión en un dispositivo específico
   */
  logoutSession: async (idOrUuid) => {
    const response = await apiClient.delete(`/profile/sessions/${idOrUuid}`);
    return response.data;
  },

  /**
   * Cerrar sesión en todos los otros dispositivos
   */
  logoutOtherSessions: async () => {
    const response = await apiClient.delete('/profile/sessions/others');
    return response.data;
  },
};

export default sessionsService;

