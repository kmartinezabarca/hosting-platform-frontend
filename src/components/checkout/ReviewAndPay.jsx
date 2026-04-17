import React, { useEffect } from "react";
import StripeCheckout from "../../components/StripeCheckout";
import PaymentMethodSelector from "../../components/payments/PaymentMethodSelector";
import { REGIMENES, USOS_CFDI } from "../../lib/cfdi";
import { Plus, CheckCircle2, User, Package, CreditCard, FileText } from "lucide-react";

function ReviewCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-foreground/[0.025] dark:bg-white/[0.025] border-b border-black/8 dark:border-white/8">
        <div className="w-6 h-6 rounded-md bg-foreground/10 dark:bg-white/10 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-foreground" />
        </div>
        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex-1">
          {label}
        </h3>
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      </div>
      {/* Card body */}
      <div className="px-4 py-3 divide-y divide-black/5 dark:divide-white/5">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right truncate max-w-[60%]">
        {value || "—"}
      </span>
    </div>
  );
}

export default function ReviewAndPay({
  plan,
  billingCycle,
  billingCycles,
  formData,
  totals,
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

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Revisar y confirmar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Verifica los datos antes de procesar el pago.
        </p>
      </div>

      {/* Review cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewCard icon={Package} label="Servicio">
          <Row label="Plan" value={plan.name} />
          <Row label="Nombre" value={formData.serviceName} />
          <Row label="Ciclo" value={billingCycles[billingCycle]?.name} />
          {formData.domain && <Row label="Dominio" value={formData.domain} />}
        </ReviewCard>

        <ReviewCard icon={User} label="Contacto">
          <Row label="Nombre" value={`${formData.firstName} ${formData.lastName}`} />
          <Row label="Email" value={formData.email} />
          <Row label="Teléfono" value={formData.phone} />
        </ReviewCard>

        {formData.requireInvoice && (
          <div className="md:col-span-2">
            <ReviewCard icon={FileText} label="Datos Fiscales · CFDI 4.0">
              <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-black/5 dark:md:divide-white/5">
                <div className="md:pr-4 space-y-0">
                  <Row label="RFC" value={formData.invoiceRfc} />
                  <Row label="Razón Social" value={formData.invoiceName} />
                  <Row label="C.P. Fiscal" value={formData.invoiceZip} />
                </div>
                <div className="md:pl-4 space-y-0">
                  <Row
                    label="Régimen"
                    value={
                      REGIMENES.find((r) => r.id === formData.invoiceRegimen)?.label
                    }
                  />
                  <Row
                    label="Uso CFDI"
                    value={
                      USOS_CFDI.find((u) => u.id === formData.invoiceUsoCfdi)?.label
                    }
                  />
                  {formData.invoiceConstanciaName && (
                    <Row label="Constancia" value={formData.invoiceConstanciaName} />
                  )}
                </div>
              </div>
            </ReviewCard>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-5 py-4 bg-foreground/[0.025] dark:bg-white/[0.025] border-b border-black/8 dark:border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground/10 dark:bg-white/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-widest">
                Método de Pago
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tarjeta guardada o ingresa una nueva
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddMethod}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva tarjeta
          </button>
        </div>

        <div className="px-5 py-4">
          <PaymentMethodSelector
            methods={paymentMethods}
            selectedStripePmId={selectedPaymentMethodId || ""}
            onSelect={(pmId) => setSelectedPaymentMethodId(pmId)}
            onChooseNew={() => setSelectedPaymentMethodId("")}
            onAddSaved={onAddMethod}
          />
        </div>
      </div>

      {/* Stripe Checkout — logic untouched */}
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
