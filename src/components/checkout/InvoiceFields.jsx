import React from "react";
import { Paperclip, X } from "lucide-react";
import { REGIMENES, USOS_CFDI } from "../../lib/cfdi";
import { useInputClass } from "./useInputStyles";

export default function InvoiceFields({
  formData, errors, touched, onChange, onBlur, clearConstancia
}) {
  const inputClass = (n) => useInputClass(touched, errors, n, true);

  return (
    <>
      <label className="flex items-start gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] cursor-pointer">
        <input
          type="checkbox"
          name="requireInvoice"
          checked={formData.requireInvoice}
          onChange={onChange}
          className="mt-1.5 accent-foreground"
        />
        <div>
          <h4 className="font-medium text-foreground">¿Requieres factura CFDI 4.0?</h4>
          <p className="text-muted-foreground text-sm">
            Si activas esta opción te pediremos los datos fiscales del SAT (la constancia es opcional).
          </p>
        </div>
      </label>

      {formData.requireInvoice && (
        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 space-y-5 bg-black/[0.02] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">RFC *</label>
              <input
                type="text"
                name="invoiceRfc"
                value={formData.invoiceRfc}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceRfc")}
                placeholder="XAXX010101000"
              />
              {errors.invoiceRfc && <p className="mt-1 text-sm text-red-600">{errors.invoiceRfc}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Razón Social / Nombre *</label>
              <input
                type="text"
                name="invoiceName"
                value={formData.invoiceName}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceName")}
                placeholder="Mi Empresa S.A. de C.V."
              />
              {errors.invoiceName && <p className="mt-1 text-sm text-red-600">{errors.invoiceName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Código Postal (domicilio fiscal) *</label>
              <input
                type="text"
                name="invoiceZip"
                value={formData.invoiceZip}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceZip")}
                placeholder="00000"
              />
              {errors.invoiceZip && <p className="mt-1 text-sm text-red-600">{errors.invoiceZip}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Régimen Fiscal *</label>
              <select
                name="invoiceRegimen"
                value={formData.invoiceRegimen}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceRegimen")}
              >
                <option value="">Selecciona</option>
                {REGIMENES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              {errors.invoiceRegimen && <p className="mt-1 text-sm text-red-600">{errors.invoiceRegimen}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Uso de CFDI *</label>
              <select
                name="invoiceUsoCfdi"
                value={formData.invoiceUsoCfdi}
                onChange={onChange}
                onBlur={onBlur}
                className={inputClass("invoiceUsoCfdi")}
              >
                {USOS_CFDI.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
              {errors.invoiceUsoCfdi && <p className="mt-1 text-sm text-red-600">{errors.invoiceUsoCfdi}</p>}
              <p className="text-xs text-muted-foreground mt-1">Recomendado: G03 - Gastos en general (si aplica).</p>
            </div>
          </div>

          {/* Carga opcional de constancia */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Constancia de situación fiscal (opcional)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Adjuntar archivo</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  name="invoiceConstancia"
                  onChange={onChange}
                  className="hidden"
                />
              </label>

              {formData.invoiceConstanciaName && (
                <span className="inline-flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 bg-black/5 dark:bg-white/10">
                  {formData.invoiceConstanciaName}
                  <button
                    type="button"
                    onClick={clearConstancia}
                    className="hover:opacity-75"
                    aria-label="Quitar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos permitidos: PDF/JPG/PNG (opcional).
            </p>
          </div>
        </div>
      )}
    </>
  );
}
