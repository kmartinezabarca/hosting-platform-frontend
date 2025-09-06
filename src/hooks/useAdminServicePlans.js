import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminServicePlansService from '../services/adminServicePlansService';
import { queryConfigs } from '../config/queryConfig';

// Query keys para planes de servicio de administración
export const adminServicePlansKeys = {
  all: ['admin-service-plans'],
  lists: () => [...adminServicePlansKeys.all, 'list'],
  list: (filters) => [...adminServicePlansKeys.lists(), filters],
  details: () => [...adminServicePlansKeys.all, 'detail'],
  detail: (uuid) => [...adminServicePlansKeys.details(), uuid],
  categories: () => [...adminServicePlansKeys.all, 'categories'],
  billingCycles: () => [...adminServicePlansKeys.all, 'billing-cycles'],
};

/**
 * Hook para obtener todos los planes de servicio con filtros
 */
export const useAdminServicePlans = (filters = {}) => {
  return useQuery({
    queryKey: adminServicePlansKeys.list(filters),
    queryFn: () => adminServicePlansService.getAll(filters),
    ...queryConfigs.dynamic,
    select: (data) => {
      // Asumiendo que la API devuelve una estructura paginada similar a la de servicios
      if (data.success && data.data) {
        return {
          plans: data.data.data || [],
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
      return { plans: [], pagination: null };
    },
  });
};

/**
 * Hook para obtener un plan de servicio específico
 */
export const useAdminServicePlan = (uuid) => {
  return useQuery({
    queryKey: adminServicePlansKeys.detail(uuid),
    queryFn: () => adminServicePlansService.getById(uuid),
    enabled: !!uuid,
    ...queryConfigs.sensitive,
  });
};

/**
 * Hook para obtener categorías de planes de servicio
 */
export const useAdminServicePlanCategories = () => {
  return useQuery({
    queryKey: adminServicePlansKeys.categories(),
    queryFn: () => adminServicePlansService.getCategories(),
    ...queryConfigs.static,
  });
};

/**
 * Hook para obtener ciclos de facturación
 */
export const useAdminBillingCycles = () => {
  return useQuery({
    queryKey: adminServicePlansKeys.billingCycles(),
    queryFn: () => adminServicePlansService.getBillingCycles(),
    ...queryConfigs.static,
  });
};

/**
 * Hook para crear un nuevo plan de servicio
 */
export const useCreateAdminServicePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planData) => adminServicePlansService.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminServicePlansKeys.all });
    },
    onError: (error) => {
      console.error('Error creating service plan:', error);
    },
  });
};

/**
 * Hook para actualizar un plan de servicio
 */
export const useUpdateAdminServicePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, planData }) => adminServicePlansService.update(uuid, planData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminServicePlansKeys.all });
      queryClient.invalidateQueries({ queryKey: adminServicePlansKeys.detail(variables.uuid) });
    },
    onError: (error) => {
      console.error('Error updating service plan:', error);
    },
  });
};

/**
 * Hook para eliminar un plan de servicio
 */
export const useDeleteAdminServicePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid) => adminServicePlansService.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminServicePlansKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting service plan:', error);
    },
  });
};

