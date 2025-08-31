import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Normaliza un item de sesión/dispositivo para evitar crasheos por datos faltantes.
 */
function normalizeDevice(raw) {
  const id = raw?.uuid || raw?.id || `${raw?.ip_address || 'ip-unk'}:${(raw?.user_agent || '').slice(0, 12)}`;
  const deviceTypeRaw = (raw?.device_type || raw?.device || '').toLowerCase();
  const device_type = ['mobile', 'tablet', 'desktop'].includes(deviceTypeRaw)
    ? deviceTypeRaw
    : deviceTypeRaw.includes('phone')
      ? 'mobile'
      : deviceTypeRaw.includes('tab')
        ? 'tablet'
        : 'desktop';

  // SO / navegador
  const browser = raw?.browser || 'Navegador';
  const os = raw?.os || raw?.platform || 'Sistema operativo';

  // Fechas
  const parseDate = (v) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  };
  const last_activity = parseDate(raw?.last_activity);
  const created_at = parseDate(raw?.created_at);
  const login_at = parseDate(raw?.login_at);
  const logout_at = parseDate(raw?.logout_at);

  // Ubicación
  const location =
    raw?.location ||
    [raw?.city, raw?.region, raw?.country].filter(Boolean).join(', ') ||
    null;

  return {
    id,
    uuid: raw?.uuid || null,
    is_current: !!raw?.is_current,
    ip_address: raw?.ip_address || '—',
    user_agent: raw?.user_agent || '',
    device_type,
    browser,
    os,
    location,
    created_at,
    last_activity,
    login_at,
    logout_at,
  };
}

/**
 * Formato relativo simple en español. Fallback a fecha corta si no válida.
 */
function formatRelativeEs(date) {
  if (!date || Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'En el futuro';

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return 'Ahora mismo';
  if (diffMs < hour) {
    const m = Math.floor(diffMs / minute);
    return `Hace ${m} min`;
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour);
    return `Hace ${h} h`;
  }
  if (diffMs < week) {
    const d = Math.floor(diffMs / day);
    return `Hace ${d} d`;
  }
  return date.toLocaleDateString('es-MX');
}

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

/**
 * Props:
 * - devices: array de sesiones del backend (pueden venir con campos faltantes).
 * - onLogoutDevice: fn(idOrUuid) => Promise|void
 * - onLogoutOthers: fn(currentIdOrUuid) => Promise|void  (opcional)
 * - loading: boolean (para skeletons externos si quieres)
 */
export default function DevicesSection({
  devices = [],
  onLogoutDevice,
  onLogoutOthers,
  loading = false,
}) {
  const [confirmFor, setConfirmFor] = useState(null); // id/uuid del dispositivo a cerrar
  const [pendingId, setPendingId] = useState(null);   // deshabilitar botón mientras cierra
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const normalized = useMemo(() => {
    const list = Array.isArray(devices) ? devices : [];
    return list.map(normalizeDevice)
      .sort((a, b) => {
        // actual primero
        if (a.is_current && !b.is_current) return -1;
        if (!a.is_current && b.is_current) return 1;
        // luego por last_activity desc
        const at = a.last_activity?.getTime?.() || 0;
        const bt = b.last_activity?.getTime?.() || 0;
        return bt - at;
      });
  }, [devices]);

  const current = normalized.find(d => d.is_current) || null;
  const total = normalized.length;
  const newestActivity = useMemo(() => {
    const best = normalized[0]?.last_activity;
    return best || null;
  }, [normalized]);

  const handleLogout = useCallback(async (idOrUuid) => {
    if (!onLogoutDevice) {
      setConfirmFor(null);
      return;
    }
    try {
      setPendingId(idOrUuid);
      await onLogoutDevice(idOrUuid);
    } finally {
      setPendingId(null);
      setConfirmFor(null);
    }
  }, [onLogoutDevice]);

  const handleLogoutOthers = useCallback(async () => {
    if (!onLogoutOthers || !current) {
      setConfirmAllOpen(false);
      return;
    }
    try {
      setPendingId('__ALL__');
      await onLogoutOthers(current.uuid || current.id);
    } finally {
      setPendingId(null);
      setConfirmAllOpen(false);
    }
  }, [onLogoutOthers, current]);

  // Cerrar modal con ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setConfirmFor(null);
        setConfirmAllOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header / métricas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MonitorSmartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Dispositivos Activos
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gestiona las sesiones abiertas en tus dispositivos
              </p>
            </div>
          </div>

          {!!onLogoutOthers && (
            <button
              type="button"
              onClick={() => setConfirmAllOpen(true)}
              disabled={!current || pendingId === '__ALL__'}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition',
                'border border-slate-300 dark:border-slate-600',
                'text-slate-700 dark:text-slate-300',
                'hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50'
              )}
              title="Cerrar sesión en todos los demás dispositivos"
            >
              Cerrar en otros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {total} dispositivo{total === 1 ? '' : 's'}
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
                {current ? 'Sesión actual' : 'Sin sesión actual detectada'}
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {current ? 'Dispositivo seguro' : 'Inicia sesión para identificarla'}
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
              {newestActivity ? formatRelativeEs(newestActivity) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {normalized.length === 0 && !loading && (
          <div className="text-center p-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <Monitor className="w-8 h-8 mx-auto mb-3 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">No hay sesiones activas.</p>
          </div>
        )}

        {normalized.map((device) => {
          const DeviceIcon = getDeviceIcon(device.device_type);
          const isPending = pendingId === device.id || pendingId === device.uuid;

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
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    device.is_current
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-slate-100 dark:bg-slate-800'
                  )}
                >
                  <DeviceIcon
                    className={cn(
                      'w-6 h-6',
                      device.is_current
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                          {(device.browser || 'Navegador')} en {(device.os || 'SO')}
                        </h4>
                        {device.is_current && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getDeviceTypeLabel(device.device_type)} • {device.ip_address || '—'}
                      </p>
                    </div>

                    {!device.is_current && (
                      <button
                        type="button"
                        onClick={() => setConfirmFor(device.id)}
                        disabled={isPending}
                        className={cn(
                          'p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400',
                          'hover:bg-red-50 dark:hover:bg-red-900/20',
                          'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                          'transition-all duration-200 disabled:opacity-50'
                        )}
                        title="Cerrar sesión"
                        aria-label="Cerrar sesión en este dispositivo"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{device.location || 'Ubicación desconocida'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Última actividad: {formatRelativeEs(device.last_activity)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Primera conexión:{' '}
                        {device.created_at ? device.created_at.toLocaleDateString('es-MX') : '—'}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-xs">Verificado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal confirmación logout uno */}
              {confirmFor === device.id && (
                <div
                  role="dialog"
                  aria-modal="true"
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setConfirmFor(null);
                  }}
                >
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Cerrar sesión en este dispositivo
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          ¿Estás seguro?
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      Se cerrará la sesión en <strong>{device.browser}</strong> en{' '}
                      <strong>{device.os}</strong>. Tendrá que iniciar sesión nuevamente.
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmFor(null)}
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
                        type="button"
                        onClick={() => handleLogout(device.uuid || device.id)}
                        disabled={isPending}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg',
                          'bg-red-600 hover:bg-red-700 text-white',
                          'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                          'transition-all duration-200 disabled:opacity-50'
                        )}
                      >
                        {isPending ? 'Cerrando…' : 'Cerrar sesión'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal confirmación logout en otros */}
      {confirmAllOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmAllOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Cerrar sesión en todos los demás
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ¿Confirmas que deseas cerrar sesión en todos los dispositivos excepto el actual?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmAllOpen(false)}
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
                type="button"
                onClick={handleLogoutOthers}
                disabled={pendingId === '__ALL__'}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg',
                  'bg-red-600 hover:bg-red-700 text-white',
                  'focus:outline-none focus:ring-2 focus:ring-red-500/20',
                  'transition-all duration-200 disabled:opacity-50'
                )}
              >
                {pendingId === '__ALL__' ? 'Cerrando…' : 'Cerrar en otros'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
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
}
