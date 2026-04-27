import ApiService from './apiClient';
import type { Service, ServiceStatus } from '@/types/models';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface AdminServiceParams {
  search?: string;
  status?: string;
  plan_id?: string | number;
  user_id?: string | number;
  page?: number;
  per_page?: number;
}

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  return qs.toString();
};

const adminServicesService = {
  getAll: async (params: AdminServiceParams = {}): Promise<PaginatedResponse<Service>> => {
    const q = buildQuery(params as Record<string, string | number | boolean | undefined>);
    const url = q ? `/admin/services?${q}` : '/admin/services';
    const response = await ApiService.get<PaginatedResponse<Service>>(url);
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<Service>> => {
    const response = await ApiService.get<ApiResponse<Service>>(`/admin/services/${id}`);
    return response.data;
  },

  create: async (serviceData: unknown): Promise<ApiResponse<Service>> => {
    const response = await ApiService.post<ApiResponse<Service>>('/admin/services', serviceData);
    return response.data;
  },

  update: async (id: string | number, serviceData: unknown): Promise<ApiResponse<Service>> => {
    const response = await ApiService.put<ApiResponse<Service>>(`/admin/services/${id}`, serviceData);
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message: string }> => {
    const response = await ApiService.delete<{ message: string }>(`/admin/services/${id}`);
    return response.data;
  },

  changeStatus: async (id: string | number, status: ServiceStatus): Promise<ApiResponse<Service>> => {
    const response = await ApiService.patch<ApiResponse<Service>>(`/admin/services/${id}/status`, { status });
    return response.data;
  },

  suspend: async (id: string | number, reason?: string): Promise<ApiResponse<Service>> => {
    const response = await ApiService.patch<ApiResponse<Service>>(`/admin/services/${id}/suspend`, { reason });
    return response.data;
  },

  reactivate: async (id: string | number): Promise<ApiResponse<Service>> => {
    const response = await ApiService.patch<ApiResponse<Service>>(`/admin/services/${id}/reactivate`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<Record<string, number>>> => {
    const response = await ApiService.get<ApiResponse<Record<string, number>>>('/admin/services/stats');
    return response.data;
  },

  getByUser: async (userId: string | number): Promise<PaginatedResponse<Service>> => {
    const response = await ApiService.get<PaginatedResponse<Service>>(`/admin/users/${userId}/services`);
    return response.data;
  },

  getHistory: async (id: string | number): Promise<ApiResponse<unknown[]>> => {
    const response = await ApiService.get<ApiResponse<unknown[]>>(`/admin/services/${id}/history`);
    return response.data;
  },
};

export default adminServicesService;
