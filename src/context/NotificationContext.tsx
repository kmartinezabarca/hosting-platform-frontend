import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { getEcho } from '@/services/echoService';

// ─── Tipos ────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  isReady: boolean;
}

interface BroadcastPayload {
  message?: string;
  [key: string]: unknown;
}

interface LaravelNotification {
  data?: {
    title?: string;
    message?: string;
    text?: string;
  };
  [key: string]: unknown;
}

// ─── Contexto ─────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

// Eventos custom emitidos con broadcastAs('...')
const CUSTOM_EVENTS = [
  'service.purchased',
  'service.ready',
  'service.status.changed',
  'invoice.generated',
  'invoice.status.changed',
  'payment.processed',
  'payment.failed',
  'ticket.replied',
] as const;

type CustomEvent = typeof CUSTOM_EVENTS[number];

// ─── Provider ─────────────────────────────────────────────────────────────

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const showInfo    = (title: string, message?: string) => toast.info(title,    { description: message || undefined });
  const showSuccess = (title: string, message?: string) => toast.success(title, { description: message || undefined });
  const showError   = (title: string, message?: string) => toast.error(title,   { description: message || undefined });

  useEffect(() => {
    const ready = Boolean(isAuthReady && isAuthenticated && user?.uuid);
    if (!ready) return;

    const echo = getEcho();
    const channelName = `user.${user!.uuid}`;
    const channel = echo
      .private(channelName)
      .error((e: unknown) => console.error('[NotificationProvider] channel error', e));

    // 1) Notificaciones de Laravel ($user->notify(..., via ['database','broadcast']))
    channel.notification((n: LaravelNotification) => {
      const title = n?.data?.title ?? 'Notificación';
      const msg   = n?.data?.message ?? n?.data?.text ?? '';
      showInfo(title, msg);
    });

    // 2) Eventos custom (ServicePurchased, etc.) con broadcastAs('...')
    const handlers: Record<CustomEvent, (payload: BroadcastPayload) => void> = {
      'service.purchased':     (p) => showSuccess('¡Servicio adquirido!', p?.message ?? 'Tu compra fue procesada.'),
      'service.ready':         (p) => showSuccess('Servicio listo', p?.message ?? 'Tu servicio está activo.'),
      'service.status.changed':(p) => showInfo('Estado del servicio', p?.message ?? 'El estado de tu servicio cambió.'),
      'invoice.generated':     (p) => showInfo('Nueva factura', p?.message ?? 'Se generó una nueva factura.'),
      'invoice.status.changed':(p) => showInfo('Factura actualizada', p?.message ?? 'El estado de tu factura cambió.'),
      'payment.processed':     (p) => showSuccess('Pago procesado', p?.message ?? 'Tu pago fue registrado exitosamente.'),
      'payment.failed':        (p) => showError('Pago fallido', p?.message ?? 'Intenta con otro método de pago.'),
      'ticket.replied':        (p) => showInfo('Respuesta en ticket', p?.message ?? 'Tienes una nueva respuesta en tu ticket.'),
    };

    CUSTOM_EVENTS.forEach((evt) => channel.listen(`.${evt}`, handlers[evt]));

    const conn = echo.connector?.pusher?.connection;
    const onReconnected = () => showInfo('Reconectado', 'La conexión en tiempo real fue restaurada.');
    conn?.bind?.('connected', onReconnected);

    return () => {
      try {
        CUSTOM_EVENTS.forEach((evt) => channel.stopListening(`.${evt}`));
        conn?.unbind?.('connected', onReconnected);
      } catch (err) {
        console.warn('cleanup warn (notifications):', err);
      }
    };
  }, [isAuthReady, isAuthenticated, user?.uuid]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<NotificationContextValue>(
    () => ({
      isReady: Boolean(isAuthReady && isAuthenticated && user?.uuid),
    }),
    [isAuthReady, isAuthenticated, user?.uuid],
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
