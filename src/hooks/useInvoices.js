import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import invoicesService from '../services/invoiceService';

// --- QUERIES (para obtener datos) ---

/**
 * Hook para obtener la lista de facturas.
 * @param {object} filters - Objeto con los filtros a aplicar (search, status, etc.).
 */
export const useInvoices = (filters) => {
  return useQuery({
    queryKey: ['invoices', filters], // La queryKey incluye los filtros para que se vuelva a ejecutar si cambian.
    queryFn: () => invoicesService.getInvoices(filters),
    select: (data) => data.data?.data || [], // Seleccionamos y devolvemos solo el array de facturas.
  });
};

/**
 * Hook para obtener las estadísticas de las facturas.
 */
export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: () => invoicesService.getInvoiceStats(),
    select: (data) => data.data || {},
  });
};

/**
 * Hook para obtener los métodos de pago.
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => invoicesService.getPaymentMethods(),
    select: (data) => data.data || [],
  });
};

/**
 * Hook para obtener el historial de transacciones.
 */
export const useTransactions = (filters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => invoicesService.getTransactions(filters),
    select: (data) => data.data?.data || [],
  });
};


// --- MUTATIONS (para modificar datos) ---

/**
 * Hook para procesar el pago de una factura.
 */
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentData) => invoicesService.processPayment(paymentData),
    onSuccess: () => {
      // Cuando el pago es exitoso, invalidamos todas las queries relacionadas
      // para que se actualicen automáticamente con los nuevos datos.
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

/**
 * Hook para establecer un método de pago como predeterminado.
 */
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId, isDefault) => invoicesService.setDefaultPaymentMethod(methodId, isDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};

/**
 * Hook para eliminar un método de pago.
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId) => invoicesService.deletePaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};
