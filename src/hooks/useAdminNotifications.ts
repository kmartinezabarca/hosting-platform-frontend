// useAdminNotifications.ts
import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminNotificationsService from '@/services/adminNotificationsService';
import { getEcho } from '@/services/echoService';
import { useAuth } from '@/context/AuthContext';

type HookOptions = { onSuccess?: (...args: any[]) => void; [key: string]: any };

// Query Keys (params como string estable)
const QK = {
  base: ['admin', 'notifications'],
  list: (normKey: string) => ['admin', 'notifications', 'list', normKey],
  stats: ['admin', 'notifications', 'stats'],
};

// Normaliza respuesta (paginada o plana)
const selectNotifications = (resp: any) => {
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
        current_page: resp?.data?.current_page ?? resp?.meta?.current_page ?? 1,
        last_page:    resp?.data?.last_page    ?? resp?.meta?.last_page    ?? 1,
        per_page:     resp?.data?.per_page     ?? resp?.meta?.per_page     ?? list.length,
        total:        resp?.data?.total        ?? resp?.meta?.total        ?? list.length,
      }
    : null;

  return { list, pagination, raw: resp };
};

/* =========================
   QUERIES
========================= */

export const useAdminNotifications = (params = {}, options: HookOptions = {}) => {
  const { isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin);

  // clave estable para el cache
  const normKey = useMemo(() => JSON.stringify(params || {}), [params]);

  const { onSuccess: _onSuccess, ...restOptions } = options;

  return useQuery({
    queryKey: QK.list(normKey),
    queryFn: () => adminNotificationsService.getNotifications(params),
    select: selectNotifications,
    enabled: shouldFetch,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    retry: false,
    ...restOptions,
  });
};

export const useAdminNotificationStats = (options: HookOptions = {}) => {
  const { isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin);

  const { onSuccess: _onSuccess, ...restOptions } = options;

  return useQuery({
    queryKey: QK.stats,
    queryFn: adminNotificationsService.getStats,
    enabled: shouldFetch,
    staleTime: 60_000,
    retry: false,
    ...restOptions,
  });
};

/* =========================
   MUTATIONS
========================= */

export const useAdminBroadcastNotification = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => adminNotificationsService.broadcast(payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminSendNotificationToUser = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: any; payload: any }) =>
      adminNotificationsService.sendToUser(userId, payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminMarkNotificationAsRead = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: any) =>
      adminNotificationsService.markAsRead(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminMarkAllNotificationsAsRead = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminNotificationsService.markAllAsRead(),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminDeleteNotification = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: any) =>
      adminNotificationsService.delete(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
  });
};

/* =========================
   HUB + REALTIME
========================= */

export const useAdminNotificationsHub = (params = {}) => {
  const { user, isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const qc = useQueryClient();
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin && user?.uuid);

  const { data: notificationsResp, isLoading, error } = useAdminNotifications(params);
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useAdminNotificationStats();

  const broadcast = useAdminBroadcastNotification();
  const sendToUser = useAdminSendNotificationToUser();
  const markAsRead = useAdminMarkNotificationAsRead();
  const markAllAsRead = useAdminMarkAllNotificationsAsRead();
  const remove = useAdminDeleteNotification();

  // Pequeño debounce para evitar invalidar en ráfaga
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bump = () => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
    }, 120);
  };

  useEffect(() => {
    if (!shouldFetch) return;

    const echo = getEcho();

    // 1) Canal global de admin para "notificaciones de admin"
    const chAdminNotifications = echo
      .private('admin.notifications')
      .subscribed(() => console.log('✅ admin.notifications subscribed'))
      .error((e: any) => console.error('❌ admin.notifications error', e));

    // a) Si usas Laravel Notifications dirigidas a "admins" como notifiable:
    chAdminNotifications.notification((n: any) => {
      console.log('🔔 admin.notification', n);
      bump();
    });

    // b) Eventos custom con broadcastAs('...'):
    const adminNotifEvents = [
      'admin.service.purchased',
      'admin.invoice.generated',
      'admin.payment.processed',
      'admin.service.status',
      'notification.received',
    ];
    adminNotifEvents.forEach((name) => chAdminNotifications.listen(`.${name}`, bump));

    // 2) Canal de "servicios" de admin
    const chAdminServices = echo
      .private('admin.services')
      .subscribed(() => console.log('✅ admin.services subscribed'))
      .error((e: any) => console.error('❌ admin.services error', e));

    const adminServiceEvents = [
      'service.purchased',
      'invoice.generated',
      'payment.processed',
      'service.status',
      'service.maintenance.scheduled',
      'service.maintenance.completed',
    ];
    adminServiceEvents.forEach((name) => chAdminServices.listen(`.${name}`, bump));

    return () => {
      try {
        adminNotifEvents.forEach((name) => chAdminNotifications.stopListening(`.${name}`));
        adminServiceEvents.forEach((name) => chAdminServices.stopListening(`.${name}`));
      } catch (err) {
        console.warn('cleanup warn (admin hub):', err);
      }
    };
  }, [shouldFetch, qc]);

  return {
    // datos
    notifications: notificationsResp?.list ?? [],
    pagination: notificationsResp?.pagination ?? null,
    stats,
    unreadCount: (stats as any)?.unread_count ?? 0,

    // loaders / errores
    isLoading: isLoading && shouldFetch,
    error,
    isLoadingStats: isLoadingStats && shouldFetch,
    statsError,
    isReady: shouldFetch,

    // acciones
    broadcastNotification: broadcast.mutate,
    sendNotificationToUser: sendToUser.mutate,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: remove.mutate,
  };
};
