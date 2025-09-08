// src/hooks/useClientNotifications.js
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientNotificationsService from '@/services/clientNotificationsService';
import { subscribeToChannel } from '@/services/pusherService';

const QK = {
  list: (params) => ['notifications', 'client', 'list', params || {}],
  unread: ['notifications', 'client', 'unreadCount'],
};

// Normaliza respuesta: soporta { data: [...] }, { data: { data:[...], ... } } o arreglo plano
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
   LISTA Y ACCIONES DE CLIENTE
========================= */
export const useClientNotifications = (params = {}) => {
  const qc = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: QK.list(params),
    queryFn: () => clientNotificationsService.list(params),
    select: selectNotifications,
    keepPreviousData: true,
    staleTime: 60_000,
  });

  const markAsRead = useMutation({
    mutationFn: (id) => clientNotificationsService.markRead(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: QK.list(params) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => clientNotificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(params) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => clientNotificationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.list(params) });
      qc.invalidateQueries({ queryKey: QK.unread });
    },
  });

  // Suscripción a notificaciones en tiempo real para el usuario
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const channelName = userId ? `private-users.${userId}` : 'private-users';

    const off = subscribeToChannel(
      channelName,
      'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
      () => {
        qc.invalidateQueries({ queryKey: QK.list(params) });
        qc.invalidateQueries({ queryKey: QK.unread });
      }
    );

    return () => {
      try { off?.(); } catch {}
    };
  }, [qc, JSON.stringify(params)]);

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

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: QK.unread,
    queryFn: () => clientNotificationsService.unreadCount(),
    select: (resp) => {
      if (typeof resp === 'number') return resp;
      if (typeof resp?.count === 'number') return resp.count;
      if (typeof resp?.data?.count === 'number') return resp.data.count;
      return 0;
    },
    staleTime: 15_000,
    refetchInterval: 15_000, // opcional si confías en Pusher
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const channelName = userId ? `private-users.${userId}` : 'private-users';

    const off = subscribeToChannel(
      channelName,
      'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
      () => qc.invalidateQueries({ queryKey: QK.unread })
    );

    return () => {
      try { off?.(); } catch {}
    };
  }, [qc]);

  return { unreadCount: data ?? 0, isLoading, error };
};