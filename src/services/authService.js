import apiClient from './apiClient';

/**
 * Servicio para operaciones de autenticación.
 * Asume que el backend maneja la sesión a través de cookies httpOnly.
 */
const authService = {
  /**
   * Iniciar sesión con credenciales.
   * El backend debe establecer una cookie httpOnly en la respuesta.
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Registrar nuevo usuario.
   * El backend debe establecer una cookie httpOnly en la respuesta.
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Verificar código 2FA.
   * El backend debe establecer una cookie httpOnly en la respuesta.
   */
  verify2FA: async (data) => {
    const response = await apiClient.post('/auth/2fa/verify', data);
    return response.data;
  },

  /**
   * Iniciar sesión con Google.
   * El backend debe establecer una cookie httpOnly en la respuesta.
   */
  loginWithGoogle: async (googleUserData) => {
    const response = await apiClient.post("/auth/google/callback", {
      first_name: googleUserData.given_name,
      last_name: googleUserData.family_name || '',
      email: googleUserData.email,
      google_id: googleUserData.sub
    });
    return response.data;
  },

  /**
   * Cerrar sesión. Llama al backend para que invalide la cookie de sesión.
   */
  logout: async () => {
    // Es importante que el backend tenga un endpoint que invalide la cookie.
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Devuelve los datos del usuario actual si la sesión es válida.
   * Si no hay sesión (sin cookie), el backend devolverá un 401 que será manejado
   * por el interceptor de apiClient y/o React Query.
   */
  getCurrentUser: async (signal) => {
    const res = await apiClient.get('/auth/me', { signal, _handle401: false });
    return res?.data ?? null;
  },
};

export default authService;

