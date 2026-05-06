import React from 'react';

const getStatusText = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active': return 'Activo';
    case 'pending': return 'Pendiente';
    case 'suspended': return 'Suspendido';
    case 'cancelled': return 'Cancelado';
    default: return 'Desconocido';
  }
};

const getStatusClasses = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
  if (s === 'pending') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  if (s === 'suspended') return 'bg-destructive/10 text-destructive';
  return 'bg-muted text-foreground/70';
};

const StatusIndicator = ({ status }) => (
  <span
    className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
      ring-1 ring-black/10 dark:ring-white/10 ${getStatusClasses(status)}
    `}
  >
    <span className="h-2.5 w-2.5 rounded-full bg-current" />
    {getStatusText(status)}
  </span>
);

export default StatusIndicator;
