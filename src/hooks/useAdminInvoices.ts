import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import adminInvoicesService from '../services/adminInvoicesService';
import { queryConfigs } from '../config/queryConfig';
import type { Invoice } from '@/types/models';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url?: string | null;
  last_page_url?: string | null;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  links?: unknown[];
}

interface InvoiceListResult {
  data: Invoice[];
  pagination: PaginationMeta | null;
}

interface UpdateInvoiceVars {
  id: number | string;
  invoiceData: Record<string, unknown>;
}

interface MarkAsPaidVars {
  id: number | string;
  paymentData: Record<string, unknown>;
}

interface UpdateStatusVars {
  id: number | string;
  status: string;
}

interface CancelInvoiceVars {
  id: number | string;
  reason?: string;
}

// Query keys para facturas de administración
export const adminInvoicesKeys = {
  all: ['admin-invoices'],
  lists: (): string[] => [...adminInvoicesKeys.all, 'list'],
  list: (filters: unknown): unknown[] => [...adminInvoicesKeys.lists(), filters],
  details: (): string[] => [...adminInvoicesKeys.all, 'detail'],
  detail: (id: number | string): unknown[] => [...adminInvoicesKeys.details(), id],
  stats: (): string[] => [...adminInvoicesKeys.all, 'stats'],
  overdue: (): string[] => [...adminInvoicesKeys.all, 'overdue'],
  revenue: (params: unknown): unknown[] => [...adminInvoicesKeys.all, 'revenue', params],
};

/**
 * Hook para obtener todas las facturas con filtros
 */
export const useAdminInvoices = (filters: Record<string, unknown> = {}): UseQueryResult<InvoiceListResult> => {
  return useQuery({
    queryKey: adminInvoicesKeys.list(filters),
    queryFn: () => adminInvoicesService.getAll(filters),
    ...queryConfigs.dynamic,
    select: (data: unknown) => {
      const d = data as Record<string, unknown>;
      // Manejar la estructura real de la API: {success: true, data: {...}}
      if (d.success && d.data) {
        const inner = d.data as Record<string, unknown>;
        return {
          data: (inner.data || []) as Invoice[],
          pagination: {
            current_page: inner.current_page,
            last_page: inner.last_page,
            per_page: inner.per_page,
            total: inner.total,
            from: inner.from,
            to: inner.to,
            first_page_url: inner.first_page_url,
            last_page_url: inner.last_page_url,
            next_page_url: inner.next_page_url,
            prev_page_url: inner.prev_page_url,
            links: inner.links || []
          } as PaginationMeta
        };
      }
      return { data: [], pagination: null };
    },
  });
};

/**
 * Hook para obtener una factura específica
 */
export const useAdminInvoice = (id: number | string): UseQueryResult<unknown> => {
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
export const useAdminInvoicesStats = (): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminInvoicesKeys.stats(),
    queryFn: () => adminInvoicesService.getStats(),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener facturas vencidas
 */
export const useAdminOverdueInvoices = (): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminInvoicesKeys.overdue(),
    queryFn: () => adminInvoicesService.getOverdue(),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener reporte de ingresos
 */
export const useAdminRevenueReport = (params: Record<string, unknown> = {}): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminInvoicesKeys.revenue(params),
    queryFn: () => adminInvoicesService.getRevenueReport(params),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para crear una nueva factura
 */
export const useCreateAdminInvoice = (): UseMutationResult<unknown, Error, Record<string, unknown>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceData: Record<string, unknown>) => adminInvoicesService.create(invoiceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error: Error) => {
      console.error('Error creating invoice:', error);
    },
  });
};

/**
 * Hook para actualizar una factura
 */
export const useUpdateAdminInvoice = (): UseMutationResult<unknown, Error, UpdateInvoiceVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceData }: UpdateInvoiceVars) => adminInvoicesService.update(id, invoiceData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.detail(variables.id) });
    },
    onError: (error: Error) => {
      console.error('Error updating invoice:', error);
    },
  });
};

/**
 * Hook para eliminar una factura
 */
export const useDeleteAdminInvoice = (): UseMutationResult<unknown, Error, number | string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => adminInvoicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error: Error) => {
      console.error('Error deleting invoice:', error);
    },
  });
};

/**
 * Hook para marcar factura como pagada
 */
export const useMarkInvoiceAsPaid = (): UseMutationResult<unknown, Error, MarkAsPaidVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentData }: MarkAsPaidVars) => adminInvoicesService.markAsPaid(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error: Error) => {
      console.error('Error marking invoice as paid:', error);
    },
  });
};

/**
 * Hook para cambiar estado de factura
 */
export const useUpdateInvoiceStatus = (): UseMutationResult<unknown, Error, UpdateStatusVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateStatusVars) => adminInvoicesService.updateStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error: Error) => {
      console.error('Error updating invoice status:', error);
    },
  });
};

/**
 * Hook para cancelar factura
 */
export const useCancelInvoice = (): UseMutationResult<unknown, Error, CancelInvoiceVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: CancelInvoiceVars) => adminInvoicesService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInvoicesKeys.all });
    },
    onError: (error: Error) => {
      console.error('Error cancelling invoice:', error);
    },
  });
};

/**
 * Hook para enviar recordatorio
 */
export const useSendInvoiceReminder = (): UseMutationResult<unknown, Error, number | string> => {
  return useMutation({
    mutationFn: (id: number | string) => adminInvoicesService.sendReminder(id),
    onError: (error: Error) => {
      console.error('Error sending reminder:', error);
    },
  });
};
