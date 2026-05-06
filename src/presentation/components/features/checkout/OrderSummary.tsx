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
}: OrderSummaryProps) {
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
    <aside className="sticky top-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] overflow-hidden">

      {/* Plan header */}
      <div className="px-5 py-4 border-b border-black/8 dark:border-white/8 bg-foreground/[0.025] dark:bg-white/[0.03]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground/10 dark:bg-white/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground leading-tight truncate">
              {plan.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-foreground/10 text-foreground">
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
              <span className="text-muted-foreground leading-snug">{item.name}</span>
              <span className="text-foreground font-medium shrink-0">
                ${parseFloat(item.price)?.toFixed(2) ?? "0.00"}
              </span>
            </div>
          ))}
        </div>

        {/* Totals breakdown */}
        <div className="border-t border-black/8 dark:border-white/8 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA 16%</span>
            <span className="text-foreground">${totals.iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-base font-bold text-foreground">Total</span>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">
                ${totals.total.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                MXN/{cycle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Auto-renewal toggle */}
        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-black/8 dark:border-white/8 bg-black/[0.015] dark:bg-white/[0.02] cursor-pointer hover:border-foreground/20 transition-colors">
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
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              ${totals.total.toFixed(2)} MXN cada {cycle.label}
            </p>
          </div>
        </label>

        {/* Plan features */}
        {plan.features?.length > 0 && (
          <div className="border-t border-black/8 dark:border-white/8 pt-3 space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Incluye
            </p>
            <div className="space-y-1.5">
              {plan.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground leading-snug">
                    {typeof f === "string" ? f : f.feature}
                  </span>
                </div>
              ))}
              {plan.features.length > 4 && (
                <p className="text-xs text-muted-foreground pl-5">
                  +{plan.features.length - 4} más incluidas
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        {step === 1 ? (
          <button
            type="button"
            onClick={onNext}
            className="w-full mt-1 rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
          >
            Continuar al Pago
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-1 rounded-xl px-5 py-3 border border-black/10 dark:border-white/10 text-foreground hover:bg-black/5 dark:hover:bg-white/8 transition font-medium inline-flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
        )}
      </div>
    </aside>
  );
}
