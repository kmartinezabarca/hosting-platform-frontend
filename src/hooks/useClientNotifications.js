import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientNotificationsService from '@/services/clientNotificationsService';
import { getEcho } from '@/services/echoService';
import { useAuth } from '@/context/AuthContext';

const QK = {
  list: (normKey) => ['notifications', 'client', 'list', normKey],
  unread: ['notifications', 'client', 'unreadCount'],
};

const normalizeParams = (params = {}) => {
  const cleaned = {};
  Object.keys(params).sort().forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
  });
  return cleaned;
};

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
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const qc = useQueryClient();

  const normParams = useMemo(() => normalizeParams(params), [params]);
  const normKey = useMemo(() => JSON.stringify(normParams), [normParams]);

  const shouldFetch = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.list(normKey),
    queryFn: () => clientNotificationsService.list(normParams),
    select: selectNotifications,
    enabled: shouldFetch,
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

  useEffect(() => {
    if (!shouldFetch) return;

    const echo = getEcho(); // <-- crear/obtener dentro del efecto
    const channelName = `user.${user.uuid}`;
    const channel = echo
      .private(channelName)
      .subscribed(() => console.log('✅ Subscribed', `private-${channelName}`))
      .error((e) => console.error('❌ Channel error', e));

    // 1) Notificaciones de Laravel (via $user->notify([...,'broadcast']))
    const handleNotification = (n) => {
      console.log('🔔 notification', n);
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    };
    channel.notification(handleNotification);

    // 2) Eventos custom que emites con broadcastAs('...')
    const customEvents = [
      'invoice.generated',
      'invoice.status.changed',
      'payment.processed',
      'payment.failed',
      'service.purchased',
      'service.ready',
      'service.status.changed',
      'service.maintenance.scheduled',
      'service.maintenance.completed',
      'ticket.replied',
    ];

    const handleCustom = (e) => {
      console.log('📩 custom event', e);
      qc.invalidateQueries({ queryKey: QK.list(normKey) });
      qc.invalidateQueries({ queryKey: QK.unread });
    };

    customEvents.forEach((name) => channel.listen(`.${name}`, handleCustom));

    return () => {
      try {
        customEvents.forEach((name) => channel.stopListening(`.${name}`));
      } catch (err) {
        console.warn('cleanup warn:', err);
      }
    };
  }, [shouldFetch, user?.uuid, qc, normKey]);

  return {
    notifications: data?.list ?? [],
    pagination: data?.pagination ?? null,
    isLoading: isLoading && shouldFetch,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isReady: shouldFetch,
  };
};

/* =========================
   CONTADOR DE NO LEÍDOS
========================= */
export const useUnreadNotificationCount = () => {
  const qc = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const shouldFetch = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.unread,
    queryFn: () => clientNotificationsService.unreadCount(),
    select: (resp) => {
      if (typeof resp === 'number') return resp;
      if (typeof resp?.unread_count === 'number') return resp.unread_count;
      if (typeof resp?.data?.count === 'number') return resp.data.count;
      if (typeof resp?.data?.unread_count === 'number') return resp.data.unread_count;
      return 0;
    },
    enabled: shouldFetch,
    refetchInterval: shouldFetch ? 30000 : false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!shouldFetch) return;

    const echo = getEcho();
    const channelName = `user.${user.uuid}`;
    const channel = echo
      .private(channelName)
      .subscribed(() => console.log('✅ Subscribed (counter)', `private-${channelName}`))
      .error((e) => console.error('❌ Channel error (counter)', e));

    const bump = () => {
      console.log('🔄 bump unread count');
      qc.invalidateQueries({ queryKey: QK.unread });
    };

    // Notificaciones + eventos custom impactan el contador
    channel.notification(bump);

    const customEvents = [
      'invoice.generated',
      'invoice.status.changed',
      'payment.processed',
      'payment.failed',
      'service.purchased',
      'service.ready',
      'service.status.changed',
      'service.maintenance.scheduled',
      'service.maintenance.completed',
      'ticket.replied',
    ];
    customEvents.forEach((name) => channel.listen(`.${name}`, bump));

    return () => {
      try {
        customEvents.forEach((name) => channel.stopListening(`.${name}`));
      } catch (err) {
        console.warn('cleanup warn (counter):', err);
      }
    };
  }, [shouldFetch, user?.uuid, qc]);

  return {
    unreadCount: data ?? 0,
    isLoading: isLoading && shouldFetch,
    error,
    isReady: shouldFetch,
  };
};
