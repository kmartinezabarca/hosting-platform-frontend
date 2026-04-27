// Admin API service for communicating with the backend
import ApiService from './apiClient';
import type { AxiosInstance } from 'axios';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: string;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

const buildEndpoint = (base: string, params: QueryParams = {}): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const q = qs.toString();
  return q ? `${base}?${q}` : base;
};

class AdminApiService {
  private apiClient: typeof ApiService;

  constructor() {
    this.apiClient = ApiService;
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    try {
      const method = (options.method ?? 'GET').toLowerCase() as Lowercase<HttpMethod>;
      const data = options.body ? JSON.parse(options.body) : undefined;

      let response;
      switch (method) {
        case 'post':   response = await this.apiClient.post(endpoint, data); break;
        case 'put':    response = await this.apiClient.put(endpoint, data); break;
        case 'patch':  response = await this.apiClient.patch(endpoint, data); break;
        case 'delete': response = await this.apiClient.delete(endpoint); break;
        default:       response = await this.apiClient.get(endpoint);
      }
      return response.data as T;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────
  getDashboardStats = () => this.request('/admin/dashboard/stats');

  // ─── Users ────────────────────────────────────────────────────────────────
  getUsers   = (params: QueryParams = {}) => this.request(buildEndpoint('/admin/users', params));
  createUser = (userData: unknown)         => this.request('/admin/users', { method: 'POST', body: JSON.stringify(userData) });
  updateUser = (id: string | number, userData: unknown) =>
    this.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
  updateUserStatus = (id: string | number, status: string) =>
    this.request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  deleteUser = (id: string | number) => this.request(`/admin/users/${id}`, { method: 'DELETE' });

  // ─── Services ─────────────────────────────────────────────────────────────
  getServices = (params: QueryParams = {}) => this.request(buildEndpoint('/admin/services', params));
  updateServiceStatus = (id: string | number, status: string) =>
    this.request(`/admin/services/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

  // ─── Invoices ─────────────────────────────────────────────────────────────
  getInvoices    = (params: QueryParams = {}) => this.request(buildEndpoint('/admin/invoices', params));
  createInvoice  = (data: unknown) => this.request('/admin/invoices', { method: 'POST', body: JSON.stringify(data) });
  updateInvoice  = (id: string | number, data: unknown) =>
    this.request(`/admin/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  updateInvoiceStatus = (id: string | number, status: string) =>
    this.request(`/admin/invoices/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  markInvoiceAsPaid     = (id: string | number) => this.request(`/admin/invoices/${id}/mark-paid`, { method: 'POST' });
  sendInvoiceReminder   = (id: string | number) => this.request(`/admin/invoices/${id}/send-reminder`, { method: 'POST' });
  cancelInvoice         = (id: string | number) => this.request(`/admin/invoices/${id}/cancel`, { method: 'POST' });
  deleteInvoice         = (id: string | number) => this.request(`/admin/invoices/${id}`, { method: 'DELETE' });

  // ─── Tickets ──────────────────────────────────────────────────────────────
  getTickets    = (params: QueryParams = {}) => this.request(buildEndpoint('/admin/tickets', params));
  createTicket  = (data: unknown) => this.request('/admin/tickets', { method: 'POST', body: JSON.stringify(data) });
  updateTicket  = (id: string | number, data: unknown) =>
    this.request(`/admin/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  assignTicket  = (id: string | number, agentId: string | number) =>
    this.request(`/admin/tickets/${id}/assign`, { method: 'PUT', body: JSON.stringify({ agent_id: agentId }) });
  updateTicketStatus   = (id: string | number, status: string) =>
    this.request(`/admin/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  updateTicketPriority = (id: string | number, priority: string) =>
    this.request(`/admin/tickets/${id}/priority`, { method: 'PUT', body: JSON.stringify({ priority }) });
  addTicketReply = (id: string | number, replyData: unknown) =>
    this.request(`/admin/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify(replyData) });
  deleteTicket  = (id: string | number) => this.request(`/admin/tickets/${id}`, { method: 'DELETE' });
  getTicketCategories = () => this.request('/admin/tickets/categories');
  getSupportAgents    = () => this.request('/admin/tickets/agents');

  // ─── Categories ───────────────────────────────────────────────────────────
  createCategory = (data: unknown) => this.request('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
  updateCategory = (uuid: string, data: unknown) =>
    this.request(`/admin/categories/${uuid}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteCategory = (uuid: string) => this.request(`/admin/categories/${uuid}`, { method: 'DELETE' });

  // ─── Billing Cycles ───────────────────────────────────────────────────────
  createBillingCycle = (data: unknown) => this.request('/admin/billing-cycles', { method: 'POST', body: JSON.stringify(data) });
  updateBillingCycle = (uuid: string, data: unknown) =>
    this.request(`/admin/billing-cycles/${uuid}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteBillingCycle = (uuid: string) => this.request(`/admin/billing-cycles/${uuid}`, { method: 'DELETE' });

  // ─── Service Plans ────────────────────────────────────────────────────────
  createServicePlan = (data: unknown) => this.request('/admin/service-plans', { method: 'POST', body: JSON.stringify(data) });
  updateServicePlan = (uuid: string, data: unknown) =>
    this.request(`/admin/service-plans/${uuid}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteServicePlan = (uuid: string) => this.request(`/admin/service-plans/${uuid}`, { method: 'DELETE' });

  // ─── Add-ons ──────────────────────────────────────────────────────────────
  createAddOn = (data: unknown) => this.request('/admin/add-ons', { method: 'POST', body: JSON.stringify(data) });
  updateAddOn = (uuid: string, data: unknown) =>
    this.request(`/admin/add-ons/${uuid}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteAddOn = (uuid: string) => this.request(`/admin/add-ons/${uuid}`, { method: 'DELETE' });
  attachAddOnToPlan = (uuid: string, planUuid: string) =>
    this.request(`/admin/add-ons/${uuid}/attach-plan`, { method: 'POST', body: JSON.stringify({ plan_uuid: planUuid }) });
  detachAddOnFromPlan = (uuid: string, planUuid: string) =>
    this.request(`/admin/add-ons/${uuid}/detach-plan`, { method: 'POST', body: JSON.stringify({ plan_uuid: planUuid }) });

  // ─── Products ─────────────────────────────────────────────────────────────
  createProduct = (data: unknown) => this.request('/admin/products', { method: 'POST', body: JSON.stringify(data) });
  updateProduct = (uuid: string, data: unknown) =>
    this.request(`/admin/products/${uuid}`, { method: 'PUT', body: JSON.stringify(data) });
  deleteProduct = (uuid: string) => this.request(`/admin/products/${uuid}`, { method: 'DELETE' });
}

const adminApiService = new AdminApiService();
export default adminApiService;
