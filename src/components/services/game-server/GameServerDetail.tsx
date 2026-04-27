import React from 'react';
import { ArrowLeft, Gamepad2, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConnectionCard from './ConnectionCard';
import PowerControlCard from './PowerControlCard';
import MetricsCard from './MetricsCard';
import { useGameServerUsage } from '@/hooks/useGameServer';

export default function GameServerDetail({ service }) {
  const { data: usage } = useGameServerUsage(service.uuid, service.status === 'active');
  const isSuspended = usage?.is_suspended ?? service.status === 'suspended';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back + header */}
      <div>
        <Link
          to="/client/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis Servicios
        </Link>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">{service.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-muted-foreground">{service.plan?.name}</span>
              <StatusBadge status={service.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Pending / failed provisioning banner */}
      {(service.status === 'pending' || service.status === 'failed') && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
          service.status === 'failed'
            ? 'border-red-500/30 bg-red-500/[0.04]'
            : 'border-amber-500/30 bg-amber-500/[0.04]'
        }`}>
          {service.status === 'failed'
            ? <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            : <Loader2 className="w-5 h-5 text-amber-500 shrink-0 animate-spin" />
          }
          <p className={`text-sm font-medium ${service.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {service.status === 'failed'
              ? 'Error al crear tu servidor. El equipo de soporte fue notificado.'
              : 'Tu servidor está siendo aprovisionado. Estará listo en unos minutos…'
            }
          </p>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left col */}
        <div className="lg:col-span-3 space-y-6">
          <ConnectionCard connection={service.connection} status={service.status} />
          {service.status === 'active' && (
            <MetricsCard serviceUuid={service.uuid} planLimits={service.plan?.limits} />
          )}
        </div>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-6">
          {service.status === 'active' && (
            <PowerControlCard serviceUuid={service.uuid} isSuspended={isSuspended} />
          )}

          {/* Plan limits info card */}
          {service.plan?.limits && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Recursos del Plan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAM</span>
                  <span className="font-medium text-foreground">
                    {service.plan.limits.memory >= 1024
                      ? `${service.plan.limits.memory / 1024} GB`
                      : `${service.plan.limits.memory} MB`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPU</span>
                  <span className="font-medium text-foreground">{service.plan.limits.cpu / 100} núcleo(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disco</span>
                  <span className="font-medium text-foreground">
                    {service.plan.limits.disk >= 1024
                      ? `${(service.plan.limits.disk / 1024).toFixed(0)} GB`
                      : `${service.plan.limits.disk} MB`}
                  </span>
                </div>
                {service.plan?.feature_limits && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bases de datos</span>
                      <span className="font-medium text-foreground">{service.plan.feature_limits.databases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Backups</span>
                      <span className="font-medium text-foreground">{service.plan.feature_limits.backups}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Creando servidor...', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    active: { label: 'En línea', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    suspended: { label: 'Suspendido', cls: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
    terminated: { label: 'Terminado', cls: 'bg-muted text-muted-foreground border-border' },
    failed: { label: 'Error', cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  };
  const info = map[status] ?? map.active;
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-medium ${info.cls}`}>
      {info.label}
    </span>
  );
}
