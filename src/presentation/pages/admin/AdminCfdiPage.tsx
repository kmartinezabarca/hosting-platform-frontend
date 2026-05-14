import React, { useState, useMemo } from 'react';
import {
  FileText, RefreshCw, Search, Download, RotateCcw,
  XCircle, CheckCircle, Clock, Loader2, X,
  ChevronUp, ChevronDown, Filter, AlertCircle,
  User, Building2, Hash, Calendar, Stamp,
  ExternalLink, Copy, ChevronRight, Receipt,
} from 'lucide-react';
import { toast } from '@presentation/components/features/ToastProvider';
import { cn } from '@shared/utils/utils';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@presentation/components/ui/tooltip';
import { Card, CardContent } from '@presentation/components/ui/card';
import { StatCard } from '@presentation/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@presentation/components/ui/select';
import {
  useAdminCfdis,
  useAdminCfdiStats,
  useAdminCfdiDetail,
  useRetryCfdi,
  useCancelCfdi,
  useDownloadAdminCfdi,
} from '@application/hooks/useAdminCfdi';

// ─── Constants ────────────────────────────────────────────────────────────────

const CFDI_STATUS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  scheduled:     { label: 'Programado', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',         Icon: Clock },
  pending_stamp: { label: 'Procesando', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',             Icon: Loader2 },
  stamped:       { label: 'Timbrado',   cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', Icon: CheckCircle },
  failed:        { label: 'Error',      cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',                 Icon: XCircle },
  cancelled:     { label: 'Cancelado',  cls: 'bg-muted text-muted-foreground border-border',                                    Icon: X },
};

const MOTIVOS_SAT = [
  { value: '01', label: '01 — Comprobante emitido con errores con relación' },
  { value: '02', label: '02 — Comprobante emitido con errores sin relación' },
  { value: '03', label: '03 — No se llevó a cabo la operación' },
  { value: '04', label: '04 — Operación nominativa relacionada en factura global' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | string | null | undefined) =>
  n != null ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n)) : '—';

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const clientName = (cfdi: any) => {
  const u = cfdi.service?.user;
  if (!u) return '—';
  return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—';
};

const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado`));
};

const canRetry = (status: string) => ['failed', 'scheduled', 'pending_stamp'].includes(status);
const isStamped = (status: string) => status === 'stamped';

// ─── Sub-components ───────────────────────────────────────────────────────────

function CfdiStatusBadge({ status }: { status: string }) {
  const info = CFDI_STATUS[status] ?? CFDI_STATUS.scheduled;
  return (
    <Badge variant="outline" className={cn('px-2.5 py-1 text-xs font-medium border-transparent', info.cls)}>
      <info.Icon className={cn('w-3 h-3 mr-1', status === 'pending_stamp' && 'animate-spin')} />
      {info.label}
    </Badge>
  );
}

const SortIcon = ({ column, sortConfig }: { column: string; sortConfig: { key: string; direction: string } }) => {
  if (sortConfig.key !== column) return <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
  return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({ cfdi, onClose }: { cfdi: any; onClose: () => void }) {
  const [motivo, setMotivo] = useState('');
  const [folioSustituto, setFolioSustituto] = useState('');
  const cancelMut = useCancelCfdi();

  const handleSubmit = (e: React.FormEvent) => {
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
          Folio: <span className="font-mono font-medium">{cfdi.folio ?? `#${cfdi.id}`}</span>
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

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false, copyable = false }: {
  label: string; value: React.ReactNode; mono?: boolean; copyable?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="text-xs text-muted-foreground flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={cn('text-xs font-medium text-right break-all', mono && 'font-mono')}>{value ?? '—'}</span>
        {copyable && typeof value === 'string' && value && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="h-5 w-5 flex-shrink-0 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, accent }: {
  icon: React.ElementType; title: string; children: React.ReactNode; accent?: string;
}) {
  return (
    <section>
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Icon className="h-3 w-3" />{title}
      </h4>
      <div className={cn(
        'rounded-xl border divide-y text-sm',
        accent === 'green'  && 'border-emerald-500/20 bg-emerald-500/5 divide-emerald-500/10',
        accent === 'red'    && 'border-red-500/20 bg-red-500/5 divide-red-500/10',
        accent === 'amber'  && 'border-amber-500/20 bg-amber-500/5 divide-amber-500/10',
        !accent             && 'border-border bg-muted/20 divide-border',
      )}>
        {children}
      </div>
    </section>
  );
}

function DetailDrawer({ cfdi: initialCfdi, onClose, onCancel }: { cfdi: any; onClose: () => void; onCancel: () => void }) {
  const retryMut    = useRetryCfdi();
  const downloadMut = useDownloadAdminCfdi();

  // Fetch full detail (with receipt.items + emisor)
  const { data: detail, isLoading } = useAdminCfdiDetail(initialCfdi.id);
  const cfdi   = (detail ?? initialCfdi) as any;
  const status = cfdi.cfdi_status ?? cfdi.status;
  const user   = cfdi.service?.user;
  const receipt = cfdi.receipt as any;
  const emisor  = cfdi.emisor as any;
  const items   = receipt?.items ?? [];

  // Calculate totals from items if available
  const taxRate  = receipt?.tax_rate  ? Number(receipt.tax_rate) : (emisor?.tasa_iva ? Number(emisor.tasa_iva) * 100 : 16);
  const subtotal = receipt?.subtotal  ? Number(receipt.subtotal) : items.reduce((s: number, i: any) => s + (Number(i.unit_price) * Number(i.quantity || 1)), 0);
  const taxAmt   = receipt?.tax_amount ? Number(receipt.tax_amount) : subtotal * (taxRate / 100);
  const total    = receipt?.total      ? Number(receipt.total)     : subtotal + taxAmt;

  const handleRetry = () => {
    retryMut.mutate(cfdi.id, {
      onSuccess: () => toast.success('Timbrado iniciado correctamente'),
      onError:   (e: any) => toast.error(e?.response?.data?.message || 'Error al timbrar'),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">CFDI #{cfdi.id}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[260px]">{cfdi.uuid}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CfdiStatusBadge status={status} />
            <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          )}

          {/* Error de timbrado */}
          {cfdi.cfdi_error && (
            <div className="flex gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-red-600 mb-1">Error de timbrado</p>
                <p className="text-xs text-red-500 break-all leading-relaxed">{cfdi.cfdi_error}</p>
              </div>
            </div>
          )}

          {/* UUID SAT si está timbrado */}
          {isStamped(status) && cfdi.cfdi_uuid && (
            <div className="flex gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-emerald-600">UUID SAT (timbrado)</p>
                  <button onClick={() => copyToClipboard(cfdi.cfdi_uuid, 'UUID SAT')} className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <Copy className="h-3 w-3" />Copiar
                  </button>
                </div>
                <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 break-all">{cfdi.cfdi_uuid}</p>
                {cfdi.stamped_at && <p className="text-[10px] text-muted-foreground mt-1">Timbrado: {fmtDateTime(cfdi.stamped_at)}</p>}
              </div>
            </div>
          )}

          {/* ── CLIENTE ── */}
          <Section icon={User} title="Cliente (receptor)">
            <InfoRow label="Nombre completo" value={clientName(cfdi)} />
            {user?.email     && <InfoRow label="Email"    value={user.email}     mono />}
            {cfdi.service?.name && <InfoRow label="Servicio" value={cfdi.service.name} />}
            {cfdi.service?.billing_cycle && <InfoRow label="Ciclo de facturación" value={cfdi.service.billing_cycle} />}
          </Section>

          {/* ── DATOS FISCALES DEL RECEPTOR ── */}
          <Section icon={Building2} title="Datos fiscales — Receptor (para timbrar)" accent={cfdi.is_publico_general ? 'amber' : undefined}>
            {cfdi.is_publico_general && (
              <div className="px-4 py-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Sin datos fiscales — se timbra como Público en General
                </span>
              </div>
            )}
            <InfoRow label="RFC"            value={cfdi.rfc}     mono copyable />
            <InfoRow label="Razón Social"   value={cfdi.name}    copyable />
            <InfoRow label="Código Postal"  value={cfdi.zip}     mono copyable />
            <InfoRow label="Régimen Fiscal" value={cfdi.regimen} mono copyable />
            <InfoRow label="Uso CFDI"       value={cfdi.uso_cfdi} mono copyable />
          </Section>

          {/* ── EMISOR ── */}
          {emisor && (
            <Section icon={Stamp} title="Datos fiscales — Emisor (tu empresa)">
              <InfoRow label="RFC"              value={emisor.rfc}             mono copyable />
              <InfoRow label="Nombre"           value={emisor.nombre}          copyable />
              <InfoRow label="Régimen Fiscal"   value={emisor.regimen_fiscal}  mono />
              <InfoRow label="Lugar Expedición" value={emisor.lugar_expedicion} mono />
              <InfoRow label="Serie"            value={emisor.serie}           mono />
              <InfoRow label="Método de Pago"   value={emisor.metodo_pago}     mono />
              <InfoRow label="Forma de Pago"    value={emisor.forma_pago}      mono />
              <InfoRow label="Moneda"           value={emisor.moneda}          mono />
              <InfoRow label="Tasa IVA"         value={emisor.tasa_iva ? `${(Number(emisor.tasa_iva) * 100).toFixed(0)}%` : '16%'} mono />
            </Section>
          )}

          {/* ── CONCEPTOS ── */}
          {items.length > 0 && (
            <section>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Receipt className="h-3 w-3" />Conceptos del comprobante
              </h4>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Descripción</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground w-12">Cant.</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">P. Unit.</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item: any, i: number) => {
                      const base = Number(item.unit_price) * Number(item.quantity || 1);
                      return (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="px-3 py-2.5 text-foreground">{item.description}</td>
                          <td className="px-3 py-2.5 text-right font-mono">{item.quantity ?? 1}</td>
                          <td className="px-3 py-2.5 text-right font-mono">{fmt(item.unit_price)}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold">{fmt(base)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t-2 border-border">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-muted-foreground font-medium">Subtotal</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{fmt(subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right text-muted-foreground font-medium">IVA ({taxRate.toFixed(0)}%)</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{fmt(taxAmt)}</td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td colSpan={3} className="px-3 py-2.5 text-right font-bold text-foreground">Total</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-primary text-sm">{fmt(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* ── PAGO ── */}
          {receipt && (
            <Section icon={Hash} title="Información de pago">
              {receipt.payment_method    && <InfoRow label="Método de pago"  value={receipt.payment_method}    />}
              {receipt.gateway           && <InfoRow label="Gateway"          value={receipt.gateway.charAt(0).toUpperCase() + receipt.gateway.slice(1)} />}
              {receipt.payment_reference && <InfoRow label="Referencia" value={receipt.payment_reference} mono copyable />}
              {receipt.paid_at           && <InfoRow label="Fecha de pago"   value={fmtDateTime(receipt.paid_at)} />}
              <InfoRow label="Folio comprobante" value={receipt.invoice_number} mono copyable />
            </Section>
          )}

          {/* ── FACTURAMA ── */}
          {cfdi.facturama_id && (
            <Section icon={ExternalLink} title="Facturama">
              <InfoRow label="ID Facturama" value={cfdi.facturama_id} mono copyable />
            </Section>
          )}

          {/* ── FECHAS ── */}
          <Section icon={Calendar} title="Fechas">
            <InfoRow label="Creado"              value={fmtDateTime(cfdi.created_at)} />
            {cfdi.stamp_scheduled_at && <InfoRow label="Timbrado programado" value={fmtDateTime(cfdi.stamp_scheduled_at)} />}
            {cfdi.stamped_at         && <InfoRow label="Timbrado exitosamente" value={fmtDateTime(cfdi.stamped_at)} />}
          </Section>
        </div>

        {/* ── Footer actions ── */}
        <div className="border-t px-5 py-4 space-y-2 bg-muted/20">
          {canRetry(status) && (
            <Button className="w-full" size="lg" onClick={handleRetry} disabled={retryMut.isPending}>
              {retryMut.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Timbrando…</>
                : <><Stamp className="h-4 w-4 mr-2" />{status === 'failed' ? 'Reintentar timbrado' : 'Timbrar ahora'}</>
              }
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button variant="outline" className="w-full" disabled={!isStamped(status) || downloadMut.isPending}
                    onClick={() => downloadMut.mutate({ id: cfdi.id, format: 'pdf', folio: cfdi.folio ?? cfdi.id })}>
                    <Download className="h-4 w-4 mr-2" />PDF
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{isStamped(status) ? 'Descargar PDF del CFDI' : 'Disponible cuando esté timbrado'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button variant="outline" className="w-full" disabled={!isStamped(status) || downloadMut.isPending}
                    onClick={() => downloadMut.mutate({ id: cfdi.id, format: 'xml', folio: cfdi.folio ?? cfdi.id })}>
                    <FileText className="h-4 w-4 mr-2" />XML
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{isStamped(status) ? 'Descargar XML del CFDI' : 'Disponible cuando esté timbrado'}</TooltipContent>
            </Tooltip>
          </div>
          {isStamped(status) && (
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
              onClick={() => { onClose(); onCancel(); }}>
              <XCircle className="h-4 w-4 mr-2" />Cancelar CFDI ante el SAT
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCfdiPage() {
  const [statusFilter, setStatusFilter]   = useState('all');
  const [search, setSearch]               = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const [currentPage, setCurrentPage]     = useState(1);
  const [cancelModal, setCancelModal]     = useState<any>(null);
  const [detailCfdi, setDetailCfdi]       = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig]       = useState({ key: 'created_at', direction: 'desc' as 'asc' | 'desc' });

  const { data, isLoading, isFetching, isError, refetch } = useAdminCfdis({
    status:   statusFilter !== 'all' ? statusFilter : undefined,
    search:   search || undefined,
    page:     currentPage,
    per_page: 15,
  });
  const { data: stats } = useAdminCfdiStats();
  const retryMut    = useRetryCfdi();
  const downloadMut = useDownloadAdminCfdi();

  const cfdis      = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.last_page ?? 1;

  const STAT_CARDS = [
    { key: 'scheduled',     label: 'Programados', icon: Clock,        accent: 'amber'   },
    { key: 'pending_stamp', label: 'Procesando',  icon: Loader2,      accent: 'blue'    },
    { key: 'stamped',       label: 'Timbrados',   icon: CheckCircle,  accent: 'emerald' },
    { key: 'failed',        label: 'Con error',   icon: XCircle,      accent: 'red'     },
    { key: 'cancelled',     label: 'Cancelados',  icon: X,            accent: 'slate'   },
  ] as const;

  const activeFilters = statusFilter !== 'all' ? 1 : 0;

  const sortedCfdis = useMemo(() => {
    const sorted = [...cfdis];
    sorted.sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      if      (sortConfig.key === 'cliente')    { aVal = clientName(a).toLowerCase(); bVal = clientName(b).toLowerCase(); }
      else if (sortConfig.key === 'total')      { aVal = Number(a.service?.price) || 0; bVal = Number(b.service?.price) || 0; }
      else if (sortConfig.key === 'status')     { aVal = a.cfdi_status ?? ''; bVal = b.cfdi_status ?? ''; }
      else if (sortConfig.key === 'created_at') { aVal = new Date(a.created_at || 0).getTime(); bVal = new Date(b.created_at || 0).getTime(); }
      else { aVal = a[sortConfig.key]; bVal = b[sortConfig.key]; }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ?  1 : -1;
      return 0;
    });
    return sorted;
  }, [cfdis, sortConfig]);

  const handleSort = (key: string) =>
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const handleDownload = (cfdi: any, format: 'pdf' | 'xml') => {
    const key = `${cfdi.id}-${format}`;
    setDownloadingId(key);
    downloadMut.mutate(
      { id: cfdi.id, format, folio: cfdi.folio ?? String(cfdi.id) },
      {
        onSuccess: () => setDownloadingId(null),
        onError:   (e: any) => {
          setDownloadingId(null);
          toast.error(e?.response?.data?.message || `Error al descargar ${format.toUpperCase()}`);
        },
      }
    );
  };

  const handleRetryRow = (cfdi: any) => {
    retryMut.mutate(cfdi.id, {
      onSuccess: () => toast.success('Timbrado iniciado correctamente'),
      onError:   (e: any) => toast.error(e?.response?.data?.message || 'Error al timbrar'),
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Facturas (CFDI)</h1>
          <p className="text-sm text-muted-foreground mt-1">Control de facturación electrónica SAT y timbrado</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
          {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Actualizar
        </Button>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, accent }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(p => p === key ? 'all' : key)}
              className="text-left"
            >
              <StatCard
                icon={Icon as any}
                label={label}
                value={(stats as any)?.[key] ?? 0}
                accent={accent as any}
                loading={isFetching}
                className={cn(statusFilter === key && 'ring-2 ring-foreground/20')}
              />
            </button>
          ))}
        </div>
      )}

      {/* Table card */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por folio, RFC, usuario…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 w-48 sm:w-64"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
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
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="h-9 px-2 text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="flex gap-2 mb-4 pb-4 border-b">
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(CFDI_STATUS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {[
                    { key: 'folio',      label: 'Folio / ID',       col: '' },
                    { key: 'cliente',    label: 'Cliente',           col: '' },
                    { key: 'fiscal',     label: 'RFC / Razón Social',col: 'hidden md:table-cell', noSort: true },
                    { key: 'total',      label: 'Monto',             col: 'hidden lg:table-cell' },
                    { key: 'status',     label: 'Estado',            col: '' },
                    { key: 'created_at', label: 'Fecha',             col: 'hidden lg:table-cell' },
                  ].map(({ key, label, col, noSort }) => (
                    <th
                      key={key}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group',
                        !noSort && 'cursor-pointer hover:bg-muted/50 transition-colors',
                        col,
                      )}
                      onClick={() => !noSort && handleSort(key)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {!noSort && <SortIcon column={key} sortConfig={sortConfig} />}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading || isFetching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                      <p className="font-medium mb-3">Error al cargar los CFDI</p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4 mr-2" />Reintentar
                      </Button>
                    </td>
                  </tr>
                ) : (
                  sortedCfdis.map((cfdi: any) => {
                    const status = cfdi.cfdi_status ?? cfdi.status;
                    const stamped = isStamped(status);
                    const user   = cfdi.service?.user;
                    const pdfKey = `${cfdi.id}-pdf`;
                    const xmlKey = `${cfdi.id}-xml`;

                    return (
                      <tr
                        key={cfdi.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setDetailCfdi(cfdi)}
                      >
                        {/* Folio / ID */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-semibold"># {cfdi.id}</p>
                              {cfdi.cfdi_uuid ? (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate max-w-[130px]" title={cfdi.cfdi_uuid}>
                                  {cfdi.cfdi_uuid}
                                </p>
                              ) : (
                                <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[130px]" title={cfdi.uuid}>
                                  {cfdi.uuid}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[160px]">{clientName(cfdi)}</p>
                            {user?.email && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                            )}
                          </div>
                        </td>

                        {/* RFC / Razón social */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-mono text-xs font-medium">{cfdi.rfc ?? '—'}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{cfdi.name ?? '—'}</p>
                        </td>

                        {/* Monto */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="font-semibold text-sm">{fmt(cfdi.service?.price)}</span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <CfdiStatusBadge status={status} />
                          {cfdi.cfdi_error && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-[10px] text-red-500 mt-0.5 max-w-[120px] truncate cursor-help">
                                  {cfdi.cfdi_error}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">{cfdi.cfdi_error}</TooltipContent>
                            </Tooltip>
                          )}
                          {status === 'scheduled' && cfdi.stamp_scheduled_at && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                              {fmtDate(cfdi.stamp_scheduled_at)}
                            </p>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{fmtDate(cfdi.created_at)}</span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">

                            {/* Retry — for failed / scheduled / pending_stamp */}
                            {canRetry(status) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleRetryRow(cfdi)}
                                    disabled={retryMut.isPending}
                                  >
                                    {retryMut.isPending
                                      ? <Loader2 className="h-4 w-4 animate-spin" />
                                      : <RotateCcw className="h-4 w-4" />
                                    }
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {status === 'failed' ? 'Reintentar timbrado' : 'Timbrar ahora'}
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* PDF — always visible */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn('h-8 w-8', stamped && 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30')}
                                    disabled={!stamped || downloadingId === pdfKey}
                                    onClick={() => handleDownload(cfdi, 'pdf')}
                                  >
                                    {downloadingId === pdfKey
                                      ? <Loader2 className="h-4 w-4 animate-spin" />
                                      : <Download className="h-4 w-4" />
                                    }
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {stamped ? 'Descargar PDF' : 'PDF disponible cuando esté timbrado'}
                              </TooltipContent>
                            </Tooltip>

                            {/* XML — always visible */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn('h-8 w-8', stamped && 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30')}
                                    disabled={!stamped || downloadingId === xmlKey}
                                    onClick={() => handleDownload(cfdi, 'xml')}
                                  >
                                    {downloadingId === xmlKey
                                      ? <Loader2 className="h-4 w-4 animate-spin" />
                                      : <FileText className="h-4 w-4" />
                                    }
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {stamped ? 'Descargar XML' : 'XML disponible cuando esté timbrado'}
                              </TooltipContent>
                            </Tooltip>

                            {/* Cancel — only when stamped */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn('h-8 w-8', stamped ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' : 'opacity-30')}
                                    disabled={!stamped}
                                    onClick={() => setCancelModal(cfdi)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {stamped ? 'Cancelar CFDI ante el SAT' : 'Solo disponible para CFDIs timbrados'}
                              </TooltipContent>
                            </Tooltip>

                            {/* Open detail */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setDetailCfdi(cfdi)}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalle</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Empty state */}
            {sortedCfdis.length === 0 && !isLoading && !isFetching && !isError && (
              <div className="text-center py-12">
                <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {search || statusFilter !== 'all' ? 'Sin resultados' : 'Sin CFDI registrados'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {search || statusFilter !== 'all' ? 'Ajusta los filtros para ver más resultados.' : 'Los CFDIs aparecerán aquí al generarse comprobantes.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t mt-2">
            <p className="text-sm text-muted-foreground">
              Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
              {pagination?.total ? <> · <span className="font-medium">{pagination.total}</span> registros</> : null}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1 || isFetching}>Anterior</Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentPage(pageNum)} disabled={isFetching} className="h-8 w-8 p-0">
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || isFetching}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail drawer */}
      {detailCfdi && (
        <DetailDrawer
          cfdi={detailCfdi}
          onClose={() => setDetailCfdi(null)}
          onCancel={() => { setCancelModal(detailCfdi); setDetailCfdi(null); }}
        />
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <CancelModal cfdi={cancelModal} onClose={() => setCancelModal(null)} />
      )}
    </div>
  );
}
