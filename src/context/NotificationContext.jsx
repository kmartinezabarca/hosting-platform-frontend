import React, { createContext, useContext, useEffect, useMemo } from 'react';
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

  // helpers para toasts / efectos laterales (ajusta a tu sistema de toasts)
  const showInfo = (title, message) => console.log('ℹ️', title, message);
  const showSuccess = (title, message) => console.log('✅', title, message);
  const showError = (title, message) => console.log('❌', title, message);

  useEffect(() => {
    const ready = Boolean(isAuthReady && isAuthenticated && user?.uuid);
    if (!ready) {
      console.log('NotificationProvider: auth no lista; no se configura Reverb.');
      return;
    }

    const echo = getEcho(); // <- crear/obtener dentro del efecto
    const channelName = `user.${user.uuid}`;
    const channel = echo
      .private(channelName)
      .subscribed(() => console.log('✅ Subscribed', `private-${channelName}`))
      .error((e) => console.error('❌ Channel error', e));

    // 1) Notificaciones de Laravel ($user->notify(..., via ['database','broadcast']))
    channel.notification((n) => {
      // n tiene { id, type, notifiable_id, data, created_at, ... }
      console.log('🔔 notification', n);
      const title = n?.data?.title ?? 'Notificación';
      const msg = n?.data?.message ?? n?.data?.text ?? '';
      showInfo(title, msg);
      // aquí puedes invalidar queries si quieres
      // qc.invalidateQueries({ queryKey: ... });
    });

    // 2) Eventos custom (ServicePurchased, etc.) que usan broadcastAs('...'):
    const handlers = Object.fromEntries(
      CUSTOM_EVENTS.map((evt) => [
        evt,
        (payload) => {
          console.log(`📩 ${evt}`, payload);
          switch (evt) {
            case 'service.purchased':
              showSuccess('¡Servicio adquirido!', payload?.message ?? 'Tu compra fue procesada.');
              break;
            case 'payment.failed':
              showError('Pago fallido', payload?.message ?? 'Intenta con otro método.');
              break;
            default:
              showInfo('Evento', payload?.message ?? evt);
          }
          // invalida queries aquí si corresponde
        },
      ])
    );

    // importante: cuando usas broadcastAs('foo.bar'), escucha con '.foo.bar'
    CUSTOM_EVENTS.forEach((evt) => channel.listen(`.${evt}`, handlers[evt]));

    // Re-suscripción tras reconexiones
    const conn = echo.connector?.pusher?.connection;
    const onReconnected = () => {
      console.log('🔁 Reconnected (user channel), refrescando estado/mostrando toast si quieres');
      // aquí podrías re-invocar fetchs si lo necesitas
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