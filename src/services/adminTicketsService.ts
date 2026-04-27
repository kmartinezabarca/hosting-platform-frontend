import ApiService from './apiClient';
import type { Ticket, TicketStatus, TicketPriority, TicketMessage } from '@/types/models';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface AdminTicketParams {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  user_id?: string | number;
  assigned_to?: string | number;
  page?: number;
  per_page?: number;
}

export interface AdminTicketReplyData {
  message: string;
  internal?: boolean;
  [key: string]: unknown;
}

export interface AdminPerformanceParams {
  period?: string;
  agent_id?: string | number;
}

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  return qs.toString();
};

const adminTicketsService = {
  getAll: async (params: AdminTicketParams = {}): Promise<PaginatedResponse<Ticket>> => {
    const q = buildQuery(params as Record<string, string | number | boolean | undefined>);
    const url = q ? `/admin/tickets?${q}` : '/admin/tickets';
    const response = await ApiService.get<PaginatedResponse<Ticket>>(url);
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.get<ApiResponse<Ticket>>(`/admin/tickets/${id}`);
    return response.data;
  },

  create: async (ticketData: unknown): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.post<ApiResponse<Ticket>>('/admin/tickets', ticketData);
    return response.data;
  },

  update: async (id: string | number, ticketData: unknown): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.put<ApiResponse<Ticket>>(`/admin/tickets/${id}`, ticketData);
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message: string }> => {
    const response = await ApiService.delete<{ message: string }>(`/admin/tickets/${id}`);
    return response.data;
  },

  changeStatus: async (id: string | number, status: TicketStatus): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.put<ApiResponse<Ticket>>(`/admin/tickets/${id}/status`, { status });
    return response.data;
  },

  changePriority: async (id: string | number, priority: TicketPriority): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.put<ApiResponse<Ticket>>(`/admin/tickets/${id}/priority`, { priority });
    return response.data;
  },

  assign: async (id: string | number, agentId: string | number): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.put<ApiResponse<Ticket>>(`/admin/tickets/${id}/assign`, { agent_id: agentId });
    return response.data;
  },

  addReply: async (id: string | number, replyData: AdminTicketReplyData | FormData): Promise<ApiResponse<TicketMessage>> => {
    const response = await ApiService.post<ApiResponse<TicketMessage>>(`/admin/tickets/${id}/reply`, replyData);
    return response.data;
  },

  getReplies: async (id: string | number): Promise<ApiResponse<TicketMessage[]>> => {
    const response = await ApiService.get<ApiResponse<TicketMessage[]>>(`/admin/tickets/${id}/replies`);
    return response.data;
  },

  close: async (id: string | number, reason?: string): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.patch<ApiResponse<Ticket>>(`/admin/tickets/${id}/close`, { reason });
    return response.data;
  },

  reopen: async (id: string | number, reason?: string): Promise<ApiResponse<Ticket>> => {
    const response = await ApiService.patch<ApiResponse<Ticket>>(`/admin/tickets/${id}/reopen`, { reason });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<Record<string, number>>> => {
    const response = await ApiService.get<ApiResponse<Record<string, number>>>('/admin/tickets/stats');
    return response.data;
  },

  getByUser: async (userId: string | number): Promise<PaginatedResponse<Ticket>> => {
    const response = await ApiService.get<PaginatedResponse<Ticket>>(`/admin/users/${userId}/tickets`);
    return response.data;
  },

  getByAgent: async (agentId: string | number): Promise<PaginatedResponse<Ticket>> => {
    const response = await ApiService.get<PaginatedResponse<Ticket>>(`/admin/agents/${agentId}/tickets`);
    return response.data;
  },

  getByPriority: async (priority: TicketPriority): Promise<PaginatedResponse<Ticket>> => {
    const response = await ApiService.get<PaginatedResponse<Ticket>>(`/admin/tickets/priority/${priority}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<unknown[]>> => {
    const response = await ApiService.get<ApiResponse<unknown[]>>('/admin/tickets/categories');
    return response.data;
  },

  getAgents: async (): Promise<ApiResponse<unknown[]>> => {
    const response = await ApiService.get<ApiResponse<unknown[]>>('/admin/tickets/agents');
    return response.data;
  },

  getPerformanceMetrics: async (params: AdminPerformanceParams = {}): Promise<ApiResponse<unknown>> => {
    const q = buildQuery(params as Record<string, string | number | boolean | undefined>);
    const url = q ? `/admin/tickets/performance?${q}` : '/admin/tickets/performance';
    const response = await ApiService.get<ApiResponse<unknown>>(url);
    return response.data;
  },
};

export default adminTicketsService;
