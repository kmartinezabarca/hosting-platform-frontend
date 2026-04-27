import React, { useEffect } from "react";
import { Paperclip, X, FileText, BookUser, ChevronDown, Loader2, User2, Building2 } from "lucide-react";
import { useInputClass } from "./useInputStyles";
import { useFiscalProfiles, useFiscalRegimes, useCfdiUses } from "@/hooks/useFiscal";
import { cn } from "@/lib/utils";

/**
 * El API puede devolver el campo de descripción con distintos nombres
 * según la versión del backend: name | description | label | nombre.
 */
const getItemName = (item) =>
  item?.name ?? item?.description ?? item?.label ?? item?.nombre ?? '';

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

/**
 * InvoiceFields — Sección CFDI 4.0 en el checkout.
 *
 * Props del padre (formData):
 *   requireInvoice, invoiceRfc, invoiceName, invoiceZip,
 *   invoiceRegimen, invoiceUsoCfdi, invoicePersonType,
 *   invoiceConstanciaName, invoiceConstanciaMime, invoiceConstanciaB64
 */
export default function InvoiceFields({
  formData,
  errors,
  touched,
  onChange,
  onBlur,
  clearConstancia,
}) {
  const inputClass = (n) => useInputClass(touched, errors, n, true);

  // ── Datos del API ──────────────────────────────────────
  const personType = formData.invoicePersonType || "fisica";

  const { data: profiles = [] as any[], isLoading: loadingProfiles } = useFiscalProfiles();
  // El API filtra por tipo — React Query recarga con ?type= cuando cambia personType
  const { data: regimes = [], isLoading: loadingRegimes } = useFiscalRegimes(personType);
  const { data: cfdiUses = [], isLoading: loadingUses } = useCfdiUses(personType);

  // Al cambiar tipo de persona, limpiar régimen/uso porque el catálogo cambia
  const prevPersonType = React.useRef(personType);
  useEffect(() => {
    if (prevPersonType.current !== personType) {
      prevPersonType.current = personType;
      onChange({ target: { name: "invoiceRegimen", value: "" } });
      onChange({ target: { name: "invoiceUsoCfdi", value: "" } });
    }
  }, [personType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cargar perfil fiscal guardado ─────────────────────
  const applyProfile = (profile) => {
    if (!profile) return;
    const fields = {
      invoiceProfileUuid: profile.uuid,
      invoiceRfc: profile.rfc ?? "",
      invoiceName: profile.business_name ?? "",
      invoiceZip: profile.postal_code ?? "",
      invoiceRegimen: profile.fiscal_regime_code ?? "",
      invoiceUsoCfdi: profile.cfdi_use_code ?? "",
      invoicePersonType: profile.rfc?.length === 12 ? "moral" : "fisica",
    };
    Object.entries(fields).forEach(([name, value]) =>
      onChange({ target: { name, value } })
    );
  };

  const handleLoadProfile = (uuid) => {
    if (!uuid) {
      // "Usar otro RFC..." — clear profile uuid and reset fields
      onChange({ target: { name: "invoiceProfileUuid", value: "" } });
      return;
    }
    const profile = profiles.find(p => p.uuid === uuid);
    applyProfile(profile);
  };

  // Auto-select default profile the first time invoice fields are shown
  const profilesLoaded = React.useRef(false);
  useEffect(() => {
    if (!loadingProfiles && profiles.length > 0 && !profilesLoaded.current && !formData.invoiceProfileUuid) {
      profilesLoaded.current = true;
      const defaultProfile = profiles.find(p => p.is_default) ?? profiles[0];
      if (defaultProfile) applyProfile(defaultProfile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProfiles, profiles]);

  // ── Inferir tipo desde RFC al escribir ────────────────
  const handleRfcChange = (e) => {
    onChange(e);
    const rfc = e.target.value.trim().toUpperCase();
    if (rfc.length >= 3) {
      const inferredType = /^[A-ZÑ&]{4}/.test(rfc) ? "fisica" : "moral";
      if (inferredType !== personType) {
        onChange({ target: { name: "invoicePersonType", value: inferredType } });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-foreground/10 dark:bg-white/10 flex items-center justify-center shrink-0">
          <FileText className="w-3.5 h-3.5 text-foreground" />
        </div>
        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
          Facturación
        </h3>
      </div>

      {/* CFDI toggle */}
      <label
        className={[
          "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
          formData.requireInvoice
            ? "border-foreground bg-foreground/[0.04] dark:bg-foreground/[0.06]"
            : "border-black/10 dark:border-white/10 hover:border-foreground/25",
        ].join(" ")}
      >
        {/* Visual toggle switch */}
        <div className="shrink-0 relative">
          <div
            className={[
              "w-11 h-6 rounded-full transition-colors duration-200",
              formData.requireInvoice ? "bg-foreground" : "bg-black/20 dark:bg-white/20",
            ].join(" ")}
          >
            <div
              className={[
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                formData.requireInvoice ? "translate-x-6" : "translate-x-1",
              ].join(" ")}
            />
          </div>
          <input
            type="checkbox"
            name="requireInvoice"
            checked={formData.requireInvoice}
            onChange={onChange}
            className="sr-only"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            ¿Requieres factura CFDI 4.0?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proporciona tus datos fiscales del SAT para emitir tu CFDI.
          </p>
        </div>

        <FileText
          className={`w-4 h-4 shrink-0 transition-colors ${
            formData.requireInvoice ? "text-foreground" : "text-muted-foreground/30"
          }`}
        />
      </label>

      {/* CFDI expanded fields */}
      {formData.requireInvoice && (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 space-y-5 bg-black/[0.015] dark:bg-white/[0.02]">

          {/* ── Selector de perfil fiscal guardado ─────── */}
          {profiles.length > 0 && (
            <div className="rounded-xl border border-dashed border-foreground/20 bg-foreground/[0.02] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <BookUser className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Perfil fiscal
                </span>
              </div>
              <div className="relative flex-1">
                {loadingProfiles ? (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cargando perfiles...</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={formData.invoiceProfileUuid || ""}
                      onChange={(e) => handleLoadProfile(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#12151c] px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition cursor-pointer"
                    >
                      {profiles.map(p => (
                        <option key={p.uuid} value={p.uuid}>
                          {p.rfc} — {p.business_name}{p.is_default ? " ★" : ""}
                        </option>
                      ))}
                      <option value="">✏ Usar otro RFC...</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Tipo de persona ────────────────────────── */}
          <div>
            <FieldLabel>Tipo de persona</FieldLabel>
            <div className="flex rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
              {[
                { value: "fisica", label: "Persona Física", Icon: User2 },
                { value: "moral", label: "Persona Moral", Icon: Building2 },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ target: { name: "invoicePersonType", value } })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                    personType === value
                      ? "bg-foreground text-background"
                      : "bg-white dark:bg-[#12151c] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RFC */}
            <div>
              <FieldLabel>RFC *</FieldLabel>
              <input
                type="text"
                name="invoiceRfc"
                value={formData.invoiceRfc}
                onChange={handleRfcChange}
                onBlur={onBlur}
                className={inputClass("invoiceRfc")}
                placeholder={personType === "moral" ? "EMP010101AA1" : "XAXX010101000"}
                maxLength={13}
              />
              {errors.invoiceRfc && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceRfc}</p>
              )}
            </div>

            {/* Razón social */}
            <div>
              <FieldLabel>Razón Social / Nombre *</FieldLabel>
              <input
                type="text"
                name="invoiceName"
                value={formData.invoiceName}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceName")}
                placeholder="Mi Empresa S.A. de C.V."
              />
              {errors.invoiceName && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceName}</p>
              )}
            </div>

            {/* CP fiscal */}
            <div>
              <FieldLabel>Código Postal fiscal *</FieldLabel>
              <input
                type="text"
                name="invoiceZip"
                value={formData.invoiceZip}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceZip")}
                placeholder="00000"
                inputMode="numeric"
                maxLength={5}
              />
              {errors.invoiceZip && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceZip}</p>
              )}
            </div>

            {/* Régimen fiscal */}
            <div>
              <FieldLabel>Régimen Fiscal *</FieldLabel>
              <div className="relative">
                <select
                  name="invoiceRegimen"
                  value={formData.invoiceRegimen}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={loadingRegimes}
                  className={cn(inputClass("invoiceRegimen"), "pr-8 appearance-none")}
                >
                  <option value="">
                    {loadingRegimes ? "Cargando..." : "Selecciona"}
                  </option>
                  {regimes.map(r => (
                    <option key={r.code} value={r.code}>
                      {r.code} – {getItemName(r)}
                    </option>
                  ))}
                </select>
                {loadingRegimes
                  ? <Loader2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                  : <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                }
              </div>
              {errors.invoiceRegimen && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceRegimen}</p>
              )}
            </div>

            {/* Uso CFDI */}
            <div className="md:col-span-2">
              <FieldLabel>Uso de CFDI *</FieldLabel>
              <div className="relative">
                <select
                  name="invoiceUsoCfdi"
                  value={formData.invoiceUsoCfdi}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={loadingUses}
                  className={cn(inputClass("invoiceUsoCfdi"), "pr-8 appearance-none")}
                >
                  <option value="">
                    {loadingUses ? "Cargando..." : "Selecciona"}
                  </option>
                  {cfdiUses.map(u => (
                    <option key={u.code} value={u.code}>
                      {u.code} – {getItemName(u)}
                    </option>
                  ))}
                </select>
                {loadingUses
                  ? <Loader2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                  : <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                }
              </div>
              {errors.invoiceUsoCfdi && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceUsoCfdi}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                Recomendado: G03 — Gastos en general.
              </p>
            </div>
          </div>

          {/* Constancia de situación fiscal */}
          <div>
            <FieldLabel>
              Constancia de situación fiscal{" "}
              <span className="font-normal normal-case text-muted-foreground">(opcional)</span>
            </FieldLabel>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/8 cursor-pointer text-sm font-medium transition">
                <Paperclip className="w-4 h-4" />
                Adjuntar archivo
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  name="invoiceConstancia"
                  onChange={onChange}
                  className="hidden"
                />
              </label>

              {formData.invoiceConstanciaName && (
                <span className="inline-flex items-center gap-2 text-xs rounded-xl px-3 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                  {formData.invoiceConstanciaName}
                  <button
                    type="button"
                    onClick={clearConstancia}
                    className="hover:opacity-70 transition-opacity"
                    aria-label="Quitar archivo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              PDF, JPG o PNG. Máx. 5 MB.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
