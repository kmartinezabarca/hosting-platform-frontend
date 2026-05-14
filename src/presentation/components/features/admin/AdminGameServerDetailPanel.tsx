'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Terminal, Gamepad2, Play, Square, RotateCcw, Zap,
  Loader2, Cpu, MemoryStick, HardDrive, WifiOff, ChevronRight, ChevronLeft,
  Puzzle, Clock, AlertCircle,
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

type Tab = 'console' | 'mods';
type PowerSignal = 'start' | 'stop' | 'restart' | 'kill';

interface Props {
  server: any;
  onClose?: () => void;
  embedded?: boolean;
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
        'flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        colors,
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function MetricCard({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-border transition-colors">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono font-semibold text-foreground text-sm">{value}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}</p>
      </div>
    </div>
  );
}

function InfoSection({ title, items }: { title: string; items: { label: string; value: string | React.ReactNode }[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">{title}</p>
      <div className="space-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="font-medium text-foreground text-right text-xs break-words max-w-[120px]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminGameServerDetailPanel({ server, onClose, embedded }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('console');
  const [pendingSignal, setPendingSignal] = useState<PowerSignal | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const isActive = server.status === 'active';

  const { data: usage } = useAdminServerUsage(server.id, isActive);
  const fetchCredentials = useAdminServerWebSocket(server.id);
  const powerMutation = useAdminServerPower(server.id);

  const eggName = server.game_software ?? server.egg_name ?? server.software ?? 'Servidor';
  const modsDir = /forge|fabric/i.test(eggName) ? '/mods' : '/plugins';
  const modsEnabled = isActive && activeTab === 'mods';

  const { data: adminFiles = [], isLoading: filesLoading, error: filesError, refetch: filesRefetch } =
    useAdminFileList(modsEnabled ? server.id : '', modsDir);
  const { mutateAsync: adminDelete } = useAdminDeleteFile(server.id, modsDir);
  const { mutateAsync: adminDownload } = useAdminDownloadFile(server.id, modsDir);
  const { upload: adminUpload, progress: adminProgress } = useAdminUploadFile(server.id, modsDir);

  const serverState = (usage as any)?.state ?? 'offline';
  const isRunning = serverState === 'running' || serverState === 'starting';
  const isSuspended = (usage as any)?.is_suspended ?? server.status === 'suspended';

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

  const ownerName = server.user ? `${server.user.first_name} ${server.user.last_name}` : '—';
  const ownerEmail = server.user?.email ?? '—';
  const planName = server.plan?.name ?? '—';
  const serverId = server.pterodactyl_server_id ?? '—';
  const identifier = server.connection_details?.identifier ?? null;
  const displayAddr = server.connection?.display ?? (server.connection ? `${server.connection.server_ip}:${server.connection.server_port}` : null);

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'console', label: 'Consola', Icon: Terminal },
    { id: 'mods', label: 'Plugins/Mods', Icon: Puzzle },
  ];

  if (embedded) {
    return (
      <div className="w-full bg-background border border-border rounded-lg flex flex-col overflow-hidden">
        {/* Header compacto */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">{server.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                <span className={cn('text-xs font-medium', STATE_COLORS[serverState] ?? 'text-slate-400')}>
                  {serverState}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Control bar */}
        <div className="px-5 py-2.5 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              <PowerButton signal="start" label="Iniciar" icon={Play} variant="green" disabled={isRunning || isSuspended} loading={pendingSignal === 'start'} onClick={() => handlePower('start')} />
              <PowerButton signal="stop" label="Detener" icon={Square} variant="red" disabled={!isRunning} loading={pendingSignal === 'stop'} onClick={() => handlePower('stop')} />
              <PowerButton signal="restart" label="Reiniciar" icon={RotateCcw} variant="amber" disabled={!isRunning} loading={pendingSignal === 'restart'} onClick={() => handlePower('restart')} />
              <PowerButton signal="kill" label="Forzar" icon={Zap} variant="orange" disabled={!isRunning} loading={pendingSignal === 'kill'} onClick={() => handlePower('kill')} />
            </div>
            {isSuspended && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-600 dark:text-orange-400 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Suspendido</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-px border-b border-border px-5 shrink-0">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors',
                activeTab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Contenido principal con sidebar */}
        <div className="flex-1 overflow-hidden flex relative">
          {/* Sidebar derecho (colapsable) */}
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="border-l border-border bg-card overflow-y-auto shrink-0"
              >
                <div className="p-4 space-y-4">
                  {/* Estado del servidor */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Estado en Tiempo Real</p>
                    <div className="space-y-1.5">
                      <MetricCard icon={Cpu} label="CPU" value={((usage as any)?.cpu ?? 0).toFixed(1)} unit="%" />
                      <MetricCard icon={MemoryStick} label="RAM" value={fmtBytes((usage as any)?.memory_bytes)} />
                      <MetricCard icon={HardDrive} label="Disco" value={fmtBytes((usage as any)?.disk_bytes)} />
                      <MetricCard icon={Clock} label="Uptime" value={fmtUptime((usage as any)?.uptime ?? 0)} />
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <InfoSection
                    title="Cliente"
                    items={[
                      { label: 'Nombre', value: ownerName },
                      { label: 'Email', value: <span className="text-xs break-all">{ownerEmail}</span> },
                    ]}
                  />

                  {/* Información del servidor */}
                  <InfoSection
                    title="Servidor"
                    items={[
                      { label: 'Plan', value: planName },
                      { label: 'Software', value: eggName },
                      { label: 'ID Pterodactyl', value: <code className="text-xs">{String(serverId)}</code> },
                      { label: 'Dirección', value: displayAddr ? <code className="text-xs break-all">{displayAddr}</code> : '—' },
                    ]}
                  />

                  {/* Límites del plan */}
                  {server.plan?.limits && (
                    <InfoSection
                      title="Límites del Plan"
                      items={Object.entries(server.plan.limits as Record<string, number>).map(([key, val]) => ({
                        label: key.replace(/_/g, ' '),
                        value: <span className="font-mono">{val}</span>,
                      }))}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Área principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Botón toggle sidebar */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-l-lg bg-muted border-l border-border hover:bg-muted/80 transition-colors"
              title={sidebarExpanded ? 'Ocultar información' : 'Mostrar información'}
            >
              {sidebarExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Contenido de tabs */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'console' && (
                <div className="h-full flex flex-col p-4 gap-3">
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
                <div className="h-full flex flex-col p-4">
                  {!isActive ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-background border-l border-border flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header compacto */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">{server.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
                <span className={cn('text-xs font-medium', STATE_COLORS[serverState] ?? 'text-slate-400')}>
                  {serverState}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control bar */}
        <div className="px-5 py-2.5 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              <PowerButton signal="start" label="Iniciar" icon={Play} variant="green" disabled={isRunning || isSuspended} loading={pendingSignal === 'start'} onClick={() => handlePower('start')} />
              <PowerButton signal="stop" label="Detener" icon={Square} variant="red" disabled={!isRunning} loading={pendingSignal === 'stop'} onClick={() => handlePower('stop')} />
              <PowerButton signal="restart" label="Reiniciar" icon={RotateCcw} variant="amber" disabled={!isRunning} loading={pendingSignal === 'restart'} onClick={() => handlePower('restart')} />
              <PowerButton signal="kill" label="Forzar" icon={Zap} variant="orange" disabled={!isRunning} loading={pendingSignal === 'kill'} onClick={() => handlePower('kill')} />
            </div>
            {isSuspended && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-600 dark:text-orange-400 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Suspendido</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-px border-b border-border px-5 shrink-0">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors',
                activeTab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Contenido principal con sidebar */}
        <div className="flex-1 overflow-hidden flex relative">
          {/* Sidebar derecho (colapsable) */}
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="border-l border-border bg-card overflow-y-auto shrink-0"
              >
                <div className="p-4 space-y-4">
                  {/* Estado del servidor */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Estado en Tiempo Real</p>
                    <div className="space-y-1.5">
                      <MetricCard icon={Cpu} label="CPU" value={((usage as any)?.cpu ?? 0).toFixed(1)} unit="%" />
                      <MetricCard icon={MemoryStick} label="RAM" value={fmtBytes((usage as any)?.memory_bytes)} />
                      <MetricCard icon={HardDrive} label="Disco" value={fmtBytes((usage as any)?.disk_bytes)} />
                      <MetricCard icon={Clock} label="Uptime" value={fmtUptime((usage as any)?.uptime ?? 0)} />
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <InfoSection
                    title="Cliente"
                    items={[
                      { label: 'Nombre', value: ownerName },
                      { label: 'Email', value: <span className="text-xs break-all">{ownerEmail}</span> },
                    ]}
                  />

                  {/* Información del servidor */}
                  <InfoSection
                    title="Servidor"
                    items={[
                      { label: 'Plan', value: planName },
                      { label: 'Software', value: eggName },
                      { label: 'ID Pterodactyl', value: <code className="text-xs">{String(serverId)}</code> },
                      { label: 'Dirección', value: displayAddr ? <code className="text-xs break-all">{displayAddr}</code> : '—' },
                    ]}
                  />

                  {/* Límites del plan */}
                  {server.plan?.limits && (
                    <InfoSection
                      title="Límites del Plan"
                      items={Object.entries(server.plan.limits as Record<string, number>).map(([key, val]) => ({
                        label: key.replace(/_/g, ' '),
                        value: <span className="font-mono">{val}</span>,
                      }))}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Área principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Botón toggle sidebar */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-l-lg bg-muted border-l border-border hover:bg-muted/80 transition-colors"
              title={sidebarExpanded ? 'Ocultar información' : 'Mostrar información'}
            >
              {sidebarExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Contenido de tabs */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'console' && (
                <div className="h-full flex flex-col p-4 gap-3">
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
                <div className="h-full flex flex-col p-4">
                  {!isActive ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
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
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
