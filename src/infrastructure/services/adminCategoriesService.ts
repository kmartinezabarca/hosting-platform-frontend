import ApiService from '@infrastructure/api/apiClient';
import type { ApiResponse } from '@core/entities/api';

export interface AdminCategory {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  bg_color?: string | null;
  is_active: boolean;
  sort_order: number;
  service_plans_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCategoryPayload {
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface AdminCategoriesMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AdminCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean | '';
}

export interface AdminCategoriesResponse {
  success: boolean;
  data: AdminCategory[];
  meta: AdminCategoriesMeta;
}

const adminCategoriesService = {
  getAll: async (params: AdminCategoriesParams = {}): Promise<AdminCategoriesResponse> => {
    const query: Record<string, any> = {};
    if (params.page)      query.page     = params.page;
    if (params.per_page)  query.per_page = params.per_page;
    if (params.search)    query.search   = params.search;
    if (params.is_active !== undefined && params.is_active !== '')
      query.is_active = params.is_active ? 1 : 0;

    const response = await ApiService.get<AdminCategoriesResponse>('/admin/categories', { params: query });
    return response.data;
  },

  create: async (payload: AdminCategoryPayload): Promise<ApiResponse<AdminCategory>> => {
    const response = await ApiService.post<ApiResponse<AdminCategory>>('/admin/categories', payload);
    return response.data;
  },

  update: async (uuid: string, payload: AdminCategoryPayload): Promise<ApiResponse<AdminCategory>> => {
    const response = await ApiService.put<ApiResponse<AdminCategory>>(`/admin/categories/${uuid}`, payload);
    return response.data;
  },

  delete: async (uuid: string): Promise<{ success: boolean; message: string }> => {
    const response = await ApiService.delete<{ success: boolean; message: string }>(`/admin/categories/${uuid}`);
    return response.data;
  },
};

export default adminCategoriesService;
