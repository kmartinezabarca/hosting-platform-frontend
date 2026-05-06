import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Edit, Trash2, Send, RefreshCw, Copy, ExternalLink,
  CheckCircle, XCircle, Clock, Link2, AlertCircle, Loader2,
  User, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  useQuotation, useUpdateQuotation, useDeleteQuotation,
  useSendQuotation, useRegenerateQuotationLink,
} from '@/hooks/useQuotations';
import type { Quotation, QuotationStatus } from '@/services/quotationService';
import { QuotationSheet, LinkDialog, StatusBadge, fmt, fmtDateTime } from './AdminQuotationsPage';

// ── Info row ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{label}</dt>
    <dd className="text-sm text-foreground font-medium">{value || <span className="text-muted-foreground/60">—</span>}</dd>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminQuotationDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate  = useNavigate();

  const [editOpen,       setEditOpen]       = useState(false);
  const [linkOpen,       setLinkOpen]       = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState(false);

  const { data: quotation, isLoading, isError, refetch } = useQuotation(uuid ?? '');

  const updateMutation     = useUpdateQuotation();
  const deleteMutation     = useDeleteQuotation();
  const sendMutation       = useSendQuotation();
  const regenerateMutation = useRegenerateQuotationLink();

  // ── Helpers ──────────────────────────────────────────────────────────────

  const changeStatus = async (status: QuotationStatus) => {
    if (!quotation) return;
    try {
      await updateMutation.mutateAsync({ uuid: quotation.uuid, data: { status } });
      const labels: Record<string, string> = { accepted: 'Cotización marcada como aceptada', rejected: 'Cotización marcada como rechazada' };
      toast.success(labels[status] ?? 'Estado actualizado');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar');
    }
  };

  const handleSend = async () => {
    if (!quotation) return;
    try {
      await sendMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización enviada — link activo por 72 horas');
      setLinkOpen(true);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al enviar');
    }
  };

  const handleRegenerate = async () => {
    if (!quotation) return;
    try {
      await regenerateMutation.mutateAsync(quotation.uuid);
      toast.success('Link regenerado — activo por 72 horas');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al regenerar');
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;
    try {
      await deleteMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización eliminada');
      navigate('/admin/quotations');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar');
    }
  };

  const copyLink = () => {
    if (!quotation?.public_url) return;
    navigator.clipboard.writeText(quotation.public_url);
    toast.success('¡Enlace copiado!');
  };

  const isExpired = quotation?.expires_at && new Date(quotation.expires_at) < new Date();

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="font-semibold text-xl mb-2">Cotización no encontrada</p>
        <p className="text-muted-foreground mb-6">Verifica que el enlace sea correcto o regresa a la lista.</p>
        <Button onClick={() => navigate('/admin/quotations')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Regresar a cotizaciones
        </Button>
      </div>
    );
  }

  const q: Quotation = quotation;
  const isBusy = updateMutation.isPending || sendMutation.isPending || regenerateMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">

      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quotations')} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{q.title}</h1>
              <StatusBadge status={q.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Creada el {fmtDateTime(q.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="w-4 h-4 mr-1.5" />Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4 mr-1.5" />Eliminar
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Client + items */}
        <div className="lg:col-span-2 space-y-6">

          {/* Client card */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
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
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border/70 bg-muted/40">
              <h2 className="text-sm font-semibold text-foreground">Conceptos</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase tracking-wide">
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Descripción</th>
                  <th className="text-center px-4 py-3 font-medium">Cant.</th>
                  <th className="text-right px-4 py-3 font-medium">Precio Unit.</th>
                  <th className="text-right px-5 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(q.items ?? []).map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3.5 text-foreground">{item.description}</td>
                    <td className="px-4 py-3.5 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-muted-foreground">{fmt(item.unit_price, q.currency)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-foreground">
                      {fmt(item.subtotal ?? item.unit_price * item.quantity, q.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-border/70 bg-muted/20">
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{fmt(q.subtotal, q.currency)}</span>
                  </div>
                  {q.discount_percent > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Descuento ({q.discount_percent}%)</span>
                      <span>−{fmt(q.discount_amount, q.currency)}</span>
                    </div>
                  )}
                  {q.tax_percent > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>IVA ({q.tax_percent}%)</span>
                      <span>+{fmt(q.tax_amount, q.currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base text-foreground">
                    <span>Total</span><span>{fmt(q.total, q.currency)} {q.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {q.notes && (
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Notas</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.notes}</p>
            </div>
          )}

          {/* Terms */}
          {q.terms && (
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Términos y condiciones</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.terms}</p>
            </div>
          )}
        </div>

        {/* RIGHT — Actions */}
        <div className="space-y-4">

          {/* Link / Send panel */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />Enlace público
            </h2>

            {q.status === 'draft' ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Envía la cotización para generar un link activo por 72 horas.
                </p>
                <Button className="w-full" onClick={handleSend} disabled={sendMutation.isPending}>
                  {sendMutation.isPending
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <Send className="w-4 h-4 mr-2" />}
                  Enviar cotización
                </Button>
              </>
            ) : (
              <>
                {q.public_url && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/40">
                    <span className="flex-1 text-xs text-muted-foreground truncate font-mono">{q.public_url}</span>
                    <button onClick={copyLink} className="p-1 rounded hover:bg-accent transition-colors" title="Copiar">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a href={q.public_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-accent transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {isExpired && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Link expirado. Regénéralo para compartirlo.
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full" onClick={handleRegenerate} disabled={regenerateMutation.isPending}>
                  {regenerateMutation.isPending
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <RefreshCw className="w-4 h-4 mr-2" />}
                  Regenerar enlace
                </Button>
              </>
            )}
          </div>

          {/* Status actions */}
          {q.status !== 'accepted' && q.status !== 'rejected' && (
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Actualizar estado</h2>
              <p className="text-xs text-muted-foreground">
                Cambia manualmente el estado de esta cotización.
              </p>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
                onClick={() => changeStatus('accepted')}
                disabled={isBusy}
              >
                <CheckCircle className="w-4 h-4 mr-2" />Marcar como aceptada
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                size="sm"
                onClick={() => changeStatus('rejected')}
                disabled={isBusy}
              >
                <XCircle className="w-4 h-4 mr-2" />Marcar como rechazada
              </Button>
            </div>
          )}

          {/* Status result display */}
          {(q.status === 'accepted' || q.status === 'rejected') && (
            <div className={`rounded-2xl border p-5 flex items-center gap-3 ${
              q.status === 'accepted'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
            }`}>
              {q.status === 'accepted'
                ? <CheckCircle className="w-5 h-5 shrink-0" />
                : <XCircle className="w-5 h-5 shrink-0" />}
              <div>
                <p className="font-semibold text-sm">
                  {q.status === 'accepted' ? 'Cotización aceptada' : 'Cotización rechazada'}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Información del enlace</h2>
            <dl className="space-y-2.5">
              {q.sent_at && (
                <InfoRow label="Enviada el" value={fmtDateTime(q.sent_at)} />
              )}
              {q.expires_at && (
                <InfoRow
                  label="Válida hasta"
                  value={
                    <span className={`flex items-center gap-1 ${isExpired ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {fmtDateTime(q.expires_at)}
                    </span>
                  }
                />
              )}
              {(q.status === 'viewed' || q.status === 'accepted' || q.status === 'rejected') && (
                <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 pt-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Vista por el cliente</span>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* ── Edit Sheet ──────────────────────────────────────────────────────── */}
      <QuotationSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editing={q}
      />

      {/* ── Link Dialog ─────────────────────────────────────────────────────── */}
      {linkOpen && <LinkDialog quotation={q} onClose={() => setLinkOpen(false)} />}

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cotización?</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente <strong>"{q.title}"</strong>.
              Esta acción no se puede deshacer y el link público dejará de funcionar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
