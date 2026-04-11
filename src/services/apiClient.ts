import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiRequestConfig } from '@/types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const ROOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Rutas que no deben disparar redirect al recibir 401
const AUTH_ENDPOINTS = ['/login', '/user', '/sanctum/csrf-cookie'];

let isAuthRedirecting = false;

const redirectToLogin = (): void => {
  if (!isAuthRedirecting && window.location.pathname !== '/login') {
    isAuthRedirecting = true;
    window.location.replace('/login');
  }
};

const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      isAuthRedirecting = false;
      return response;
    },
    (error: unknown) => {
      const axiosError = error as { response?: { status: number }; config?: ApiRequestConfig };
      const { response, config } = axiosError;
      const status = response?.status;

      if (config?._skipAuthRedirect === true) {
        return Promise.reject(error);
      }

      if (!response) {
        return Promise.reject(error);
      }

      const requestUrl = config?.url ?? '';
      const isAuthRoute = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

      if (status === 401 && !isAuthRoute) {
        redirectToLogin();
      }

      if (status === 419) {
        // CSRF token mismatch — refrescar la página
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

  get: <T = unknown>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, config as AxiosRequestConfig),

  post: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post<T>(url, data, config as AxiosRequestConfig),

  put: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put<T>(url, data, config as AxiosRequestConfig),

  patch: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch<T>(url, data, config as AxiosRequestConfig),

  delete: <T = unknown>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(url, config as AxiosRequestConfig),

  getRoot: <T = unknown>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    rootApiClient.get<T>(url, config as AxiosRequestConfig),

  postRoot: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    rootApiClient.post<T>(url, data, config as AxiosRequestConfig),
};

export default ApiService;
