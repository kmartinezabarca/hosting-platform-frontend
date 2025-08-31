import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryConfigs } from '../config/queryConfig';

// Simulamos el servicio hasta que se implemente
const servicesService = {
  getServices: async () => {
    // Placeholder - implementar cuando esté disponible el servicio
    return { data: [] };
  },
  createService: async (serviceData) => {
    // Placeholder - implementar cuando esté disponible el servicio
    return { data: serviceData };
  },
};

/**
 * Hook para obtener servicios del cliente
 */
export const useServices = (options = {}) => {
  return useQuery({
    queryKey: ['services'],
    queryFn: servicesService.getServices,
    select: (data) => data.data || [],
    ...queryConfigs.dynamic, // Usar configuración para datos dinámicos
    ...options,
    onError: (error) => {
      console.error("Error al obtener servicios", error);
    },
  });
};

/**
 * Hook para crear un nuevo servicio
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: servicesService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      console.error("Error al crear servicio", error);
    },
  });
};

