import ApiService from './apiClient';
import type { Invoice, InvoiceStatus } from '@/types/models';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface AdminInvoiceParams {
  search?: string;
  status?: string;
  user_id?: string | number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface AdminRevenueParams {
  period?: string;
  date_from?: string;
  date_to?: string;
}

export interface InvoiceStats {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  invoices_count: number;
  revenue_this_month?: number;
}

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  return qs.toString();
};

const adminInvoicesService = {
  getAll: async (params: AdminInvoiceParams = {}): Promise<PaginatedResponse<Invoice>> => {
    const q = buildQuery(params as Record<string, string | number | boolean | undefined>);
    const url = q ? `/admin/invoices?${q}` : '/admin/invoices';
    const response = await ApiService.get<PaginatedResponse<Invoice>>(url);
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<Invoice>> => {
    const response = await ApiService.get<ApiResponse<Invoice>>(`/admin/invoices/${id}`);
    return response.data;
  },

  create: async (invoiceData: unknown): Promise<ApiResponse<Invoice>> => {
    const response = await ApiService.post<ApiResponse<Invoice>>('/admin/invoices', invoiceData);
    return response.data;
  },

  update: async (id: string | number, invoiceData: unknown): Promise<ApiResponse<Invoice>> => {
    const response = await ApiService.put<ApiResponse<Invoice>>(`/admin/invoices/${id}`, invoiceData);
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message: string }> => {
    const response = await ApiService.delete<{ message: string }>(`/admin/invoices/${id}`);
    return response.data;
  },

  markAsPaid: async (id: string | number, paymentData?: unknown): Promise<ApiResponse<Invoice>> => {
    const response = await ApiService.post<ApiResponse<Invoice>>(`/admin/invoices/${id}/mark-paid`, paymentData);
    return response.data;
  },

  updateStatus: async (id: string | number, status: InvoiceStatus): Promise<ApiResponse<Invoice>> => {
    const response = await ApiService.put<ApiResponse<Invoice>>(`/admin/invoices/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string | number, reason?: string): Promise<ApiResponse<Invoice>> => {
    const response = await ApiService.post<ApiResponse<Invoice>>(`/admin/invoices/${id}/cancel`, { reason });
    return response.data;
  },

  sendReminder: async (id: string | number): Promise<{ message: string }> => {
    const response = await ApiService.post<{ message: string }>(`/admin/invoices/${id}/send-reminder`);
    return response.data;
  },

  generatePdf: async (id: string | number): Promise<Blob> => {
    const response = await ApiService.get<Blob>(`/admin/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<InvoiceStats>> => {
    const response = await ApiService.get<ApiResponse<InvoiceStats>>('/admin/invoices/stats');
    return response.data;
  },

  getByUser: async (userId: string | number): Promise<PaginatedResponse<Invoice>> => {
    const response = await ApiService.get<PaginatedResponse<Invoice>>(`/admin/users/${userId}/invoices`);
    return response.data;
  },

  getOverdue: async (): Promise<PaginatedResponse<Invoice>> => {
    const response = await ApiService.get<PaginatedResponse<Invoice>>('/admin/invoices/overdue');
    return response.data;
  },

  getRevenueReport: async (params: AdminRevenueParams = {}): Promise<ApiResponse<unknown>> => {
    const q = buildQuery(params as Record<string, string | number | boolean | undefined>);
    const url = q ? `/admin/invoices/revenue-report?${q}` : '/admin/invoices/revenue-report';
    const response = await ApiService.get<ApiResponse<unknown>>(url);
    return response.data;
  },
};

export default adminInvoicesService;
