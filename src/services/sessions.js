import apiClient from './apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getSessions = async () => {
  const response = await apiClient.get('/profile/devices');
  return response.data;
};

const logoutSession = async (idOrUuid) => {
  const response = await apiClient.delete(`/profile/sessions/${idOrUuid}`);
  return response.data;
};

const logoutOtherSessions = async () => {
  const response = await apiClient.delete('/profile/sessions/others');
  return response.data;
};

export const useSessions = () => {
  return useQuery({ queryKey: ['sessions'], queryFn: getSessions });
};

export const useLogoutSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useLogoutOtherSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
