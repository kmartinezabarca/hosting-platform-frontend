import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Terminal, Gamepad2, Play, Square, RotateCcw, Zap,
  Loader2, Cpu, MemoryStick, HardDrive, WifiOff,
  User, Package, Activity, Puzzle,
} from 'lucide-react';
import { toast } from '@presentation/components/features/ToastProvider';
import { cn } from '@shared/utils/utils';
import { GameServerConsole } from '@presentation/components/features/services/GameServerConsole';
import FileManager from '@presentation/components/features/services/game-server/ModsManager';
import {
  useAdminServerUsage,
  useAdminServerWebSocket,
  useAdminServerPower,
} from '@application/hooks/useAdminGameServerConsole';
import {
  useAdminFileList,
  useAdminDeleteFile,
  useAdminDownloadFile,
  useAdminUploadFile,
} from '@application/hooks/useAdminFileManager';

type Tab = 'console' | 'info' | 'mods';
type PowerSignal = 'start' | 'stop' | 'restart' | 'kill';

interface Props {
  server: any;
  onClose: () => void;
}

const STATE_COLORS: Record<string, string> = {
  running:  'text-emerald-500',
  starting: 'text-amber-500',
  stopping: 'text-orange-500',
  offline:  'text-slate-400',
};

const fmtBytes = (b: number) => {
  if (!b) return '0 MB';
  const mb = b / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
};

const fmtUptime = (ms: number) => {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function PowerButton({
  signal, label, icon: Icon, variant, disabled, loading, onClick,
}: {
  signal: PowerSignal; label: string; icon: React.ElementType;
  variant: 'green' | 'red' | 'amber' | 'orange';
  disabled?: boolean; loading?: boolean; onClick: () => void;
}) {
  const colors = {
    green:  'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20',
    red:    'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20',
    amber:  'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        colors,
      )}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
      {label}
    </button>
  );
}

export default function AdminGameServerDetailPanel({ server, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('console');
  const [pendingSignal, setPendingSignal] = useState<PowerSignal | null>(null);

  const isActive = server.status === 'active';

  const { data: usage } = useAdminServerUsage(server.id, isActive);
  const fetchCredentials = useAdminServerWebSocket(server.id);
  const powerMutation    = useAdminServerPower(server.id);

  const eggName     = server.game_software ?? server.egg_name ?? server.software ?? 'Servidor';
  const modsDir     = /forge|fabric/i.test(eggName) ? '/mods' : '/plugins';
  const modsEnabled = isActive && activeTab === 'mods';

  // File manager hooks (mods/plugins tab) — always called, disabled when tab not active
  const { data: adminFiles = [], isLoading: filesLoading, error: filesError, refetch: filesRefetch } =
    useAdminFileList(modsEnabled ? server.id : '', modsDir);
  const { mutateAsync: adminDelete }   = useAdminDeleteFile(server.id, modsDir);
  const { mutateAsync: adminDownload } = useAdminDownloadFile(server.id, modsDir);
  const { upload: adminUpload, progress: adminProgress } = useAdminUploadFile(server.id, modsDir);

  const serverState  = (usage as any)?.state ?? 'offline';
  const isRunning    = serverState === 'running' || serverState === 'starting';
  const isSuspended  = (usage as any)?.is_suspended ?? server.status === 'suspended';

  const handlePower = async (signal: PowerSignal) => {
    setPendingSignal(signal);
    try {
      const res: any = await powerMutation.mutateAsync(signal);
      toast.success(res?.message ?? 'Señal enviada.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al enviar señal.');
    } finally {
      setPendingSignal(null);
    }
  };

  const ownerName   = server.user ? `${server.user.first_name} ${server.user.last_name}` : '—';
  const ownerEmail  = server.user?.email ?? '—';
  const planName    = server.plan?.name ?? '—';
  const serverId    = server.pterodactyl_server_id ?? '—';
  const identifier  = server.connection_details?.identifier ?? null;
  const displayAddr = server.connection?.display ?? (server.connection ? `${server.connection.server_ip}:${server.connection.server_port}` : null);

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'console', label: 'Consola',      Icon: Terminal },
    { id: 'mods',    label: 'Plugins/Mods', Icon: Puzzle },
    { id: 'info',    label: 'Información',  Icon: Activity },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-background border-l border-border flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border bg-card shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-foreground truncate">{server.name}</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border">
                <span className={cn('w-1.5 h-1.5 rounded-full', isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                <span className={STATE_COLORS[serverState] ?? 'text-slate-400'}>
                  {serverState}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ownerName}</span>
              <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {eggName}</span>
              {displayAddr && (
                <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{displayAddr}</code>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Power strip */}
        <div className="px-5 py-3 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium mr-1">Control:</span>
            <div className="grid grid-cols-4 gap-2 flex-1">
              <PowerButton signal="start"   label="Iniciar"   icon={Play}      variant="green"  disabled={isRunning  || isSuspended} loading={pendingSignal === 'start'}   onClick={() => handlePower('start')} />
              <PowerButton signal="stop"    label="Detener"   icon={Square}    variant="red"    disabled={!isRunning}                loading={pendingSignal === 'stop'}    onClick={() => handlePower('stop')} />
              <PowerButton signal="restart" label="Reiniciar" icon={RotateCcw} variant="amber"  disabled={!isRunning}                loading={pendingSignal === 'restart'} onClick={() => handlePower('restart')} />
              <PowerButton signal="kill"    label="Forzar"    icon={Zap}       variant="orange" disabled={!isRunning}                loading={pendingSignal === 'kill'}    onClick={() => handlePower('kill')} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-px border-b border-border px-5 shrink-0">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors',
                activeTab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'console' && (
            <div className="p-4 h-full flex flex-col gap-3">
              {/* Metrics strip */}
              {isActive && usage && (
                <div className="grid grid-cols-3 gap-2 shrink-0">
                  {[
                    { icon: Cpu,         label: 'CPU',    value: `${((usage as any).cpu ?? 0).toFixed(1)}%` },
                    { icon: MemoryStick, label: 'RAM',    value: fmtBytes((usage as any).memory_bytes) },
                    { icon: HardDrive,   label: 'Disco',  value: fmtBytes((usage as any).disk_bytes) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono font-semibold text-foreground ml-auto">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {!isActive ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <WifiOff className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">Consola no disponible</p>
                  <p className="text-xs">El servidor está en estado <code className="bg-muted px-1 rounded">{server.status}</code></p>
                </div>
              ) : !identifier ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <WifiOff className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Sin identificador de Pterodactyl asignado.</p>
                </div>
              ) : (
                <GameServerConsole
                  serviceUuid={server.uuid ?? String(server.id)}
                  serverName={server.name}
                  enabled={isActive}
                  className="flex-1 min-h-[400px]"
                  fetchCredentials={fetchCredentials}
                />
              )}
            </div>
          )}

          {activeTab === 'mods' && (
            <div className="p-4">
              {!isActive ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-16">
                  <WifiOff className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-medium">Gestor no disponible</p>
                  <p className="text-xs">El servidor debe estar activo para gestionar plugins/mods.</p>
                </div>
              ) : (
                <FileManager
                  serviceUuid={String(server.id)}
                  eggName={eggName}
                  hooksOverride={{
                    files: adminFiles,
                    isLoading: filesLoading,
                    error: filesError,
                    refetch: filesRefetch,
                    deleteFiles: adminDelete,
                    downloadFile: adminDownload,
                    upload: adminUpload,
                    progress: adminProgress,
                    powerAction: (signal) => powerMutation.mutateAsync(signal),
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="p-5 space-y-4">
              {/* Owner */}
              <section className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Propietario</p>
                </div>
                <div className="divide-y divide-border/50">
                  {[
                    { label: 'Nombre',  value: ownerName },
                    { label: 'Email',   value: ownerEmail },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Server */}
              <section className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Servidor</p>
                </div>
                <div className="divide-y divide-border/50">
                  {[
                    { label: 'Plan',             value: planName },
                    { label: 'Software',         value: eggName },
                    { label: 'Estado',           value: server.status },
                    { label: 'ID Pterodactyl',   value: String(serverId) },
                    { label: 'Identificador',    value: identifier ?? '—' },
                    { label: 'Dirección',        value: displayAddr ?? '—' },
                    { label: 'Estado WS',        value: serverState },
                    { label: 'Uptime',           value: fmtUptime((usage as any)?.uptime ?? 0) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <code className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded max-w-[60%] truncate text-right">{value}</code>
                    </div>
                  ))}
                </div>
              </section>

              {/* Plan limits */}
              {server.plan?.limits && (
                <section className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Límites del Plan</p>
                  </div>
                  <div className="divide-y divide-border/50">
                    {Object.entries(server.plan.limits as Record<string, number>).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono font-semibold text-foreground">{val}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
