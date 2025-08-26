const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Authentication service
export const authService = {
  // Login with Google
  async loginWithGoogle(googleUserData) {
    try {
      // 1. Llama al endpoint de tu API de Laravel
      const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: googleUserData.given_name,
          last_name: googleUserData.family_name,
          email: googleUserData.email,
          google_id: googleUserData.sub,
        }),
      });

      const data = await response.json();

      // 2. Si la respuesta NO es OK (ej. 403, 422, 500), lanza un error con el mensaje del backend
      if (!response.ok) {
        // Esto será capturado por el bloque catch en LoginPage
        throw new Error(data.message || "Ocurrió un error en el servidor.");
      }

      // 3. Si la respuesta es OK, comprueba si contiene un token de acceso
      if (data.access_token) {
        // Si hay token, es un login exitoso. Guarda los datos.
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }

      // 4. Devuelve SIEMPRE la data completa del backend.
      // LoginPage decidirá qué hacer con ella (si tiene 'access_token' o 'two_factor_required')
      return data;
    } catch (error) {
      console.error("Google Login Service Error:", error);
      // Re-lanza el error para que el componente que llama (LoginPage) pueda manejarlo
      throw error;
    }
  },

  // Login user with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store authentication data
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        token: data.access_token,
        redirectTo: data.redirect_to || "/client/dashboard",
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async verifyTwoFactor(email, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'La verificación 2FA falló.');
      }

    
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      // Devolvemos la respuesta para que el AuthContext la procese.
      return data;

    } catch (error) {
      console.error('2FA Verification Error:', error);
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract validation errors if available
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(" "));
        }
        throw new Error(data.message || "Registration failed");
      }

      // Store authentication data
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        token: data.access_token,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem("auth_token");

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
  },

  // Get current user
  getCurrentUser() {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("auth_token");
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Check if user has admin privileges
  isAdmin() {
    const user = this.getCurrentUser();
    return user && ["super_admin", "admin"].includes(user.role);
  },

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem("auth_token");
  },
};

export default authService;

