// src/services/ticketsService.ts
import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, FilterParams } from '@/types/api';
import type { Ticket, TicketMessage, TicketStatus, TicketPriority } from '@/types/models';

export interface TicketListParams {
  status?: string;
  priority?: string;
  department?: string;
  search?: string;
  page?: number;
  per_page?: number;
  signal?: AbortSignal;
  [key: string]: string | number | boolean | AbortSignal | undefined;
}

export interface TicketCreateData {
  subject: string;
  message: string;
  priority?: TicketPriority;
  department?: string;
  service_id?: number | string;
}

export interface TicketReplyPayload {
  message?: string;
  files?: File[];
}

export interface TicketStats {
  open: number;
  in_progress: number;
  closed: number;
  pending: number;
  total: number;
}

/** Limpia params donde "all" no debe viajar al backend */
const sanitizeListParams = (p: Omit<TicketListParams, 'signal'> = {}): Record<string, string | number | boolean | undefined> => {
  const { status, priority, department, ...rest } = p;
  return {
    ...(status && status !== 'all' ? { status } : {}),
    ...(priority && priority !== 'all' ? { priority } : {}),
    ...(department && department !== 'all' ? { department } : {}),
    ...rest,
  } as Record<string, string | number | boolean | undefined>;
};

/** Si payload NO es FormData, lo convertimos (message + files[]) */
const ensureFormData = (payload: FormData | TicketReplyPayload): FormData => {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  if (payload?.message != null) fd.append('message', payload.message);
  if (Array.isArray(payload?.files)) {
    payload.files.forEach((file) => fd.append('attachments[]', file));
  }
  // agrega más campos si tu API los admite (e.g. internal, cc, etc.)
  return fd;
};

export const ticketsService = {
  /** GET /tickets?status=&priority=&department=&page=&per_page= */
  async getTickets(params: TicketListParams = {}): Promise<PaginatedResponse<Ticket>> {
    try {
      const { signal, ...rest } = params;
      const response = await apiClient.get<PaginatedResponse<Ticket>>('/tickets', {
        params: sanitizeListParams(rest),
        signal, // AbortController opcional
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  /** GET /tickets/:uuid (detalle + replies) */
  async getTicket(uuid: string, { signal }: { signal?: AbortSignal } = {}): Promise<ApiResponse<Ticket & { messages?: TicketMessage[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<Ticket & { messages?: TicketMessage[] }>>(`/tickets/${uuid}`, { signal });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  /** POST /tickets  (subject, message, priority, department, service_id?) */
  async createTicket(data: TicketCreateData, { signal }: { signal?: AbortSignal } = {}): Promise<ApiResponse<Ticket>> {
    try {
      const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', data, { signal });
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  /**
   * POST /tickets/:uuid/reply
   * payload: FormData  o  { message: string, files?: File[] }
   */
  async addReply(uuid: string, payload: FormData | TicketReplyPayload, { signal }: { signal?: AbortSignal } = {}): Promise<ApiResponse<TicketMessage>> {
    try {
      const formData = ensureFormData(payload);
      const response = await apiClient.post<ApiResponse<TicketMessage>>(
        `/tickets/${uuid}/reply`,
        formData,
        {
          signal,
          // axios detecta FormData y setea multipart boundary solo
          headers: { /* 'Content-Type': 'multipart/form-data' */ },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  /** POST /tickets/:uuid/close */
  async closeTicket(uuid: string, { signal }: { signal?: AbortSignal } = {}): Promise<ApiResponse<Ticket>> {
    try {
      const response = await apiClient.post<ApiResponse<Ticket>>(`/tickets/${uuid}/close`, null, { signal });
      return response.data;
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  },

  /** GET /tickets/stats */
  async getStats({ signal }: { signal?: AbortSignal } = {}): Promise<ApiResponse<TicketStats>> {
    try {
      const response = await apiClient.get<ApiResponse<TicketStats>>('/tickets/stats', { signal });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw error;
    }
  },
};

export default ticketsService;
