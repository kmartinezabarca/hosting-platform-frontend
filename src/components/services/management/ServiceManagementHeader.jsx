import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

// El nuevo y elegante indicador de estado
const StatusIndicator = ({ status }) => {
  const statusInfo = {
    active: { text: 'Active', color: 'bg-green-500' },
    pending: { text: 'Pending', color: 'bg-yellow-500' },
    suspended: { text: 'Suspended', color: 'bg-red-500' },
    cancelled: { text: 'Cancelled', color: 'bg-zinc-500' },
  };
  const currentStatus = statusInfo[status] || statusInfo.cancelled;

  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-3 w-3`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStatus.color}`}></span>
      </span>
      <span className="text-sm font-medium text-foreground">{currentStatus.text}</span>
    </div>
  );
};

const ServiceManagementHeader = ({ service, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mb-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* --- Botón de Volver --- */}
      <Link
        to="/client/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Mis Servicios
      </Link>

      {/* --- Título y Estado --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {service.name}
        </h1>
        <StatusIndicator status={service.status} />
      </div>

      {/* --- Información Clave (ahora más sutil) --- */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
        <span>Dominio: <strong className="text-foreground">{service.domain || 'N/A'}</strong></span>
        <span>IP Pública: <strong className="text-foreground">{service.ip_address || 'N/A'}</strong></span>
        <span>Creado: <strong className="text-foreground">{new Date(service.created_at).toLocaleDateString('es-ES')}</strong></span>
      </div>
    </div>
  );
};

export default ServiceManagementHeader;
