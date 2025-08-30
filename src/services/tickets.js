import authService from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class TicketsService {
   /* ----------------------------- Helpers ----------------------------- */

  /**
   * Helper para peticiones JSON (el que ya tenías ).
   */
  async #request(path, { method = 'GET', body, signal } = {}) {
    const token = authService.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    // Solo añade Content-Type si hay un body
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!res.ok) {
      const msg = `HTTP error! status: ${res.status}`;
      let details = null;
      try { details = await res.json(); } catch {}
      console.error('TicketsService error:', msg, details || '');
      throw new Error(details?.message || msg);
    }

    // Si la respuesta no tiene contenido (ej. 204 No Content), devuelve un objeto vacío
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json();
    }
    return {};
  }

  /**
   * ✨ NUEVO Helper para peticiones con archivos (FormData).
   */
  async #requestWithFiles(path, { method = 'POST', formData, signal } = {}) {
    const token = authService.getToken();
    
    // Para FormData, NO establecemos el 'Content-Type'. El navegador lo hace por nosotros.
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json', // Aceptamos una respuesta JSON del servidor
    };

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers,
      body: formData, // Pasamos el FormData directamente
    });

    if (!res.ok) {
      const msg = `HTTP error! status: ${res.status}`;
      let details = null;
      try { details = await res.json(); } catch {}
      console.error('TicketsService (with files) error:', msg, details || '');
      throw new Error(details?.message || msg);
    }
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json();
    }
    return {};
  }

  /* ------------------------------- Listado ------------------------------- */
  /**
   * Obtiene tickets paginados del usuario actual.
   * @param {Object} params
   * @param {'open'|'in_progress'|'waiting_customer'|'resolved'|'closed'|'all'} [params.status]
   * @param {'low'|'medium'|'high'|'urgent'|'all'} [params.priority]
   * @param {'technical'|'billing'|'sales'|'abuse'|'all'} [params.department]
   * @param {number} [params.page]
   * @param {number} [params.per_page]
   * @param {AbortSignal} [params.signal]
   */
  async getTickets(params = {}) {
    const { status, priority, department, page, per_page, signal } = params;
    const qp = new URLSearchParams();
    if (status && status !== 'all') qp.set('status', status);
    if (priority && priority !== 'all') qp.set('priority', priority);
    if (department && department !== 'all') qp.set('department', department);
    if (page) qp.set('page', page);
    if (per_page) qp.set('per_page', per_page);

    const qs = qp.toString();
    return this.#request(`/tickets${qs ? `?${qs}` : ''}`, { signal });
  }

  /* ------------------------------ Detalle ------------------------------ */
  /**
   * Obtiene un ticket por UUID (incluye replies).
   * @param {string} uuid
   * @param {AbortSignal} [signal]
   */
  async getTicket(uuid, { signal } = {}) {
    return this.#request(`/tickets/${uuid}`, { signal });
  }

  /* ------------------------------ Crear ------------------------------- */
  /**
   * Crea un ticket.
   * @param {Object} data
   * @param {string} data.subject
   * @param {string} data.message
   * @param {'low'|'medium'|'high'|'urgent'} data.priority
   * @param {'technical'|'billing'|'sales'|'abuse'} data.department
   * @param {number} [data.service_id] // opcional
   * @param {AbortSignal} [signal]
   */
  async createTicket(data, { signal } = {}) {
    return this.#request('/tickets', { method: 'POST', body: data, signal });
  }

 /* ------------------------------ Responder ------------------------------ */
  /**
   * ✨ CORREGIDO: Agrega una respuesta al ticket.
   * Ahora usa el nuevo helper #requestWithFiles.
   * @param {string} uuid
   * @param {FormData} formData - Los datos del mensaje (texto y/o archivos).
   */
  async addReply(uuid, formData) {
    return this.#requestWithFiles(`/tickets/${uuid}/reply`, {
      method: 'POST',
      formData: formData, // El helper espera una propiedad 'formData'
    });
  }

  /* -------------------------------- Cerrar -------------------------------- */
  /**
   * Cierra un ticket.
   * @param {string} uuid
   * @param {AbortSignal} [signal]
   */
  async closeTicket(uuid, { signal } = {}) {
    return this.#request(`/tickets/${uuid}/close`, { method: 'POST', signal });
  }

  /* ------------------------------ Estadísticas ------------------------------ */
  /**
   * Estadísticas de tickets del usuario.
   * @param {AbortSignal} [signal]
   */
  async getStats({ signal } = {}) {
    return this.#request('/tickets/stats', { signal });
  }
}

export default new TicketsService();
