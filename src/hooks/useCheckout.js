import { useQuery } from '@tanstack/react-query';
import { queryConfigs } from '../config/queryConfig';
import servicesService from '../services/serviceService'; // Asegúrate de que este sea el servicio correcto
import invoicesService from '../services/invoiceService'; // Asegúrate de que este sea el servicio correcto

/**
 * Hook para obtener los add-ons de un plan específico.
 * @param {string} planId - El ID del plan para el que se quieren obtener los add-ons.
 * @param {boolean} enabled - Si la query debe estar habilitada.
 */
export const usePlanAddons = (planId, enabled) => {
  return useQuery({
    queryKey: ['planAddons', planId],
    queryFn: () => servicesService.getPlanAddOns(planId),
    select: (data) => data.data || [],
    enabled: enabled && !!planId,
    ...queryConfigs.dynamic,
    onError: (error) => {
      console.error("Error al obtener add-ons del plan", error);
    },
  });
};

/**
 * Hook para obtener los métodos de pago del usuario.
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: invoicesService.getPaymentMethods,
    select: (data) => data.data || [],
    ...queryConfigs.dynamic,
    onError: (error) => {
      console.error("Error al obtener métodos de pago", error);
    },
  });
};


