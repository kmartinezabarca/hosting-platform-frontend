import React from "react";
import { Check } from "lucide-react";

export default function OrderSummary({
  plan,
  billingCycle,
  billingCycles,
  formData,
  setFormData,
  totals,          // { subtotal, iva, total }
  step,
  onNext,
  onBack,
  payRef,
}) {
  return (
    <aside className="sticky top-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] p-6">
      <h3 className="text-lg font-semibold text-foreground mb-5">Resumen del Pedido</h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{plan.name}</span>
          <span className="text-foreground font-medium">
            ${Number(plan.price[billingCycle]).toFixed(2)}
          </span>
        </div>

        {formData.backupService && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Backup Premium</span>
            <span className="text-foreground font-medium">$4.99</span>
          </div>
        )}
        {formData.prioritySupport && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Soporte Prioritario</span>
            <span className="text-foreground font-medium">$9.99</span>
          </div>
        )}

        {billingCycles[billingCycle].discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Descuento ({billingCycles[billingCycle].discount}%)</span>
            <span>
              -${((plan.price[billingCycle] * billingCycles[billingCycle].discount) / 100).toFixed(2)}
            </span>
          </div>
        )}

        <hr className="border-black/10 dark:border-white/10 my-2" />

        {/* Desglose con IVA */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IVA 16%</span>
          <span className="text-foreground">${totals.iva.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">${totals.total.toFixed(2)}</span>
        </div>
        <p className="text-muted-foreground text-sm">
          /{billingCycle === "monthly" ? "mes" : billingCycle === "quarterly" ? "trimestre" : "año"}
        </p>
      </div>

      {/* Auto-renovación */}
      <label className="mt-5 flex items-start gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] cursor-pointer">
        <input
          type="checkbox"
          checked={formData.autoRenew}
          onChange={(e) => setFormData((p) => ({ ...p, autoRenew: e.target.checked }))}
          className="mt-1.5 accent-foreground"
        />
        <div>
          <h4 className="font-medium text-foreground">Renovación automática</h4>
          <p className="text-muted-foreground text-sm">
            Si activas esta opción, se cargará automáticamente el total ({`$${totals.total.toFixed(2)} MXN`}) en cada ciclo.
            Puedes desactivarla en cualquier momento desde tu panel.
          </p>
        </div>
      </label>

      <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
        <h4 className="font-semibold text-foreground mb-3">Incluye:</h4>
        <div className="space-y-2">
          {plan.features.slice(0, 4).map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-muted-foreground">{f}</span>
            </div>
          ))}
          {plan.features.length > 4 && (
            <p className="text-muted-foreground text-sm">
              +{plan.features.length - 4} características más
            </p>
          )}
        </div>
      </div>

      {/* Único bloque de botones */}
      {step === 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="w-full mt-6 rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition"
        >
          Continuar al Pago
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-xl px-5 py-3 border border-black/10 dark:border-white/10 bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            Volver
          </button>
          {/* <button
            type="button"
            onClick={() => {
              if (payRef?.current) payRef.current();
              else document
                .querySelector("#stripe-payment-element")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="w-full rounded-xl px-5 py-3 bg-foreground text-background font-semibold hover:opacity-90 transition"
          >
            {`Pagar $${totals.total.toFixed(2)} MXN`}
          </button> */}
        </div>
      )}
    </aside>
  );
}
