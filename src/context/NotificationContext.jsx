import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { getEcho } from '@/services/echoService';

const NotificationContext = createContext(null);

// lista de eventos custom que emites con broadcastAs('...'):
const CUSTOM_EVENTS = [
  'service.purchased',
  'service.ready',
  'service.status.changed',
  'invoice.generated',
  'invoice.status.changed',
  'payment.processed',
  'payment.failed',
  'ticket.replied',
];

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const showInfo    = (title, message) => toast.info(title,    { description: message || undefined });
  const showSuccess = (title, message) => toast.success(title, { description: message || undefined });
  const showError   = (title, message) => toast.error(title,   { description: message || undefined });

  useEffect(() => {
    const ready = Boolean(isAuthReady && isAuthenticated && user?.uuid);
    if (!ready) return;

    const echo = getEcho();
    const channelName = `user.${user.uuid}`;
    const channel = echo
      .private(channelName)
      .error((e) => console.error('[NotificationProvider] channel error', e));

    // 1) Notificaciones de Laravel ($user->notify(..., via ['database','broadcast']))
    channel.notification((n) => {
      const title = n?.data?.title ?? 'Notificación';
      const msg   = n?.data?.message ?? n?.data?.text ?? '';
      showInfo(title, msg);
    });

    // 2) Eventos custom (ServicePurchased, etc.) que usan broadcastAs('...'):
    const handlers = Object.fromEntries(
      CUSTOM_EVENTS.map((evt) => [
        evt,
        (payload) => {
          switch (evt) {
            case 'service.purchased':
              showSuccess('¡Servicio adquirido!', payload?.message ?? 'Tu compra fue procesada.');
              break;
            case 'service.ready':
              showSuccess('Servicio listo', payload?.message ?? 'Tu servicio está activo.');
              break;
            case 'service.status.changed':
              showInfo('Estado del servicio', payload?.message ?? 'El estado de tu servicio cambió.');
              break;
            case 'invoice.generated':
              showInfo('Nueva factura', payload?.message ?? 'Se generó una nueva factura.');
              break;
            case 'invoice.status.changed':
              showInfo('Factura actualizada', payload?.message ?? 'El estado de tu factura cambió.');
              break;
            case 'payment.processed':
              showSuccess('Pago procesado', payload?.message ?? 'Tu pago fue registrado exitosamente.');
              break;
            case 'payment.failed':
              showError('Pago fallido', payload?.message ?? 'Intenta con otro método de pago.');
              break;
            case 'ticket.replied':
              showInfo('Respuesta en ticket', payload?.message ?? 'Tienes una nueva respuesta en tu ticket.');
              break;
            default:
              showInfo('Notificación', payload?.message ?? evt);
          }
        },
      ])
    );

    // importante: cuando usas broadcastAs('foo.bar'), escucha con '.foo.bar'
    CUSTOM_EVENTS.forEach((evt) => channel.listen(`.${evt}`, handlers[evt]));

    const conn = echo.connector?.pusher?.connection;
    const onReconnected = () => {
      showInfo('Reconectado', 'La conexión en tiempo real fue restaurada.');
    };
    conn?.bind?.('connected', onReconnected);

    return () => {
      try {
        CUSTOM_EVENTS.forEach((evt) => channel.stopListening(`.${evt}`));
        conn?.unbind?.('connected', onReconnected);
        // OJO: si otros componentes usan el mismo canal, no hagas leave.
        // echo.leave(channelName);
      } catch (err) {
        console.warn('cleanup warn (notifications):', err);
      }
    };
  }, [isAuthReady, isAuthenticated, user?.uuid]);

  const value = useMemo(
    () => ({
      isReady: Boolean(isAuthReady && isAuthenticated && user?.uuid),
      // opcional: expón APIs para disparar toasts globales
      // notify: ({title, message, variant}) => ...
    }),
    [isAuthReady, isAuthenticated, user?.uuid]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};