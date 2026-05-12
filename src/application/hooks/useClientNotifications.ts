import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientNotificationsService from '@infrastructure/services/clientNotificationsService';
import { useAuth } from '@application/context/AuthContext';

const QK = {
  list: (normKey: string) => ['notifications', 'client', 'list', normKey],
  unread: ['notifications', 'client', 'unreadCount'],
};

const normalizeParams = (params: Record<string, unknown> = {}) => {
  const cleaned: Record<string, unknown> = {};
  Object.keys(params).sort().forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
  });
  return cleaned;
};

const selectNotifications = (resp: any) => {
  const paged        = resp?.data?.data;
  const flatFromData = Array.isArray(resp?.data) ? resp.data : null;
  const flatDirect   = Array.isArray(resp)       ? resp      : null;

  const list = Array.isArray(paged)
    ? paged
    : Array.isArray(flatFromData)
    ? flatFromData
    : Array.isArray(flatDirect)
    ? flatDirect
    : [];

  const pagination = Array.isArray(paged)
    ? {
        current_page: resp?.data?.current_page ?? 1,
        last_page:    resp?.data?.last_page    ?? 1,
        per_page:     resp?.data?.per_page     ?? list.length,
        total:        resp?.data?.total        ?? list.length,
      }
    : null;

  return { list, pagination, raw: resp };
};

/* =========================
   LISTA Y ACCIONES (CLIENTE)
========================= */
export const useClientNotifications = (params: Record<string, unknown> = {}) => {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const qc = useQueryClient();

  const normParams = useMemo(() => normalizeParams(params), [params]);
  const normKey    = useMemo(() => JSON.stringify(normParams), [normParams]);

  const shouldFetch = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.list(normKey),
    queryFn:  () => clientNotificationsService.list(normParams),
    select:   selectNotifications,
    enabled:  shouldFetch,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => clientNotificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.setQueryData<number>(QK.unread, (old) => Math.max(0, (old ?? 0) - 1));
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => clientNotificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.setQueryData<number>(QK.unread, 0);
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => clientNotificationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  return {
    notifications:      data?.list       ?? [],
    pagination:         data?.pagination ?? null,
    isLoading:          isLoading && shouldFetch,
    error,
    markAsRead:         markAsRead.mutate,
    markAllAsRead:      markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isReady:            shouldFetch,
    // pending IDs for per-button loading states
    markingReadId:  markAsRead.isPending      ? (markAsRead.variables      as string) : null,
    deletingId:     deleteNotification.isPending ? (deleteNotification.variables as string) : null,
  };
};

/* =========================
   CONTADOR DE NO LEÍDOS
========================= */
export const useUnreadNotificationCount = () => {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const shouldFetch = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.unread,
    queryFn:  () => clientNotificationsService.unreadCount(),
    select:   (resp: any) => {
      if (typeof resp === 'number')                       return resp;
      if (typeof resp?.unread_count === 'number')         return resp.unread_count;
      if (typeof resp?.data?.count === 'number')          return resp.data.count;
      if (typeof resp?.data?.unread_count === 'number')   return resp.data.unread_count;
      return 0;
    },
    enabled:              shouldFetch,
    refetchOnWindowFocus: false,
    retry:                false,
    staleTime:            Infinity,  // El WS mantiene el valor actualizado; no refrescar por tiempo
  });

  return {
    unreadCount: data ?? 0,
    isLoading:   isLoading && shouldFetch,
    error,
    isReady:     shouldFetch,
  };
};
