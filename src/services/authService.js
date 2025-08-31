import apiClient from './apiClient';

/**
 * Servicio para operaciones de autenticación
 */
const authService = {
  /**
   * Iniciar sesión con credenciales
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Verificar código 2FA
   */
  verify2FA: async (data) => {
    const response = await apiClient.post('/auth/2fa/verify', data);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  },

  /**
   * Iniciar sesión con Google
   */
  loginWithGoogle: async (googleUserData) => {
    const response = await apiClient.post("/auth/google/callback", {
      first_name: googleUserData.given_name,
      last_name: googleUserData.family_name || '',
      email: googleUserData.email,
      google_id: googleUserData.sub
    });
    if (response.data.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
    }
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    // En una aplicación real, aquí harías una llamada al backend para invalidar el token
    localStorage.removeItem('auth_token');
    return { success: true };
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },


  /**
   * Devuelve: { uuid, first_name, last_name, email, role, avatar_url }
   * (El backend ya debe construir avatar_url absoluta)
   */
  getCurrentUser: async (signal) => {
    if (!authService.getToken()) return null;

    const res = await apiClient.get('/auth/me', { signal });
    const user = res?.data ?? res;
    return user;
  },

  /**
   * Obtener token de autenticación
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
};

export default authService;

