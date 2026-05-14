import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Gamepad2, Search, RefreshCw, AlertTriangle, Loader2, Play, Trash2, RotateCcw, Shield, ShieldOff, Filter, X, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import AdminGameServerDetailPanel from '@presentation/components/features/admin/AdminGameServerDetailPanel';
import { toast } from '@presentation/components/features/ToastProvider';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { Card, CardContent } from '@presentation/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@presentation/components/ui/select';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@presentation/components/ui/tooltip';
import {
  useAdminGameServers,
  useProvisionGameServer,
  useSuspendGameServer,
  useUnsuspendGameServer,
  useReinstallGameServer,
  useDeleteGameServer,
} from '@application/hooks/useAdminGameServers';

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',  className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  active:     { label: 'Activo',     className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  suspended:  { label: 'Suspendido', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  terminated: { label: 'Terminado',  className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  failed:     { label: 'Error',      className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return <Badge variant="outline" className={`${cfg.className} px-2.5 py-1 text-xs font-medium`}>{cfg.label}</Badge>;
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

const SortIcon = ({ column, sortConfig }: { column: string; sortConfig: { key: string; direction: string } }) => {
  if (sortConfig.key !== column) return <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
  return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

// ── Danger Modal ──────────────────────────────────────────────────────────────

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
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isPending}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!canConfirm || isPending} className="flex-1">
            {isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminGameServersPage() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters]  = useState(false);
  const [currentPage, setCurrentPage]  = useState(1);
  const [perPage] = useState(20);
  const [sortConfig, setSortConfig]    = useState({ key: 'name', direction: 'asc' as 'asc' | 'desc' });
  const [modal, setModal]              = useState<any>(null);
  const [detailServer, setDetailServer] = useState<any>(null);

  const { data, isLoading, isFetching, isError, refetch } = useAdminGameServers({
    search:   search || undefined,
    status:   statusFilter !== 'all' ? statusFilter : undefined,
    page:     currentPage,
    per_page: perPage,
  });

  const servers = data?.data ?? [];
  const meta = data?.meta as Record<string, any> | null;
  const totalPages = meta?.last_page || 1;

  const provisionMut  = useProvisionGameServer();
  const suspendMut    = useSuspendGameServer();
  const unsuspendMut  = useUnsuspendGameServer();
  const reinstallMut  = useReinstallGameServer();
  const deleteMut     = useDeleteGameServer();

  const isPending = provisionMut.isPending || suspendMut.isPending || unsuspendMut.isPending || reinstallMut.isPending || deleteMut.isPending;

  // ── Sorting ────────────────────────────────────────────────────────────────

  const sortedServers = useMemo(() => {
    const sorted = [...servers];
    sorted.sort((a: any, b: any) => {
      let aValue: any, bValue: any;
      if (sortConfig.key === 'name') { aValue = (a.name ?? '').toLowerCase(); bValue = (b.name ?? '').toLowerCase(); }
      else if (sortConfig.key === 'user') { aValue = (a.user?.name ?? '').toLowerCase(); bValue = (b.user?.name ?? '').toLowerCase(); }
      else if (sortConfig.key === 'plan') { aValue = (a.plan?.name ?? '').toLowerCase(); bValue = (b.plan?.name ?? '').toLowerCase(); }
      else if (sortConfig.key === 'status') { aValue = a.status ?? ''; bValue = b.status ?? ''; }
      else { aValue = a[sortConfig.key]; bValue = b[sortConfig.key]; }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [servers, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const runMutation = (mut: any, id: number, successMsg: string) => {
    mut.mutate(id, {
      onSuccess: () => { toast.success(successMsg); setModal(null); },
      onError:   (e: any) => toast.error(e?.response?.data?.message || 'Error al ejecutar la acción'),
    });
  };

  const handleAction = (type: string, server: any) => {
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

  const activeFilters = [statusFilter].filter(f => f !== 'all').length;

  const stats = useMemo(() => ({
    total: servers.length,
    active: servers.filter((s: any) => s.status === 'active').length,
    suspended: servers.filter((s: any) => s.status === 'suspended').length,
    pending: servers.filter((s: any) => s.status === 'pending').length,
  }), [servers]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            Servidores de Juego
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} servidores en el sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Search + filters header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, cliente…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 w-48 sm:w-64"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9"
              >
                <Filter className="h-4 w-4 mr-1.5" />
                Filtros
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStatusFilter('all'); }}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border dark:border-white/10">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                  <SelectItem value="failed">Error</SelectItem>
                  <SelectItem value="terminated">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Servidor
                      <SortIcon column="name" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('user')}
                  >
                    <div className="flex items-center gap-1">
                      Cliente
                      <SortIcon column="user" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    IP:Puerto
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Estado
                      <SortIcon column="status" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group hidden md:table-cell"
                    onClick={() => handleSort('plan')}
                  >
                    <div className="flex items-center gap-1">
                      Plan
                      <SortIcon column="plan" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {isFetching ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
                      <p className="font-medium text-foreground mb-3">Error al cargar los servidores</p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />Reintentar
                      </Button>
                    </td>
                  </tr>
                ) : sortedServers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Gamepad2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron servidores</p>
                    </td>
                  </tr>
                ) : (
                  sortedServers.map((server: any) => {
                    const conn = server.connection_details;
                    const host = conn?.display ?? '—';
                    const port = conn?.frp_port;
                    const address = port ? `${host}:${port}` : host;
                    return (
                      <tr key={server.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Gamepad2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{server.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{server.external_id ? `ID: ${server.external_id}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{server.user?.name ?? server.user?.first_name ? `${server.user.first_name} ${server.user.last_name ?? ''}`.trim() : '—'}</p>
                            <p className="text-xs text-muted-foreground truncate">{server.user?.email ?? ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-foreground">{address}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={server.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{server.plan?.name ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {server.status === 'active' && (
                              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30" onClick={() => setDetailServer(server)}><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Ver Servidor</TooltipContent></Tooltip>
                            )}
                            {(server.status === 'pending' || server.status === 'failed') && (
                              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAction('provision', server)} disabled={provisionMut.isPending}>{provisionMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>Aprovisionar</TooltipContent></Tooltip>
                            )}
                            {server.status === 'active' && (
                              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30" onClick={() => handleAction('suspend', server)}><ShieldOff className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Suspender</TooltipContent></Tooltip>
                            )}
                            {server.status === 'suspended' && (
                              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => handleAction('unsuspend', server)} disabled={unsuspendMut.isPending}>{unsuspendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>Reactivar</TooltipContent></Tooltip>
                            )}
                            {server.status !== 'terminated' && (
                              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleAction('reinstall', server)}><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Reinstalar</TooltipContent></Tooltip>
                            )}
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleAction('delete', server)}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Eliminar</TooltipContent></Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (always visible) */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-white/10">
            <div className="text-sm text-muted-foreground">
              Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isFetching}>Anterior</Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                   return <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(pageNum)} disabled={isFetching} className="h-8 w-8 p-0">{pageNum}</Button>;
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isFetching}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Modal */}
      {modal && MODAL_CONFIG && (
        <DangerModal
          {...MODAL_CONFIG}
          isPending={isPending}
          onConfirm={confirmModal}
          onClose={() => setModal(null)}
        />
      )}

      <AnimatePresence>
        {detailServer && (
          <AdminGameServerDetailPanel
            server={detailServer}
            onClose={() => setDetailServer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
