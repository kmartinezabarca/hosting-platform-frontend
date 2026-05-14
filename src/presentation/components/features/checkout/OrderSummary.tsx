import React from "react";
import { Check, Zap, RefreshCw, ArrowRight, ChevronLeft } from "lucide-react";

const CYCLE_LABELS = {
  monthly:     { label: "mes",       badge: "Mensual",     savings: null   },
  quarterly:   { label: "trimestre", badge: "Trimestral",  savings: "10%"  },
  semi_annually: { label: "semestre", badge: "Semestral",  savings: "15%"  },
  annually:    { label: "año",       badge: "Anual",       savings: "20%"  },
};

interface OrderSummaryProps {
  plan: any;
  billingCycle: string;
  billingCycles: Record<string, any>;
  formData: any;
  setFormData: (data: any) => void;
  totals: any;
  step: number;
  onNext: () => void;
  onBack: () => void;
  payRef: React.RefObject<any>;
  selectedAddOns?: (string | number)[];
  addons?: any[];
  isGameServer?: boolean;
  isNoCharge?: boolean;
}

export default function OrderSummary({
  plan,
  billingCycle,
  billingCycles,
  formData,
  setFormData,
  totals,
  step,
  onNext,
  onBack,
  payRef,
  selectedAddOns = [],
  addons = [],
  isGameServer = false,
  isNoCharge = false,
}: OrderSummaryProps) {
  const isFree  = plan?.is_free  || plan?.plan_type === 'free';
  const isTrial = plan?.is_trial || plan?.plan_type === 'trial';
  const items: { key: string; name: string; price: any }[] = [];
  if (plan) {
    const price = plan.price?.[billingCycle] ?? 0;
    items.push({
      key: `plan-${plan.id}-${billingCycle}`,
      name: `${plan.name} · ${billingCycles[billingCycle]?.name || billingCycle}`,
      price,
    });
  }
  selectedAddOns.forEach((id) => {
    const add = addons.find((a) => a.uuid === id || a.id === id);
    if (add) items.push({ key: `addon-${id}`, name: add.name, price: add.price });
  });

  const cycle = CYCLE_LABELS[billingCycle] || CYCLE_LABELS.monthly;

  return (
    <aside className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#101820]">

      {/* Plan header */}
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground leading-tight truncate">
              {plan.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {cycle.badge}
                </span>
              {cycle.savings && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  −{cycle.savings}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Line items */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex justify-between items-start gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-300 leading-snug">{item.name}</span>
              <span className="text-foreground font-medium shrink-0">
                {isNoCharge ? '$0.00' : `$${parseFloat(item.price)?.toFixed(2) ?? "0.00"}`}
              </span>
            </div>
          ))}
        </div>

        {/* Totals breakdown */}
        {isNoCharge ? (
          <div className="border-t border-slate-200 pt-3 dark:border-white/10">
            <div className="flex justify-between items-end">
              <span className="text-base font-bold text-foreground">Total</span>
              <div className="text-right">
                <span className="text-3xl font-bold tracking-tight text-foreground">$0.00</span>
                <span className={[
                  'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  isFree
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                ].join(' ')}>
                  {isFree ? 'Gratis' : `Trial ${plan?.trial_days ?? ''}d`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-3 space-y-1.5 dark:border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
              <span className="text-foreground">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">IVA 16%</span>
              <span className="text-foreground">${totals.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-base font-bold text-foreground">Total</span>
              <div className="text-right">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  ${totals.total.toFixed(2)}
                </span>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                  MXN/{cycle.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-renewal toggle — hidden for free/trial plans */}
        {!isNoCharge && (
        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20">
          <div className="shrink-0 relative">
            <div
              className={[
                "w-9 h-5 rounded-full transition-colors duration-200",
                formData.autoRenew ? "bg-foreground" : "bg-black/20 dark:bg-white/20",
              ].join(" ")}
            >
              <div
                className={[
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  formData.autoRenew ? "translate-x-4" : "translate-x-0.5",
                ].join(" ")}
              />
            </div>
            <input
              type="checkbox"
              checked={formData.autoRenew}
              onChange={(e) =>
                setFormData((p) => ({ ...p, autoRenew: e.target.checked }))
              }
              className="sr-only"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              Renovación automática
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
              ${totals.total.toFixed(2)} MXN cada {cycle.label}
            </p>
          </div>
        </label>
        )}

        {/* Plan features */}
        {plan.features?.length > 0 && (
          <div className="border-t border-slate-200 pt-3 space-y-2 dark:border-white/10">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Incluye
            </p>
            <div className="space-y-1.5">
              {plan.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-600 leading-snug dark:text-slate-300">
                    {typeof f === "string" ? f : f.feature}
                  </span>
                </div>
              ))}
              {plan.features.length > 4 && (
                <p className="text-xs text-slate-500 pl-5 dark:text-slate-400">
                  +{plan.features.length - 4} más incluidas
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        {step < (isGameServer ? 3 : 2) ? (
  <button
    type="button"
    onClick={onNext}
    className="w-full mt-1 rounded-xl px-5 py-3 bg-[#222] text-white font-semibold hover:brightness-110 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 dark:bg-white dark:text-[#101214]"
  >
    {step === (isGameServer ? 2 : 1)
      ? (isNoCharge ? 'Revisar y confirmar' : 'Continuar al Pago')
      : 'Continuar'}
    <ArrowRight className="w-4 h-4" />
  </button>
) : (
  <button
    type="button"
    onClick={onBack}
    className="w-full mt-1 rounded-xl px-5 py-3 border border-slate-200 dark:border-white/10 text-foreground hover:bg-slate-50 dark:hover:bg-white/10 transition font-medium inline-flex items-center justify-center gap-2"
  >
    <ChevronLeft className="w-4 h-4" />
    Volver
  </button>
)}
      </div>
    </aside>
  );
}
