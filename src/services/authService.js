import apiClient from './apiClient';
import { useMutation } from '@tanstack/react-query';

const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  localStorage.setItem('auth_token', response.data.access_token);
  return response.data;
};

const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

const verify2FA = async (data) => {
  const response = await apiClient.post('/auth/2fa/verify', data);
  localStorage.setItem('auth_token', response.data.access_token);
  return response.data;
};

const logout = async () => {
  // En una aplicación real, aquí harías una llamada al backend para invalidar el token
  localStorage.removeItem('auth_token');
  return { success: true };
};

export const useLogin = () => {
  return useMutation({ mutationFn: login });
};

export const useRegister = () => {
  return useMutation({ mutationFn: register });
};

export const useVerify2FA = () => {
  return useMutation({ mutationFn: verify2FA });
};

export const useLogout = () => {
  return useMutation({ mutationFn: logout });
};


