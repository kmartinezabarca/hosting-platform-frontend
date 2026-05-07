import { useQuery } from '@tanstack/react-query';
import { queryConfigs } from '@shared/constants/queryConfig';
import servicesService from '@infrastructure/services/serviceService';
import invoicesService from '@infrastructure/services/invoiceService';

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
/**
 * Hook para obtener los juegos (eggs) disponibles para un plan específico.
 * Agrupa los eggs por nido (nest) para una mejor presentación.
 */
export const useGameEggs = (planUuid: any, enabled: boolean) => {
  return useQuery({
    queryKey: ['gameEggs', planUuid],
    queryFn: () => (servicesService as any).getGameEggs(planUuid),
    select: (data: any) => data.data || [],
    enabled: enabled && !!planUuid,
    ...queryConfigs.dynamic,
  });
};
