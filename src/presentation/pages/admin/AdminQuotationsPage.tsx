import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@presentation/components/features/ToastProvider';
import {
  Plus, Search, FileText, Send, Copy, RefreshCw, Trash2, Edit,
  Clock, CheckCircle, XCircle, Eye, Link2, AlertCircle, Loader2, User, X,
  Package, Receipt, ExternalLink, History,
  ChevronUp, ChevronDown, Filter,
} from 'lucide-react';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Label } from '@presentation/components/ui/label';
import { Textarea } from '@presentation/components/ui/textarea';
import { Separator } from '@presentation/components/ui/separator';
import { Card, CardContent } from '@presentation/components/ui/card';
import { Badge } from '@presentation/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@presentation/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@presentation/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@presentation/components/ui/dialog';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@presentation/components/ui/tooltip';
import { StatCard } from '@presentation/components/ui/stat-card';
import {
  useQuotations, useCreateQuotation, useUpdateQuotation,
  useDeleteQuotation, useSendQuotation, useRegenerateQuotationLink,
} from '@application/hooks/useQuotations';
import type { Quotation, QuotationStatus } from '@infrastructure/services/quotationService';

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
  draft:            { label: 'Borrador',         color: 'bg-muted text-muted-foreground',                           icon: <FileText       className="w-3 h-3" /> },
  sent:             { label: 'Enviada',           color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',          icon: <Send           className="w-3 h-3" /> },
  viewed:           { label: 'Vista',             color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',    icon: <Eye            className="w-3 h-3" /> },
  accepted:         { label: 'Aceptada',          color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: <CheckCircle    className="w-3 h-3" /> },
  rejected:         { label: 'Rechazada',         color: 'bg-red-500/15 text-red-600 dark:text-red-400',             icon: <XCircle        className="w-3 h-3" /> },
  expired:          { label: 'Vencida',           color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',       icon: <Clock          className="w-3 h-3" /> },
  cancelled:        { label: 'Cancelada',         color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',       icon: <XCircle        className="w-3 h-3" /> },
  pending_revision: { label: 'Revisión pendiente', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',   icon: <History        className="w-3 h-3" /> },
};

export const StatusBadge = ({ status, label }: { status: QuotationStatus; label?: string }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <Badge variant="outline" className={`${cfg.color} px-2.5 py-1 text-xs font-medium border-transparent`}>
      {cfg.icon}<span className="ml-1.5">{label ?? cfg.label}</span>
    </Badge>
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
    <div className="grid grid-cols-12 gap-1.5 items-start">
      <div className="col-span-5">
        <Input placeholder="Descripción" {...register(`items.${index}.description`)} className="text-sm" />
      </div>
      <div className="col-span-2">
        <Input type="number" min="1" placeholder="Cant." {...register(`items.${index}.quantity`)} className="text-sm" />
      </div>
      <div className="col-span-4">
        <div className="flex gap-1.5">
          <Input type="number" min="0" step="0.01" placeholder="Precio unit." {...register(`items.${index}.unit_price`)} className="text-sm flex-1 min-w-0" />
          <span className="inline-flex items-center px-1.5 text-[10px] text-muted-foreground whitespace-nowrap bg-muted/50 rounded-md">{fmt(sub)}</span>
        </div>
      </div>
      <div className="col-span-1 flex justify-center pt-0.5">
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
      <SheetContent side="right" className="!w-full !max-w-[800px] overflow-y-auto p-0">
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
              <div className="grid grid-cols-12 gap-1.5 px-0.5">
                <span className="col-span-5 text-xs font-medium text-muted-foreground">Descripción</span>
                <span className="col-span-2 text-xs font-medium text-muted-foreground">Cant.</span>
                <span className="col-span-4 text-xs font-medium text-muted-foreground">Precio unit. / Subtotal</span>
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
            <StatusBadge status={quotation.status} label={(quotation as any).status_label} />
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

// ── Sort icon ─────────────────────────────────────────────────────────────────

const SortIcon = ({ column, sortConfig }: { column: string; sortConfig: { key: string; direction: string } }) => {
  if (sortConfig.key !== column) return <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
  return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminQuotationsPage() {
  const navigate = useNavigate();

  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [showFilters,    setShowFilters]    = useState(false);
  const [page,           setPage]           = useState(1);
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [editingQ,       setEditingQ]       = useState<Quotation | null>(null);
  const [linkDialogQ,    setLinkDialogQ]    = useState<Quotation | null>(null);
  const [deleteConfirmQ, setDeleteConfirmQ] = useState<Quotation | null>(null);
  const [sortConfig,     setSortConfig]     = useState({ key: 'created_at', direction: 'desc' as 'asc' | 'desc' });

  const deleteMutation = useDeleteQuotation();

  const { data, isLoading, isFetching, isError, refetch } = useQuotations({
    search:   search || undefined,
    status:   statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: 15,
  });

  const quotations: Quotation[] = (data as any)?.quotations ?? [];
  const pagination               = (data as any)?.pagination;
  const totalPages               = pagination?.last_page ?? 1;

  const LOCKED_STATUSES = ['accepted', 'rejected', 'expired', 'cancelled'];

  // ── Sorting ────────────────────────────────────────────────────────────────

  const sortedQuotations = useMemo(() => {
    const sorted = [...quotations];
    sorted.sort((a, b) => {
      const aAny = a as any;
      const bAny = b as any;
      let aValue: any = aAny[sortConfig.key];
      let bValue: any = bAny[sortConfig.key];

      if (sortConfig.key === 'total') {
        aValue = Number(a.total) || 0;
        bValue = Number(b.total) || 0;
      } else if (sortConfig.key === 'client_name') {
        aValue = (a.client_name ?? '').toLowerCase();
        bValue = (b.client_name ?? '').toLowerCase();
      } else if (sortConfig.key === 'title') {
        aValue = (a.title ?? '').toLowerCase();
        bValue = (b.title ?? '').toLowerCase();
      } else if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (sortConfig.key === 'currency') {
        aValue = (a.currency ?? '').toLowerCase();
        bValue = (b.currency ?? '').toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [quotations, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = quotations.length;
    const sent = quotations.filter(q => q.status === 'sent' || q.status === 'viewed').length;
    const accepted = quotations.filter(q => q.status === 'accepted').length;
    const expired = quotations.filter(q => q.status === 'expired').length;
    const totalAmount = quotations.reduce((sum, q) => sum + Number(q.total), 0);
    const acceptedAmount = quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + Number(q.total), 0);
    return { total, sent, accepted, expired, totalAmount, acceptedAmount };
  }, [quotations]);

  const activeFilters = [statusFilter].filter(f => f !== 'all').length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEdit = useCallback((q: Quotation) => {
    if (LOCKED_STATUSES.includes(q.status)) {
      const labels: Record<string, string> = { accepted: 'aceptada', rejected: 'rechazada', expired: 'vencida', cancelled: 'cancelada' };
      toast.error('No se puede modificar una cotización ' + (labels[q.status] ?? 'finalizada'));
      return;
    }
    setEditingQ(q);
    setSheetOpen(true);
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirmQ) return;
    if (LOCKED_STATUSES.includes(deleteConfirmQ.status)) {
      const labels: Record<string, string> = { accepted: 'aceptada', rejected: 'rechazada', expired: 'vencida', cancelled: 'cancelada' };
      toast.error('No se puede eliminar una cotización ' + (labels[deleteConfirmQ.status] ?? 'finalizada'));
      setDeleteConfirmQ(null);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteConfirmQ.uuid);
      toast.success('Cotización eliminada');
      setDeleteConfirmQ(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar');
    }
  };

  const statusOptions = [
    { value: 'all',             label: 'Todos los estados' },
    { value: 'draft',           label: 'Borrador' },
    { value: 'sent',            label: 'Enviada' },
    { value: 'viewed',          label: 'Vista' },
    { value: 'accepted',        label: 'Aceptada' },
    { value: 'rejected',        label: 'Rechazada' },
    { value: 'expired',         label: 'Vencida' },
    { value: 'cancelled',       label: 'Cancelada' },
    { value: 'pending_revision', label: 'Revisión pendiente' },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} cotizaciones en el sistema</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button onClick={() => { setEditingQ(null); setSheetOpen(true); }} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>
      </div>

      {/* ── Statistics Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Receipt} label="Total" value={stats.total} subtitle={formatCurrency(stats.totalAmount)} accent="slate" loading={isFetching} />
        <StatCard icon={Send} label="Enviadas" value={stats.sent} accent="blue" loading={isFetching} />
        <StatCard icon={CheckCircle} label="Aceptadas" value={stats.accepted} progress={stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0} accent="emerald" loading={isFetching} />
        <StatCard icon={Clock} label="Vencidas" value={stats.expired} accent="amber" loading={isFetching} />
      </div>

      {/* ── Quotations Table Card ───────────────────────────────────────── */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Search + filters header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por título, cliente o email…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

          {/* Filter dropdowns inline */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Título
                      <SortIcon column="title" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('client_name')}
                  >
                    <div className="flex items-center gap-1">
                      Cliente
                      <SortIcon column="client_name" sortConfig={sortConfig} />
                    </div>
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
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center gap-1">
                      Total
                      <SortIcon column="total" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group hidden lg:table-cell"
                    onClick={() => handleSort('currency')}
                  >
                    <div className="flex items-center gap-1">
                      Moneda
                      <SortIcon column="currency" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group hidden lg:table-cell"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Creada
                      <SortIcon column="created_at" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><Skeleton className="h-10 w-10 rounded-lg" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
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
                ) : (
                  sortedQuotations.map((q: Quotation) => (
                    <tr
                      key={q.uuid}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/quotations/${q.uuid}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Receipt className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {q.title}
                              {q.revision_number > 0 && (
                                <span className="ml-1.5 inline-flex items-center px-1 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/[0.08] text-muted-foreground align-middle">
                                  REV {q.revision_number}
                                </span>
                              )}
                            </p>
                            {q.items?.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {q.items.length} concepto{q.items.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{q.client_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{q.client_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={q.status} label={(q as any).status_label} />
                          {(q as any).is_expired && (
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" aria-label="Vencida" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          {fmt(q.total, q.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs font-mono text-muted-foreground">{q.currency}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{fmtDate(q.created_at)}</span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/quotations/${q.uuid}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalle</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(q)}
                                  disabled={LOCKED_STATUSES.includes(q.status)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{LOCKED_STATUSES.includes(q.status) ? 'No editable' : 'Editar'}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLinkDialogQ(q)}>
                                <Link2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{q.status === 'draft' ? 'Generar link' : 'Ver link'}</TooltipContent>
                          </Tooltip>
                          {q.public_url && q.status !== 'draft' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(q.public_url!); toast.success('¡Enlace copiado!'); }}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar enlace</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  onClick={LOCKED_STATUSES.includes(q.status) ? undefined : () => setDeleteConfirmQ(q)}
                                  disabled={LOCKED_STATUSES.includes(q.status)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{LOCKED_STATUSES.includes(q.status) ? 'No editable' : 'Eliminar'}</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Empty state */}
            {sortedQuotations.length === 0 && !isLoading && !isError && (
              <div className="text-center py-12">
                <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground mb-1 font-medium">
                  {search || statusFilter !== 'all' ? 'Sin resultados' : 'Sin cotizaciones'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {search || statusFilter !== 'all'
                    ? 'Ajusta los filtros para ver más resultados.'
                    : 'Crea tu primera cotización para empezar.'}
                </p>
                {!search && statusFilter === 'all' && (
                  <Button size="sm" onClick={() => { setEditingQ(null); setSheetOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />Nueva cotización
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination (always visible) */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>Anterior</Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <Button key={pageNum} variant={page === pageNum ? "default" : "ghost"} size="sm" onClick={() => setPage(pageNum)} disabled={isFetching} className="h-8 w-8 p-0">{pageNum}</Button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isFetching}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
