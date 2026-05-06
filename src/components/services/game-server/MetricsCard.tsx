import React from 'react';
import { Activity, Wifi, Clock, AlertCircle } from 'lucide-react';
import { useGameServerUsage } from '@/hooks/useGameServer';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(ms: number) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

function ResourceBar({ label, value, used, total, color = 'bg-violet-500' }: any) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : color;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-semibold tabular-nums">
          {total ? `${used} / ${total}` : `${pct.toFixed(1)}%`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MetricsCard({ serviceUuid, planLimits }: any) {
  const { data: usage, isError } = useGameServerUsage(serviceUuid);

  const memoryMB = (usage as any)?.memory_bytes ? (usage as any).memory_bytes / 1_048_576 : 0;
  const planMemMB = planLimits?.memory ?? 0;
  const memPct = planMemMB > 0 ? (memoryMB / planMemMB) * 100 : 0;

  const diskBytes: number = (usage as any)?.disk_bytes ?? 0;
  const planDiskMB = planLimits?.disk ?? 0;
  const planDiskBytes = planDiskMB * 1_048_576;
  const diskPct = planDiskBytes > 0 ? (diskBytes / planDiskBytes) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Rendimiento Vital</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">En Vivo</p>
            </div>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground py-8 justify-center bg-muted/20 rounded-xl border border-dashed border-border">
          <AlertCircle className="w-6 h-6 opacity-20" />
          <p className="font-medium">Métricas no disponibles</p>
        </div>
      ) : !usage ? (
        <div className="space-y-5 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <ResourceBar
            label="Memoria RAM"
            value={memPct}
            used={formatBytes((usage as any).memory_bytes)}
            total={planMemMB ? (planMemMB >= 1024 ? `${planMemMB / 1024} GB` : `${planMemMB} MB`) : null}
            color="bg-blue-500"
          />
          <ResourceBar
            label="Carga de CPU"
            value={(usage as any).cpu ?? 0}
            color="bg-violet-500"
          />
          <ResourceBar
            label="Almacenamiento"
            value={diskPct}
            used={formatBytes(diskBytes)}
            total={planDiskMB ? formatBytes(planDiskMB * 1_048_576) : null}
            color="bg-amber-500"
          />

          {/* Network + Uptime Grid */}
          <div className="pt-5 border-t border-border grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Wifi className="w-3 h-3 text-emerald-500" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tráfico Red</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-bold text-foreground tabular-nums flex items-center justify-between">
                  <span className="text-muted-foreground font-normal">↓</span> {formatBytes((usage as any).network_rx)}/s
                </p>
                <p className="text-xs font-bold text-foreground tabular-nums flex items-center justify-between">
                  <span className="text-muted-foreground font-normal">↑</span> {formatBytes((usage as any).network_tx)}/s
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tiempo Activo</p>
              </div>
              <p className="text-sm font-bold text-foreground mt-1">
                {formatUptime((usage as any).uptime_ms)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}