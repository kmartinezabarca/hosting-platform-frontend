import { useQuery } from '@tanstack/react-query';
import billingCyclesService from  '@infrastructure/services/billingCyclesService';
import { queryConfigs } from '@shared/constants/queryConfig';

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
