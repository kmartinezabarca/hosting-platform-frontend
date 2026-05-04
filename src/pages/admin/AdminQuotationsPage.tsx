import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus, Search, FileText, Send, Copy, RefreshCw, Trash2, Edit,
  Clock, CheckCircle, XCircle, Eye, Link2, AlertCircle, Loader2,
  DollarSign, User, Mail, Phone, Building2, X, ChevronLeft, ChevronRight,
  Package, Receipt, ExternalLink, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useQuotations, useCreateQuotation, useUpdateQuotation,
  useDeleteQuotation, useSendQuotation, useRegenerateQuotationLink,
} from '@/hooks/useQuotations';
import type { Quotation, QuotationStatus } from '@/services/quotationService';

// ── Zod schema ────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  description: z.string().min(1, 'Requerido'),
  quantity:    z.coerce.number().positive('> 0'),
  unit_price:  z.coerce.number().min(0, '≥ 0'),
});

const quotationSchema = z.object({
  title:            z.string().min(2, 'Mínimo 2 caracteres'),
  client_name:      z.string().min(2, 'Requerido'),
  client_email:     z.string().email('Email inválido'),
  client_company:   z.string().optional(),
  client_phone:     z.string().optional(),
  currency:         z.enum(['MXN', 'USD']),
  discount_percent: z.coerce.number().min(0).max(100),
  tax_percent:      z.coerce.number().min(0).max(100),
  notes:            z.string().optional(),
  terms:            z.string().optional(),
  items:            z.array(itemSchema).min(1, 'Agrega al menos un concepto'),
});

type FormValues = z.infer<typeof quotationSchema>;

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft:    { label: 'Borrador',  color: 'bg-muted text-muted-foreground',                           icon: <FileText   className="w-3 h-3" /> },
  sent:     { label: 'Enviada',   color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',          icon: <Send       className="w-3 h-3" /> },
  viewed:   { label: 'Vista',     color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',    icon: <Eye        className="w-3 h-3" /> },
  accepted: { label: 'Aceptada',  color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rechazada', color: 'bg-red-500/15 text-red-600 dark:text-red-400',             icon: <XCircle    className="w-3 h-3" /> },
  expired:  { label: 'Vencida',   color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',       icon: <Clock      className="w-3 h-3" /> },
};

export const StatusBadge = ({ status }: { status: QuotationStatus }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

export const fmt = (n: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(n);

export const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtDateTime = (d: string | null) => {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(d));
};

// ── Item row ──────────────────────────────────────────────────────────────────

const ItemRow = ({ index, remove, register, watch }: any) => {
  const qty   = watch(`items.${index}.quantity`)   || 0;
  const price = watch(`items.${index}.unit_price`) || 0;
  const sub   = Number(qty) * Number(price);

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-5">
        <Input placeholder="Descripción" {...register(`items.${index}.description`)} className="text-sm" />
      </div>
      <div className="col-span-2">
        <Input type="number" min="1" placeholder="Cant." {...register(`items.${index}.quantity`)} className="text-sm" />
      </div>
      <div className="col-span-3">
        <Input type="number" min="0" step="0.01" placeholder="Precio unit." {...register(`items.${index}.unit_price`)} className="text-sm" />
      </div>
      <div className="col-span-1 flex items-center justify-end pt-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{fmt(sub)}</span>
      </div>
      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={() => remove(index)}
          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Create / Edit Sheet ───────────────────────────────────────────────────────

interface QuotationSheetProps {
  open:     boolean;
  onClose:  () => void;
  editing?: Quotation | null;
}

export const QuotationSheet = ({ open, onClose, editing }: QuotationSheetProps) => {
  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();
  const isEditing = !!editing;

  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      title:            editing?.title            ?? '',
      client_name:      editing?.client_name      ?? '',
      client_email:     editing?.client_email     ?? '',
      client_company:   editing?.client_company   ?? '',
      client_phone:     editing?.client_phone     ?? '',
      currency:         (editing?.currency        ?? 'MXN') as 'MXN' | 'USD',
      discount_percent: editing?.discount_percent ?? 0,
      tax_percent:      editing?.tax_percent      ?? 16,
      notes:            editing?.notes            ?? '',
      terms:            editing?.terms            ?? '',
      items: editing?.items?.length
        ? editing.items.map(i => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price }))
        : [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const items       = watch('items');
  const currency    = watch('currency');
  const discountPct = watch('discount_percent') || 0;
  const taxPct      = watch('tax_percent') || 0;

  const subtotal       = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unit_price)), 0);
  const discountAmount = subtotal * discountPct / 100;
  const taxable        = subtotal - discountAmount;
  const taxAmount      = taxable * taxPct / 100;
  const total          = taxable + taxAmount;

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        items: values.items.map(i => ({ ...i, quantity: Number(i.quantity), unit_price: Number(i.unit_price) })),
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ uuid: editing!.uuid, data: payload });
        toast.success('Cotización actualizada');
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success('Cotización creada');
      }
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar');
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              {isEditing ? 'Editar Cotización' : 'Nueva Cotización'}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? 'Modifica los datos de la cotización.' : 'Completa los datos del cliente y los conceptos a cotizar.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Título de la cotización *</Label>
              <Input id="title" {...register('title')} placeholder="Ej. Propuesta Hosting Pro para Empresa XYZ" className="mt-1" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            {/* Client */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4" />Datos del Cliente</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nombre *</Label>
                  <Input {...register('client_name')} placeholder="Juan García" className="mt-1" />
                  {errors.client_name && <p className="text-xs text-destructive mt-1">{errors.client_name.message}</p>}
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input {...register('client_email')} placeholder="juan@empresa.com" className="mt-1" />
                  {errors.client_email && <p className="text-xs text-destructive mt-1">{errors.client_email.message}</p>}
                </div>
                <div>
                  <Label>Empresa</Label>
                  <Input {...register('client_company')} placeholder="Empresa S.A. de C.V." className="mt-1" />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input {...register('client_phone')} placeholder="+52 55 1234 5678" className="mt-1" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4" />Conceptos</h4>
              <div className="grid grid-cols-12 gap-2 px-0.5">
                <span className="col-span-5 text-xs font-medium text-muted-foreground">Descripción</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Cant.</span>
                <span className="col-span-3 text-xs font-medium text-muted-foreground">Precio unit.</span>
                <span className="col-span-1 text-xs font-medium text-muted-foreground text-right">Sub</span>
                <span className="col-span-1" />
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <ItemRow key={field.id} index={index} remove={remove} register={register} watch={watch} />
                ))}
              </div>
              {errors.items && <p className="text-xs text-destructive">{(errors.items as any)?.message}</p>}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unit_price: 0 })} className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" />Agregar concepto
              </Button>
            </div>

            <Separator />

            {/* Totals config */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Moneda</Label>
                <Controller control={control} name="currency" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">🇲🇽 MXN</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>Descuento (%)</Label>
                <Input type="number" min="0" max="100" step="1" {...register('discount_percent')} className="mt-1" />
              </div>
              <div>
                <Label>IVA (%)</Label>
                <Input type="number" min="0" max="100" step="1" {...register('tax_percent')} className="mt-1" />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{fmt(subtotal, currency)}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento ({discountPct}%)</span><span>−{fmt(discountAmount, currency)}</span>
                </div>
              )}
              {taxPct > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA ({taxPct}%)</span><span>+{fmt(taxAmount, currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>{fmt(total, currency)}</span>
              </div>
            </div>

            <Separator />

            {/* Notes & Terms */}
            <div className="space-y-3">
              <div>
                <Label>Notas para el cliente</Label>
                <Textarea {...register('notes')} placeholder="Condiciones especiales, aclaraciones…" rows={3} className="mt-1 resize-none" />
              </div>
              <div>
                <Label>Términos y condiciones</Label>
                <Textarea {...register('terms')} placeholder="Validez, forma de pago, tiempos de entrega…" rows={3} className="mt-1 resize-none" />
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t sticky bottom-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Actualizar' : 'Guardar como borrador'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// ── Link dialog ───────────────────────────────────────────────────────────────

export const LinkDialog = ({ quotation, onClose }: { quotation: Quotation; onClose: () => void }) => {
  const sendMutation       = useSendQuotation();
  const regenerateMutation = useRegenerateQuotationLink();
  const [copied, setCopied] = useState(false);

  const publicUrl = quotation.public_url;
  const hasSent   = quotation.status !== 'draft';

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('¡Enlace copiado!');
    });
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(quotation.uuid);
      toast.success('Cotización enviada — link activo por 72 horas');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al enviar');
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync(quotation.uuid);
      toast.success('Link regenerado — activo por 72 horas más');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al regenerar');
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />Link público
          </DialogTitle>
          <DialogDescription>
            Este link estará activo durante <strong>72 horas</strong> y puede ser compartido directamente con tu cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={quotation.status} />
            {quotation.expires_at && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Vence {fmtDate(quotation.expires_at)}
              </span>
            )}
          </div>

          {hasSent && publicUrl ? (
            <div className="flex items-center gap-2 p-3 rounded-xl border bg-muted/40">
              <span className="flex-1 text-xs text-muted-foreground truncate font-mono">{publicUrl}</span>
              <button onClick={copyLink} className="shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors" title="Copiar">
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed bg-muted/20 text-center">
              <p className="text-sm text-muted-foreground">La cotización aún no ha sido enviada.</p>
            </div>
          )}

          {quotation.expires_at && new Date(quotation.expires_at) < new Date() && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              El link ha expirado. Regénéralo para volver a compartirlo.
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cerrar</Button>
          {!hasSent ? (
            <Button onClick={handleSend} disabled={sendMutation.isPending} className="flex-1">
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Enviar y generar link
            </Button>
          ) : (
            <Button variant="outline" onClick={handleRegenerate} disabled={regenerateMutation.isPending} className="flex-1">
              {regenerateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerar link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Table skeleton row ────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-border/50">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <Skeleton className="h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminQuotationsPage() {
  const navigate = useNavigate();

  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [page,           setPage]           = useState(1);
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [editingQ,       setEditingQ]       = useState<Quotation | null>(null);
  const [linkDialogQ,    setLinkDialogQ]    = useState<Quotation | null>(null);
  const [deleteConfirmQ, setDeleteConfirmQ] = useState<Quotation | null>(null);

  const deleteMutation = useDeleteQuotation();

  const { data, isLoading, isError, refetch } = useQuotations({
    search:   search || undefined,
    status:   statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: 15,
  });

  const quotations: Quotation[] = (data as any)?.quotations ?? [];
  const pagination               = (data as any)?.pagination;

  const handleEdit = useCallback((q: Quotation) => {
    setEditingQ(q);
    setSheetOpen(true);
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirmQ) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmQ.uuid);
      toast.success('Cotización eliminada');
      setDeleteConfirmQ(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar');
    }
  };

  const statusOptions = [
    { value: 'all',      label: 'Todos los estados' },
    { value: 'draft',    label: 'Borrador' },
    { value: 'sent',     label: 'Enviada' },
    { value: 'viewed',   label: 'Vista' },
    { value: 'accepted', label: 'Aceptada' },
    { value: 'rejected', label: 'Rechazada' },
    { value: 'expired',  label: 'Vencida' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            Cotizaciones
          </h1>
          <p className="text-muted-foreground mt-1 ml-14 text-sm">
            Crea y gestiona cotizaciones con links públicos de 72 horas.
          </p>
        </div>
        <Button onClick={() => { setEditingQ(null); setSheetOpen(true); }} className="shrink-0 shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />Nueva cotización
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, cliente o email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="Actualizar">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/70 bg-card/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border/70">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Moneda</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-32">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-32">Creada</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
                    <p className="font-medium text-foreground mb-3">Error al cargar las cotizaciones</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className="w-4 h-4 mr-2" />Reintentar
                    </Button>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Receipt className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">
                      {search || statusFilter !== 'all' ? 'Sin resultados' : 'Sin cotizaciones'}
                    </p>
                    <p className="text-muted-foreground text-sm mb-5">
                      {search || statusFilter !== 'all'
                        ? 'Ajusta los filtros para ver más resultados.'
                        : 'Crea tu primera cotización y comparte el link con tu cliente.'}
                    </p>
                    {!search && statusFilter === 'all' && (
                      <Button size="sm" onClick={() => { setEditingQ(null); setSheetOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />Nueva cotización
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                quotations.map((q: Quotation) => (
                  <motion.tr
                    key={q.uuid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/quotations/${q.uuid}`)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground truncate max-w-[220px]">{q.title}</p>
                      {q.items?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {q.items.length} concepto{q.items.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">{q.client_name}</p>
                      <p className="text-xs text-muted-foreground">{q.client_email}</p>
                      {q.client_company && (
                        <p className="text-xs text-muted-foreground">{q.client_company}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-foreground">
                      {fmt(q.total, q.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-xs text-muted-foreground font-mono">{q.currency}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {fmtDate(q.created_at)}
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem {...{ onClick: () => navigate(`/admin/quotations/${q.uuid}`) } as any}>
                            <Eye className="w-4 h-4 mr-2" />Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem {...{ onClick: () => handleEdit(q) } as any}>
                            <Edit className="w-4 h-4 mr-2" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem {...{ onClick: () => setLinkDialogQ(q) } as any}>
                            <Link2 className="w-4 h-4 mr-2" />
                            {q.status === 'draft' ? 'Generar link' : 'Ver link'}
                          </DropdownMenuItem>
                          {q.public_url && q.status !== 'draft' && (
                            <DropdownMenuItem {...{
                              onClick: () => {
                                navigator.clipboard.writeText(q.public_url!);
                                toast.success('¡Enlace copiado!');
                              }
                            } as any}>
                              <Copy className="w-4 h-4 mr-2" />Copiar enlace
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator {...{} as any} />
                          <DropdownMenuItem {...{ onClick: () => setDeleteConfirmQ(q), className: 'text-destructive focus:text-destructive' } as any}>
                            <Trash2 className="w-4 h-4 mr-2" />Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !isError && pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/70 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Mostrando {quotations.length} de {pagination.total} cotizaciones
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />Anterior
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                {page} / {pagination.last_page}
              </span>
              <Button variant="outline" size="sm" disabled={page === pagination.last_page} onClick={() => setPage(p => p + 1)}>
                Siguiente<ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <QuotationSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditingQ(null); }}
        editing={editingQ}
      />

      {linkDialogQ && <LinkDialog quotation={linkDialogQ} onClose={() => setLinkDialogQ(null)} />}

      <AnimatePresence>
        {deleteConfirmQ && (
          <Dialog open onOpenChange={() => setDeleteConfirmQ(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar cotización?</DialogTitle>
                <DialogDescription>
                  Se eliminará permanentemente <strong>"{deleteConfirmQ.title}"</strong>.
                  Esta acción no se puede deshacer y el link público dejará de funcionar.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setDeleteConfirmQ(null)} className="flex-1">Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1">
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
