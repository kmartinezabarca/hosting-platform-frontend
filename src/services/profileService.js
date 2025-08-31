import apiClient from './apiClient';

/**
 * Servicio para operaciones relacionadas con el perfil del usuario
 */
const profileService = {
  /**
   * Obtener información del perfil del usuario
   */
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  /**
   * Actualizar información del perfil
   */
  updateProfile: async (payload) => {
    const response = await apiClient.put('/profile', payload);
    return response.data;
  },

  /**
   * Subir avatar del usuario
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Obtener información de seguridad del perfil
   */
  getSecurity: async () => {
    const response = await apiClient.get('/profile/security');
    return response.data;
  },

  /**
   * Actualizar contraseña del usuario
   */
  updatePassword: async (payload) => {
    const response = await apiClient.put('/profile/password', payload);
    return response.data;
  },
};

export default profileService;

