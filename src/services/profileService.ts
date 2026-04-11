import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { Profile, SecurityInfo } from '@/types/models';

interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface AvatarResponse {
  avatar_url: string;
}

const profileService = {
  getProfile: async (): Promise<ApiResponse<Profile>> => {
    const response = await apiClient.get<ApiResponse<Profile>>('/profile');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<Profile>> => {
    const response = await apiClient.put<ApiResponse<Profile>>('/profile', payload);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<AvatarResponse>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<ApiResponse<AvatarResponse>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSecurity: async (): Promise<ApiResponse<SecurityInfo>> => {
    const response = await apiClient.get<ApiResponse<SecurityInfo>>('/profile/security');
    return response.data;
  },

  updatePassword: async (payload: UpdatePasswordPayload): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/profile/password', payload);
    return response.data;
  },
};

export default profileService;
