// Renombrado a ApiService.js (o como prefieras)

import axios from "axios";

// --- 1. Define tus URLs base ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const ROOT_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let isAuthRedirecting = false;

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
      if ((status === 401 || status === 403) && !isAuthRedirecting) {
        isAuthRedirecting = true;
        if (window.location.pathname !== "/login") {
          // window.location.replace('/login');
        }
      }
      if (status === 419 && !isAuthRedirecting) {
        // window.location.replace('/login');
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
  delete: (url, config) => apiClient.delete(url, config),
  getRoot: (url, config) => rootApiClient.get(url, config),
  postRoot: (url, data, config) => rootApiClient.post(url, data, config),
};

export default ApiService;
