import ApiService from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { User, SecurityInfo } from '@/types/models';

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  address?: string;
  postal_code?: string;
  [key: string]: unknown;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const profileService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await ApiService.get<ApiResponse<User>>('/profile');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<User>> => {
    const response = await ApiService.put<ApiResponse<User>>('/profile', payload);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await ApiService.post<ApiResponse<{ avatar_url: string }>>(
      '/profile/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  getSecurity: async (): Promise<ApiResponse<SecurityInfo>> => {
    const response = await ApiService.get<ApiResponse<SecurityInfo>>('/profile/security');
    return response.data;
  },

  updatePassword: async (payload: UpdatePasswordPayload): Promise<ApiResponse<{ message: string }>> => {
    const response = await ApiService.put<ApiResponse<{ message: string }>>('/profile/password', payload);
    return response.data;
  },
};

export default profileService;
