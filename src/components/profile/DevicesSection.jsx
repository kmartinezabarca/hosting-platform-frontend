import React, { useState } from 'react';
import { 
  MonitorSmartphone, 
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  Clock, 
  LogOut, 
  AlertTriangle,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';

const DevicesSection = ({ devices = [], onLogoutDevice }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(null);

  // Datos mock si no se proporcionan dispositivos
  const mockDevices = [
    {
      id: 1,
      device_type: 'desktop',
      browser: 'Chrome',
      os: 'Windows 11',
      location: 'Ciudad de México, MX',
      ip_address: '192.168.1.100',
      last_activity: '2024-08-30T10:30:00Z',
      is_current: true,
      created_at: '2024-08-29T08:00:00Z'
    },
    {
      id: 2,
      device_type: 'mobile',
      browser: 'Safari',
      os: 'iOS 17.5',
      location: 'Guadalajara, MX',
      ip_address: '192.168.1.101',
      last_activity: '2024-08-30T09:15:00Z',
      is_current: false,
      created_at: '2024-08-28T14:30:00Z'
    },
    {
      id: 3,
      device_type: 'tablet',
      browser: 'Chrome',
      os: 'Android 14',
      location: 'Monterrey, MX',
      ip_address: '192.168.1.102',
      last_activity: '2024-08-29T22:45:00Z',
      is_current: false,
      created_at: '2024-08-27T16:20:00Z'
    }
  ];

  const deviceList = devices.length > 0 ? devices : mockDevices;

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Monitor;
    }
  };

  const getDeviceTypeLabel = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return 'Móvil';
      case 'tablet':
        return 'Tablet';
      case 'desktop':
      default:
        return 'Escritorio';
    }
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES');
  };

  const handleLogout = (deviceId) => {
    if (onLogoutDevice) {
      onLogoutDevice(deviceId);
    }
    setShowLogoutConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <MonitorSmartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Dispositivos Activos
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona las sesiones activas en tus dispositivos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {deviceList.length} Dispositivos
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Sesiones activas
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Sesión Actual
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Dispositivo seguro
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Última actividad
              </span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              {formatLastActivity(deviceList[0]?.last_activity)}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de dispositivos */}
      <div className="space-y-4">
        {deviceList.map((device) => {
          const DeviceIcon = getDeviceIcon(device.device_type);
          
          return (
            <div
              key={device.id}
              className={cn(
                'bg-white dark:bg-slate-900 rounded-2xl border p-6 transition-all duration-200',
                device.is_current 
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icono del dispositivo */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  device.is_current
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-slate-100 dark:bg-slate-800'
                )}>
                  <DeviceIcon className={cn(
                    'w-6 h-6',
                    device.is_current
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400'
                  )} />
                </div>

                {/* Información del dispositivo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {device.browser} en {device.os}
                        </h4>
                        {device.is_current && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Actual
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getDeviceTypeLabel(device.device_type)} • {device.ip_address}
                      </p>
                    </div>

                    {/* Menú de acciones */}
                    {!device.is_current && (
                      <div className="relative">
                        <button
                          onClick={() => setShowLogoutConfirm(device.id)}
                          className={cn(
                            'p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400',
                            'hover:bg-red-50 dark:hover:bg-red-900/20',
                            'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                            'transition-all duration-200'
                          )}
                          title="Cerrar sesión"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Detalles adicionales */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{device.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Última actividad: {formatLastActivity(device.last_activity)}</span>
                    </div>
                  </div>

                  {/* Información de seguridad */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Primera conexión: {new Date(device.created_at).toLocaleDateString('es-ES')}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-xs">Verificado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal de confirmación de logout */}
              {showLogoutConfirm === device.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Cerrar sesión
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          ¿Estás seguro?
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Se cerrará la sesión en <strong>{device.browser} en {device.os}</strong>. 
                      El dispositivo necesitará iniciar sesión nuevamente.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLogoutConfirm(null)}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg',
                          'border border-slate-300 dark:border-slate-600',
                          'text-slate-700 dark:text-slate-300',
                          'hover:bg-slate-100 dark:hover:bg-slate-700',
                          'focus:outline-none focus:ring-2 focus:ring-slate-500/20',
                          'transition-all duration-200'
                        )}
                      >
                        Cancelar
                      </button>
                      
                      <button
                        onClick={() => handleLogout(device.id)}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg',
                          'bg-red-600 hover:bg-red-700 text-white',
                          'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                          'transition-all duration-200'
                        )}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Consejos de seguridad
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Cierra sesión en dispositivos que no reconozcas</li>
              <li>• Revisa regularmente tus dispositivos activos</li>
              <li>• Usa redes WiFi seguras para acceder a tu cuenta</li>
              <li>• Activa la autenticación de dos factores para mayor seguridad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesSection;

