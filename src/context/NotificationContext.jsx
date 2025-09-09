import React, { createContext, useContext, useEffect } from 'react';
import { useToast } from '../components/NotificationToast';
import { useAuth } from './AuthContext';
import echoInstance from '../services/echoService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const toast = useToast();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  // Configurar listeners de notificaciones en tiempo real
  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !user?.uuid) {
      return;
    }

    try {
      const channelName = `user.${user.uuid}`;
      const channel = echoInstance.private(channelName);

      // Mapeo de eventos a tipos de toast
      const eventHandlers = {
        'service.purchased': (data) => {
          toast.success(
            '¡Servicio Adquirido!',
            data.message || `Tu servicio '${data.service_name}' ha sido adquirido exitosamente.`,
            { type: 'service_purchased', duration: 8000 }
          );
        },
        
        'service.ready': (data) => {
          toast.success(
            'Servicio Listo',
            data.message || `Tu servicio '${data.service_name}' está listo para usar.`,
            { type: 'service_ready', duration: 8000 }
          );
        },
        
        'service.status.changed': (data) => {
          toast.info(
            'Estado del Servicio Actualizado',
            data.message || `El estado de tu servicio ha cambiado a: ${data.new_status}`,
            { type: 'service_status', duration: 6000 }
          );
        },
        
        'service.maintenance.scheduled': (data) => {
          toast.warning(
            'Mantenimiento Programado',
            data.message || `Se ha programado mantenimiento para tu servicio.`,
            { type: 'service_maintenance_scheduled', duration: 8000 }
          );
        },
        
        'service.maintenance.completed': (data) => {
          toast.success(
            'Mantenimiento Completado',
            data.message || `El mantenimiento de tu servicio ha sido completado.`,
            { type: 'service_maintenance_completed', duration: 6000 }
          );
        },
        
        'invoice.generated': (data) => {
          toast.info(
            'Nueva Factura Generada',
            data.message || `Se ha generado la factura #${data.invoice_number}`,
            { type: 'invoice_generated', duration: 8000 }
          );
        },
        
        'invoice.status.changed': (data) => {
          const isPositive = ['paid', 'completed'].includes(data.new_status);
          const toastMethod = isPositive ? toast.success : toast.info;
          
          toastMethod(
            'Estado de Factura Actualizado',
            data.message || `Tu factura #${data.invoice_number} cambió a: ${data.new_status}`,
            { type: 'invoice_status_changed', duration: 6000 }
          );
        },
        
        'payment.processed': (data) => {
          toast.success(
            'Pago Procesado',
            data.message || `Tu pago de $${data.amount} ha sido procesado exitosamente.`,
            { type: 'payment_processed', duration: 8000 }
          );
        },
        
        'payment.failed': (data) => {
          toast.error(
            'Error en el Pago',
            data.message || `Hubo un problema procesando tu pago. Por favor, intenta nuevamente.`,
            { type: 'payment_failed', duration: 10000 }
          );
        },
        
        'ticket.replied': (data) => {
          toast.info(
            'Nueva Respuesta en Soporte',
            data.message || `Has recibido una nueva respuesta en tu ticket de soporte.`,
            { type: 'ticket_replied', duration: 6000 }
          );
        },
        
        'notification.received': (data) => {
          // Notificación genérica
          toast.notification(
            data.title || 'Nueva Notificación',
            data.message || data.text || 'Tienes una nueva notificación.',
            data.type || 'default',
            { duration: 6000 }
          );
        }
      };

      // Registrar todos los event listeners
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        channel.listen(eventName, (data) => {
          console.log(`Reverb: Evento recibido - ${eventName}:`, data);
          handler(data);
        });
      });

      console.log(`Reverb: Conectado al canal ${channelName} para notificaciones toast`);

      return () => {
        try {
          Object.keys(eventHandlers).forEach(eventName => {
            channel.stopListening(eventName);
          });
          echoInstance.leave(channelName);
          console.log(`Reverb: Desconectado del canal ${channelName}`);
        } catch (error) {
          console.warn('Error al desconectar listeners de notificaciones:', error);
        }
      };
    } catch (error) {
      console.error('Error al configurar notificaciones en tiempo real:', error);
    }
  }, [isAuthReady, isAuthenticated, user?.uuid, toast]);

  // Funciones de utilidad para mostrar notificaciones manuales
  const showSuccess = (title, message, options = {}) => {
    toast.success(title, message, options);
  };

  const showError = (title, message, options = {}) => {
    toast.error(title, message, options);
  };

  const showWarning = (title, message, options = {}) => {
    toast.warning(title, message, options);
  };

  const showInfo = (title, message, options = {}) => {
    toast.info(title, message, options);
  };

  const showNotification = (title, message, type = 'default', options = {}) => {
    toast.notification(title, message, type, options);
  };

  const value = {
    // Métodos para mostrar notificaciones
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    
    // Acceso directo al hook de toast
    toast,
    
    // Estado de las notificaciones
    toasts: toast.toasts,
    clearAllToasts: toast.clearAllToasts
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

