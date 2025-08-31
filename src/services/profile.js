import apiClient from './apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getProfile = async () => {
  const response = await apiClient.get('/profile');
  return response.data;
};

const updateProfile = async (payload) => {
  const response = await apiClient.put('/profile', payload);
  return response.data;
};

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiClient.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const getSecurity = async () => {
  const response = await apiClient.get('/profile/security');
  return response.data;
};

const updatePassword = async (payload) => {
  const response = await apiClient.put('/profile/password', payload);
  return response.data;
};

export const useProfile = () => {
  return useQuery({ queryKey: ['profile'], queryFn: getProfile });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useSecurity = () => {
  return useQuery({ queryKey: ['security'], queryFn: getSecurity });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
    },
  });
};
