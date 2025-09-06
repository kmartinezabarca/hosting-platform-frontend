import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminDashboardService from '../services/adminDashboardService';
import { toast } from 'sonner';

// Query keys para el cache
export const adminQueryKeys = {
  stats: ['admin', 'dashboard', 'stats'],
  users: (params) => ['admin', 'users', params],
  services: (params) => ['admin', 'services', params],
  invoices: (params) => ['admin', 'invoices', params],
  tickets: (params) => ['admin', 'tickets', params],
  ticketCategories: ['admin', 'tickets', 'categories'],
  supportAgents: ['admin', 'support-agents']
};

// Hook para obtener estadísticas del dashboard
export const useAdminStats = () => {
  return useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: adminDashboardService.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
};

// Hook para obtener usuarios con filtros
export const useAdminUsers = (params = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => adminDashboardService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    keepPreviousData: true,
    retry: 2
  });
};

// Hook para obtener servicios con filtros
export const useAdminServices = (params = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.services(params),
    queryFn: () => adminDashboardService.getServices(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    keepPreviousData: true,
    retry: 2
  });
};

// Hook para obtener facturas con filtros
export const useAdminInvoices = (params = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.invoices(params),
    queryFn: () => adminDashboardService.getInvoices(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    keepPreviousData: true,
    retry: 2
  });
};

// Hook para obtener tickets con filtros
export const useAdminTickets = (params = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.tickets(params),
    queryFn: () => adminDashboardService.getTickets(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    keepPreviousData: true,
    retry: 2
  });
};

// Hook para obtener categorías de tickets
export const useTicketCategories = () => {
  return useQuery({
    queryKey: adminQueryKeys.ticketCategories,
    queryFn: adminDashboardService.getTicketCategories,
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2
  });
};

// Hook para obtener agentes de soporte
export const useSupportAgents = () => {
  return useQuery({
    queryKey: adminQueryKeys.supportAgents,
    queryFn: adminDashboardService.getSupportAgents,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });
};

// Mutations para gestión de usuarios
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminDashboardService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }) => adminDashboardService.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminDashboardService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }) => adminDashboardService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado del usuario actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar estado');
    }
  });
};

// Mutations para gestión de servicios
export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ serviceId, status, reason }) => adminDashboardService.updateServiceStatus(serviceId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado del servicio actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar servicio');
    }
  });
};

// Mutations para gestión de facturas
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminDashboardService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Factura creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear factura');
    }
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, status, notes }) => adminDashboardService.updateInvoiceStatus(invoiceId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado de factura actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar factura');
    }
  });
};

export const useMarkInvoiceAsPaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, paymentMethod, notes }) => adminDashboardService.markInvoiceAsPaid(invoiceId, paymentMethod, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Factura marcada como pagada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al marcar factura como pagada');
    }
  });
};

// Mutations para gestión de tickets
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, status }) => adminDashboardService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats });
      toast.success('Estado del ticket actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar ticket');
    }
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, assignedTo, status }) => adminDashboardService.assignTicket(ticketId, assignedTo, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Ticket asignado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al asignar ticket');
    }
  });
};

export const useAddTicketReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, message, isInternal }) => adminDashboardService.addTicketReply(ticketId, message, isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      toast.success('Respuesta agregada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al agregar respuesta');
    }
  });
};

