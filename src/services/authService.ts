import ApiService from './apiClient';
import type { User } from '@/types/models';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface Verify2FAPayload {
  code: string;
  [key: string]: unknown;
}

export interface GoogleUserData {
  given_name: string;
  family_name?: string;
  email: string;
  sub: string;
  picture?: string | null;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  message?: string;
  requires_2fa?: boolean;
}

/**
 * Servicio para operaciones de autenticación.
 * El backend maneja la sesión a través de cookies httpOnly.
 */
const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterPayload): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  verify2FA: async (data: Verify2FAPayload): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/2fa/verify', data);
    return response.data;
  },

  loginWithGoogle: async (googleUserData: GoogleUserData): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/google/callback', {
      first_name: googleUserData.given_name,
      last_name:  googleUserData.family_name ?? '',
      email:      googleUserData.email,
      google_id:  googleUserData.sub,
      picture:    googleUserData.picture ?? null,
    });
    return response.data;
  },

  logout: async (): Promise<{ message?: string }> => {
    const response = await ApiService.post<{ message?: string }>('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (signal?: AbortSignal): Promise<{ data: User } | null> => {
    const res = await ApiService.get<{ data: User }>('/auth/me', {
      signal,
      _skipAuthRedirect: true,
    } as Parameters<typeof ApiService.get>[1]);
    return res?.data ?? null;
  },
};

export default authService;
