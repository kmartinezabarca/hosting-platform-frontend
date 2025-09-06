import React, { useState, useMemo } from 'react';
import { useSessions, useLogoutSession, useLogoutOtherSessions } from '../../hooks/useSessions';
import { MonitorSmartphone, Smartphone, Tablet, Monitor, MapPin, Clock, LogOut, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import Pagination from '../../components/ui/pagination-v2';
import ConfirmationModal from '../modals/ConfirmationModal'; // Reutilizamos nuestro modal de confirmación

// --- Sub-componente para una sola tarjeta de dispositivo ---
// Esto limpia el componente principal y es más fácil de mantener.
const DeviceCard = ({ device, onLogout, isPending }) => {
  const DeviceIcon = useMemo(() => {
    switch (device.device_type) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  }, [device.device_type]);

  const formatRelativeEs = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60000) return 'Ahora mismo';
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-4 sm:p-6 transition-all',
      device.is_current ? 'border-primary/30 bg-primary/5' : 'border-border'
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center',
          device.is_current ? 'bg-primary/10' : 'bg-muted'
        )}>
          <DeviceIcon className={cn('w-6 h-6', device.is_current ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground truncate">{device.browser} en {device.platform}</h4>
              <p className="text-sm text-muted-foreground">{device.ip_address}</p>
            </div>
            {device.is_current ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-600">
                Actual
              </span>
            ) : (
              <button
                onClick={onLogout}
                disabled={isPending}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                aria-label="Cerrar sesión en este dispositivo"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{device.location || 'Ubicación desconocida'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Últ. vez: {formatRelativeEs(device.last_activity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
const DevicesSection = () => {
  const [page, setPage] = useState(1);
  const [sessionToLogout, setSessionToLogout] = useState(null);
  const [confirmLogoutOthers, setConfirmLogoutOthers] = useState(false);

  // --- Hooks de React Query para gestionar datos y mutaciones ---
  const { data: paginatedData, isLoading, isError } = useSessions(page);
  const logoutMutation = useLogoutSession();
  const logoutOthersMutation = useLogoutOtherSessions();

  // Extraemos los datos y la metadata de paginación de la respuesta de la API
  const devices = paginatedData?.data?.data || [];
  const pagination = {
    currentPage: paginatedData?.data?.current_page,
    lastPage: paginatedData?.data?.last_page,
    total: paginatedData?.data?.total,
  };
  const currentDevice = useMemo(() => devices.find(d => d.is_current), [devices]);

  // --- Manejadores de Acciones ---
  const handleConfirmLogout = () => {
    if (sessionToLogout) {
      logoutMutation.mutate(sessionToLogout.uuid, {
        onSuccess: () => setSessionToLogout(null), // Cierra el modal al éxito
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

  // --- Renderizado de Estados ---
  if (isLoading && !paginatedData) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-muted rounded-2xl animate-pulse" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 rounded-2xl border border-dashed border-destructive/50 bg-destructive/5">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-destructive" />
        <p className="text-destructive font-medium">Error al cargar las sesiones</p>
        <p className="text-sm text-destructive/80">Por favor, intenta recargar la página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Dispositivos y Sesiones</h3>
          <p className="text-muted-foreground mt-1">
            Has iniciado sesión en {pagination.total || 0} dispositivo{pagination.total !== 1 && 's'}.
          </p>
        </div>
        <button
          onClick={() => setConfirmLogoutOthers(true)}
          disabled={devices.length <= 1 || logoutOthersMutation.isPending}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {logoutOthersMutation.isPending ? 'Cerrando...' : 'Cerrar en otros dispositivos'}
        </button>
      </div>

      {/* Lista de Dispositivos */}
      <div className="space-y-4">
        {devices.length === 0 ? (
          <div className="text-center p-10 rounded-2xl border border-dashed border-border">
            <Monitor className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No hay sesiones activas para mostrar.</p>
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

      {/* Paginación */}
      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        onPageChange={setPage}
      />

      {/* Modales de Confirmación */}
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
          <strong className="text-foreground">{sessionToLogout?.browser} en {sessionToLogout?.platform}</strong>.
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