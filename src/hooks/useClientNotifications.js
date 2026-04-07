import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientNotificationsService from '@/services/clientNotificationsService';
import echoInstance from '@/services/echoService';
import { useAuth } from '@/context/AuthContext';

const QK = {
  list: (normKey) => ['notifications', 'client', 'list', normKey], // normKey estable (string)
  unread: ['notifications', 'client', 'unreadCount'],
};

// Normaliza params a un objeto con claves ordenadas y sin undefined/null/''.
const normalizeParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
    });
  return cleaned;
};

// Normaliza respuesta: { data: [...] } | { data: { data:[...], ... } } | arreglo plano
const selectNotifications = (resp) => {
  const paged = resp?.data?.data;
  const flatFromData = Array.isArray(resp?.data) ? resp.data : null;
  const flatDirect = Array.isArray(resp) ? resp : null;

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
        last_page: resp?.data?.last_page ?? 1,
        per_page: resp?.data?.per_page ?? list.length,
        total: resp?.data?.total ?? list.length,
      }
    : null;

  return { list, pagination, raw: resp };
};

/* =========================
   LISTA Y ACCIONES (CLIENTE)
========================= */
export const useClientNotifications = (params = {}) => {
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  // Parametros estables
  const normParams = useMemo(() => normalizeParams(params), [params]);
  const normKey = useMemo(() => JSON.stringify(normParams), [normParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.list(normKey),
    queryFn: () => clientNotificationsService.list(normParams),
    select: selectNotifications,
    enabled: isAuthenticated, // <- NO consultes si no hay sesión
    keepPreviousData: true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const markAsRead = useMutation({
    mutationFn: (id) => clientNotificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => clientNotificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => clientNotificationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  // Suscripción realtime SOLO cuando hay usuario autenticado
  useEffect(() => {
    if (!isAuthenticated || !user?.uuid) return;

    const channelName = `user.${user.uuid}`;
    const channel = echoInstance.private(channelName);

    const handler = (e) => {
      // console.log('Reverb: notif cliente recibida:', e);
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    };

    // IMPORTANTE: usa exactamente el nombre que emite tu backend
    channel.listen('notification.received', handler);

    return () => {
      try {
        channel.stopListening('notification.received', handler);
      } catch {}
      try {
        echoInstance.leave(channelName);
      } catch {}
    };
  }, [isAuthenticated, user?.uuid, qc, normKey]);

  return {
    notifications: data?.list ?? [],
    pagination: data?.pagination ?? null,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
};

/* =========================
   CONTADOR DE NO LEÍDOS
========================= */
export const useUnreadNotificationCount = () => {
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: QK.unread,
    queryFn: () => clientNotificationsService.unreadCount(),
    select: (resp) => {
      if (typeof resp === 'number') return resp;
      if (typeof resp?.count === 'number') return resp.count;
      if (typeof resp?.data?.count === 'number') return resp.data.count;
      return 0;
    },
    enabled: isAuthenticated, // <- NO consultes si no hay sesión
    refetchInterval: isAuthenticated ? 10000 : false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.uuid) return;

    const channelName = `user.${user.uuid}`;
    const channel = echoInstance.private(channelName);

    const handler = () => qc.invalidateQueries({ queryKey: QK.unread });

    channel.listen('notification.received', handler);

    return () => {
      try {
        channel.stopListening('notification.received', handler);
      } catch {}
      try {
        echoInstance.leave(channelName);
      } catch {}
    };
  }, [isAuthenticated, user?.uuid, qc]);

  return { unreadCount: data ?? 0, isLoading, error };
};