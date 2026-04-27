import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { rfcMxRx } from '@/lib/cfdi';
import { useFiscalRegimes, useCfdiUses } from '@/hooks/useFiscal';
import { useUpdateInvoiceFiscalData } from '@/hooks/useInvoices';

const getItemName = (item) =>
  item?.name ?? item?.description ?? item?.label ?? item?.nombre ?? '';

const inputCls = cn(
  'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm',
  'text-foreground placeholder:text-muted-foreground',
  'outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition',
  'disabled:opacity-50'
);

export default function UpdateFiscalDataModal({ invoice, onClose }) {
  const [form, setForm] = useState({
    rfc: '',
    razon_social: '',
    codigo_postal: '',
    regimen_fiscal: '',
    uso_cfdi: '',
    person_type: 'fisica',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const { data: regimes = [], isLoading: loadingRegimes } = useFiscalRegimes(form.person_type);
  const { data: cfdiUses = [], isLoading: loadingUses } = useCfdiUses(form.person_type);
  const updateMut = useUpdateInvoiceFiscalData();

  if (!invoice) return null;

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.rfc.trim()) e.rfc = 'El RFC es requerido';
    else if (!rfcMxRx.test(form.rfc.trim())) e.rfc = 'RFC inválido (formato SAT)';
    if (!form.razon_social.trim()) e.razon_social = 'La razón social es requerida';
    if (!form.codigo_postal.trim()) e.codigo_postal = 'El CP es requerido';
    else if (!/^\d{5}$/.test(form.codigo_postal.trim())) e.codigo_postal = 'Debe ser 5 dígitos';
    if (!form.regimen_fiscal) e.regimen_fiscal = 'Selecciona un régimen';
    if (!form.uso_cfdi) e.uso_cfdi = 'Selecciona un uso de CFDI';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateMut.mutate(
      { uuid: invoice.uuid, ...form },
      {
        onSuccess: () => { setSuccess(true); setTimeout(onClose, 2500); },
        onError: (err) => toast.error((err as any)?.response?.data?.message || 'Error al actualizar los datos fiscales'),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-background rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Datos Fiscales CFDI 4.0</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Factura {invoice.invoice_number}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">¡Tu factura está siendo procesada!</p>
            <p className="text-xs text-muted-foreground">Recibirás tu CFDI por correo electrónico en breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tipo de persona */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              {[
                { value: 'fisica', label: 'Persona Física' },
                { value: 'moral', label: 'Persona Moral' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    handleChange('person_type', value);
                    handleChange('regimen_fiscal', '');
                    handleChange('uso_cfdi', '');
                  }}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium transition-colors',
                    form.person_type === value
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-foreground/[0.04]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* RFC */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">RFC *</label>
                <input
                  type="text"
                  value={form.rfc}
                  onChange={e => handleChange('rfc', e.target.value.toUpperCase())}
                  placeholder="XAXX010101000"
                  maxLength={13}
                  className={cn(inputCls, errors.rfc && 'border-destructive')}
                />
                {errors.rfc && <p className="text-xs text-destructive">{errors.rfc}</p>}
              </div>

              {/* CP */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Código Postal *</label>
                <input
                  type="text"
                  value={form.codigo_postal}
                  onChange={e => handleChange('codigo_postal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="00000"
                  inputMode="numeric"
                  maxLength={5}
                  className={cn(inputCls, errors.codigo_postal && 'border-destructive')}
                />
                {errors.codigo_postal && <p className="text-xs text-destructive">{errors.codigo_postal}</p>}
              </div>

              {/* Razón social */}
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-foreground">Razón Social / Nombre *</label>
                <input
                  type="text"
                  value={form.razon_social}
                  onChange={e => handleChange('razon_social', e.target.value)}
                  placeholder="Mi Empresa S.A. de C.V."
                  className={cn(inputCls, errors.razon_social && 'border-destructive')}
                />
                {errors.razon_social && <p className="text-xs text-destructive">{errors.razon_social}</p>}
              </div>

              {/* Régimen */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Régimen Fiscal *</label>
                <div className="relative">
                  <select
                    value={form.regimen_fiscal}
                    onChange={e => handleChange('regimen_fiscal', e.target.value)}
                    disabled={loadingRegimes}
                    className={cn(inputCls, 'pr-8 appearance-none cursor-pointer', errors.regimen_fiscal && 'border-destructive')}
                  >
                    <option value="">{loadingRegimes ? 'Cargando...' : 'Selecciona'}</option>
                    {regimes.map(r => (
                      <option key={r.code} value={r.code}>{r.code} – {getItemName(r)}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {errors.regimen_fiscal && <p className="text-xs text-destructive">{errors.regimen_fiscal}</p>}
              </div>

              {/* Uso CFDI */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Uso CFDI *</label>
                <div className="relative">
                  <select
                    value={form.uso_cfdi}
                    onChange={e => handleChange('uso_cfdi', e.target.value)}
                    disabled={loadingUses}
                    className={cn(inputCls, 'pr-8 appearance-none cursor-pointer', errors.uso_cfdi && 'border-destructive')}
                  >
                    <option value="">{loadingUses ? 'Cargando...' : 'Selecciona'}</option>
                    {cfdiUses.map(u => (
                      <option key={u.code} value={u.code}>{u.code} – {getItemName(u)}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {errors.uso_cfdi && <p className="text-xs text-destructive">{errors.uso_cfdi}</p>}
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-3 py-2">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Tu RFC debe coincidir exactamente con el registrado en el SAT. Los errores pueden causar rechazo del CFDI.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateMut.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                  : 'Guardar datos fiscales'
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
