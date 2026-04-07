import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Trash2, AlertCircle, Info, DollarSign, Package, Wrench, ArrowRight } from 'lucide-react';
import { useClientNotifications, useUnreadNotificationCount } from '../hooks/useClientNotifications';
import { useAdminNotificationsHub } from '../hooks/useAdminNotifications';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '../context/AuthContext';


const toKey = (type) => (typeof type === 'string' ? type.replace(/\./g, '_').toLowerCase() : 'default');

const notificationStyles = {
  service_purchased: { icon: Package, color: 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/50' },
  service_ready: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/50' },
  service_status: { icon: Package, color: 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50' },
  service_maintenance_scheduled: { icon: Wrench, color: 'text-yellow-500 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50' },
  service_maintenance_completed: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/50' },
  invoice_generated: { icon: DollarSign, color: 'text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50' },
  invoice_status_changed: { icon: DollarSign, color: 'text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50' },
  payment_processed: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/50' },
  payment_failed: { icon: AlertCircle, color: 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50' },
  ticket_replied: { icon: Info, color: 'text-blue-500 dark:text-blue-400 bg-blue-900/50' },
  default: { icon: Bell, color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800' },
};

const getNotificationStyle = (type) => notificationStyles[toKey(type)] || notificationStyles.default;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = (now - date) / 1000;
  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const { icon: Icon, color: colorClass } = getNotificationStyle(notification?.data?.type);
  const isUnread = !notification.read_at;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className={`border-b border-gray-200/80 dark:border-gray-700/60 ${isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800/50'}`}
    >
      <div className="p-4 group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                {notification?.data?.title || 'Notificación'}
              </p>
              {isUnread && (
                <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full ml-3 mt-1 shadow-[0_0_6px] shadow-blue-500/70" aria-label="No leída" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {notification?.data?.message || notification?.data?.text || 'Sin contenido'}
            </p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(notification.created_at)}
              </p>
              <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {isUnread && (
                  <button onClick={() => onMarkAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                    Leída
                  </button>
                )}
                <button onClick={() => onDelete(notification.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationDropdown = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated, isAuthReady, user } = useAuth();

  // MEJORA: Hooks encapsulados para mayor claridad.
  const useNotifications = isAdmin ? useAdminNotificationsHub : useClientNotifications;
  const {
    notifications = [],
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isReady,
  } = useNotifications() || {};
  
  const { unreadCount = 0, isReady: unreadReady } = useUnreadNotificationCount();
  const unreadCountForDisplay = isAdmin ? notifications.filter(n => !n.read_at).length : unreadCount;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthReady || !isAuthenticated || !user?.uuid) {
    return <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />;
  }

  const renderContent = () => {
    if (!isReady || isLoading) {
      return (
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Error al cargar</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inténtalo de nuevo más tarde.</p>
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Todo al día</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No tienes notificaciones nuevas.</p>
        </div>
      );
    }
    return (
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} onDelete={deleteNotification} />
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
        aria-label={`Notificaciones (${unreadCountForDisplay} sin leer)`}
      >
        <Bell className="w-6 h-6" />
        {unreadReady && unreadCountForDisplay > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-md">
            {unreadCountForDisplay > 9 ? '9+' : unreadCountForDisplay}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 80px)', minHeight: '150px' }}
          >
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {isReady && notifications.length > 0 && unreadCountForDisplay > 0 && (
                <button onClick={() => markAllAsRead()} className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold mt-1">
                  Marcar todas como leídas
                </button>
              )}
            </header>

            <div className="overflow-y-auto flex-1">
              {renderContent()}
            </div>

            {isReady && notifications.length > 0 && (
              <footer className="p-2 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = isAdmin ? '/admin/notifications' : '/client/notifications';
                  }}
                  className="w-full flex items-center justify-center gap-2 text-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Ver historial completo <ArrowRight className="w-4 h-4" />
                </button>
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
