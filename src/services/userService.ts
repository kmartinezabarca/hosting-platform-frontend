import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, MessageResponse, FilterParams } from '@/types/api';
import type { User } from '@/types/models';

export interface UserFilterParams extends FilterParams {
  role?: string;
  status?: string;
}

export interface UserCreateData {
  email: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'client';
  password?: string;
  [key: string]: unknown;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  clients: number;
  [key: string]: unknown;
}

export interface ActivityItem {
  id: number;
  description: string;
  created_at: string;
  [key: string]: unknown;
}

const usersService = {
  // Obtener todos los usuarios (admin)
  getAll: async (params: UserFilterParams = {}): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.per_page) queryParams.append('per_page', String(params.per_page));

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';

    const response = await apiClient.get<PaginatedResponse<User>>(url);
    return response.data;
  },

  // Obtener un usuario específico
  getById: async (id: number | string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  create: async (userData: UserCreateData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/admin/users', userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (id: number | string, userData: Partial<UserCreateData>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id: number | string): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(`/admin/users/${id}`);
    return response.data;
  },

  // Cambiar estado del usuario
  changeStatus: async (id: number | string, status: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // Obtener estadísticas de usuarios
  getStats: async (): Promise<ApiResponse<UserStats>> => {
    const response = await apiClient.get<ApiResponse<UserStats>>('/admin/users/stats');
    return response.data;
  },

  // Obtener actividad reciente de usuarios
  getRecentActivity: async (limit: number = 10): Promise<ApiResponse<ActivityItem[]>> => {
    const response = await apiClient.get<ApiResponse<ActivityItem[]>>(`/admin/users/recent-activity?limit=${limit}`);
    return response.data;
  }
};

export default usersService;
