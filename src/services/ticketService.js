// src/services/ticketsService.js
import apiClient from './apiClient';

/** Limpia params donde "all" no debe viajar al backend */
const sanitizeListParams = (p = {}) => {
  const { status, priority, department, ...rest } = p;
  return {
    ...(status && status !== 'all' ? { status } : {}),
    ...(priority && priority !== 'all' ? { priority } : {}),
    ...(department && department !== 'all' ? { department } : {}),
    ...rest,
  };
};

/** Si payload NO es FormData, lo convertimos (message + files[]) */
const ensureFormData = (payload) => {
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
  async getTickets(params = {}) {
    try {
      const { signal, ...rest } = params;
      const response = await apiClient.get('/tickets', {
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
  async getTicket(uuid, { signal } = {}) {
    try {
      const response = await apiClient.get(`/tickets/${uuid}`, { signal });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  /** POST /tickets  (subject, message, priority, department, service_id?) */
  async createTicket(data, { signal } = {}) {
    try {
      const response = await apiClient.post('/tickets', data, { signal });
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
  async addReply(uuid, payload, { signal } = {}) {
    try {
      const formData = ensureFormData(payload);
      const response = await apiClient.post(
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
  async closeTicket(uuid, { signal } = {}) {
    try {
      const response = await apiClient.post(`/tickets/${uuid}/close`, null, { signal });
      return response.data;
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  },

  /** GET /tickets/stats */
  async getStats({ signal } = {}) {
    try {
      const response = await apiClient.get('/tickets/stats', { signal });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw error;
    }
  },
};

export default ticketsService;