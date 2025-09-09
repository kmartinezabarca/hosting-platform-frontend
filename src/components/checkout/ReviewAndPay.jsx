import React, { useMemo, useState, useEffect } from "react";
import StripeCheckout from "../../components/StripeCheckout";
import PaymentMethodSelector from "../../components/payments/PaymentMethodSelector";
import { REGIMENES, USOS_CFDI } from "../../lib/cfdi";
import { Plus } from "lucide-react";

export default function ReviewAndPay({
  plan,
  billingCycle,
  billingCycles,
  formData,
  totals,          // { subtotal, iva, total }
  payRef,
  onSuccess,
  onError,
  paymentMethods = [],
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  onAddMethod,
  selectedAddOns = [],
}) {

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
      const def = paymentMethods.find((m) => m.is_default) || paymentMethods[0];
      if (def) setSelectedPaymentMethodId(def.stripe_payment_method_id);
    }
  }, [paymentMethods, selectedPaymentMethodId, setSelectedPaymentMethodId]);

  const InfoRow = ({ label, value, fullWidth = false }) => (
    <div className={`py-3 ${fullWidth ? "col-span-2" : ""}`}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-foreground truncate">
        {value || "-"}
      </dd>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-foreground">
        Revisar pedido y pagar
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
          <h3 className="font-semibold text-foreground mb-2">
            Resumen del Servicio
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servicio:</span>
              <span className="text-foreground">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="text-foreground">{formData.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ciclo:</span>
              <span className="text-foreground">
                {billingCycles[billingCycle].name}
              </span>
            </div>
            {formData.domain && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dominio:</span>
                <span className="text-foreground">{formData.domain}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
          <h3 className="font-semibold text-foreground mb-2">Contacto</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="text-foreground">
                {formData.firstName} {formData.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="text-foreground">{formData.phone}</span>
            </div>
          </div>
        </div>

        {formData.requireInvoice && (
          <div className="md:col-span-2 card-premium p-6 rounded-2xl border border-border bg-background">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Datos Fiscales (CFDI 4.0)
            </h3>

            {/* Usamos un grid para una alineación perfecta y responsiva */}
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y divide-border">
              <InfoRow label="RFC" value={formData.invoiceRfc} />

              <InfoRow
                label="Razón Social / Nombre"
                value={formData.invoiceName}
              />

              <InfoRow
                label="Código Postal Fiscal"
                value={formData.invoiceZip}
              />

              <InfoRow
                label="Régimen Fiscal"
                value={
                  REGIMENES.find((r) => r.id === formData.invoiceRegimen)?.label
                }
              />

              <InfoRow
                label="Uso de CFDI"
                value={
                  USOS_CFDI.find((u) => u.id === formData.invoiceUsoCfdi)?.label
                }
                fullWidth={true} // Ocupa todo el ancho si es el último impar
              />

              <InfoRow
                label="Constancia de Situación Fiscal"
                value={formData.invoiceConstanciaName || "No adjunta"}
                fullWidth={true}
              />
            </dl>
          </div>
        )}
      </div>

      {/* Método de pago (nuevo diseño) */}
      <section
        aria-labelledby="payment-method-label"
        className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] p-5"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <label
              id="payment-method-label"
              htmlFor="payment-method"
              className="block text-sm font-semibold text-foreground"
            >
              Método de pago
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Elige una tarjeta guardada o usa una nueva sin guardarla para esta
              compra.
            </p>
          </div>

          {/* CTA secundario (desktop) para agregar/guardar tarjeta */}
          <button
            type="button"
            onClick={onAddMethod}
            className="hidden md:inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            <Plus className="w-4 h-4" />
            Agregar tarjeta
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-2">
            <PaymentMethodSelector
              methods={paymentMethods}
              selectedStripePmId={selectedPaymentMethodId || ""}
              onSelect={(pmId) => {
                setSelectedPaymentMethodId(pmId);
              }}
              onChooseNew={() => {
                setSelectedPaymentMethodId("");
              }}
              onAddSaved={onAddMethod}
            />
          </div>
        </div>
      </section>
      {/* Payment Element (sin botón) + aviso de seguridad */}
      <StripeCheckout
        amount={totals.total}
        currency="mxn"
        payRef={payRef}
        showPayButton={true}
        paymentMethodId={selectedPaymentMethodId}
        serviceData={{
          plan_id: plan.id,
          serviceName: formData.serviceName,
          billingCycle,
          domain: formData.domain,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          requireInvoice: formData.requireInvoice,
          invoice: formData.requireInvoice
            ? {
                rfc: formData.invoiceRfc,
                name: formData.invoiceName,
                zip: formData.invoiceZip,
                regimen: formData.invoiceRegimen,
                usoCfdi: formData.invoiceUsoCfdi,
                constancia: formData.invoiceConstanciaB64
                  ? {
                      filename: formData.invoiceConstanciaName,
                      mime: formData.invoiceConstanciaMime,
                      content_b64: formData.invoiceConstanciaB64,
                    }
                  : null,
              }
            : null,
          autoRenew: formData.autoRenew,
        }}
        onSuccess={onSuccess}
        onError={onError}
        addOns={selectedAddOns}
      />
    </div>
  );
}