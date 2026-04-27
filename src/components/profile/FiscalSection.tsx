// /components/profile/FiscalSection.jsx
// Sección de perfiles fiscales en la página de perfil del cliente.
// Permite crear, editar, eliminar y establecer como predeterminado
// los datos fiscales (RFC, régimen, uso CFDI, etc.).

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Plus, Pencil, Trash2, Star, StarOff,
  Loader2, AlertCircle, CheckCircle2, ChevronDown, X, User2, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { rfcMxRx } from '@/lib/cfdi';
import {
  useFiscalProfiles,
  useFiscalRegimes,
  useCfdiUses,
  useCreateFiscalProfile,
  useUpdateFiscalProfile,
  useDeleteFiscalProfile,
  useSetDefaultFiscalProfile,
} from '@/hooks/useFiscal';

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * El API puede devolver el campo de descripción con distintos nombres
 * según la versión del backend: name | description | label | nombre.
 * Esta función los resuelve en ese orden de prioridad.
 */
const getItemName = (item) =>
  item?.name ?? item?.description ?? item?.label ?? item?.nombre ?? '';

/** Detecta persona física (13 chars RFC) vs moral (12 chars) */
const inferPersonType = (rfc = '') => {
  const clean = rfc.trim().toUpperCase();
  // 4 letras al inicio → persona física
  if (/^[A-ZÑ&]{4}/.test(clean)) return 'fisica';
  if (/^[A-ZÑ&]{3}/.test(clean)) return 'moral';
  return 'fisica';
};

const inputCls = cn(
  'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm',
  'text-foreground placeholder:text-muted-foreground',
  'outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 transition',
  'disabled:opacity-50 disabled:cursor-not-allowed'
);

const EMPTY_FORM = {
  rfc: '',
  business_name: '',
  postal_code: '',
  fiscal_regime_code: '',
  cfdi_use_code: '',
  person_type: 'fisica', // 'fisica' | 'moral'
};

/* ── Sub-componentes ─────────────────────────────────────── */

function SectionCard({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ProfileCard({ profile, regimes, cfdiUses, onEdit, onDelete, onSetDefault, loadingDelete, loadingDefault }) {
  const regime = regimes.find(r => r.code === profile.fiscal_regime_code);
  const cfdiUse = cfdiUses.find(u => u.code === profile.cfdi_use_code);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        'rounded-xl border p-4 transition-colors',
        profile.is_default
          ? 'border-foreground/30 bg-foreground/[0.03]'
          : 'border-border hover:border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* RFC + default badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-semibold text-sm text-foreground tracking-wider">
              {profile.rfc}
            </span>
            {profile.is_default && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-foreground text-background font-medium">
                <Star className="w-3 h-3" />
                Predeterminado
              </span>
            )}
          </div>

          {/* Razón social */}
          <p className="text-sm text-foreground font-medium truncate">{profile.business_name}</p>

          {/* Detalles */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            <span>CP {profile.postal_code}</span>
            {regime && <span className="truncate max-w-[200px]">{regime.code} – {getItemName(regime)}</span>}
            {cfdiUse && <span className="truncate max-w-[160px]">{cfdiUse.code} – {getItemName(cfdiUse)}</span>}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          {!profile.is_default && (
            <button
              onClick={() => onSetDefault(profile.uuid)}
              disabled={loadingDefault}
              title="Establecer como predeterminado"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors disabled:opacity-50"
            >
              {loadingDefault ? <Loader2 className="w-4 h-4 animate-spin" /> : <StarOff className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => onEdit(profile)}
            title="Editar"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(profile.uuid)}
            disabled={loadingDelete}
            title="Eliminar"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/[0.08] transition-colors disabled:opacity-50"
          >
            {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileForm({ initial, onSubmit, onCancel, isPending }: { initial?: any; onSubmit: (payload: any) => any; onCancel: () => void; isPending: boolean }) {
  const [form, setForm] = useState<typeof EMPTY_FORM>(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Los catálogos se obtienen del API filtrados por tipo de persona.
  // Al cambiar person_type React Query hace la petición con el nuevo ?type=
  const { data: regimes = [], isLoading: loadingRegimes } = useFiscalRegimes(form.person_type);
  const { data: cfdiUses = [], isLoading: loadingUses } = useCfdiUses(form.person_type);

  // Cuando el RFC cambia, inferir tipo de persona
  const handleRfcChange = (e) => {
    const val = e.target.value.toUpperCase();
    const personType = val.length >= 3 ? inferPersonType(val) : form.person_type;
    // Si el tipo cambió, limpiar régimen y uso para que el user seleccione del nuevo catálogo
    const extra = personType !== form.person_type
      ? { fiscal_regime_code: '', cfdi_use_code: '' }
      : {};
    setForm(p => ({ ...p, rfc: val, person_type: personType, ...extra }));
    if (errors.rfc) setErrors(p => { const n = { ...p }; delete n.rfc; return n; });
  };

  const handleChange = (field, value) => {
    // Al cambiar tipo de persona también limpiar régimen/uso
    if (field === 'person_type' && value !== form.person_type) {
      setForm(p => ({ ...p, person_type: value, fiscal_regime_code: '', cfdi_use_code: '' }));
    } else {
      setForm(p => ({ ...p, [field]: value }));
    }
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.rfc.trim()) e.rfc = 'El RFC es requerido';
    else if (!rfcMxRx.test(form.rfc.trim())) e.rfc = 'RFC inválido (formato SAT)';
    if (!form.business_name.trim()) e.business_name = 'La razón social es requerida';
    if (!form.postal_code.trim()) e.postal_code = 'El código postal es requerido';
    else if (!/^\d{5}$/.test(form.postal_code.trim())) e.postal_code = 'Debe ser de 5 dígitos';
    if (!form.fiscal_regime_code) e.fiscal_regime_code = 'Selecciona un régimen';
    if (!form.cfdi_use_code) e.cfdi_use_code = 'Selecciona un uso de CFDI';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      rfc: form.rfc.trim().toUpperCase(),
      business_name: form.business_name.trim(),
      postal_code: form.postal_code.trim(),
      fiscal_regime_code: form.fiscal_regime_code,
      cfdi_use_code: form.cfdi_use_code,
    });
  };

  const selectCls = (field) => cn(
    inputCls, 'pr-8 appearance-none cursor-pointer',
    errors[field] && 'border-destructive focus:ring-destructive/10'
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={handleSubmit}
      className="rounded-xl border border-foreground/20 bg-foreground/[0.02] p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {initial ? 'Editar perfil fiscal' : 'Nuevo perfil fiscal'}
        </p>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tipo de persona */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        {[
          { value: 'fisica', label: 'Persona Física', Icon: User2 },
          { value: 'moral', label: 'Persona Moral', Icon: Building2 },
        ].map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleChange('person_type', value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
              form.person_type === value
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-foreground/[0.04]'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* RFC */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            RFC <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={form.rfc}
            onChange={handleRfcChange}
            disabled={isPending}
            placeholder={form.person_type === 'moral' ? 'EMP010101AA1' : 'XAXX010101000'}
            maxLength={13}
            className={cn(inputCls, errors.rfc && 'border-destructive focus:ring-destructive/10')}
          />
          {errors.rfc && <p className="text-xs text-destructive">{errors.rfc}</p>}
        </div>

        {/* Razón social */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Razón Social / Nombre <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={form.business_name}
            onChange={e => handleChange('business_name', e.target.value)}
            disabled={isPending}
            placeholder="Mi Empresa S.A. de C.V."
            className={cn(inputCls, errors.business_name && 'border-destructive focus:ring-destructive/10')}
          />
          {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
        </div>

        {/* Código postal */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Código Postal Fiscal <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={form.postal_code}
            onChange={e => handleChange('postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
            disabled={isPending}
            placeholder="06600"
            inputMode="numeric"
            maxLength={5}
            className={cn(inputCls, errors.postal_code && 'border-destructive focus:ring-destructive/10')}
          />
          {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code}</p>}
        </div>

        {/* Régimen fiscal */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Régimen Fiscal <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              value={form.fiscal_regime_code}
              onChange={e => handleChange('fiscal_regime_code', e.target.value)}
              disabled={isPending || loadingRegimes}
              className={selectCls('fiscal_regime_code')}
            >
              <option value="">
                {loadingRegimes ? 'Cargando...' : 'Selecciona'}
              </option>
              {regimes.map(r => (
                <option key={r.code} value={r.code}>
                  {r.code} – {getItemName(r)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          {errors.fiscal_regime_code && <p className="text-xs text-destructive">{errors.fiscal_regime_code}</p>}
        </div>

        {/* Uso CFDI */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Uso de CFDI <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              value={form.cfdi_use_code}
              onChange={e => handleChange('cfdi_use_code', e.target.value)}
              disabled={isPending || loadingUses}
              className={selectCls('cfdi_use_code')}
            >
              <option value="">
                {loadingUses ? 'Cargando...' : 'Selecciona'}
              </option>
              {cfdiUses.map(u => (
                <option key={u.code} value={u.code}>
                  {u.code} – {getItemName(u)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          {errors.cfdi_use_code && <p className="text-xs text-destructive">{errors.cfdi_use_code}</p>}
          <p className="text-xs text-muted-foreground">Recomendado: G03 – Gastos en general</p>
        </div>
      </div>

      {/* Acciones del formulario */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
          ) : (
            <><CheckCircle2 className="w-3.5 h-3.5" /> {initial ? 'Guardar cambios' : 'Crear perfil'}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}

/* ── Componente principal ────────────────────────────────── */
export default function FiscalSection() {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any | null>(null); // objeto completo del perfil

  const { data: profiles = [], isLoading: loadingProfiles } = useFiscalProfiles();
  // Catálogos completos (sin filtro de tipo) para mostrar nombres en las tarjetas
  const { data: allRegimes = [] } = useFiscalRegimes();
  const { data: allCfdiUses = [] } = useCfdiUses();

  const createMut = useCreateFiscalProfile({
    onSuccess: () => { toast.success('Perfil fiscal creado'); setShowForm(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error al crear el perfil'),
  });

  const updateMut = useUpdateFiscalProfile({
    onSuccess: () => { toast.success('Perfil fiscal actualizado'); setEditingProfile(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Error al actualizar el perfil'),
  });

  const deleteMut = useDeleteFiscalProfile({
    onSuccess: () => toast.success('Perfil fiscal eliminado'),
    onError: () => toast.error('Error al eliminar el perfil'),
  });

  const defaultMut = useSetDefaultFiscalProfile({
    onSuccess: () => toast.success('Perfil predeterminado actualizado'),
    onError: () => toast.error('Error al actualizar el predeterminado'),
  });

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setShowForm(false); // cerrar formulario de creación si estaba abierto
  };

  const handleDelete = (uuid) => {
    if (!window.confirm('¿Eliminar este perfil fiscal? Esta acción no se puede deshacer.')) return;
    deleteMut.mutate(uuid);
  };

  const handleCreate = (payload) => createMut.mutateAsync(payload);

  const handleUpdate = (payload: any) =>
    editingProfile && updateMut.mutateAsync({ uuid: editingProfile.uuid, ...payload });

  return (
    <div className="space-y-6">
      {/* Tarjeta principal */}
      <SectionCard
        icon={Receipt}
        iconBg="bg-violet-100 dark:bg-violet-900/30"
        iconColor="text-violet-600 dark:text-violet-400"
        title="Datos de Facturación"
        subtitle="Tus perfiles fiscales para emisión de CFDI 4.0"
      >
        {/* Botón agregar + estado */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loadingProfiles
              ? 'Cargando...'
              : profiles.length === 0
              ? 'No tienes perfiles fiscales guardados'
              : `${profiles.length} perfil${profiles.length !== 1 ? 'es' : ''} guardado${profiles.length !== 1 ? 's' : ''}`}
          </p>
          {!showForm && !editingProfile && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo perfil
            </button>
          )}
        </div>

        {/* Formulario de creación */}
        <AnimatePresence>
          {showForm && (
            <div className="mb-4">
              <ProfileForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isPending={createMut.isPending}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Lista de perfiles */}
        {loadingProfiles ? (
          <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando perfiles...</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {profiles.map((profile) => (
                editingProfile?.uuid === profile.uuid ? (
                  <ProfileForm
                    key={`edit-${profile.uuid}`}
                    initial={{
                      rfc: profile.rfc,
                      business_name: profile.business_name,
                      postal_code: profile.postal_code,
                      fiscal_regime_code: profile.fiscal_regime_code,
                      cfdi_use_code: profile.cfdi_use_code,
                      person_type: inferPersonType(profile.rfc),
                    }}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingProfile(null)}
                    isPending={updateMut.isPending}
                  />
                ) : (
                  <ProfileCard
                    key={profile.uuid}
                    profile={profile}
                    regimes={allRegimes}
                    cfdiUses={allCfdiUses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetDefault={(uuid) => defaultMut.mutate(uuid)}
                    loadingDelete={deleteMut.isPending && deleteMut.variables === profile.uuid}
                    loadingDefault={defaultMut.isPending && defaultMut.variables === profile.uuid}
                  />
                )
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Estado vacío */}
        {!loadingProfiles && profiles.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <Receipt className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Sin perfiles fiscales</p>
              <p className="text-xs text-muted-foreground mt-1">
                Agrega tus datos del SAT para agilizar el proceso de facturación.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Agregar datos fiscales
            </button>
          </div>
        )}
      </SectionCard>

      {/* Aviso SAT */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Asegúrate de que los datos coincidan exactamente con tu{' '}
          <strong>Constancia de Situación Fiscal</strong> del SAT. Los errores en RFC,
          régimen fiscal o código postal pueden ocasionar que el CFDI sea rechazado.
        </p>
      </div>
    </div>
  );
}
