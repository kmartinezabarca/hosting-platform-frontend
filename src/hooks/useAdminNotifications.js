// useAdminNotifications.js
import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminNotificationsService from '@/services/adminNotificationsService';
import { getEcho } from '@/services/echoService';
import { useAuth } from '@/context/AuthContext';

// Query Keys (params como string estable)
const QK = {
  base: ['admin', 'notifications'],
  list: (normKey) => ['admin', 'notifications', 'list', normKey],
  stats: ['admin', 'notifications', 'stats'],
};

// Normaliza respuesta (paginada o plana)
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

export const useAdminNotifications = (params = {}, options = {}) => {
  const { isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin);

  // clave estable para el cache
  const normKey = useMemo(() => JSON.stringify(params || {}), [params]);

  return useQuery({
    queryKey: QK.list(normKey),
    queryFn: () => adminNotificationsService.getNotifications(params),
    select: selectNotifications,
    enabled: shouldFetch,
    keepPreviousData: true,
    staleTime: 60_000,
    retry: false,
    ...options,
  });
};

export const useAdminNotificationStats = (options = {}) => {
  const { isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin);

  return useQuery({
    queryKey: QK.stats,
    queryFn: adminNotificationsService.getStats,
    enabled: shouldFetch,
    staleTime: 60_000,
    retry: false,
    ...options,
  });
};

/* =========================
   MUTATIONS
========================= */

export const useAdminBroadcastNotification = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminNotificationsService.broadcast(payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminSendNotificationToUser = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }) =>
      adminNotificationsService.sendToUser(userId, payload),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminMarkNotificationAsRead = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) =>
      adminNotificationsService.markAsRead(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminMarkAllNotificationsAsRead = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminNotificationsService.markAllAsRead(),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useAdminDeleteNotification = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) =>
      adminNotificationsService.delete(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
      options.onSuccess?.(...args);
    },
    ...options,
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
  const debounceRef = useRef();
  const bump = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      qc.invalidateQueries({ queryKey: QK.base });
      qc.invalidateQueries({ queryKey: QK.stats });
    }, 120);
  };

  useEffect(() => {
    if (!shouldFetch) return;

    const echo = getEcho();

    // 1) Canal global de admin para “notificaciones de admin”
    // Recomendado para tus eventos administrativos agrupados
    const chAdminNotifications = echo
      .private('admin.notifications')
      .subscribed(() => console.log('✅ admin.notifications subscribed'))
      .error((e) => console.error('❌ admin.notifications error', e));

    // a) Si usas Laravel Notifications dirigidas a “admins” como notifiable (poco común):
    chAdminNotifications.notification((n) => {
      console.log('🔔 admin.notification', n);
      bump();
    });

    // b) Eventos custom con broadcastAs('...'):
    const adminNotifEvents = [
      // si emites como 'admin.service.purchased' etc:
      'admin.service.purchased',
      'admin.invoice.generated',
      'admin.payment.processed',
      'admin.service.status',
      // o bien si usas nombres genéricos:
      'notification.received',
    ];
    adminNotifEvents.forEach((name) => chAdminNotifications.listen(`.${name}`, bump));

    // 2) Canal de “servicios” de admin (tú ya lo usaste con ServicePurchased)
    // Recuerda: si tu evento tiene broadcastAs('service.purchased'), se escucha con '.service.purchased'
    const chAdminServices = echo
      .private('admin.services')
      .subscribed(() => console.log('✅ admin.services subscribed'))
      .error((e) => console.error('❌ admin.services error', e));

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
        // Nota: no hacemos leave() para no interferir si otros componentes usan los mismos canales.
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
    unreadCount: stats?.unread_count ?? 0,

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