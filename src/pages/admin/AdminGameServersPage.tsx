import React, { useState } from 'react';
import { Gamepad2, Search, RefreshCw, AlertTriangle, Loader2, Play, Trash2, RotateCcw, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useAdminGameServers,
  useProvisionGameServer,
  useSuspendGameServer,
  useUnsuspendGameServer,
  useReinstallGameServer,
  useDeleteGameServer,
} from '@/hooks/useAdminGameServers';

/* ── Status badge ──────────────────────────────────── */
const STATUS_MAP = {
  pending:    { label: 'Pendiente',  cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  active:     { label: 'Activo',     cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  suspended:  { label: 'Suspendido', cls: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  terminated: { label: 'Terminado',  cls: 'bg-muted text-muted-foreground border-border' },
  failed:     { label: 'Error',      cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

function StatusBadge({ status }: any) {
  const info = STATUS_MAP[status] ?? STATUS_MAP.active;
  return (
    <span className={cn('inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-medium', info.cls)}>
      {info.label}
    </span>
  );
}

/* ── Modal de confirmación con campo de texto ─────── */
function DangerModal({ title, description, warning, confirmWord, onConfirm, onClose, isPending }: any) {
  const [typed, setTyped] = useState('');
  const canConfirm = !confirmWord || typed === confirmWord;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl p-6">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        {warning && (
          <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 px-4 py-3 mb-4">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{warning}</p>
          </div>
        )}
        {confirmWord && (
          <div className="mb-4 space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Escribe <strong className="font-mono">{confirmWord}</strong> para confirmar:
            </label>
            <input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder={confirmWord}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 font-mono"
            />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || isPending}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Botón de acción ──────────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, loading, danger, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      title={label}
      className={cn(
        'p-1.5 rounded-lg transition-colors disabled:opacity-40',
        danger
          ? 'text-muted-foreground hover:text-red-500 hover:bg-red-500/[0.08]'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
    </button>
  );
}

/* ── Página principal ─────────────────────────────── */
export default function AdminGameServersPage() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal]             = useState<any>(null); // { type, server }

  const { data, isLoading, isError, refetch } = useAdminGameServers({
    search:   search || undefined,
    status:   statusFilter || undefined,
    per_page: 20,
  });

  const servers = data?.data ?? [];

  const provisionMut  = useProvisionGameServer();
  const suspendMut    = useSuspendGameServer();
  const unsuspendMut  = useUnsuspendGameServer();
  const reinstallMut  = useReinstallGameServer();
  const deleteMut     = useDeleteGameServer();

  const isPending = provisionMut.isPending || suspendMut.isPending || unsuspendMut.isPending || reinstallMut.isPending || deleteMut.isPending;

  const runMutation = (mut, id, successMsg) => {
    mut.mutate(id, {
      onSuccess: () => { toast.success(successMsg); setModal(null); },
      onError:   (e) => toast.error(e?.response?.data?.message || 'Error al ejecutar la acción'),
    });
  };

  const handleAction = (type, server) => {
    if (type === 'provision') {
      if (!window.confirm(`¿Re-aprovisionar "${server.name}"? Se creará de nuevo en Pterodactyl.`)) return;
      runMutation(provisionMut, server.id, 'Servidor en cola de aprovisionamiento');
    } else if (type === 'unsuspend') {
      runMutation(unsuspendMut, server.id, 'Servidor reactivado');
    } else {
      setModal({ type, server });
    }
  };

  const confirmModal = () => {
    const { type, server } = modal;
    if (type === 'suspend')   runMutation(suspendMut,   server.id, 'Servidor suspendido');
    if (type === 'reinstall') runMutation(reinstallMut, server.id, 'Reinstalación iniciada');
    if (type === 'delete')    runMutation(deleteMut,    server.id, 'Servidor eliminado');
  };

  const MODAL_CONFIG = modal ? {
    suspend: {
      title: 'Suspender servidor',
      description: `El cliente no podrá acceder a su servidor "${modal.server?.name}".`,
      confirmWord: null,
    },
    reinstall: {
      title: 'Reinstalar servidor',
      description: `Esto borrará TODOS los archivos del servidor "${modal.server?.name}".`,
      warning: 'El cliente perderá sus mundos, configuraciones y datos. ¡Esta acción no se puede deshacer!',
      confirmWord: 'REINSTALAR',
    },
    delete: {
      title: 'Eliminar servidor permanentemente',
      description: `Esto eliminará "${modal.server?.name}" de Pterodactyl de forma permanente.`,
      warning: 'Esta acción no se puede deshacer. El servidor dejará de existir.',
      confirmWord: 'ELIMINAR',
    },
  }[modal.type] ?? null : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            Servidores de Juego
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de servidores Pterodactyl</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cliente o IP…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/10 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/10 transition"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="pending">Pendiente</option>
          <option value="suspended">Suspendido</option>
          <option value="failed">Error</option>
          <option value="terminated">Terminado</option>
        </select>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Error al cargar los servidores</p>
          <button onClick={() => refetch()} className="mt-3 text-sm text-foreground underline">Reintentar</button>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Gamepad2 className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay servidores que coincidan</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Servidor', 'Cliente', 'IP:Puerto', 'Estado', 'Plan', 'Acciones'].map(h => (
                  <th key={h} className={cn('px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide', h === 'Acciones' ? 'text-right' : 'text-left')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {servers.map((server: any) => {
                const ip   = server.connection?.server_ip;
                const port = server.connection?.server_port;
                return (
                  <tr key={server.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{server.name}</p>
                      {server.connection?.identifier && (
                        <p className="text-xs text-muted-foreground font-mono">{server.connection.identifier}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{server.user?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{server.user?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {ip && port ? `${ip}:${port}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={server.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {server.plan?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(server.status === 'pending' || server.status === 'failed') && (
                          <ActionBtn icon={Play} label="Aprovisionar" onClick={() => handleAction('provision', server)} loading={provisionMut.isPending} />
                        )}
                        {server.status === 'active' && (
                          <ActionBtn icon={ShieldOff} label="Suspender" onClick={() => handleAction('suspend', server)} />
                        )}
                        {server.status === 'suspended' && (
                          <ActionBtn icon={Shield} label="Reactivar" onClick={() => handleAction('unsuspend', server)} loading={unsuspendMut.isPending} />
                        )}
                        {server.status !== 'terminated' && (
                          <ActionBtn icon={RotateCcw} label="Reinstalar" onClick={() => handleAction('reinstall', server)} danger />
                        )}
                        <ActionBtn icon={Trash2} label="Eliminar" onClick={() => handleAction('delete', server)} danger />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación peligrosa */}
      {modal && MODAL_CONFIG && (
        <DangerModal
          {...MODAL_CONFIG}
          isPending={isPending}
          onConfirm={confirmModal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
