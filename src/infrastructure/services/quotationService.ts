import ApiService from '@infrastructure/api/apiClient';

// ── Types ────────────────────────────────────────────────────────────────────

export interface QuotationItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'pending_revision';
export type QuotationCurrency = 'MXN' | 'USD';

export interface Activity {
  id: number;
  action: string;
  description?: string | null;
  user_id?: number | null;
  created_at: string;
}

export interface Quotation {
  id: number;
  uuid: string;
  title: string;
  client_name: string;
  client_email: string;
  client_company?: string | null;
  client_phone?: string | null;
  items: QuotationItem[];
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  currency: QuotationCurrency;
  notes?: string | null;
  terms?: string | null;
  status: QuotationStatus;
  status_label: string;
  revision_number: number;
  parent_uuid?: string | null;
  is_expired: boolean;
  can_be_modified: boolean;
  can_be_deleted: boolean;
  can_be_sent: boolean;
  can_be_accepted: boolean;
  can_be_rejected: boolean;
  can_be_reopened: boolean;
  activities: Activity[];
  public_token: string;
  public_url: string;
  expires_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationCreatePayload {
  title: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  items: Omit<QuotationItem, 'id' | 'subtotal'>[];
  discount_percent?: number;
  tax_percent?: number;
  currency?: QuotationCurrency;
  notes?: string;
  terms?: string;
}

export interface QuotationUpdatePayload extends Partial<QuotationCreatePayload> {
  status?: QuotationStatus;
}

export interface QuotationListParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  return qs.toString();
};

// ── Service ──────────────────────────────────────────────────────────────────

const quotationService = {
  /** List all quotations (admin) */
  getAll: async (params: QuotationListParams = {}): Promise<any> => {
    const q = buildQuery(params as any);
    const url = q ? `/admin/quotations?${q}` : '/admin/quotations';
    const res = await ApiService.get(url);
    return res.data;
  },

  /** Get one quotation by uuid (admin) */
  getById: async (uuid: string): Promise<any> => {
    const res = await ApiService.get(`/admin/quotations/${uuid}`);
    return res.data;
  },

  /** Create quotation */
  create: async (payload: QuotationCreatePayload): Promise<any> => {
    const res = await ApiService.post('/admin/quotations', payload);
    return res.data;
  },

  /** Update quotation */
  update: async (uuid: string, payload: QuotationUpdatePayload): Promise<any> => {
    const res = await ApiService.put(`/admin/quotations/${uuid}`, payload);
    return res.data;
  },

  /** Delete quotation */
  delete: async (uuid: string): Promise<any> => {
    const res = await ApiService.delete(`/admin/quotations/${uuid}`);
    return res.data;
  },

  /**
   * Send quotation to client — backend generates public_token and sets
   * expires_at to now + 72 hours, changes status to "sent"
   */
  send: async (uuid: string): Promise<any> => {
    const res = await ApiService.post(`/admin/quotations/${uuid}/send`, {});
    return res.data;
  },

  /**
   * Regenerate / extend the public link (+72 h from now)
   */
  regenerateLink: async (uuid: string): Promise<any> => {
    const res = await ApiService.post(`/admin/quotations/${uuid}/regenerate-link`, {});
    return res.data;
  },

  /** Accept quotation */
  accept: async (uuid: string): Promise<any> => {
    const res = await ApiService.post(`/admin/quotations/${uuid}/accept`, {});
    return res.data;
  },

  /** Reject quotation */
  reject: async (uuid: string): Promise<any> => {
    const res = await ApiService.post(`/admin/quotations/${uuid}/reject`, {});
    return res.data;
  },

  /** Reopen quotation (from rejected/expired/cancelled back to draft) */
  reopen: async (uuid: string): Promise<any> => {
    const res = await ApiService.post(`/admin/quotations/${uuid}/reopen`, {});
    return res.data;
  },

  /** Create a revision (duplicate as new quotation with reference to original) */
  createRevision: async (uuid: string): Promise<any> => {
    const res = await ApiService.post(`/admin/quotations/${uuid}/revision`, {});
    return res.data;
  },

  // ── Public (no auth) ──────────────────────────────────────────────────────

  /**
   * Fetch a quotation by its public token — used on the public view page.
   * This endpoint must be unauthenticated on the backend.
   */
  getPublic: async (token: string): Promise<any> => {
    const res = await ApiService.get(`/quotations/public/${token}`);
    return res.data;
  },

  /**
   * Record that a client has viewed the quotation (marks status = "viewed")
   */
  markViewed: async (token: string): Promise<any> => {
    const res = await ApiService.post(`/quotations/public/${token}/viewed`, {});
    return res.data;
  },
};

export default quotationService;
