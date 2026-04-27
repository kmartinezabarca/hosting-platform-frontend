import React, { useState, useMemo } from 'react';
import { useSessions, useLogoutSession, useLogoutOtherSessions } from '../../hooks/useSessions';
import {
  MonitorSmartphone, Smartphone, Tablet, Monitor,
  MapPin, Clock, LogOut, AlertTriangle, ShieldAlert,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/ui/pagination-v2';
import ConfirmationModal from '../modals/ConfirmationModal';

/* ── Device card ────────────────────────────────────────────────────────── */
const DeviceCard = ({ device, onLogout, isPending }) => {
  const DeviceIcon = useMemo(() => {
    switch (device.device_type) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default:       return Monitor;
    }
  }, [device.device_type]);

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
      'group bg-card border rounded-2xl p-4 sm:p-5 transition-all duration-200',
      device.is_current
        ? 'border-foreground/20 bg-foreground/[0.02]'
        : 'border-border/60 hover:border-border'
    )}>
      <div className="flex items-center gap-4">
        {/* Device icon */}
        <div className={cn(
          'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors',
          device.is_current
            ? 'bg-foreground text-background'
            : 'bg-muted/60 text-muted-foreground group-hover:bg-muted'
        )}>
          <DeviceIcon className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground text-sm truncate">
                {device.browser} en {device.platform}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{device.ip_address}</p>
            </div>
            {device.is_current ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Actual
              </span>
            ) : (
              <button
                onClick={onLogout}
                disabled={isPending}
                className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/[0.08] disabled:opacity-50 transition-all shrink-0"
                aria-label="Cerrar sesión en este dispositivo"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {device.location || 'Ubicación desconocida'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
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
  const currentDevice = useMemo(() => devices.find(d => d.is_current), [devices]);

  const handleConfirmLogout = () => {
    if (sessionToLogout) {
      logoutMutation.mutate(sessionToLogout.uuid, {
        onSuccess: () => setSessionToLogout(null),
      });
    }
  };

  const handleConfirmLogoutOthers = () => {
    if (currentDevice) {
      logoutOthersMutation.mutate(currentDevice.uuid, {
        onSuccess: () => setConfirmLogoutOthers(false),
      });
    }
  };

  /* ── Loading skeleton ──────────────────────────────────────────────── */
  if (isLoading && !paginatedData) {
    return (
      <div className="space-y-4">
        <div className="h-14 bg-muted/50 rounded-2xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────────────────── */
  if (isError) {
    return (
      <div className="text-center p-10 rounded-2xl border border-dashed border-destructive/40 bg-destructive/[0.04]">
        <AlertTriangle className="w-7 h-7 mx-auto mb-3 text-destructive" />
        <p className="font-medium text-destructive text-sm">Error al cargar las sesiones</p>
        <p className="text-xs text-destructive/70 mt-1">Por favor, intenta recargar la página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Section header card ───────────────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-foreground/[0.07] flex items-center justify-center shrink-0">
            <MonitorSmartphone className="w-4 h-4 text-foreground/70" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Dispositivos y Sesiones</h3>
            <p className="text-xs text-muted-foreground">
              Has iniciado sesión en {pagination.total || 0} dispositivo{pagination.total !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
        <button
          onClick={() => setConfirmLogoutOthers(true)}
          disabled={devices.length <= 1 || logoutOthersMutation.isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shrink-0',
            'border border-red-500/30 text-red-500',
            'hover:bg-red-500/[0.06]',
            'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {logoutOthersMutation.isPending ? 'Cerrando...' : 'Cerrar en otros dispositivos'}
        </button>
      </div>

      {/* ── Device list ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center p-10 rounded-2xl border border-dashed border-border/60">
            <Monitor className="w-7 h-7 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No hay sesiones activas para mostrar.</p>
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

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        onPageChange={setPage}
        className=""
      />

      {/* ── Confirmation modals ───────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={!!sessionToLogout}
        onClose={() => setSessionToLogout(null)}
        onConfirm={handleConfirmLogout}
        title="Cerrar Sesión en Dispositivo"
        confirmText="Sí, cerrar sesión"
        isConfirming={logoutMutation.isPending}
      >
        <p>
          Se cerrará la sesión en{' '}
          <strong className="text-foreground">
            {sessionToLogout?.browser} en {sessionToLogout?.platform}
          </strong>.
          Será necesario volver a iniciar sesión en ese dispositivo.
        </p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={confirmLogoutOthers}
        onClose={() => setConfirmLogoutOthers(false)}
        onConfirm={handleConfirmLogoutOthers}
        title="Cerrar Sesión en Otros Dispositivos"
        confirmText="Sí, cerrar en otros"
        isConfirming={logoutOthersMutation.isPending}
      >
        <p>
          Se cerrarán todas las sesiones excepto la actual. Esta acción no se puede deshacer.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default DevicesSection;
