// src/hooks/useCurrentUser.ts
import { useQuery } from '@tanstack/react-query';
import authService from '@/services/authService';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth','me'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    select: (u) => u.data,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
