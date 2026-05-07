import ApiService from '@infrastructure/api/apiClient';
import type { User } from '@core/entities/models';
// Rollback: token handling moved back to cookies ( Sanctum )

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  /** Nombre de usuario único (3-30 chars, letras/números/-/_) */
  username: string;
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

export interface UserPreview {
  first_name: string;
  last_name: string;
  email: string;
  /** URL de avatar proveniente de Google OAuth */
  picture?: string | null;
  avatar_url?: string | null;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  access_token?: string;
  message?: string;
  requires_2fa?: boolean;
  /** Google OAuth — nuevo usuario: debe elegir username */
  username_required?: boolean;
  /** Usuario existente autenticado pero sin username asignado */
  needs_username?: boolean;
  /** Token temporal para completar el perfil de Google (flujo username_required) */
  setup_token?: string;
  /** Datos de previsualización del usuario para CompleteProfilePage */
  user_preview?: UserPreview;
  expires_in_minutes?: number;
  redirect_to?: string;
}

export interface UsernameAvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface CompleteProfilePayload {
  setup_token: string;
  username: string;
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
      avatar_url:    googleUserData.picture ?? null,
    });
  
    return response.data;
  },

  /**
   * Verifica si un nombre de usuario está disponible.
   * GET /api/auth/username/check?username=X
   */
  checkUsernameAvailability: async (username: string): Promise<UsernameAvailabilityResponse> => {
    const response = await ApiService.get<UsernameAvailabilityResponse>(
      `/auth/username/check?username=${encodeURIComponent(username)}`,
    );
    return response.data;
  },

  /**
   * Completa el perfil de un usuario nuevo de Google.
   * POST /api/auth/complete-profile
   * Requiere setup_token (no autenticado aún).
   */
  completeProfile: async (payload: CompleteProfilePayload): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/complete-profile', payload);
    return response.data;
  },

  /**
   * Configura el username de un usuario ya autenticado que aún no tiene uno.
   * POST /api/auth/setup-username
   */
  setupUsername: async (username: string): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/setup-username', { username });
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
