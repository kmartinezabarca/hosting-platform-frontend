import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@application/context/AuthContext';
import { getEcho } from '@infrastructure/services/echoService';

// ─── Tipos ────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  isReady: boolean;
}

interface WsNotification {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  text?: string;
  target?: string;
  [key: string]: unknown;
}

// ─── Query keys (alineados con useClientNotifications y useAdminNotifications) ──

const CLIENT_UNREAD_QK  = ['notifications', 'client', 'unreadCount'] as const;
const CLIENT_LIST_QK    = ['notifications', 'client', 'list'] as const;
const ADMIN_BASE_QK     = ['admin', 'notifications'] as const;

// ─── Contexto ─────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isAuthReady, isAdmin } = useAuth();
  const qc = useQueryClient();

  const isReady = Boolean(isAuthReady && isAuthenticated && user?.uuid);

  useEffect(() => {
    if (!isReady) return;

    const echo = getEcho();

    if (isAdmin) {
      // ── Canal admin ────────────────────────────────────────────────────
      const ch = echo
        .private('admin.notifications')
        .subscribed(() => console.log('✅ admin.notifications subscribed'))
        .error((e: unknown) => console.error('[NotificationProvider] admin channel error', e));

      ch.notification((n: WsNotification) => {
        const title = n?.title ?? 'Notificación';
        const msg   = n?.message ?? n?.text ?? '';
        toast.info(title, { description: msg || undefined });

        qc.invalidateQueries({ queryKey: ADMIN_BASE_QK });
      });

      return () => {
        try { echo.leave('admin.notifications'); } catch { /* noop */ }
      };
    } else {
      // ── Canal cliente ──────────────────────────────────────────────────
      const channelName = `user.${user!.uuid}`;
      const ch = echo
        .private(channelName)
        .subscribed(() => console.log('✅', `private-${channelName}`, 'subscribed'))
        .error((e: unknown) => console.error('[NotificationProvider] client channel error', e));

      ch.notification((n: WsNotification) => {
        const title = n?.title ?? 'Notificación';
        const msg   = n?.message ?? n?.text ?? '';
        toast.info(title, { description: msg || undefined });

        // Incremento reactivo del contador — sin ningún request adicional
        qc.setQueryData<number>(CLIENT_UNREAD_QK, (old) => (old ?? 0) + 1);
        // Invalidar la lista para que se refresque al próximo uso
        qc.invalidateQueries({ queryKey: CLIENT_LIST_QK });
      });

      const conn = echo.connector?.pusher?.connection;
      const onReconnected = () => toast.info('Reconectado', { description: 'La conexión en tiempo real fue restaurada.' });
      conn?.bind?.('connected', onReconnected);

      return () => {
        try {
          echo.leave(channelName);
          conn?.unbind?.('connected', onReconnected);
        } catch { /* noop */ }
      };
    }
  }, [isReady, isAdmin, user?.uuid, qc]);

  const value = useMemo<NotificationContextValue>(
    () => ({ isReady }),
    [isReady],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
