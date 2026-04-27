import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const ROOT_URL     = import.meta.env.VITE_API_URL      || 'http://localhost:8000';

// Rutas que no deben disparar redirect al recibir 401/403
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
    (response) => {
      isAuthRedirecting = false;
      return response;
    },
    (error) => {
      const { response, config } = error ?? {};
      const status = response?.status as number | undefined;

      if ((config as AxiosRequestConfig & { _skipAuthRedirect?: boolean })?._skipAuthRedirect) {
        return Promise.reject(error);
      }

      if (!response) return Promise.reject(error);

      const requestUrl: string = config?.url ?? '';
      const isAuthRoute = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

      if (status === 401 && !isAuthRoute) redirectToLogin();
      if (status === 419) window.location.reload(); // CSRF mismatch

      return Promise.reject(error);
    },
  );

  return client;
};

const apiClient  = createApiClient(API_BASE_URL);
const rootClient = createApiClient(ROOT_URL);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cfg = AxiosRequestConfig & { _skipAuthRedirect?: boolean; [key: string]: any };

const ApiService = {
  client:     apiClient,
  rootClient,

  get:      <T = unknown>(url: string, config?: Cfg): Promise<AxiosResponse<T>> => apiClient.get<T>(url, config),
  post:     <T = unknown>(url: string, data?: unknown, config?: Cfg): Promise<AxiosResponse<T>> => apiClient.post<T>(url, data, config),
  put:      <T = unknown>(url: string, data?: unknown, config?: Cfg): Promise<AxiosResponse<T>> => apiClient.put<T>(url, data, config),
  patch:    <T = unknown>(url: string, data?: unknown, config?: Cfg): Promise<AxiosResponse<T>> => apiClient.patch<T>(url, data, config),
  delete:   <T = unknown>(url: string, config?: Cfg): Promise<AxiosResponse<T>> => apiClient.delete<T>(url, config),
  getRoot:  <T = unknown>(url: string, config?: Cfg): Promise<AxiosResponse<T>> => rootClient.get<T>(url, config),
  postRoot: <T = unknown>(url: string, data?: unknown, config?: Cfg): Promise<AxiosResponse<T>> => rootClient.post<T>(url, data, config),
};

export default ApiService;
