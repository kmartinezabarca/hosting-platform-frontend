import React, { useEffect, useState } from "react";
import StripeCheckout from '@presentation/components/features/StripeCheckout';
import PaymentMethodSelector from '@presentation/components/features/payments/PaymentMethodSelector';
import { useFiscalRegimes, useCfdiUses } from "@application/hooks/useFiscal";
import { Plus, CheckCircle2, User, Package, CreditCard, FileText, Gift, Timer, Rocket, ShieldCheck } from "lucide-react";
import { servicesService } from "@infrastructure/services/serviceService";

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

// ─── Free/Trial activation section ────────────────────────────────────────────

function FreeActivationSection({
  plan,
  formData,
  selectedAddOns,
  billingCycle,
  onSuccess,
  onError,
}: {
  plan: any;
  formData: any;
  selectedAddOns: any[];
  billingCycle: string;
  onSuccess: (result: any) => void;
  onError: (msg: string) => void;
}) {
  const [activating, setActivating] = useState(false);

  const isFree   = plan?.is_free || plan?.plan_type === 'free';
  const isTrial  = plan?.is_trial || plan?.plan_type === 'trial';
  const trialDays = plan?.trial_days ?? 0;

  const buildInvoice = () => {
    if (!formData?.requireInvoice) return null;
    if (formData.invoiceProfileUuid) return { fiscal_profile_uuid: formData.invoiceProfileUuid };
    return {
      person_type: formData.invoicePersonType || 'fisica',
      rfc:         formData.invoiceRfc,
      name:        formData.invoiceName,
      zip:         formData.invoiceZip,
      regimen:     formData.invoiceRegimen,
      uso_cfdi:    formData.invoiceUsoCfdi || 'G03',
      constancia:  formData.invoiceConstanciaB64
        ? { filename: formData.invoiceConstanciaName, mime: formData.invoiceConstanciaMime, content_b64: formData.invoiceConstanciaB64 }
        : null,
    };
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      const response: any = await servicesService.contractService({
        plan_id:         plan.id,
        billing_cycle:   billingCycle,
        service_name:    formData.serviceName,
        domain:          formData.domain || undefined,
        egg_id:          formData.selectedEggId ?? undefined,
        add_ons:         selectedAddOns as any,
        additional_options: { auto_renew: false },
        invoice:         buildInvoice(),
        // No payment fields — backend detects free/trial via plan.plan_type
      } as any);

      if (response?.success) {
        onSuccess({ service: response.data });
      } else {
        throw new Error(response?.message || 'Error al activar el servicio.');
      }
    } catch (err: any) {
      console.error('Free activation error:', err);
      onError(err?.response?.data?.message || err?.message || 'Error al activar el servicio.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className={[
        'rounded-2xl border overflow-hidden',
        isFree
          ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
          : 'border-violet-500/25 bg-violet-500/[0.06]',
      ].join(' ')}>
        <div className={[
          'flex items-center gap-3 px-5 py-4 border-b',
          isFree
            ? 'border-emerald-500/15 bg-emerald-500/[0.06]'
            : 'border-violet-500/15 bg-violet-500/[0.06]',
        ].join(' ')}>
          {isFree
            ? <Gift className="w-5 h-5 text-emerald-500 shrink-0" />
            : <Timer className="w-5 h-5 text-violet-500 shrink-0" />
          }
          <div>
            <p className={[
              'text-sm font-bold',
              isFree ? 'text-emerald-700 dark:text-emerald-300' : 'text-violet-700 dark:text-violet-300',
            ].join(' ')}>
              {isFree ? 'Plan Gratuito' : `Prueba gratuita · ${trialDays} días`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isFree
                ? 'No se requiere tarjeta de crédito ni ningún pago.'
                : `Sin cargos durante ${trialDays} días. Cancela en cualquier momento antes de que termine.`
              }
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Sin cargos ocultos ni compromisos</span>
          </div>
          {isTrial && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Se te notificará antes de que el período de prueba termine</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Acceso inmediato tras la activación</span>
          </div>
        </div>
      </div>

      {/* Activate button */}
      <button
        type="button"
        onClick={handleActivate}
        disabled={activating}
        className={[
          'w-full rounded-xl px-5 py-3.5 font-semibold text-white transition inline-flex items-center justify-center gap-2',
          isFree
            ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
            : 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400',
          'disabled:opacity-70',
        ].join(' ')}
      >
        {activating ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Activando servicio...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            {isFree ? 'Activar gratis ahora' : `Iniciar ${trialDays} días de prueba`}
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ReviewAndPay({
  plan,
  billingCycle,
  billingCycles,
  formData,
  totals,
  payRef,
  onSuccess,
  onError,
  paymentMethods = [] as any[],
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  onAddMethod,
  selectedAddOns = [],
  isNoCharge = false,
}) {
  // Catálogos SAT para mostrar nombres en la revisión
  const { data: regimes = [] } = useFiscalRegimes();
  const { data: cfdiUses = [] } = useCfdiUses();

  /** El API puede usar name | description | label | nombre */
  const getItemName = (item) =>
    item?.name ?? item?.description ?? item?.label ?? item?.nombre ?? '';

  const regimeObj = regimes.find(r => r.code === formData.invoiceRegimen);
  const cfdiUseObj = cfdiUses.find(u => u.code === formData.invoiceUsoCfdi);
  const regimeName = regimeObj ? getItemName(regimeObj) : (formData.invoiceRegimen ?? '—');
  const cfdiUseName = cfdiUseObj ? getItemName(cfdiUseObj) : (formData.invoiceUsoCfdi ?? '—');

  useEffect(() => {
    if (!isNoCharge && paymentMethods.length > 0 && !selectedPaymentMethodId) {
      const def = paymentMethods.find((m) => m.is_default) || paymentMethods[0];
      if (def) setSelectedPaymentMethodId(def.stripe_payment_method_id);
    }
  }, [paymentMethods, selectedPaymentMethodId, setSelectedPaymentMethodId, isNoCharge]);

  const isFree  = plan?.is_free || plan?.plan_type === 'free';
  const isTrial = plan?.is_trial || plan?.plan_type === 'trial';

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {isNoCharge ? 'Revisar y confirmar' : 'Revisar y confirmar'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isNoCharge
            ? isFree
              ? 'Confirma los datos de tu servicio para activarlo gratis.'
              : `Confirma los datos para iniciar tu prueba gratuita de ${plan?.trial_days ?? ''} días.`
            : 'Verifica los datos antes de procesar el pago.'
          }
        </p>
      </div>

      {/* Review cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewCard icon={Package} label="Servicio">
          <Row label="Plan" value={plan.name} />
          <Row label="Nombre" value={formData.serviceName} />
          {!isNoCharge && <Row label="Ciclo" value={billingCycles[billingCycle]?.name} />}
          {formData.domain && <Row label="Dominio" value={formData.domain} />}
          {isNoCharge && (
            <Row
              label="Tipo"
              value={isFree ? 'Gratuito' : `Trial · ${plan?.trial_days ?? 0} días`}
            />
          )}
        </ReviewCard>

        <ReviewCard icon={User} label="Contacto">
          <Row label="Nombre" value={`${formData.firstName} ${formData.lastName}`} />
          <Row label="Email" value={formData.email} />
          <Row label="Teléfono" value={formData.phone} />
        </ReviewCard>

        {formData.requireInvoice && (
          <div className="md:col-span-2">
            <ReviewCard icon={FileText} label="Datos Fiscales · CFDI 4.0">
              {formData.invoiceProfileUuid ? (
                /* Saved profile selected */
                <div className="py-1">
                  <Row label="RFC" value={formData.invoiceRfc} />
                  <Row label="Razón Social" value={formData.invoiceName} />
                  <Row label="C.P. Fiscal" value={formData.invoiceZip} />
                  <Row label="Régimen" value={`${formData.invoiceRegimen} – ${regimeName}`} />
                  <Row label="Uso CFDI" value={`${formData.invoiceUsoCfdi} – ${cfdiUseName}`} />
                  <div className="flex justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0">
                    <span className="text-muted-foreground shrink-0">Origen</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      ★ Perfil guardado
                    </span>
                  </div>
                </div>
              ) : (
                /* Manual entry */
                <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-black/5 dark:md:divide-white/5">
                  <div className="md:pr-4 space-y-0">
                    <Row label="RFC" value={formData.invoiceRfc} />
                    <Row label="Razón Social" value={formData.invoiceName} />
                    <Row label="C.P. Fiscal" value={formData.invoiceZip} />
                  </div>
                  <div className="md:pl-4 space-y-0">
                    <Row label="Régimen" value={`${formData.invoiceRegimen} – ${regimeName}`} />
                    <Row label="Uso CFDI" value={`${formData.invoiceUsoCfdi} – ${cfdiUseName}`} />
                    {formData.invoiceConstanciaName && (
                      <Row label="Constancia" value={formData.invoiceConstanciaName} />
                    )}
                  </div>
                </div>
              )}
            </ReviewCard>
          </div>
        )}
      </div>

      {/* Payment section — paid plans only */}
      {isNoCharge ? (
        <FreeActivationSection
          plan={plan}
          formData={formData}
          selectedAddOns={selectedAddOns}
          billingCycle={billingCycle}
          onSuccess={onSuccess}
          onError={onError}
        />
      ) : (
        <>
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

          {/* Stripe Checkout */}
          <StripeCheckout
            amount={totals.total}
            currency="mxn"
            payRef={payRef}
            showPayButton
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
              egg_id: formData.selectedEggId ?? null,
              requireInvoice: formData.requireInvoice,
              invoice: (formData.requireInvoice
                ? formData.invoiceProfileUuid
                  ? { fiscal_profile_uuid: formData.invoiceProfileUuid }
                  : {
                      person_type: formData.invoicePersonType || "fisica",
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
                : null) as Record<string, unknown> | undefined,
              autoRenew: formData.autoRenew,
            }}
            onSuccess={onSuccess}
            onError={onError}
            addOns={selectedAddOns}
          />
        </>
      )}
    </div>
  );
}
