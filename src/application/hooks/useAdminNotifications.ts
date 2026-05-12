// useAdminNotifications.ts
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminNotificationsService from '@infrastructure/services/adminNotificationsService';
import { useAuth } from '@application/context/AuthContext';

interface HookOptions { onSuccess?: (...args: any[]) => void; [key: string]: any }

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

  const { onSuccess: _onSuccess, enabled: enabledOpt, ...restOptions } = options;
  const enabled = shouldFetch && (enabledOpt !== false);

  return useQuery({
    queryKey: QK.list(normKey),
    queryFn: () => adminNotificationsService.getNotifications(params),
    select: selectNotifications,
    enabled,
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
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminDeleteNotification = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => adminNotificationsService.delete(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminArchiveNotification = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => adminNotificationsService.archive(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminUnarchiveNotification = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => adminNotificationsService.unarchive(notificationId),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminArchiveAllRead = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminNotificationsService.archiveAllRead(),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      options.onSuccess?.(...args);
    },
  });
};

export const useAdminDeleteAllArchived = (options: HookOptions = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminNotificationsService.deleteAllArchived(),
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: QK.base });
      options.onSuccess?.(...args);
    },
  });
};

/* =========================
   HUB + REALTIME
========================= */

export const useAdminNotificationsHub = (params = {}) => {
  const { isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin);

  const { data: notificationsResp, isLoading, error } = useAdminNotifications(params);
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useAdminNotificationStats();

  const broadcast         = useAdminBroadcastNotification();
  const sendToUser        = useAdminSendNotificationToUser();
  const markAsRead        = useAdminMarkNotificationAsRead();
  const markAllAsRead     = useAdminMarkAllNotificationsAsRead();
  const remove            = useAdminDeleteNotification();
  const archive           = useAdminArchiveNotification();
  const unarchive         = useAdminUnarchiveNotification();

  // El canal admin.notifications es suscrito por NotificationContext,
  // que invalida ['admin', 'notifications'] en cada evento WS.

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
    archiveNotification: archive.mutate,
    unarchiveNotification: unarchive.mutate,
    // pending IDs for per-button loading states
    markingReadId:    markAsRead.isPending  ? (markAsRead.variables  as string) : null,
    deletingId:       remove.isPending      ? (remove.variables      as string) : null,
    archivingId:      archive.isPending     ? (archive.variables     as string) : null,
    unarchivingId:    unarchive.isPending   ? (unarchive.variables   as string) : null,
  };
};
