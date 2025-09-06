// src/hooks/useTickets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketsService from '../services/ticketService'; // el que reescribimos para apiClient

/** Query Keys normalizados */
export const ticketsKeys = {
  all:        ['tickets'],
  list: (params) => ['tickets', 'list', params ?? {}],
  detail: (uuid)   => ['tickets', 'detail', uuid],
  stats:      ['tickets', 'stats'],
};

/** Normaliza la respuesta del backend (paginada o no) a un array de filas */
const selectRows = (res) => {
  // Soporta: {data:{data:[...]}} (paginador laravel) o {data:[...]} o [...]
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

/** Lista de tickets (con filtros de servidor) */
export function useTickets(params = {}, options = {}) {
  return useQuery({
    queryKey: ticketsKeys.list(params),
    queryFn: () => ticketsService.getTickets(params),
    select: selectRows,
    keepPreviousData: true,
    staleTime: 60_000, // 1 min
    ...options,
  });
}

/** Detalle de un ticket */
export function useTicket(uuid, options = {}) {
  return useQuery({
    queryKey: ticketsKeys.detail(uuid),
    queryFn: () => ticketsService.getTicket(uuid),
    enabled: !!uuid && (options.enabled ?? true),
    select: (res) => res?.data ?? res,
    ...options,
  });
}

/** Crear ticket */
export function useCreateTicket(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => ticketsService.createTicket(payload),
    onSuccess: (res, variables) => {
      // Invalida listas
      qc.invalidateQueries({ queryKey: ticketsKeys.all });
      options?.onSuccess?.(res, variables);
    },
    onError: options?.onError,
  });
}

/** Responder (texto + adjuntos) */
export function useAddReply(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }) => ticketsService.addReply(uuid, payload),
    onSuccess: (res, vars) => {
      // Refrescar detalle y lista
      qc.invalidateQueries({ queryKey: ticketsKeys.detail(vars.uuid) });
      qc.invalidateQueries({ queryKey: ticketsKeys.all });
      options?.onSuccess?.(res, vars);
    },
    onError: options?.onError,
  });
}

/** Cerrar ticket */
export function useCloseTicket(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid) => ticketsService.closeTicket(uuid),
    onSuccess: (res, uuid) => {
      qc.invalidateQueries({ queryKey: ticketsKeys.detail(uuid) });
      qc.invalidateQueries({ queryKey: ticketsKeys.all });
      options?.onSuccess?.(res, uuid);
    },
    onError: options?.onError,
  });
}

/** Stats */
export function useTicketStats(options = {}) {
  return useQuery({
    queryKey: ticketsKeys.stats,
    queryFn: () => ticketsService.getStats(),
    select: (res) => res?.data ?? res,
    staleTime: 5 * 60_000,
    ...options,
  });
}
