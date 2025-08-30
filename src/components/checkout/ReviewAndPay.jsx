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

  const [useNewCard, setUseNewCard] = useState(paymentMethods.length === 0);

  useEffect(() => {
    if (!useNewCard && paymentMethods.length > 0 && !selectedPaymentMethodId) {
      const def = paymentMethods.find((m) => m.is_default) || paymentMethods[0];
      if (def) setSelectedPaymentMethodId(def.stripe_payment_method_id);
    }
  }, [useNewCard, paymentMethods, selectedPaymentMethodId, setSelectedPaymentMethodId]);
  
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
          <div className="md:col-span-2 card-premium p-5 rounded-2xl border border-black/10 dark:border-white/10">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Datos fiscales (CFDI 4.0)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">RFC:</span>
                <span className="text-foreground font-medium">
                  {formData.invoiceRfc}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Razón social / Nombre:
                </span>
                <span className="text-foreground font-medium">
                  {formData.invoiceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CP fiscal:</span>
                <span className="text-foreground font-medium">
                  {formData.invoiceZip}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Régimen:</span>
                <span className="text-foreground font-medium">
                  {REGIMENES.find((r) => r.id === formData.invoiceRegimen)
                    ?.label || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uso CFDI:</span>
                <span className="text-foreground font-medium">
                  {
                    USOS_CFDI.find((u) => u.id === formData.invoiceUsoCfdi)
                      ?.label
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Constancia:</span>
                <span className="text-foreground font-medium">
                  {formData.invoiceConstanciaName
                    ? formData.invoiceConstanciaName
                    : "No adjunta"}
                </span>
              </div>
            </div>
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
                setUseNewCard(false);
                setSelectedPaymentMethodId(pmId);
              }}
              onChooseNew={() => {
                setUseNewCard(true);
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