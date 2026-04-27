import { useQuery } from '@tanstack/react-query';
import { queryConfigs } from '../config/queryConfig';
import servicesService from '../services/serviceService';
import invoicesService from '../services/invoiceService';

/**
 * Hook para obtener los add-ons de un plan específico.
 */
export const usePlanAddons = (planId: any, enabled: boolean) => {
  return useQuery({
    queryKey: ['planAddons', planId],
    queryFn: () => (servicesService as any).getPlanAddOns(planId),
    select: (data: any) => data.data || [],
    enabled: enabled && !!planId,
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener los métodos de pago del usuario.
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: (invoicesService as any).getPaymentMethods,
    select: (data: any) => data.data || [],
    ...queryConfigs.dynamic,
  });
};
