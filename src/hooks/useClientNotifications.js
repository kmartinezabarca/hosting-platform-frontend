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
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const qc = useQueryClient();

  // Parametros estables
  const normParams = useMemo(() => normalizeParams(params), [params]);
  const normKey = useMemo(() => JSON.stringify(normParams), [normParams]);

  // Solo ejecutar query cuando la autenticación esté lista Y el usuario esté autenticado
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.list(normKey),
    queryFn: () => clientNotificationsService.list(normParams),
    select: selectNotifications,
    enabled: shouldFetch, // <- Condición más robusta
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

  // Suscripción realtime SOLO cuando hay usuario autenticado y la auth está lista
  useEffect(() => {
    if (!shouldFetch) return;

    const channelName = `user.${user.uuid}`;
    
    try {
      const channel = echoInstance.private(channelName);

      const handler = (e) => {
        console.log('Reverb: notificación cliente recibida:', e);
        qc.invalidateQueries({ queryKey: QK.list(normKey) });
        qc.invalidateQueries({ queryKey: QK.unread });
      };

      // Escuchar múltiples eventos de notificación
      const events = [
        'notification.received',
        'invoice.generated',
        'invoice.status.changed',
        'payment.processed',
        'payment.failed',
        'service.purchased',
        'service.ready',
        'service.status.changed',
        'service.maintenance.scheduled',
        'service.maintenance.completed',
        'ticket.replied'
      ];

      events.forEach(eventName => {
        channel.listen(eventName, handler);
      });

      return () => {
        try {
          events.forEach(eventName => {
            channel.stopListening(eventName, handler);
          });
        } catch (error) {
          console.warn('Error al detener listeners:', error);
        }
        try {
          echoInstance.leave(channelName);
        } catch (error) {
          console.warn('Error al salir del canal:', error);
        }
      };
    } catch (error) {
      console.error('Error al configurar canal de notificaciones:', error);
    }
  }, [shouldFetch, user?.uuid, qc, normKey]);

  return {
    notifications: data?.list ?? [],
    pagination: data?.pagination ?? null,
    isLoading: isLoading && shouldFetch,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
    isReady: shouldFetch, // Nuevo: indica si el hook está listo para usar
  };
};

/* =========================
   CONTADOR DE NO LEÍDOS
========================= */
export const useUnreadNotificationCount = () => {
  const qc = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  // Solo ejecutar query cuando la autenticación esté lista Y el usuario esté autenticado
  const shouldFetch = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  const { data, isLoading, error } = useQuery({
    queryKey: QK.unread,
    queryFn: () => clientNotificationsService.unreadCount(),
    select: (resp) => {
      if (typeof resp === 'number') return resp;
      if (typeof resp?.count === 'number') return resp.count;
      if (typeof resp?.data?.count === 'number') return resp.data.count;
      if (typeof resp?.data?.unread_count === 'number') return resp.data.unread_count;
      return 0;
    },
    enabled: shouldFetch, // <- Condición más robusta
    refetchInterval: shouldFetch ? 30000 : false, // Refetch cada 30 segundos si está habilitado
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!shouldFetch) return;

    const channelName = `user.${user.uuid}`;
    
    try {
      const channel = echoInstance.private(channelName);

      const handler = () => {
        console.log('Reverb: actualizando contador de no leídos');
        qc.invalidateQueries({ queryKey: QK.unread });
      };

      // Escuchar múltiples eventos que pueden afectar el contador
      const events = [
        'notification.received',
        'invoice.generated',
        'invoice.status.changed',
        'payment.processed',
        'payment.failed',
        'service.purchased',
        'service.ready',
        'service.status.changed',
        'service.maintenance.scheduled',
        'service.maintenance.completed',
        'ticket.replied'
      ];

      events.forEach(eventName => {
        channel.listen(eventName, handler);
      });

      return () => {
        try {
          events.forEach(eventName => {
            channel.stopListening(eventName, handler);
          });
        } catch (error) {
          console.warn('Error al detener listeners de contador:', error);
        }
        try {
          echoInstance.leave(channelName);
        } catch (error) {
          console.warn('Error al salir del canal de contador:', error);
        }
      };
    } catch (error) {
      console.error('Error al configurar canal de contador:', error);
    }
  }, [shouldFetch, user?.uuid, qc]);

  return { 
    unreadCount: data ?? 0, 
    isLoading: isLoading && shouldFetch, 
    error,
    isReady: shouldFetch // Nuevo: indica si el hook está listo para usar
  };
};

