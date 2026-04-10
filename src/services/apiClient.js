import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const ROOT_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Rutas que no deben disparar redirect al recibir 401/403
const AUTH_ENDPOINTS = ["/login", "/user", "/sanctum/csrf-cookie"];

let isAuthRedirecting = false;

const redirectToLogin = () => {
  if (!isAuthRedirecting && window.location.pathname !== "/login") {
    isAuthRedirecting = true;
    window.location.replace("/login");
  }
};

const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
  });

  client.interceptors.response.use(
    (response) => {
      // Reset flag cuando una petición autenticada tiene éxito
      isAuthRedirecting = false;
      return response;
    },
    (error) => {
      const { response, config } = error || {};
      const status = response?.status;

      // Permitir que el caller maneje el error manualmente
      if (config?._skipAuthRedirect === true) {
        return Promise.reject(error);
      }

      if (!response) {
        return Promise.reject(error);
      }

      const requestUrl = config?.url || "";
      const isAuthRoute = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

      if (status === 401 && !isAuthRoute) {
        redirectToLogin();
      }

      if (status === 419) {
        // CSRF token mismatch — refrescar la página para obtener uno nuevo
        window.location.reload();
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient(API_BASE_URL);
const rootApiClient = createApiClient(ROOT_URL);

const ApiService = {
  client: apiClient,
  rootClient: rootApiClient,

  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  getRoot: (url, config) => rootApiClient.get(url, config),
  postRoot: (url, data, config) => rootApiClient.post(url, data, config),
};

export default ApiService;
