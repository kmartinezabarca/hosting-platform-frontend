// src/hooks/useTickets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '../services/ticketService';

type TicketOptions = {
  enabled?: boolean;
  onSuccess?: (...args: any[]) => void;
  onError?: (...args: any[]) => void;
  [key: string]: any;
};

/** Query Keys normalizados */
export const ticketsKeys = {
  all:        ['tickets'],
  list: (params: any) => ['tickets', 'list', params ?? {}],
  detail: (uuid: any)   => ['tickets', 'detail', uuid],
  stats:      ['tickets', 'stats'],
};

/** Normaliza la respuesta del backend (paginada o no) a un array de filas */
const selectRows = (res: any) => {
  // Soporta: {data:{data:[...]}} (paginador laravel) o {data:[...]} o [...]
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

/** Lista de tickets (con filtros de servidor) */
export function useTickets(params = {}, options: TicketOptions = {}) {
  const { enabled: _enabled, onSuccess: _onSuccess, onError: _onError, ...restOptions } = options;
  return useQuery({
    queryKey: ticketsKeys.list(params),
    queryFn: () => ticketsService.getTickets(params),
    select: selectRows,
    placeholderData: (prev) => prev,
    staleTime: 60_000, // 1 min
    ...restOptions,
  });
}

/** Detalle de un ticket */
export function useTicket(uuid: any, options: TicketOptions = {}) {
  const { enabled, onSuccess: _onSuccess, onError: _onError, ...restOptions } = options;
  return useQuery({
    queryKey: ticketsKeys.detail(uuid),
    queryFn: () => ticketsService.getTicket(uuid),
    enabled: !!uuid && (enabled ?? true),
    select: (res: any) => res?.data ?? res,
    ...restOptions,
  });
}

/** Crear ticket */
export function useCreateTicket(options: TicketOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => ticketsService.createTicket(payload),
    onSuccess: (res, variables) => {
      // Invalida listas
      qc.invalidateQueries({ queryKey: ticketsKeys.all });
      options?.onSuccess?.(res, variables);
    },
    onError: options?.onError,
  });
}

/** Responder (texto + adjuntos) */
export function useAddReply(options: TicketOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: any }) => ticketsService.addReply(uuid, payload),
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
export function useCloseTicket(options: TicketOptions = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => ticketsService.closeTicket(uuid),
    onSuccess: (res, uuid) => {
      qc.invalidateQueries({ queryKey: ticketsKeys.detail(uuid) });
      qc.invalidateQueries({ queryKey: ticketsKeys.all });
      options?.onSuccess?.(res, uuid);
    },
    onError: options?.onError,
  });
}

/** Stats */
export function useTicketStats(options: TicketOptions = {}) {
  const { enabled: _enabled, onSuccess: _onSuccess, onError: _onError, ...restOptions } = options;
  return useQuery({
    queryKey: ticketsKeys.stats,
    queryFn: () => ticketsService.getStats(),
    select: (res: any) => res?.data ?? res,
    staleTime: 5 * 60_000,
    ...restOptions,
  });
}
