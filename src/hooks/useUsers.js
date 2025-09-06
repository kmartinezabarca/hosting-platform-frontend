import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersService from '../services/userService';

/**
 * Hook para obtener todos los usuarios con filtros
 */
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => usersService.getAll(params),
    select: (response) => {
      // Manejar tanto respuestas paginadas como arrays directos
      if (response.data && Array.isArray(response.data.data)) {
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
      } else if (Array.isArray(response.data)) {
        return {
          users: response.data,
          pagination: null
        };
      } else if (Array.isArray(response)) {
        return {
          users: response,
          pagination: null
        };
      }
      return {
        users: [],
        pagination: null
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al cargar usuarios:', error);
    },
  });
};

/**
 * Hook para obtener un usuario específico por ID
 */
export const useUser = (userId) => {
  return useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: () => usersService.getById(userId),
    enabled: !!userId,
    select: (response) => response.data || response,
    staleTime: 5 * 60 * 1000,
    cacheTime: 20 * 60 * 1000,
    onError: (error) => {
      console.error('Error al cargar usuario:', error);
    },
  });
};

/**
 * Hook para crear un nuevo usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.create,
    onSuccess: (data) => {
      // Invalidar la lista de usuarios para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
    onError: (error) => {
      console.error('Error al crear usuario:', error);
    },
  });
};

/**
 * Hook para actualizar un usuario existente
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }) => usersService.update(id, userData),
    onSuccess: (data, variables) => {
      const userId = variables.id;
      
      // Invalidar la lista de usuarios
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      
      // Invalidar el usuario específico
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
      
      // Invalidar estadísticas
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
    onError: (error) => {
      console.error('Error al actualizar usuario:', error);
    },
  });
};

/**
 * Hook para eliminar un usuario
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      // Invalidar todas las consultas relacionadas con usuarios
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error al eliminar usuario:', error);
    },
  });
};

/**
 * Hook para cambiar el estado de un usuario
 */
export const useChangeUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }) => usersService.changeStatus(userId, status),
    onSuccess: (data, variables) => {
      const userId = variables.userId;
      
      // Invalidar la lista de usuarios
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      
      // Invalidar el usuario específico
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
      
      // Invalidar estadísticas
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
    onError: (error) => {
      console.error('Error al cambiar estado del usuario:', error);
    },
  });
};

/**
 * Hook para obtener estadísticas de usuarios
 */
export const useUsersStats = () => {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersService.getStats,
    select: (response) => response.data || response,
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al cargar estadísticas de usuarios:', error);
    },
  });
};

/**
 * Hook para obtener actividad reciente de usuarios
 */
export const useUsersRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: ['users', 'recent-activity', limit],
    queryFn: () => usersService.getRecentActivity(limit),
    select: (response) => response.data || response,
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al cargar actividad reciente:', error);
    },
  });
};

