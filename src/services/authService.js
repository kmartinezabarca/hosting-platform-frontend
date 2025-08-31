import apiClient from "./apiClient";

/**
 * Servicio para operaciones de autenticación
 */
const authService = {
  /**
   * Iniciar sesión con credenciales
   */
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Verificar código 2FA
   */
  verify2FA: async (data) => {
    const response = await apiClient.post("/auth/2fa/verify", data);
    if (response.data.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
    }
    return response.data;
  },

  /**
   * Iniciar sesión con Google
   */
  loginWithGoogle: async (googleUserData) => {
    const response = await apiClient.post("/auth/google/callback", {
      first_name: googleUserData.given_name,
      last_name: googleUserData.family_name || "",
      email: googleUserData.email,
      google_id: googleUserData.sub,
    });
    if (response.data.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("auth_token");
    const user = JSON.parse(localStorage.getItem("user_data"));
    return !!(token && user);
  },

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem("user_data"));
    return user && user.role === role;
  },

   /**
   * Verificar si el usuario es administrador
   */
  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem("user_data"));
    return user?.role === 'admin';
  },

  /**
   * Trae el usuario autenticado desde /auth/me o null si no hay token.
   * (El backend ya debe regresar avatar_url absoluta)
   * @param {AbortSignal} [signal]
   * @returns {Promise<object|null>}
   */
  fetchCurrentUser: async (signal) => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await apiClient.get("/auth/me", { signal });
      // Si tu backend responde { success, data: { ...user } }
      return res?.data?.data ?? res?.data ?? res;
    } catch (err) {
      // Si el token es inválido/expiró, consideramos que no hay usuario
      if (err?.response?.status === 401) return null;
      throw err;
    }
  },

  /**
   * Obtener token de autenticación
   */
  getToken: () => {
    return localStorage.getItem("auth_token");
  },
};

export default authService;
