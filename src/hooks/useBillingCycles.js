import { useQuery } from '@tanstack/react-query';
import billingCyclesService from '../services/billingCyclesService';
import { queryConfigs } from '../config/queryConfig';

/**
 * Hook para obtener ciclos de facturación
 */
export const useBillingCycles = (options = {}) => {
  return useQuery({
    queryKey: ['billingCycles'],
    queryFn: billingCyclesService.getBillingCycles,
    select: (data) => data.data || [],
    ...queryConfigs.static, // Usar configuración para datos estáticos
    ...options,
    onError: (error) => {
      console.error("Error al obtener ciclos de facturación", error);
    },
  });
};

