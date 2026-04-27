import apiClient from './apiClient';
import type { ApiResponse, MessageResponse } from '@/types/api';

export interface FiscalRegime {
  key?: string;
  code?: string;
  description: string;
  type?: 'fisica' | 'moral' | 'both';
}

export interface CfdiUse {
  key?: string;
  code?: string;
  description: string;
  type?: 'fisica' | 'moral' | 'both';
}

export interface FiscalProfile {
  id: number;
  uuid: string;
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
  uso_cfdi: string;
  is_default: boolean;
  email?: string;
  cp?: string;
  [key: string]: unknown;
}

export interface FiscalProfilePayload {
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
  uso_cfdi: string;
  email?: string;
  cp?: string;
  is_default?: boolean;
  [key: string]: unknown;
}

/**
 * Normaliza cualquier forma de respuesta de Laravel a un array:
 *   { data: [...] }              → resource collection
 *   { data: { data: [...] } }   → paginado
 *   [...]                        → array directo
 */
function toArray<T>(response: unknown): T[] {
  const d = (response as Record<string, unknown>)?.data ?? response;
  if (Array.isArray(d)) return d as T[];               // array directo
  if (Array.isArray((d as Record<string, unknown>)?.data)) return (d as { data: T[] }).data;   // resource collection { data: [...] }
  if (Array.isArray(((d as Record<string, unknown>)?.data as Record<string, unknown>)?.data)) return ((d as { data: { data: T[] } }).data).data; // paginado { data: { data: [...] } }
  return [];
}

const fiscalService = {
  /* ── Catálogos SAT ─────────────────────────────────────── */

  /** Regímenes fiscales. type: 'fisica' | 'moral' | undefined (todos) */
  getRegimes: async (type?: 'fisica' | 'moral'): Promise<FiscalRegime[]> => {
    const params = type ? { type } : {};
    const response = await apiClient.get('/fiscal/regimes', { params });
    return toArray<FiscalRegime>(response.data);
  },

  /** Usos de CFDI. type: 'fisica' | 'moral' | undefined (todos) */
  getCfdiUses: async (type?: 'fisica' | 'moral'): Promise<CfdiUse[]> => {
    const params = type ? { type } : {};
    const response = await apiClient.get('/fiscal/cfdi-uses', { params });
    return toArray<CfdiUse>(response.data);
  },

  /* ── Perfiles fiscales del usuario ─────────────────────── */

  /** Lista todos los perfiles del usuario autenticado */
  getProfiles: async (): Promise<FiscalProfile[]> => {
    const response = await apiClient.get('/fiscal/profiles');
    return toArray<FiscalProfile>(response.data);
  },

  /** Obtiene un perfil por UUID */
  getProfile: async (uuid: string): Promise<FiscalProfile> => {
    const { data } = await apiClient.get<ApiResponse<FiscalProfile>>(`/fiscal/profiles/${uuid}`);
    return (data as { data?: FiscalProfile })?.data ?? data as unknown as FiscalProfile;
  },

  /** Crea un nuevo perfil fiscal */
  createProfile: async (payload: FiscalProfilePayload): Promise<FiscalProfile> => {
    const { data } = await apiClient.post<ApiResponse<FiscalProfile>>('/fiscal/profiles', payload);
    return (data as { data?: FiscalProfile })?.data ?? data as unknown as FiscalProfile;
  },

  /** Actualiza un perfil fiscal existente */
  updateProfile: async (uuid: string, payload: Partial<FiscalProfilePayload>): Promise<FiscalProfile> => {
    const { data } = await apiClient.put<ApiResponse<FiscalProfile>>(`/fiscal/profiles/${uuid}`, payload);
    return (data as { data?: FiscalProfile })?.data ?? data as unknown as FiscalProfile;
  },

  /** Elimina un perfil fiscal */
  deleteProfile: async (uuid: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(`/fiscal/profiles/${uuid}`);
    return data;
  },

  /** Marca un perfil como predeterminado */
  setDefault: async (uuid: string): Promise<FiscalProfile> => {
    const { data } = await apiClient.put<ApiResponse<FiscalProfile>>(`/fiscal/profiles/${uuid}/set-default`);
    return (data as { data?: FiscalProfile })?.data ?? data as unknown as FiscalProfile;
  },
};

export default fiscalService;
