import React from 'react';
import { BarChart2, Wifi, Clock, AlertCircle } from 'lucide-react';
import { useGameServerUsage } from '@/hooks/useGameServer';
import { cn } from '@/lib/utils';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

function ResourceBar({ label, value, max, used, total, color = 'bg-violet-500' }: any) {
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
      <div className="h-2 rounded-full bg-muted overflow-hidden">
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
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recursos en Tiempo Real</h3>
          <p className="text-xs text-muted-foreground">Actualización cada 5 segundos</p>
        </div>
      </div>

      {isError ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
          <AlertCircle className="w-4 h-4" />
          No se pudo obtener el estado del servidor
        </div>
      ) : !usage ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-8 rounded-lg bg-muted" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <ResourceBar
            label="RAM"
            value={memPct}
            used={formatBytes((usage as any).memory_bytes)}
            total={planMemMB ? `${planMemMB >= 1024 ? `${planMemMB / 1024} GB` : `${planMemMB} MB`}` : null}
            color="bg-blue-500"
          />
          <ResourceBar
            label="CPU"
            value={(usage as any).cpu ?? 0}
            color="bg-violet-500"
          />
          <ResourceBar
            label="Disco"
            value={diskPct}
            used={formatBytes(diskBytes)}
            total={planDiskMB ? `${formatBytes(planDiskMB * 1_048_576)}` : null}
            color="bg-emerald-500"
          />

          {/* Network & Uptime */}
          <div className="pt-2 border-t border-border grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="text-xs">
                <p className="text-muted-foreground">⬇ Red</p>
                <p className="font-semibold text-foreground tabular-nums">{formatBytes((usage as any).network_rx)}/s</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-muted-foreground rotate-180" />
              <div className="text-xs">
                <p className="text-muted-foreground">⬆ Red</p>
                <p className="font-semibold text-foreground tabular-nums">{formatBytes((usage as any).network_tx)}/s</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="text-xs">
                <span className="text-muted-foreground">Uptime: </span>
                <span className="font-semibold text-foreground">{formatUptime((usage as any).uptime_ms)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
