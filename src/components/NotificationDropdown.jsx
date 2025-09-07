import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import { useClientNotifications, useUnreadNotificationCount } from '../hooks/useClientNotifications';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { Skeleton } from './ui/skeleton';

const NotificationDropdown = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { 
    notifications, 
    isLoading: loadingNotifications, 
    error: notificationsError, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = isAdmin ? useAdminNotifications() : useClientNotifications();

  const { 
    unreadCount, 
    isLoading: loadingUnreadCount, 
    error: unreadCountError 
  } = isAdmin ? useAdminNotifications() : useUnreadNotificationCount();

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
  }, [dropdownRef]);

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

  const handleNotificationClick = (notification) => {
    if (notification.data.action_url) {
      window.open(notification.data.action_url, "_blank");
    }
    handleMarkAsRead(notification.id);
    setIsOpen(false);
  };

  const sortedNotifications = notifications ? [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Notificaciones"
        title="Notificaciones"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-colors text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:bg-accent/70"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount > 0 && !loadingUnreadCount) && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-error ring-2 ring-white dark:ring-card" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 md:w-96 z-[80] rounded-2xl p-2 bg-white/95 dark:bg-[#121417]/95 supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-[#121417]/80 border border-black/10 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] text-foreground"
          >
            <span aria-hidden className="absolute -top-2 right-6 w-3.5 h-3.5 rotate-45 bg-white/95 dark:bg-[#121417]/95 border-t border-l border-black/10 dark:border-white/10 shadow-[0_2px_6px_rgba(0,0,0,0.06)]" />
            
            <div className="flex justify-between items-center px-3 py-2 border-b border-black/10 dark:border-white/10">
              <h3 className="font-semibold text-lg">Notificaciones</h3>
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!notifications || notifications.filter(n => !n.read_at).length === 0}
              >
                Marcar todas como leídas
              </button>
            </div>

            <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
              {loadingNotifications && (
                <div className="px-3 py-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
              )}
              {notificationsError && <p className="text-error px-3 py-2">Error al cargar notificaciones: {notificationsError.message}</p>}
              
              {!loadingNotifications && sortedNotifications.length === 0 && (
                <p className="text-muted-foreground px-3 py-2">No hay notificaciones.</p>
              )}

              {!loadingNotifications && sortedNotifications.length > 0 && (
                <ul>
                  {sortedNotifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`flex items-start gap-2 px-3 py-2 rounded-lg transition-colors ${notification.read_at ? "bg-muted/20" : "bg-primary/5 hover:bg-primary/10"}`}
                    >
                      <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                        <p className={`text-sm font-medium ${notification.read_at ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.data.title || "Nueva Notificación"}
                        </p>
                        <p className={`text-xs ${notification.read_at ? "text-muted-foreground" : "text-foreground/80"}`}>
                          {notification.data.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notification.read_at && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                            title="Marcar como leída"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {notification.data.action_url && (
                          <button 
                            onClick={() => handleNotificationClick(notification)}
                            className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                            title="Ver detalle"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-error transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;


