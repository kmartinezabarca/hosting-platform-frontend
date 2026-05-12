import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from '@presentation/components/features/ToastProvider';
import {
  ArrowLeft, Edit, Trash2, Send, RefreshCw, Copy, ExternalLink,
  CheckCircle, XCircle, Clock, Link2, AlertCircle, Loader2,
  User, Eye, Lock, RotateCcw, History, FileText, Plus,
} from 'lucide-react';
import { Button } from '@presentation/components/ui/button';
import { Separator } from '@presentation/components/ui/separator';
import { Label } from '@presentation/components/ui/label';
import { Textarea } from '@presentation/components/ui/textarea';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@presentation/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@presentation/components/ui/dialog';
import {
  useQuotation, useUpdateQuotation, useDeleteQuotation,
  useSendQuotation, useRegenerateQuotationLink,
  useAcceptQuotation, useRejectQuotation, useReopenQuotation, useCreateQuotationRevision,
} from '@application/hooks/useQuotations';
import type { Quotation } from '@infrastructure/services/quotationService';
import { QuotationSheet, LinkDialog, StatusBadge, fmt, fmtDateTime } from '@presentation/pages/admin/AdminQuotationsPage';

// ── Activity icon/color mapping ──────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  created:           { icon: <FileText    className="w-3.5 h-3.5" />, color: 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400' },
  sent:              { icon: <Send        className="w-3.5 h-3.5" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  viewed:            { icon: <Eye         className="w-3.5 h-3.5" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  accepted:          { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  rejected:          { icon: <XCircle     className="w-3.5 h-3.5" />, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  expired:           { icon: <Clock       className="w-3.5 h-3.5" />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  cancelled:         { icon: <XCircle     className="w-3.5 h-3.5" />, color: 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400' },
  reopened:          { icon: <RotateCcw   className="w-3.5 h-3.5" />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  revision_created:  { icon: <History     className="w-3.5 h-3.5" />, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  link_regenerated:  { icon: <RefreshCw  className="w-3.5 h-3.5" />, color: 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</dt>
    <dd className="text-sm text-foreground font-medium">{value ?? <span className="text-muted-foreground/60">&mdash;</span>}</dd>
  </div>
);

// ── Modals ─────────────────────────────────────────────────────────────────────

interface ReasonModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  isPending: boolean;
  onSubmit: (reason: string) => void;
}

const ReasonModal = ({ open, onClose, title, description, actionLabel, actionIcon, isPending, onSubmit }: ReasonModalProps) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-9" disabled={isPending}>Cancelar</Button>
            <Button onClick={handleSubmit} className="flex-1 h-9" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : actionIcon}
              {actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminQuotationDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate  = useNavigate();

  const [editOpen,        setEditOpen]        = useState(false);
  const [linkOpen,        setLinkOpen]        = useState(false);
  const [deleteConfirm,   setDeleteConfirm]   = useState(false);
  const [rejectOpen,      setRejectOpen]      = useState(false);
  const [reopenOpen,      setReopenOpen]      = useState(false);
  const [revisionConfirm, setRevisionConfirm] = useState(false);

  const { data: quotation, isLoading, isError, refetch } = useQuotation(uuid ?? '');

  const updateMutation     = useUpdateQuotation();
  const deleteMutation     = useDeleteQuotation();
  const sendMutation       = useSendQuotation();
  const regenerateMutation = useRegenerateQuotationLink();
  const acceptMutation     = useAcceptQuotation();
  const rejectMutation     = useRejectQuotation();
  const reopenMutation     = useReopenQuotation();
  const revisionMutation   = useCreateQuotationRevision();

  const isBusy = updateMutation.isPending || sendMutation.isPending || regenerateMutation.isPending
    || acceptMutation.isPending || rejectMutation.isPending || reopenMutation.isPending || revisionMutation.isPending;

  // ── Timeline fallback ──────────────────────────────────────────────────────

  const timelineItems = useMemo(() => {
    if (!quotation) return [];
    if (quotation.activities && quotation.activities.length > 0) return quotation.activities;
    const items: { id: number; action: string; description: string; created_at: string }[] = [
      { id: 0, action: 'created', description: 'Cotización creada', created_at: quotation.created_at },
    ];
    if (quotation.sent_at) {
      items.push({ id: 1, action: 'sent', description: 'Cotización enviada — link generado por 72 horas', created_at: quotation.sent_at });
    }
    if (quotation.status === 'viewed') {
      items.push({ id: 2, action: 'viewed', description: 'Vista por el cliente', created_at: quotation.updated_at });
    }
    if (quotation.status === 'accepted') {
      items.push({ id: 3, action: 'accepted', description: 'Cotización aceptada', created_at: quotation.updated_at });
    }
    if (quotation.status === 'rejected') {
      items.push({ id: 4, action: 'rejected', description: 'Cotización rechazada', created_at: quotation.updated_at });
    }
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return items;
  }, [quotation]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!quotation) return;
    try {
      await sendMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización enviada — link activo por 72 horas');
      setLinkOpen(true);
      refetch();
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al enviar');
    }
  };

  const handleRegenerate = async () => {
    if (!quotation) return;
    try {
      await regenerateMutation.mutateAsync(quotation.uuid);
      toast.success('Link regenerado — activo por 72 horas más');
      refetch();
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al regenerar');
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;
    try {
      await deleteMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización eliminada');
      navigate('/admin/quotations');
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al eliminar');
    }
  };

  const handleAccept = async () => {
    if (!quotation) return;
    try {
      await acceptMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización aceptada');
      refetch();
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al aceptar');
    }
  };

  const handleReject = async (reason: string) => {
    if (!quotation) return;
    try {
      await rejectMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización rechazada');
      setRejectOpen(false);
      refetch();
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al rechazar');
    }
  };

  const handleReopen = async (reason: string) => {
    if (!quotation) return;
    try {
      await reopenMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización reabierta');
      setReopenOpen(false);
      refetch();
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al reabrir');
    }
  };

  const handleCreateRevision = async () => {
    if (!quotation) return;
    try {
      const res = await revisionMutation.mutateAsync(quotation.uuid);
      const newUuid = res?.data?.uuid;
      toast.success('Revisión creada');
      setRevisionConfirm(false);
      if (newUuid) navigate(`/admin/quotations/${newUuid}`);
      else refetch();
    } catch (err: any) {
      if (err?.response?.status === 422) toast.error(err?.response?.data?.message ?? 'Error de negocio');
      else if (err?.response?.status === 403) toast.error('No autorizado');
      else toast.error(err?.response?.data?.message ?? 'Error al crear revisión');
    }
  };

  const copyLink = () => {
    if (!quotation?.public_url) return;
    navigator.clipboard.writeText(quotation.public_url);
    toast.success('¡Enlace copiado!');
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="font-semibold text-xl text-foreground mb-2">Cotización no encontrada</p>
        <p className="text-muted-foreground mb-6">Verifica que el enlace sea correcto o regresa a la lista.</p>
        <Button onClick={() => navigate('/admin/quotations')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />Regresar a cotizaciones
        </Button>
      </div>
    );
  }

  const q: Quotation = quotation;
  const isExpired = q.is_expired;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">

      {/* ═════════════════════════════════════════════════════════════════════
          HEADER
         ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quotations')} className="shrink-0 mt-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">{q.title}</h1>
              <StatusBadge status={q.status} label={q.status_label} />
              {q.revision_number > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/[0.08] text-muted-foreground">
                  REV {q.revision_number}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Creada el {fmtDateTime(q.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {q.public_url && q.status !== 'draft' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Copiar enlace público</TooltipContent>
            </Tooltip>
          )}

          {q.can_be_modified ? (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="w-4 h-4 mr-1.5" />Editar
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                    <Edit className="w-4 h-4 mr-1.5" />Editar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">No puedes modificar esta cotización</TooltipContent>
            </Tooltip>
          )}

          {q.can_be_deleted ? (
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200/50 dark:border-red-900/50">
              <Trash2 className="w-4 h-4 mr-1.5" />Eliminar
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed border-red-200/50 dark:border-red-900/50 text-red-500/50">
                    <Trash2 className="w-4 h-4 mr-1.5" />Eliminar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">No puedes eliminar esta cotización</TooltipContent>
            </Tooltip>
          )}

          {q.can_be_reopened && (
            <Button variant="default" size="sm" onClick={() => setReopenOpen(true)} disabled={reopenMutation.isPending}>
              {reopenMutation.isPending
                ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                : <RotateCcw className="w-4 h-4 mr-1.5" />}
              Reabrir
            </Button>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          LOCKED BANNER (when can_be_modified is false but not a terminal state)
         ═════════════════════════════════════════════════════════════════════ */}
      {!q.can_be_modified && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-[#161A22] shadow-sm">
          <div className="p-2 rounded-lg bg-slate-200/60 dark:bg-white/[0.08]">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Cotización {q.status_label.toLowerCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esta cotización no puede modificarse.
              {q.can_be_reopened && ' Usa "Reabrir" para habilitar la edición.'}
            </p>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN GRID
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Client card */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" />Datos del Cliente
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <InfoRow label="Nombre" value={q.client_name} />
              <InfoRow label="Email" value={<a href={`mailto:${q.client_email}`} className="text-primary hover:underline">{q.client_email}</a>} />
              {q.client_company && <InfoRow label="Empresa" value={q.client_company} />}
              {q.client_phone   && <InfoRow label="Teléfono" value={q.client_phone} />}
            </dl>
          </div>

          {/* Items table */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/70 dark:border-white/10">
              <h2 className="text-sm font-semibold text-foreground">Conceptos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/[0.06]">
                    <th className="text-left px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">#</th>
                    <th className="text-left px-4 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descripción</th>
                    <th className="text-center px-4 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Cant.</th>
                    <th className="text-right px-4 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">Precio Unit.</th>
                    <th className="text-right px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {(q.items ?? []).map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-all duration-150">
                      <td className="px-6 py-4 text-muted-foreground text-xs tabular-nums w-10">{i + 1}</td>
                      <td className="px-4 py-4 text-foreground font-medium">{item.description}</td>
                      <td className="px-4 py-4 text-center text-muted-foreground tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-muted-foreground tabular-nums">{fmt(item.unit_price, q.currency)}</td>
                      <td className="px-6 py-4 text-right font-medium text-foreground tabular-nums">
                        {fmt(item.subtotal ?? item.unit_price * item.quantity, q.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.04]">
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground py-1">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{fmt(q.subtotal, q.currency)}</span>
                  </div>
                  {q.discount_percent > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 py-1">
                      <span>Descuento ({q.discount_percent}%)</span>
                      <span className="tabular-nums">&minus;{fmt(q.discount_amount, q.currency)}</span>
                    </div>
                  )}
                  {q.tax_percent > 0 && (
                    <div className="flex justify-between text-muted-foreground py-1">
                      <span>IVA ({q.tax_percent}%)</span>
                      <span className="tabular-nums">+{fmt(q.tax_amount, q.currency)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-base text-foreground pt-0.5">
                    <span>Total</span>
                    <span className="tabular-nums">{fmt(q.total, q.currency)} <span className="text-xs font-normal text-muted-foreground">{q.currency}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {q.notes && (
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Notas</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.notes}</p>
            </div>
          )}

          {/* Terms */}
          {q.terms && (
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Términos y condiciones</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.terms}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-muted-foreground" />Actividad
            </h2>
            <div className="relative">
              <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-slate-200 dark:bg-white/[0.12]" />
              <div className="space-y-3">
                {timelineItems.map((item: any, i: number) => {
                  const cfg = ACTIVITY_CONFIG[item.action] ?? { icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400' };
                  return (
                    <motion.div
                      key={item.id ?? i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.04 }}
                      className="relative pl-7"
                    >
                      <div className={`absolute left-0 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">{item.description ?? item.action}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{fmtDateTime(item.created_at)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Sticky sidebar ─────────────────────────────── */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">

          {/* Link / Send panel */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />Enlace público
            </h2>

            {q.can_be_sent ? (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Envía la cotización para generar un link público activo por 72 horas que podrás compartir con tu cliente.
                </p>
                <Button className="w-full h-9" onClick={handleSend} disabled={sendMutation.isPending}>
                  {sendMutation.isPending
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <Send className="w-4 h-4 mr-2" />}
                  Enviar cotización
                </Button>
              </>
            ) : q.status !== 'draft' ? (
              <>
                {q.public_url && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-white/[0.05]">
                    <span className="flex-1 text-xs text-muted-foreground truncate font-mono">{q.public_url}</span>
                    <button onClick={copyLink} className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-white/[0.08] transition-colors duration-150" title="Copiar">
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <a href={q.public_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-white/[0.08] transition-colors duration-150">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  </div>
                )}

                {isExpired && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Link expirado. Regénéralo para compartirlo.
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full h-9" onClick={handleRegenerate} disabled={regenerateMutation.isPending}>
                  {regenerateMutation.isPending
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <RefreshCw className="w-4 h-4 mr-2" />}
                  Regenerar enlace
                </Button>
              </>
            ) : null}
          </div>

          {/* Status actions (flags-driven) */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Acciones</h2>

            {q.can_be_accepted && (
              <Button
                className="w-full h-9"
                size="sm"
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <CheckCircle className="w-4 h-4 mr-2" />}
                Marcar como aceptada
              </Button>
            )}

            {q.can_be_rejected && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200/50 dark:border-red-900/50"
                onClick={() => setRejectOpen(true)}
                disabled={rejectMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />Rechazar cotización
              </Button>
            )}

            {q.can_be_reopened && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9"
                onClick={() => setReopenOpen(true)}
                disabled={reopenMutation.isPending}
              >
                {reopenMutation.isPending
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <RotateCcw className="w-4 h-4 mr-2" />}
                Reabrir cotización
              </Button>
            )}

            {/* Create revision — always shown when quotation is not in draft/pending_revision */}
            {q.status !== 'draft' && q.status !== 'pending_revision' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9"
                onClick={() => setRevisionConfirm(true)}
                disabled={revisionMutation.isPending}
              >
                {revisionMutation.isPending
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <History className="w-4 h-4 mr-2" />}
                Crear revisión
              </Button>
            )}
          </div>

          {/* Locked status display */}
          {!q.can_be_modified && (
            <div className={`rounded-2xl border p-6 space-y-3 shadow-sm ${
              q.status === 'accepted'
                ? 'border-emerald-200/70 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                : q.status === 'rejected'
                  ? 'border-red-200/70 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20'
                  : q.status === 'expired'
                    ? 'border-amber-200/70 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.04]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  q.status === 'accepted'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : q.status === 'rejected'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : q.status === 'expired'
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-slate-100 dark:bg-white/[0.08]'
                }`}>
                  {q.status === 'accepted'
                    ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    : q.status === 'rejected'
                      ? <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      : q.status === 'expired'
                        ? <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        : <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    Cotización {q.status_label.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {q.status === 'accepted'
                      ? 'El cliente aceptó esta cotización.'
                      : q.status === 'rejected'
                        ? 'El cliente rechazó esta cotización.'
                        : q.status === 'expired'
                          ? 'El link público ha expirado.'
                          : 'Esta cotización está finalizada.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parent revision link */}
          {q.parent_uuid && (
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-muted-foreground" />Revisión
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Esta es la revisión {q.revision_number} de la cotización original.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9"
                onClick={() => navigate(`/admin/quotations/${q.parent_uuid}`)}
              >
                Ver cotización original
              </Button>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#161A22] shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Información</h2>
            <dl className="space-y-3">
              <InfoRow label="Creada el" value={fmtDateTime(q.created_at)} />
              <InfoRow label="Última modificación" value={fmtDateTime(q.updated_at)} />
              {q.sent_at && (
                <InfoRow label="Enviada el" value={fmtDateTime(q.sent_at)} />
              )}
              {q.expires_at && (
                <InfoRow
                  label="Válida hasta"
                  value={
                    <span className={`flex items-center gap-1.5 ${isExpired ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {fmtDateTime(q.expires_at)}
                    </span>
                  }
                />
              )}
            </dl>
          </div>
        </div>
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
          MODALS
         ═════════════════════════════════════════════════════════════════════ */}

      <QuotationSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editing={q.can_be_modified ? q : undefined}
      />

      {linkOpen && <LinkDialog quotation={q} onClose={() => setLinkOpen(false)} />}

      {/* Delete confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cotización?</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente <strong>&ldquo;{q.title}&rdquo;</strong>.
              Esta acción no se puede deshacer y el link público dejará de funcionar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="flex-1 h-9">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 h-9">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject reason modal */}
      <ReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Rechazar cotización"
        description="La cotización será marcada como rechazada. Indica el motivo (opcional)."
        actionLabel="Rechazar cotización"
        actionIcon={<XCircle className="w-4 h-4 mr-2" />}
        isPending={rejectMutation.isPending}
        onSubmit={handleReject}
      />

      {/* Reopen reason modal */}
      <ReasonModal
        open={reopenOpen}
        onClose={() => setReopenOpen(false)}
        title="Reabrir cotización"
        description="La cotización volverá a estado borrador para permitir modificaciones. Indica el motivo (opcional)."
        actionLabel="Reabrir cotización"
        actionIcon={<RotateCcw className="w-4 h-4 mr-2" />}
        isPending={reopenMutation.isPending}
        onSubmit={handleReopen}
      />

      {/* Create revision confirmation */}
      <Dialog open={revisionConfirm} onOpenChange={setRevisionConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear revisión</DialogTitle>
            <DialogDescription>
              Se creará una nueva cotización con los mismos datos de <strong>&ldquo;{q.title}&rdquo;</strong>.
              La cotización actual mantendrá su estado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setRevisionConfirm(false)} className="flex-1 h-9" disabled={revisionMutation.isPending}>Cancelar</Button>
            <Button onClick={handleCreateRevision} className="flex-1 h-9" disabled={revisionMutation.isPending}>
              {revisionMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Crear revisión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
