import axios from "axios";

let isAuthRedirecting = false;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const initializeCsrf = async () => {
  try {
    // Usamos una URL absoluta porque esta ruta NO tiene el prefijo /api
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true,
    });
    console.log("CSRF cookie initialized");
  } catch (error) {
    console.error("Could not initialize CSRF cookie", error);
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error || {};
    const status = response?.status;

    if (config && config._handle401 === false) {
      return Promise.reject(error);
    }

    if (!response) {
      return Promise.reject(error);
    }

    // Trata 401 o 403 como sesión inválida
    if ((status === 401 || status === 403) && !isAuthRedirecting) {
      isAuthRedirecting = true;

      // Evita loop si ya estás en /login
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    if (status === 419 && !isAuthRedirecting) { window.location.replace('/login'); }

    return Promise.reject(error);
  }
);

export default apiClient;
