import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Trash2, ExternalLink, AlertCircle, Info, DollarSign, Package, Wrench } from 'lucide-react';
import { useClientNotifications, useUnreadNotificationCount } from '../hooks/useClientNotifications';
import { useAdminNotificationsHub } from '../hooks/useAdminNotifications';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '../context/AuthContext';

// Iconos por tipo de notificación
const getNotificationIcon = (type) => {
  const iconMap = {
    'service_purchased': Package,
    'service_ready': CheckCircle,
    'service_status': Package,
    'service_maintenance_scheduled': Wrench,
    'service_maintenance_completed': CheckCircle,
    'invoice_generated': DollarSign,
    'invoice_status_changed': DollarSign,
    'payment_processed': CheckCircle,
    'payment_failed': AlertCircle,
    'ticket_replied': Info,
    'default': Bell
  };
  
  return iconMap[type] || iconMap.default;
};

// Colores por tipo de notificación
const getNotificationColor = (type) => {
  const colorMap = {
    'service_purchased': 'text-green-600 bg-green-100',
    'service_ready': 'text-green-600 bg-green-100',
    'service_status': 'text-blue-600 bg-blue-100',
    'service_maintenance_scheduled': 'text-yellow-600 bg-yellow-100',
    'service_maintenance_completed': 'text-green-600 bg-green-100',
    'invoice_generated': 'text-purple-600 bg-purple-100',
    'invoice_status_changed': 'text-purple-600 bg-purple-100',
    'payment_processed': 'text-green-600 bg-green-100',
    'payment_failed': 'text-red-600 bg-red-100',
    'ticket_replied': 'text-blue-600 bg-blue-100',
    'default': 'text-gray-600 bg-gray-100'
  };
  
  return colorMap[type] || colorMap.default;
};

// Componente de notificación individual
const NotificationItem = ({ notification, onMarkAsRead, onDelete, isAdmin = false }) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const isUnread = !notification.read_at;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isUnread ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium text-gray-900 ${isUnread ? 'font-semibold' : ''}`}>
                {notification.data?.title || 'Notificación'}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.data?.message || notification.data?.text || 'Sin mensaje'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {formatDate(notification.created_at)}
              </p>
            </div>
            
            {isUnread && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            {isUnread && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar como leída
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal
const NotificationDropdown = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Obtener estado de autenticación
  const { isAuthenticated, isAuthReady, user } = useAuth();

  // Solo usar hooks de notificaciones si el usuario está autenticado y la auth está lista
  const shouldUseNotifications = isAuthReady && isAuthenticated && user?.uuid;

  // Hooks condicionales - solo se ejecutan si shouldUseNotifications es true
  const clientNotifications = shouldUseNotifications && !isAdmin ? useClientNotifications() : null;
  const clientUnreadCount = shouldUseNotifications && !isAdmin ? useUnreadNotificationCount() : null;
  const adminNotifications = shouldUseNotifications && isAdmin ? useAdminNotificationsHub() : null;

  // Seleccionar los datos correctos basados en el tipo de usuario
  const notificationData = isAdmin ? adminNotifications : clientNotifications;
  const unreadData = isAdmin ? adminNotifications : clientUnreadCount;

  // Extraer datos de forma segura
  const notifications = notificationData?.notifications || [];
  const isLoading = notificationData?.isLoading || false;
  const error = notificationData?.error || null;
  const markAsRead = notificationData?.markAsRead || (() => {});
  const markAllAsRead = notificationData?.markAllAsRead || (() => {});
  const deleteNotification = notificationData?.deleteNotification || (() => {});
  const isReady = notificationData?.isReady || false;

  const unreadCount = unreadData?.unreadCount || 0;
  const isLoadingUnreadCount = unreadData?.isLoading || false;
  const unreadCountError = unreadData?.error || null;
  const unreadReady = unreadData?.isReady || false;

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    if (notifications && notifications.length > 0) {
      markAllAsRead();
    }
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
  };

  // Si no está autenticado o la auth no está lista, mostrar placeholder
  if (!shouldUseNotifications) {
    return (
      <div className="w-6 h-6 animate-pulse bg-gray-200 rounded"></div>
    );
  }

  // Componente de carga
  const LoadingState = () => (
    <div className="p-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Componente de error
  const ErrorState = () => (
    <div className="p-4 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Error al cargar notificaciones</p>
    </div>
  );

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="p-8 text-center">
      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500">No hay notificaciones</p>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadReady && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {isReady && notifications && notifications.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {!isReady || isLoading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState />
              ) : !notifications || notifications.length === 0 ? (
                <EmptyState />
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {isReady && notifications && notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navegar a la página de notificaciones si existe
                    window.location.href = isAdmin ? '/admin/notifications' : '/client/notifications';
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;

