import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminTicketsService from '../services/adminTicketsService';
import { queryConfigs } from '../config/queryConfig';

// Query keys para tickets de administración
export const adminTicketsKeys = {
  all: ['admin-tickets'],
  lists: () => [...adminTicketsKeys.all, 'list'],
  list: (filters) => [...adminTicketsKeys.lists(), filters],
  details: () => [...adminTicketsKeys.all, 'detail'],
  detail: (id) => [...adminTicketsKeys.details(), id],
  stats: () => [...adminTicketsKeys.all, 'stats'],
  categories: () => [...adminTicketsKeys.all, 'categories'],
  agents: () => [...adminTicketsKeys.all, 'agents'],
  replies: (id) => [...adminTicketsKeys.all, 'replies', id],
  performance: (params) => [...adminTicketsKeys.all, 'performance', params],
};

/**
 * Hook para obtener todos los tickets con filtros
 */
export const useAdminTickets = (filters = {}) => {
  return useQuery({
    queryKey: adminTicketsKeys.list(filters),
    queryFn: () => adminTicketsService.getAll(filters),
    ...queryConfigs.dynamic,
    select: (data) => {
      // Manejar la estructura real de la API: {success: true, data: {...}}
      if (data.success && data.data) {
        return {
          data: data.data.data || [],
          pagination: {
            current_page: data.data.current_page,
            last_page: data.data.last_page,
            per_page: data.data.per_page,
            total: data.data.total,
            from: data.data.from,
            to: data.data.to,
            first_page_url: data.data.first_page_url,
            last_page_url: data.data.last_page_url,
            next_page_url: data.data.next_page_url,
            prev_page_url: data.data.prev_page_url,
            links: data.data.links || []
          }
        };
      }
      return { data: [], pagination: null };
    },
  });
};

/**
 * Hook para obtener un ticket específico
 */
export const useAdminTicket = (id) => {
  return useQuery({
    queryKey: adminTicketsKeys.detail(id),
    queryFn: () => adminTicketsService.getById(id),
    enabled: !!id,
    ...queryConfigs.sensitive,
  });
};

/**
 * Hook para obtener estadísticas de tickets
 */
export const useAdminTicketsStats = () => {
  return useQuery({
    queryKey: adminTicketsKeys.stats(),
    queryFn: () => adminTicketsService.getStats(),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener categorías de tickets
 */
export const useAdminTicketCategories = () => {
  return useQuery({
    queryKey: adminTicketsKeys.categories(),
    queryFn: () => adminTicketsService.getCategories(),
    ...queryConfigs.static,
  });
};

/**
 * Hook para obtener agentes disponibles
 */
export const useAdminTicketAgents = () => {
  return useQuery({
    queryKey: adminTicketsKeys.agents(),
    queryFn: () => adminTicketsService.getAgents(),
    ...queryConfigs.static,
  });
};

/**
 * Hook para obtener respuestas de un ticket
 */
export const useAdminTicketReplies = (id) => {
  return useQuery({
    queryKey: adminTicketsKeys.replies(id),
    queryFn: () => adminTicketsService.getReplies(id),
    enabled: !!id,
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para obtener métricas de rendimiento
 */
export const useAdminTicketPerformance = (params = {}) => {
  return useQuery({
    queryKey: adminTicketsKeys.performance(params),
    queryFn: () => adminTicketsService.getPerformanceMetrics(params),
    ...queryConfigs.dynamic,
  });
};

/**
 * Hook para crear un nuevo ticket
 */
export const useCreateAdminTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketData) => adminTicketsService.create(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error creating ticket:', error);
    },
  });
};

/**
 * Hook para actualizar un ticket
 */
export const useUpdateAdminTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ticketData }) => adminTicketsService.update(id, ticketData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.detail(variables.id) });
    },
    onError: (error) => {
      console.error('Error updating ticket:', error);
    },
  });
};

/**
 * Hook para eliminar un ticket
 */
export const useDeleteAdminTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminTicketsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting ticket:', error);
    },
  });
};

/**
 * Hook para cambiar estado del ticket
 */
export const useChangeTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => adminTicketsService.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error changing ticket status:', error);
    },
  });
};

/**
 * Hook para cambiar prioridad del ticket
 */
export const useChangeTicketPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }) => adminTicketsService.changePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error changing ticket priority:', error);
    },
  });
};

/**
 * Hook para asignar ticket
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, agentId }) => adminTicketsService.assign(id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error assigning ticket:', error);
    },
  });
};

/**
 * Hook para agregar respuesta al ticket
 */
export const useAddTicketReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, replyData }) => adminTicketsService.addReply(id, replyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.replies(variables.id) });
    },
    onError: (error) => {
      console.error('Error adding reply:', error);
    },
  });
};

/**
 * Hook para cerrar ticket
 */
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => adminTicketsService.close(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error closing ticket:', error);
    },
  });
};

/**
 * Hook para reabrir ticket
 */
export const useReopenTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => adminTicketsService.reopen(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTicketsKeys.all });
    },
    onError: (error) => {
      console.error('Error reopening ticket:', error);
    },
  });
};

