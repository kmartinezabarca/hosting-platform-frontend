import { useQuery } from '@tanstack/react-query';
import billingCyclesService from '@presentation/components/features/services/billingCyclesService';
import { queryConfigs } from '@presentation/components/features/config/queryConfig';

/**
 * Hook para obtener ciclos de facturación
 */
export const useBillingCycles = (options: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['billingCycles'],
    queryFn: billingCyclesService.getBillingCycles,
    select: (data: any) => data.data || [],
    ...queryConfigs.static,
    ...options,
  });
};
