import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminInvoicesService from '../services/adminInvoicesService';
import { queryConfigs } from '../config/queryConfig';

// Query keys para facturas de administración
export const adminInvoicesKeys = {
  all: ['admin-invoices'],
  lists: () => [...adminInvoicesKeys.all, 'list'],
  list: (filters) => [...adminInvoicesKeys.lists(), filters],
  details: () => [...adminInvoicesKeys.all, 'detail'],
  detail: (id) => [...adminInvoicesKeys.details(), id],
  stats: () => [...adminInvoicesKeys.all, 'stats'],
  overdue: () => [...adminInvoicesKeys.all, 'overdue'],
  revenue: (params) => [...adminInvoicesKeys.all, 'revenue', params],
};

/**
 * Hook para obtener todas las facturas con filtros
 */
export const useAdminInvoices = (filters = {}) => {
  return useQuery({
    queryKey: adminInvoicesKeys.list(filters),
    queryFn: () => adminInvoicesService.getAll(filters),
    ...queryConfigs.dynamic,
    select: (data) => {
      // Manejar la estructura real de la API: {success: true, data: {...}}
      if (data.success && data.data) {
        return {
          data: data.data.data || [],
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
      return { data: [], pagination: null };
    },
  });
};

/**
 * Hook para obtener una factura específica
 */
export const useAdminInvoice = (id) => {
  return useQuery({
    queryKey: adminInvoicesKeys.detail(id),
    queryFn: () => adminInvoicesService.getById(id),
    enabled: !!id,
    ...queryConfigs.sensitive,
  });
};

/**
 * Hook para obtener estadísticas de facturas
 */
export const useAdminInvoicesStats = () => {
  return useQuery({
    queryKey: adminInvoicesKeys.stats(),
    queryFn: () => adminInvoicesService.getStats(),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener facturas vencidas
 */
export const useAdminOverdueInvoices = () => {
  return useQuery({
    queryKey: adminInvoicesKeys.overdue(),
    queryFn: () => adminInvoicesService.getOverdue(),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener reporte de ingresos
 */
export const useAdminRevenueReport = (params = {}) => {
  return useQuery({
    queryKey: adminInvoicesKeys.revenue(params),
    queryFn: () => adminInvoicesService.getRevenueReport(params),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para crear una nueva factura
 */
export const useCreateAdminInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceData) => adminInvoicesService.create(invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
    },
  });
};

/**
 * Hook para actualizar una factura
 */
export const useUpdateAdminInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceData }) => adminInvoicesService.update(id, invoiceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.detail(variables.id) });
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
    },
  });
};

/**
 * Hook para eliminar una factura
 */
export const useDeleteAdminInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminInvoicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error);
    },
  });
};

/**
 * Hook para marcar factura como pagada
 */
export const useMarkInvoiceAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentData }) => adminInvoicesService.markAsPaid(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error) => {
      console.error('Error marking invoice as paid:', error);
    },
  });
};

/**
 * Hook para cambiar estado de factura
 */
export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => adminInvoicesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error) => {
      console.error('Error updating invoice status:', error);
    },
  });
};

/**
 * Hook para cancelar factura
 */
export const useCancelInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => adminInvoicesService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error) => {
      console.error('Error cancelling invoice:', error);
    },
  });
};

/**
 * Hook para enviar recordatorio
 */
export const useSendInvoiceReminder = () => {
  return useMutation({
    mutationFn: (id) => adminInvoicesService.sendReminder(id),
    onError: (error) => {
      console.error('Error sending reminder:', error);
    },
  });
};

