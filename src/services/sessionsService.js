import apiClient from './apiClient';

/**
 * Servicio para operaciones relacionadas con sesiones y dispositivos
 */
const sessionsService = {
  /**
   * Obtiene una lista paginada de las sesiones del usuario.
   *
   * @param {number} page - El número de página a solicitar.
   * @param {number} perPage - El número de sesiones por página.
   * @returns {Promise<object>} La respuesta paginada de la API.
   */
  getSessions: async (page = 1, perPage = 10) => {
    try {
      const response = await apiClient.get('/profile/devices', {
        params: {
          page: page,
          per_page: perPage,
        },
      });
      
      return response.data;

    } catch (error) {
      console.error('Error al obtener las sesiones:', error);
      throw error;
    }
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
    const response = await apiClient.post('/profile/devices/revoke-others');
    return response.data;
  },
};

export default sessionsService;

