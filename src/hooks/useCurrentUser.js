// src/hooks/useCurrentUser.js
import { useQuery } from '@tanstack/react-query';
import authService from '@/services/authService';

export const useCurrentUser = () => {
  const token = authService.getToken();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: (count, err) => (err?.status === 401 || err?.status === 403 ? false : count < 2),
  });
};
