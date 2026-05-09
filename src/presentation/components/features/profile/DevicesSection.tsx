import React, { useState, useMemo } from 'react';
import { useSessions, useLogoutSession, useLogoutOtherSessions } from '@application/hooks/useSessions';
import {
  MonitorSmartphone, Smartphone, Tablet, Monitor,
  MapPin, Clock, LogOut, AlertTriangle, ShieldAlert,
  Zap, ShieldCheck
} from 'lucide-react';
import { cn } from '@shared/utils/utils';
import Pagination from '@presentation/components/ui/pagination-v2';
import ConfirmationModal from '@presentation/components/features/modals/ConfirmationModal';

/* ── Device card ────────────────────────────────────────────────────────── */
const DeviceCard = ({ device, onLogout, isPending }) => {
  const DeviceIcon = useMemo(() => {
    switch (device.device) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default:       return Monitor;
    }
  }, [device.device]);

  const formatRelativeEs = (dateStr) => {
    if (!dateStr) return '—';
    const date   = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60000)  return 'Ahora mismo';
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60)   return `Hace ${diffMins} min`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24)  return `Hace ${diffHours} h`;
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn(
      'group bg-white dark:bg-[#101820] border rounded-xl p-4 sm:p-5 transition-all duration-200',
      device.is_current
        ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-500/5'
        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
    )}>
      <div className="flex items-center gap-4">
        {/* Device icon */}
        <div className={cn(
          'w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors',
          device.is_current
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
            : 'bg-slate-100 dark:bg-white/5 text-slate-400'
        )}>
          <DeviceIcon className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {device.browser} en {device.platform}
                </h4>
                {device.is_current && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Actual
                  </span>
                )}
                {!device.is_current && device.is_active && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    Activa
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{device.ip_address}</p>
            </div>
            {!device.is_current && (
              <button
                onClick={onLogout}
                disabled={isPending}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-all shrink-0"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              {device.location || 'Ubicación desconocida'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              {formatRelativeEs(device.last_activity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────────── */
const DevicesSection = () => {
  const [page,                setPage]                = useState(1);
  const [sessionToLogout,     setSessionToLogout]     = useState<any>(null);
  const [confirmLogoutOthers, setConfirmLogoutOthers] = useState(false);

  const { data: paginatedData, isLoading, isError } = useSessions(page);
  const logoutMutation       = useLogoutSession();
  const logoutOthersMutation = useLogoutOtherSessions();

  const rawData = paginatedData as any;
  const devices    = rawData?.data?.data || [];
  const pagination = {
    currentPage: rawData?.data?.current_page,
    lastPage:    rawData?.data?.last_page,
    total:       rawData?.data?.total,
  };

  const handleConfirmLogout = () => {
    if (sessionToLogout) {
      logoutMutation.mutate(sessionToLogout.uuid, {
        onSuccess: () => setSessionToLogout(null),
      });
    }
  };

  const handleConfirmLogoutOthers = () => {
    const currentDevice = devices.find(d => d.is_current);
    if (currentDevice) {
      logoutOthersMutation.mutate(currentDevice.uuid, {
        onSuccess: () => setConfirmLogoutOthers(false),
      });
    }
  };

  if (isLoading && !paginatedData) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 rounded-xl border border-dashed border-red-200 bg-red-50 dark:bg-red-500/5">
        <AlertTriangle className="w-7 h-7 mx-auto mb-3 text-red-500" />
        <p className="font-bold text-red-600 text-sm">Error al cargar las sesiones</p>
        <p className="text-xs text-red-500/70 mt-1">Por favor, intenta recargar la página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#101820] border border-slate-200 dark:border-white/10 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
            <MonitorSmartphone className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dispositivos y Sesiones</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Has iniciado sesión en <span className="font-bold text-slate-900 dark:text-white">{pagination.total || 0}</span> dispositivos.
            </p>
          </div>
        </div>
        <button
          onClick={() => setConfirmLogoutOthers(true)}
          disabled={devices.length <= 1 || logoutOthersMutation.isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
            'bg-white dark:bg-transparent border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {logoutOthersMutation.isPending ? 'Cerrando...' : 'Cerrar otros'}
        </button>
      </div>

      {/* Device list */}
      <div className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center p-12 rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <Monitor className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No hay sesiones activas para mostrar.</p>
          </div>
        ) : (
          devices.map((device) => (
            <DeviceCard
              key={device.uuid}
              device={device}
              onLogout={() => setSessionToLogout(device)}
              isPending={logoutMutation.isPending && logoutMutation.variables === device.uuid}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        onPageChange={setPage}
        className="pt-2"
      />

      {/* Confirmation modals */}
      <ConfirmationModal
        isOpen={!!sessionToLogout}
        onClose={() => setSessionToLogout(null)}
        onConfirm={handleConfirmLogout}
        title="Cerrar Sesión"
        confirmText="Sí, cerrar sesión"
        isConfirming={logoutMutation.isPending}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Se cerrará la sesión en <strong className="text-slate-900 dark:text-white">{sessionToLogout?.browser} en {sessionToLogout?.platform}</strong>. 
          Será necesario volver a iniciar sesión en ese dispositivo.
        </p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={confirmLogoutOthers}
        onClose={() => setConfirmLogoutOthers(false)}
        onConfirm={handleConfirmLogoutOthers}
        title="Cerrar Otras Sesiones"
        confirmText="Sí, cerrar todas"
        isConfirming={logoutOthersMutation.isPending}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Se cerrarán todas las sesiones excepto la actual. Esta acción no se puede deshacer.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default DevicesSection;
