/**
 * Tipos base para respuestas de la API de Laravel.
 * Todos los servicios deben usar estos tipos para consistencia.
 */

// ─── Envelopes de respuesta ────────────────────────────────────────────────

/** Respuesta de un solo recurso: { data: T } */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Respuesta paginada de Laravel: { data: T[], meta, links } */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

/** Respuesta de mensaje genérico */
export interface MessageResponse {
  message: string;
}

// ─── Config de petición ────────────────────────────────────────────────────

import type { AxiosRequestConfig } from 'axios';

export interface ApiRequestConfig extends AxiosRequestConfig {
  /** Si true, evita el redirect automático a /login en 401/403 */
  _skipAuthRedirect?: boolean;
}

// ─── Parámetros comunes de queries ────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface FilterParams extends SearchParams {
  status?: string;
  [key: string]: string | number | boolean | undefined;
}
