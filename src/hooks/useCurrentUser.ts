import { useQuery, UseQueryResult } from '@tanstack/react-query';
import authService from '@/services/authService';
import type { User } from '@/types/models';

export const useCurrentUser = (): UseQueryResult<User | null> => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    select: (response) => response?.data ?? null,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
