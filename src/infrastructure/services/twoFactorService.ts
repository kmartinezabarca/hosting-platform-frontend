import apiClient from '@presentation/components/features/apiClient';

/**
 * Servicio para operaciones de autenticación de dos factores (2FA)
 */
const twoFactorService = {
  /**
   * Generar código QR y secreto para configurar 2FA
   */
  generate2FA: async () => {
    const response = await apiClient.post('/2fa/generate');
    return response.data;
  },

  /**
   * Habilitar 2FA con código de verificación
   */
  enable2FA: async (code) => {
    const response = await apiClient.post('/2fa/enable', { code });
    return response.data;
  },

  /**
   * Deshabilitar 2FA
   */
  disable2FA: async () => {
    const response = await apiClient.post('/2fa/disable');
    return response.data;
  },
};

export default twoFactorService;

