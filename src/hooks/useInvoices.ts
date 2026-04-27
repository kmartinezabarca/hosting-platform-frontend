import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import invoicesService from '../services/invoiceService';
import type { Invoice, InvoiceStats, Transaction, PaymentMethod } from '@/types/models';
import type { FiscalDataPayload } from '@/services/invoiceService';

export interface InvoiceFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
  [key: string]: unknown;
}

export interface ProcessPaymentPayload {
  invoice_uuid: string;
  payment_method_id: string;
  [key: string]: unknown;
}

export interface DownloadCfdiPayload {
  uuid: string;
  format: 'pdf' | 'xml';
  invoiceNumber?: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useInvoices = (filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoicesService.getInvoices(filters as Record<string, unknown>),
    select: (data) => (data as { data?: { data?: Invoice[] } }).data?.data ?? [],
  });
};

export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: () => invoicesService.getInvoiceStats(),
    select: (data) => (data as { data?: InvoiceStats }).data ?? ({} as InvoiceStats),
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => invoicesService.getPaymentMethods(),
    select: (data) => (data as { data?: PaymentMethod[] }).data ?? [],
  });
};

export const useTransactions = (filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => invoicesService.getTransactions(filters as Record<string, unknown>),
    select: (data) => (data as { data?: { data?: Transaction[] } }).data?.data ?? [],
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentData: ProcessPaymentPayload) => invoicesService.processPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

/** Establece un método de pago como predeterminado. */
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string | number) =>
      invoicesService.setDefaultPaymentMethod(String(methodId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string | number) => invoicesService.deletePaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
};

/** Actualiza datos fiscales de una factura en la ventana de 72h */
export const useUpdateInvoiceFiscalData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, ...payload }: FiscalDataPayload & { uuid: string }) =>
      invoicesService.updateFiscalData(uuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

/** Descarga programática del CFDI (PDF o XML) */
export const useDownloadCfdi = () => {
  return useMutation({
    mutationFn: async ({ uuid, format, invoiceNumber }: DownloadCfdiPayload) => {
      const blob = await invoicesService.downloadCfdi(uuid, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoiceNumber ?? uuid}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
};
