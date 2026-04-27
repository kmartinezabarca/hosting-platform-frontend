import React, { useState } from 'react';
import {
  FileText, RefreshCw, Search, Download, RotateCcw,
  XCircle, CheckCircle, Clock, Loader2, AlertTriangle, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useAdminCfdis,
  useAdminCfdiStats,
  useRetryCfdi,
  useCancelCfdi,
  useDownloadAdminCfdi,
} from '@/hooks/useAdminCfdi';

/* ── Helpers de estado CFDI ──────────────────────── */
const CFDI_STATUS = {
  scheduled:     { label: 'Programado', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',    Icon: Clock },
  pending_stamp: { label: 'Procesando', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',        Icon: Loader2 },
  stamped:       { label: 'Timbrado',   cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', Icon: CheckCircle },
  failed:        { label: 'Error',      cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',            Icon: XCircle },
  cancelled:     { label: 'Cancelado',  cls: 'bg-muted text-muted-foreground border-border',                              Icon: X },
};

function CfdiStatusBadge({ status }) {
  const info = CFDI_STATUS[status] ?? CFDI_STATUS.scheduled;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium', info.cls)}>
      <info.Icon className={cn('w-3 h-3', status === 'pending_stamp' && 'animate-spin')} />
      {info.label}
    </span>
  );
}

/* ── Modal de cancelación ─────────────────────────── */
const MOTIVOS_SAT = [
  { value: '01', label: '01 — Comprobante emitido con errores con relación' },
  { value: '02', label: '02 — Comprobante emitido con errores sin relación' },
  { value: '03', label: '03 — No se llevó a cabo la operación' },
  { value: '04', label: '04 — Operación nominativa relacionada en factura global' },
];

function CancelModal({ cfdi, onClose }) {
  const [motivo, setMotivo]               = useState('');
  const [folioSustituto, setFolioSustituto] = useState('');
  const cancelMut = useCancelCfdi();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivo) return toast.error('Selecciona el motivo de cancelación');
    cancelMut.mutate(
      { id: cfdi.id, motivo, ...(folioSustituto ? { folio_sustituto: folioSustituto } : {}) },
      {
        onSuccess: () => { toast.success('CFDI cancelado'); onClose(); },
        onError:   (err: any) => toast.error(err?.response?.data?.message || 'Error al cancelar'),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl p-6">
        <h3 className="text-base font-semibold text-foreground mb-1">Cancelar CFDI</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Folio: <span className="font-mono font-medium">{cfdi.folio ?? cfdi.invoice_number ?? `#${cfdi.id}`}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Motivo SAT *</label>
            <select
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/10"
            >
              <option value="">Selecciona el motivo</option>
              {MOTIVOS_SAT.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          {motivo === '01' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">UUID Folio Sustituto</label>
              <input
                value={folioSustituto}
                onChange={e => setFolioSustituto(e.target.value)}
                placeholder="UUID del CFDI sustituto"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/10 font-mono"
              />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cancelMut.isPending}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Cancelar CFDI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────────────── */
export default function AdminCfdiPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [cancelModal, setCancelModal]   = useState<any>(null);

  const { data, isLoading, isError, refetch } = useAdminCfdis({
    status:   statusFilter || undefined,
    search:   search || undefined,
    per_page: 20,
  });
  const { data: stats }  = useAdminCfdiStats();
  const retryMut         = useRetryCfdi();
  const downloadMut      = useDownloadAdminCfdi();

  const cfdis = data?.data ?? [];

  const STAT_CARDS = [
    { key: 'scheduled',     label: 'Programados', color: 'text-amber-500' },
    { key: 'pending_stamp', label: 'Procesando',  color: 'text-blue-500' },
    { key: 'stamped',       label: 'Timbrados',   color: 'text-emerald-500' },
    { key: 'failed',        label: 'Con error',   color: 'text-red-500' },
    { key: 'cancelled',     label: 'Cancelados',  color: 'text-muted-foreground' },
  ];

  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Gestión de CFDI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Monitoreo y control de facturas electrónicas SAT</p>
        </div>
        <button onClick={() => refetch()} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors" title="Actualizar">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stats cards — clickeables para filtrar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {STAT_CARDS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(p => p === key ? '' : key)}
              className={cn(
                'rounded-2xl border p-4 text-left transition-all hover:border-foreground/20',
                statusFilter === key ? 'border-foreground/30 bg-foreground/[0.03]' : 'border-border'
              )}
            >
              <div className={cn('text-2xl font-bold tabular-nums', color)}>{(stats as any)?.[key] ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por folio, RFC, usuario…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/10 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/10 transition"
        >
          <option value="">Todos los estados</option>
          {Object.entries(CFDI_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Error al cargar los CFDI</p>
          <button onClick={() => refetch()} className="mt-3 text-sm text-foreground underline">Reintentar</button>
        </div>
      ) : cfdis.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay CFDI que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Folio / UUID', 'Cliente / RFC', 'Monto', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className={cn('px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide', h === 'Acciones' ? 'text-right' : 'text-left')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cfdis.map((cfdi: any) => {
                const cfdiStatus = cfdi.cfdi_status ?? cfdi.status;
                return (
                  <tr key={cfdi.id} className="hover:bg-muted/20 transition-colors">
                    {/* Folio */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-foreground">
                        {cfdi.folio ?? cfdi.invoice_number ?? `#${cfdi.id}`}
                      </p>
                      {cfdi.uuid && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]" title={cfdi.uuid}>
                          {cfdi.uuid}
                        </p>
                      )}
                    </td>
                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <p className="text-foreground">{cfdi.user?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {cfdi.rfc ?? cfdi.invoice?.rfc ?? '—'}
                      </p>
                    </td>
                    {/* Monto */}
                    <td className="px-4 py-3 font-medium text-foreground tabular-nums">
                      {cfdi.total != null ? fmt(cfdi.total) : '—'}
                    </td>
                    {/* Estado */}
                    <td className="px-4 py-3">
                      <CfdiStatusBadge status={cfdiStatus} />
                      {cfdi.cfdi_error && (
                        <p className="text-[10px] text-red-500 mt-0.5 max-w-[180px] truncate" title={cfdi.cfdi_error}>
                          {cfdi.cfdi_error}
                        </p>
                      )}
                    </td>
                    {/* Fecha */}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(cfdi.created_at)}
                    </td>
                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {cfdiStatus === 'failed' && (
                          <button
                            onClick={() => retryMut.mutate(cfdi.id, {
                              onSuccess: () => toast.success('Reintento de timbrado iniciado'),
                              onError:   (e: any) => toast.error(e?.response?.data?.message || 'Error al reintentar'),
                            })}
                            disabled={retryMut.isPending}
                            title="Reintentar timbrado"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/[0.08] transition-colors disabled:opacity-50"
                          >
                            {retryMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          </button>
                        )}
                        {cfdiStatus === 'stamped' && (
                          <>
                            <button
                              onClick={() => downloadMut.mutate({ id: cfdi.id, format: 'pdf', folio: cfdi.folio })}
                              disabled={downloadMut.isPending}
                              title="Descargar PDF"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadMut.mutate({ id: cfdi.id, format: 'xml', folio: cfdi.folio })}
                              disabled={downloadMut.isPending}
                              title="Descargar XML"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCancelModal(cfdi)}
                              title="Cancelar CFDI"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/[0.08] transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {cancelModal && (
        <CancelModal cfdi={cancelModal} onClose={() => setCancelModal(null)} />
      )}
    </div>
  );
}
