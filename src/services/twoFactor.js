import apiClient from './apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const generate2FA = async () => {
  const response = await apiClient.post('/2fa/generate');
  return response.data;
};

const enable2FA = async (code) => {
  const response = await apiClient.post('/2fa/enable', { code });
  return response.data;
};

const disable2FA = async () => {
  const response = await apiClient.post('/2fa/disable');
  return response.data;
};

export const useGenerate2FA = () => {
  return useMutation({ mutationFn: generate2FA });
};

export const useEnable2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
