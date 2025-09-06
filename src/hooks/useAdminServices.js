import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminServicesService from '../services/adminServicesService';
import { queryConfigs } from '../config/queryConfig';

// Query keys para servicios de administración
export const adminServicesKeys = {
  all: ['admin-services'],
  lists: () => [...adminServicesKeys.all, 'list'],
  list: (filters) => [...adminServicesKeys.lists(), filters],
  details: () => [...adminServicesKeys.all, 'detail'],
  detail: (id) => [...adminServicesKeys.details(), id],
  stats: () => [...adminServicesKeys.all, 'stats'],
  history: (id) => [...adminServicesKeys.all, 'history', id],
  byUser: (userId) => [...adminServicesKeys.all, 'by-user', userId],
};

/**
 * Hook para obtener todos los servicios con filtros
 */
export const useAdminServices = (filters = {}) => {
  return useQuery({
    queryKey: adminServicesKeys.list(filters),
    queryFn: () => adminServicesService.getAll(filters),
    ...queryConfigs.dynamic,
    select: (data) => {
      // Extraer los datos de la respuesta paginada
      if (data.success && data.data) {
        return {
          services: data.data.data || [],
          pagination: {
            current_page: data.data.current_page,
            last_page: data.data.last_page,
            per_page: data.data.per_page,
            total: data.data.total,
            from: data.data.from,
            to: data.data.to,
            first_page_url: data.data.first_page_url,
            last_page_url: data.data.last_page_url,
            next_page_url: data.data.next_page_url,
            prev_page_url: data.data.prev_page_url,
            links: data.data.links || []
          }
        };
      }
      return { services: [], pagination: null };
    },
  });
};

/**
 * Hook para obtener un servicio específico
 */
export const useAdminService = (id) => {
  return useQuery({
    queryKey: adminServicesKeys.detail(id),
    queryFn: () => adminServicesService.getById(id),
    enabled: !!id,
    ...queryConfigs.sensitive,
  });
};

/**
 * Hook para obtener estadísticas de servicios
 */
export const useAdminServicesStats = () => {
  return useQuery({
    queryKey: adminServicesKeys.stats(),
    queryFn: () => adminServicesService.getStats(),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener historial de un servicio
 */
export const useAdminServiceHistory = (id) => {
  return useQuery({
    queryKey: adminServicesKeys.history(id),
    queryFn: () => adminServicesService.getHistory(id),
    enabled: !!id,
    ...queryConfigs.sensitive,
  });
};

/**
 * Hook para obtener servicios por usuario
 */
export const useAdminServicesByUser = (userId) => {
  return useQuery({
    queryKey: adminServicesKeys.byUser(userId),
    queryFn: () => adminServicesService.getByUser(userId),
    enabled: !!userId,
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para crear un nuevo servicio
 */
export const useCreateAdminService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceData) => adminServicesService.create(serviceData),
    onSuccess: () => {
      // Invalidar todas las queries de servicios para refrescar los datos
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.all });
    },
    onError: (error) => {
      console.error('Error creating service:', error);
    },
  });
};

/**
 * Hook para actualizar un servicio
 */
export const useUpdateAdminService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, serviceData }) => adminServicesService.update(id, serviceData),
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.detail(variables.id) });
    },
    onError: (error) => {
      console.error('Error updating service:', error);
    },
  });
};

/**
 * Hook para eliminar un servicio
 */
export const useDeleteAdminService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminServicesService.delete(id),
    onSuccess: () => {
      // Invalidar todas las queries de servicios
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
    },
  });
};

/**
 * Hook para cambiar el estado de un servicio
 */
export const useChangeAdminServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => adminServicesService.changeStatus(id, status),
    onSuccess: () => {
      // Invalidar queries de servicios para refrescar los datos
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.all });
    },
    onError: (error) => {
      console.error('Error changing service status:', error);
    },
  });
};

/**
 * Hook para suspender un servicio
 */
export const useSuspendAdminService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => adminServicesService.suspend(id, reason),
    onSuccess: () => {
      // Invalidar queries de servicios
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.all });
    },
    onError: (error) => {
      console.error('Error suspending service:', error);
    },
  });
};

/**
 * Hook para reactivar un servicio
 */
export const useReactivateAdminService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminServicesService.reactivate(id),
    onSuccess: () => {
      // Invalidar queries de servicios
      queryClient.invalidateQueries({ queryKey: adminServicesKeys.all });
    },
    onError: (error) => {
      console.error('Error reactivating service:', error);
    },
  });
};

