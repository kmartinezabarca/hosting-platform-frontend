import React from "react";
import { Paperclip, X, FileText } from "lucide-react";
import { REGIMENES, USOS_CFDI } from "../../lib/cfdi";
import { useInputClass } from "./useInputStyles";

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

export default function InvoiceFields({
  formData,
  errors,
  touched,
  onChange,
  onBlur,
  clearConstancia,
}) {
  const inputClass = (n) => useInputClass(touched, errors, n, true);

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

      {/* CFDI toggle — styled switch card */}
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
              formData.requireInvoice
                ? "bg-foreground"
                : "bg-black/20 dark:bg-white/20",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>RFC *</FieldLabel>
              <input
                type="text"
                name="invoiceRfc"
                value={formData.invoiceRfc}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceRfc")}
                placeholder="XAXX010101000"
              />
              {errors.invoiceRfc && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceRfc}</p>
              )}
            </div>

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
              />
              {errors.invoiceZip && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceZip}</p>
              )}
            </div>

            <div>
              <FieldLabel>Régimen Fiscal *</FieldLabel>
              <select
                name="invoiceRegimen"
                value={formData.invoiceRegimen}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceRegimen")}
              >
                <option value="">Selecciona</option>
                {REGIMENES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.invoiceRegimen && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceRegimen}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <FieldLabel>Uso de CFDI *</FieldLabel>
              <select
                name="invoiceUsoCfdi"
                value={formData.invoiceUsoCfdi}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceUsoCfdi")}
              >
                {USOS_CFDI.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
              {errors.invoiceUsoCfdi && (
                <p className="mt-1 text-xs text-red-500">{errors.invoiceUsoCfdi}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                Recomendado: G03 — Gastos en general.
              </p>
            </div>
          </div>

          {/* Constancia attachment */}
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
