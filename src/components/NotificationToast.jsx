import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, DollarSign, Package, Wrench, Bell } from 'lucide-react';

// Iconos por tipo de notificación
const getToastIcon = (type) => {
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
    'success': CheckCircle,
    'error': AlertCircle,
    'warning': AlertCircle,
    'info': Info,
    'default': Bell
  };
  
  return iconMap[type] || iconMap.default;
};

// Colores por tipo de notificación
const getToastColors = (type) => {
  const colorMap = {
    'service_purchased': 'bg-green-50 border-green-200 text-green-800',
    'service_ready': 'bg-green-50 border-green-200 text-green-800',
    'service_status': 'bg-blue-50 border-blue-200 text-blue-800',
    'service_maintenance_scheduled': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'service_maintenance_completed': 'bg-green-50 border-green-200 text-green-800',
    'invoice_generated': 'bg-purple-50 border-purple-200 text-purple-800',
    'invoice_status_changed': 'bg-purple-50 border-purple-200 text-purple-800',
    'payment_processed': 'bg-green-50 border-green-200 text-green-800',
    'payment_failed': 'bg-red-50 border-red-200 text-red-800',
    'ticket_replied': 'bg-blue-50 border-blue-200 text-blue-800',
    'success': 'bg-green-50 border-green-200 text-green-800',
    'error': 'bg-red-50 border-red-200 text-red-800',
    'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'info': 'bg-blue-50 border-blue-200 text-blue-800',
    'default': 'bg-gray-50 border-gray-200 text-gray-800'
  };
  
  return colorMap[type] || colorMap.default;
};

// Colores de iconos
const getIconColors = (type) => {
  const colorMap = {
    'service_purchased': 'text-green-600',
    'service_ready': 'text-green-600',
    'service_status': 'text-blue-600',
    'service_maintenance_scheduled': 'text-yellow-600',
    'service_maintenance_completed': 'text-green-600',
    'invoice_generated': 'text-purple-600',
    'invoice_status_changed': 'text-purple-600',
    'payment_processed': 'text-green-600',
    'payment_failed': 'text-red-600',
    'ticket_replied': 'text-blue-600',
    'success': 'text-green-600',
    'error': 'text-red-600',
    'warning': 'text-yellow-600',
    'info': 'text-blue-600',
    'default': 'text-gray-600'
  };
  
  return colorMap[type] || colorMap.default;
};

// Componente de toast individual
const Toast = ({ 
  id, 
  title, 
  message, 
  type = 'default', 
  duration = 5000, 
  onClose,
  onClick 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = getToastIcon(type);
  const bgColors = getToastColors(type);
  const iconColors = getIconColors(type);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative w-full max-w-sm p-4 border rounded-lg shadow-lg cursor-pointer ${bgColors}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${iconColors}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {title}
          </p>
          {message && (
            <p className="text-sm mt-1 opacity-90">
              {message}
            </p>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barra de progreso */}
      {duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
        />
      )}
    </motion.div>
  );
};

// Contenedor de toasts
const NotificationToast = ({ toasts = [], onRemoveToast, onToastClick }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={onRemoveToast}
              onClick={() => onToastClick && onToastClick(toast)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook para gestionar toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      duration: 5000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Métodos de conveniencia
  const success = (title, message, options = {}) => 
    addToast({ title, message, type: 'success', ...options });

  const error = (title, message, options = {}) => 
    addToast({ title, message, type: 'error', duration: 8000, ...options });

  const warning = (title, message, options = {}) => 
    addToast({ title, message, type: 'warning', ...options });

  const info = (title, message, options = {}) => 
    addToast({ title, message, type: 'info', ...options });

  const notification = (title, message, type = 'default', options = {}) => 
    addToast({ title, message, type, ...options });

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    notification
  };
};

// Agregar el hook al componente para fácil acceso
NotificationToast.useToast = useToast;

export default NotificationToast;

