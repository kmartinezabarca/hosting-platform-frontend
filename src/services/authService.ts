import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/models';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface Verify2FAPayload {
  code: string;
}

interface GoogleUserData {
  given_name: string;
  family_name?: string;
  email: string;
  sub: string;
  picture?: string | null;
}

interface AuthResponse {
  message: string;
  user?: User;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  verify2FA: async (data: Verify2FAPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/2fa/verify', data);
    return response.data;
  },

  loginWithGoogle: async (googleUserData: GoogleUserData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google/callback', {
      first_name: googleUserData.given_name,
      last_name: googleUserData.family_name ?? '',
      email: googleUserData.email,
      google_id: googleUserData.sub,
      picture: googleUserData.picture ?? null,
    });
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (signal?: AbortSignal): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me', {
      signal,
      _skipAuthRedirect: true,
    });
    return res?.data ?? null;
  },
};

export default authService;
