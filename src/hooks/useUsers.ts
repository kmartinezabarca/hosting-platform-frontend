import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersService from '../services/userService';

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => usersService.getAll(params),
    select: (rawResponse) => {
      const response = rawResponse as any;
      if (response?.data && Array.isArray(response.data.data)) {
        return {
          users: response.data.data,
          pagination: {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            per_page: response.data.per_page,
            total: response.data.total,
            from: response.data.from,
            to: response.data.to
          }
        };
      } else if (Array.isArray(response?.data)) {
        return { users: response.data, pagination: null };
      } else if (Array.isArray(response)) {
        return { users: response, pagination: null };
      }
      return { users: [], pagination: null };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUser = (userId: any) => {
  return useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => usersService.getById(userId),
    enabled: !!userId,
    select: (response: any) => response?.data || response,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userData }: { id: any; userData: any }) => usersService.update(id, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useChangeUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: any; status: any }) => usersService.changeStatus(userId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
  });
};

export const useUsersStats = () => {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
    select: (response: any) => response?.data || response,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUsersRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['users', 'recent-activity', limit],
    queryFn: () => usersService.getRecentActivity(limit),
    select: (response: any) => response?.data || response,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
