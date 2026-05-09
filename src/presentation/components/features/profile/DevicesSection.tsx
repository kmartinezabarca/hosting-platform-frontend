import React, { useState, useMemo } from 'react';
import { useSessions, useLogoutSession, useLogoutOtherSessions } from '@application/hooks/useSessions';
import {
  MonitorSmartphone, Smartphone, Tablet, Monitor,
  MapPin, Clock, LogOut, AlertTriangle, ShieldAlert,
  CheckCircle2, Circle, Zap
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
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30)   return `Hace ${diffDays} d`;
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn(
      'group relative bg-card border rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md',
      device.is_current
        ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
        : device.is_active
          ? 'border-blue-500/20 bg-blue-500/[0.01]'
          : 'border-border/60 hover:border-border'
    )}>
      {/* Status indicator badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {device.is_current && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Actual
          </span>
        )}
        {!device.is_current && device.is_active && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Zap className="w-3 h-3" />
            Activa
          </span>
        )}
        {!device.is_current && !device.is_active && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 text-muted-foreground border border-border/40">
            <Circle className="w-2 h-2" />
            Inactiva
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Device icon */}
        <div className={cn(
          'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 flex items-center justify-center transition-all',
          device.is_current
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : device.is_active
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
              : 'bg-muted/60 text-muted-foreground group-hover:bg-muted'
        )}>
          <DeviceIcon className="w-6 h-6" />
        </div>

        {/* Info section */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {device.browser} en {device.platform}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 font-mono tracking-tight">{device.ip_address}</p>
            </div>
            {!device.is_current && (
              <button
                onClick={onLogout}
                disabled={isPending}
                className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                aria-label="Cerrar sesión en este dispositivo"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {device.location && (
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {device.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {formatRelativeEs(device.last_activity)}
            </span>
          </div>

          {/* Additional info */}
          <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap gap-3 text-xs text-muted-foreground/80">
            <span>Iniciado: {new Date(device.login_at).toLocaleDateString('es-MX')}</span>
            {device.device_type && <span className="capitalize">{device.device_type}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────────── */
const DevicesSection = () => {
  const [page, setPage] = useState(1);
  const [sessionToLogout, setSessionToLogout] = useState<any>(null);
  const [confirmLogoutOthers, setConfirmLogoutOthers] = useState(false);

  const { data: paginatedData, isLoading, isError } = useSessions(page);
  const logoutMutation = useLogoutSession();
  const logoutOthersMutation = useLogoutOtherSessions();

  const rawData = paginatedData as any;
  const devices = rawData?.data?.data || [];
  const pagination = {
    currentPage: rawData?.data?.current_page,
    lastPage: rawData?.data?.last_page,
    total: rawData?.data?.total,
  };

  const currentDevice = useMemo(() => devices.find(d => d.is_current), [devices]);
  const activeDevices = useMemo(() => devices.filter(d => d.is_active), [devices]);
  const inactiveDevices = useMemo(() => devices.filter(d => !d.is_active && !d.is_current), [devices]);

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
        <div className="h-16 bg-muted/50 rounded-2xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-2xl animate-pulse" />
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
    <div className="space-y-6">
      {/* ── Section header card ───────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-card to-card/95 border border-border/60 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
            <MonitorSmartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Dispositivos y Sesiones</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {pagination.total || 0} dispositivo{pagination.total !== 1 ? 's' : ''} 
              {activeDevices.length > 0 && ` • ${activeDevices.length} activo${activeDevices.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setConfirmLogoutOthers(true)}
          disabled={devices.length <= 1 || logoutOthersMutation.isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0',
            'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400',
            'hover:bg-red-500/15 hover:border-red-500/50',
            'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <ShieldAlert className="w-4 h-4" />
          {logoutOthersMutation.isPending ? 'Cerrando...' : 'Cerrar en otros'}
        </button>
      </div>

      {/* ── Stats cards ───────────────────────────────────────────────── */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total de dispositivos</p>
                <p className="text-2xl font-bold text-foreground mt-1">{pagination.total || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center">
                <MonitorSmartphone className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sesiones activas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeDevices.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sesión actual</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">1</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Device list ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        {devices.length === 0 ? (
          <div className="text-center p-12 rounded-2xl border border-dashed border-border/60 bg-muted/20">
            <Monitor className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-base font-medium text-muted-foreground">No hay sesiones activas para mostrar.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Tus dispositivos aparecerán aquí cuando inicies sesión.</p>
          </div>
        ) : (
          <>
            {/* Current device */}
            {currentDevice && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Dispositivo actual</h4>
                <DeviceCard
                  key={currentDevice.uuid}
                  device={currentDevice}
                  onLogout={() => setSessionToLogout(currentDevice)}
                  isPending={logoutMutation.isPending && logoutMutation.variables === currentDevice.uuid}
                />
              </div>
            )}

            {/* Active devices */}
            {activeDevices.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Sesiones activas</h4>
                <div className="space-y-3">
                  {activeDevices.map((device) => (
                    <DeviceCard
                      key={device.uuid}
                      device={device}
                      onLogout={() => setSessionToLogout(device)}
                      isPending={logoutMutation.isPending && logoutMutation.variables === device.uuid}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive devices */}
            {inactiveDevices.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Historial (inactivas)</h4>
                <div className="space-y-3">
                  {inactiveDevices.map((device) => (
                    <DeviceCard
                      key={device.uuid}
                      device={device}
                      onLogout={() => setSessionToLogout(device)}
                      isPending={logoutMutation.isPending && logoutMutation.variables === device.uuid}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
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
          </strong>
          {sessionToLogout?.is_active && (
            <span className="block text-sm text-muted-foreground mt-2">
              Esta sesión está activa. Será necesario volver a iniciar sesión en ese dispositivo.
            </span>
          )}
          {!sessionToLogout?.is_active && (
            <span className="block text-sm text-muted-foreground mt-2">
              Esta sesión está inactiva y será eliminada del historial.
            </span>
          )}
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
          Se cerrarán todas las sesiones excepto la actual. 
          <strong className="block mt-2">Esta acción no se puede deshacer.</strong>
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default DevicesSection;
