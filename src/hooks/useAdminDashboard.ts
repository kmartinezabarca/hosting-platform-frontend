import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import _adminDashboardService from '../services/adminDashboardService';
// Cast to any since adminDashboardService types may not match expected methods
const adminDashboardService = _adminDashboardService as any;
import { toast } from 'sonner';

interface AdminParams {
  [key: string]: unknown;
}

interface UpdateUserVars {
  userId: number | string;
  userData: Record<string, unknown>;
}

interface UpdateUserStatusVars {
  userId: number | string;
  status: string;
}

interface UpdateServiceStatusVars {
  serviceId: number | string;
  status: string;
  reason?: string;
}

interface UpdateInvoiceStatusVars {
  invoiceId: number | string;
  status: string;
  notes?: string;
}

interface MarkInvoiceAsPaidVars {
  invoiceId: number | string;
  paymentMethod: string;
  notes?: string;
}

interface UpdateTicketStatusVars {
  ticketId: number | string;
  status: string;
}

interface AssignTicketVars {
  ticketId: number | string;
  assignedTo: number | string;
  status?: string;
}

interface AddTicketReplyVars {
  ticketId: number | string;
  message: string;
  isInternal?: boolean;
}

// Query keys para el cache
export const adminQueryKeys = {
  stats: ['admin', 'dashboard', 'stats'],
  users: (params: AdminParams): unknown[] => ['admin', 'users', params],
  services: (params: AdminParams): unknown[] => ['admin', 'services', params],
  invoices: (params: AdminParams): unknown[] => ['admin', 'invoices', params],
  tickets: (params: AdminParams): unknown[] => ['admin', 'tickets', params],
  ticketCategories: ['admin', 'tickets', 'categories'],
  supportAgents: ['admin', 'support-agents']
};

// Hook para obtener estadísticas del dashboard
export const useAdminStats = (): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: adminDashboardService.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
};

// Hook para obtener usuarios con filtros
export const useAdminUsers = (params: AdminParams = {}): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => adminDashboardService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    placeholderData: (prev) => prev,
    retry: 2
  });
};

// Hook para obtener servicios con filtros
export const useAdminServices = (params: AdminParams = {}): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.services(params),
    queryFn: () => adminDashboardService.getServices(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    placeholderData: (prev) => prev,
    retry: 2
  });
};

// Hook para obtener facturas con filtros
export const useAdminInvoices = (params: AdminParams = {}): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.invoices(params),
    queryFn: () => adminDashboardService.getInvoices(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    placeholderData: (prev) => prev,
    retry: 2
  });
};

// Hook para obtener tickets con filtros
export const useAdminTickets = (params: AdminParams = {}): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.tickets(params),
    queryFn: () => adminDashboardService.getTickets(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    placeholderData: (prev) => prev,
    retry: 2
  });
};

// Hook para obtener categorías de tickets
export const useTicketCategories = (): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.ticketCategories,
    queryFn: adminDashboardService.getTicketCategories,
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  });
};

// Hook para obtener agentes de soporte
export const useSupportAgents = (): UseQueryResult<unknown> => {
  return useQuery({
    queryKey: adminQueryKeys.supportAgents,
    queryFn: adminDashboardService.getSupportAgents,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });
};

// Mutations para gestión de usuarios
export const useCreateUser = (): UseMutationResult<unknown, Error, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminDashboardService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  });
};

export const useUpdateUser = (): UseMutationResult<unknown, Error, UpdateUserVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: UpdateUserVars) => adminDashboardService.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  });
};

export const useDeleteUser = (): UseMutationResult<unknown, Error, number | string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminDashboardService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  });
};

export const useUpdateUserStatus = (): UseMutationResult<unknown, Error, UpdateUserStatusVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: UpdateUserStatusVars) => adminDashboardService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado del usuario actualizado');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar estado');
    }
  });
};

// Mutations para gestión de servicios
export const useUpdateServiceStatus = (): UseMutationResult<unknown, Error, UpdateServiceStatusVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, status, reason }: UpdateServiceStatusVars) => adminDashboardService.updateServiceStatus(serviceId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado del servicio actualizado');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar servicio');
    }
  });
};

// Mutations para gestión de facturas
export const useCreateInvoice = (): UseMutationResult<unknown, Error, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminDashboardService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Factura creada exitosamente');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al crear factura');
    }
  });
};

export const useUpdateInvoiceStatus = (): UseMutationResult<unknown, Error, UpdateInvoiceStatusVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, status, notes }: UpdateInvoiceStatusVars) => adminDashboardService.updateInvoiceStatus(invoiceId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado de factura actualizado');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar factura');
    }
  });
};

export const useMarkInvoiceAsPaid = (): UseMutationResult<unknown, Error, MarkInvoiceAsPaidVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, paymentMethod, notes }: MarkInvoiceAsPaidVars) => adminDashboardService.markInvoiceAsPaid(invoiceId, paymentMethod, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Factura marcada como pagada');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al marcar factura como pagada');
    }
  });
};

// Mutations para gestión de tickets
export const useUpdateTicketStatus = (): UseMutationResult<unknown, Error, UpdateTicketStatusVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status }: UpdateTicketStatusVars) => adminDashboardService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado del ticket actualizado');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al actualizar ticket');
    }
  });
};

export const useAssignTicket = (): UseMutationResult<unknown, Error, AssignTicketVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, assignedTo, status }: AssignTicketVars) => adminDashboardService.assignTicket(ticketId, assignedTo, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Ticket asignado exitosamente');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al asignar ticket');
    }
  });
};

export const useAddTicketReply = (): UseMutationResult<unknown, Error, AddTicketReplyVars> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message, isInternal }: AddTicketReplyVars) => adminDashboardService.addTicketReply(ticketId, message, isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Respuesta agregada exitosamente');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al agregar respuesta');
    }
  });
};
