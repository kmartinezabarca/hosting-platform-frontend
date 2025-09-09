import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminNotificationsService from '@/services/adminNotificationsService';
import echoInstance from '@/services/echoService';
import { useAuth } from '@/context/AuthContext';

// Query Keys
const QK = {
  base: ['admin', 'notifications'],
  list: (params) => ['admin', 'notifications', 'list', params || {}],
  stats: ['admin', 'notifications', 'stats'],
};

// Normaliza respuesta (paginada o plana)
const selectNotifications = (resp) => {
  // Casos:
  // - Paginada estilo Laravel: { success, data: { data: [...], current_page, last_page, ... }, meta? }
  // - Plana: { success, data: [...] }  ó  [...]
  const pagedArray = resp?.data?.data;
  const flatArray = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : null);

  const list = Array.isArray(pagedArray) ? pagedArray : (Array.isArray(flatArray) ? flatArray : []);
  const pagination = Array.isArray(pagedArray)
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
  const shouldFetch = isAuthReady && isAuthenticated && isAdmin;

  return useQuery({
    queryKey: QK.list(params),
    queryFn: () => adminNotificationsService.getNotifications(params),
    select: selectNotifications,
    enabled: shouldFetch,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    retry: false,
    ...options,
  });
};

export const useAdminNotificationStats = (options = {}) => {
  const { isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const shouldFetch = isAuthReady && isAuthenticated && isAdmin;

  return useQuery({
    queryKey: QK.stats,
    queryFn: adminNotificationsService.getStats,
    enabled: shouldFetch,
    staleTime: 60 * 1000,
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
   HOOK COMBINADO + PUSHER
========================= */

export const useAdminNotificationsHub = (params = {}) => {
  const { user, isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const qc = useQueryClient();
  const shouldFetch = isAuthReady && isAuthenticated && isAdmin && user?.uuid;

  const {
    data: notificationsResp,
    isLoading,
    error,
  } = useAdminNotifications(params);

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useAdminNotificationStats();

  const broadcast = useAdminBroadcastNotification();
  const sendToUser = useAdminSendNotificationToUser();
  const markAsRead = useAdminMarkNotificationAsRead();
  const markAllAsRead = useAdminMarkAllNotificationsAsRead();
  const remove = useAdminDeleteNotification();

  // Suscripciones en tiempo real - solo cuando está autenticado como admin
  useEffect(() => {
    if (!shouldFetch) return;

    try {
      const channel = echoInstance.private('admin.notifications');
      
      const handler = (e) => {
        console.log('Reverb: Nueva notificación de admin recibida:', e);
        qc.invalidateQueries({ queryKey: QK.base });
        qc.invalidateQueries({ queryKey: QK.stats });
      };

      // Escuchar múltiples eventos de admin
      const events = [
        'notification.received',
        'admin.service.purchased',
        'admin.invoice.generated',
        'admin.payment.processed',
        'admin.service.status'
      ];

      events.forEach(eventName => {
        channel.listen(eventName, handler);
      });

      return () => {
        try {
          events.forEach(eventName => {
            channel.stopListening(eventName, handler);
          });
          echoInstance.leave('admin.notifications');
        } catch (error) {
          console.warn('Error al desconectar listeners de admin:', error);
        }
      };
    } catch (error) {
      console.error('Error al configurar canal de admin:', error);
    }
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

