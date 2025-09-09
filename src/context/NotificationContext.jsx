import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import echoInstance from '../services/echoService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  // Configurar listeners de notificaciones en tiempo real
  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !user?.uuid) {
      console.log('NotificationProvider: No configurando Reverb - auth no está listo', {
        isAuthReady,
        isAuthenticated,
        hasUser: !!user?.uuid
      });
      return;
    }

    try {
      const channelName = `user.${user.uuid}`;
      console.log(`NotificationProvider: Configurando canal ${channelName}`);
      
      const channel = echoInstance.private(channelName);

      // Eventos de notificaciones
      const eventHandlers = {
        'service.purchased': (data) => {
          console.log('Reverb: Servicio adquirido:', data);
          // Aquí puedes usar el sistema de toasts existente
          // toast.success('¡Servicio Adquirido!', data.message);
        },
        
        'service.ready': (data) => {
          console.log('Reverb: Servicio listo:', data);
        },
        
        'service.status.changed': (data) => {
          console.log('Reverb: Estado del servicio cambiado:', data);
        },
        
        'invoice.generated': (data) => {
          console.log('Reverb: Factura generada:', data);
        },
        
        'invoice.status.changed': (data) => {
          console.log('Reverb: Estado de factura cambiado:', data);
        },
        
        'payment.processed': (data) => {
          console.log('Reverb: Pago procesado:', data);
        },
        
        'payment.failed': (data) => {
          console.log('Reverb: Pago fallido:', data);
        },
        
        'ticket.replied': (data) => {
          console.log('Reverb: Respuesta en ticket:', data);
        },
        
        'notification.received': (data) => {
          console.log('Reverb: Notificación recibida:', data);
        }
      };

      // Registrar todos los event listeners
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        channel.listen(eventName, (data) => {
          console.log(`Reverb: Evento recibido - ${eventName}:`, data);
          handler(data);
        });
      });

      console.log(`NotificationProvider: Conectado al canal ${channelName} para notificaciones`);

      return () => {
        try {
          Object.keys(eventHandlers).forEach(eventName => {
            channel.stopListening(eventName);
          });
          echoInstance.leave(channelName);
          console.log(`NotificationProvider: Desconectado del canal ${channelName}`);
        } catch (error) {
          console.warn('NotificationProvider: Error al desconectar listeners:', error);
        }
      };
    } catch (error) {
      console.error('NotificationProvider: Error al configurar notificaciones en tiempo real:', error);
    }
  }, [isAuthReady, isAuthenticated, user?.uuid]);

  const value = {
    // Métodos para mostrar notificaciones pueden ir aquí
    // Por ahora solo logging
    isReady: isAuthReady && isAuthenticated && !!user?.uuid,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

