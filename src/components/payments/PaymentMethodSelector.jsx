import React, { useMemo } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import { PaymentMethodLogo } from "../invoices/PaymentMethodLogos";
/**
 * methods: [{
 *   stripe_payment_method_id: string,
 *   brand: string, last4: string,
 *   exp_month: number, exp_year: number,
 *   is_default: boolean, name?: string
 * }]
 */
export default function PaymentMethodSelect({
  methods = [],
  selectedStripePmId = "",
  onSelect,        // (pmId: string) => void
  onChooseNew,     // () => void
  onAddSaved,      // () => void  (abrir modal)
  disabled = false,
  size = "md",
}) {
  const selected = useMemo(
    () => methods.find(m => m.stripe_payment_method_id === selectedStripePmId) || null,
    [methods, selectedStripePmId]
  );

  const brandLabel = (b) => {
    const x = (b || "CARD").toLowerCase();
    if (x === "amex") return "AMEX";
    if (x === "mastercard") return "MASTERCARD";
    if (x === "nu" || x === "nubank") return "NU";
    if (x === "visa") return "VISA";
    return (b || "CARD").toUpperCase();
  };

  const sizing = size === "sm"
    ? { logo: "w-6 h-6", btnPad: "px-3 py-2", line1: "text-sm", line2: "text-[11px]" }
    : { logo: "w-8 h-6", btnPad: "px-4 py-3", line1: "text-sm", line2: "text-xs" };

  const SelectedView = () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center rounded-md bg-black/5 dark:bg-white/10">
        <PaymentMethodLogo brand={selected?.brand} className={sizing.logo} cardName="CARD" />
      </div>
      <div className="text-left">
        <div className="text-sm font-medium text-foreground">
          {selected
            ? `${brandLabel(selected.brand)} •••• ${selected.last4}`
            : "Selecciona un método"}
          {/* {selected?.is_default && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Predeterminado
            </span>
          )} */}
        </div>
        <div className="text-xs text-muted-foreground">
          {selected ? `Vence ${String(selected.exp_month).padStart(2, "0")}/${selected.exp_year}` : "—"}
        </div>
      </div>
    </div>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-background text-foreground px-4 py-3 hover:border-foreground/20 disabled:opacity-50"
        >
          <SelectedView />
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="z-50 min-w-[320px] rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1115] p-1 shadow-xl"
        >
          {/* Lista de guardadas */}
          {methods.length > 0 ? (
            methods.map((m) => (
              <DropdownMenu.Item
                key={m.stripe_payment_method_id}
                onSelect={() => onSelect?.(m.stripe_payment_method_id)}
                className={[
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 outline-none cursor-pointer",
                  "hover:bg-black/[0.06] dark:hover:bg-white/[0.06]",
                  "focus:bg-black/[0.06] dark:focus:bg-white/[0.06]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-black/5 dark:bg-white/10">
                     <PaymentMethodLogo brand={m.brand} className={sizing.logo} cardName="CARD" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-foreground">
                      {brandLabel(m.brand)} •••• {m.last4}
                      {m.is_default && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                          Predeterminado
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Vence {String(m.exp_month).padStart(2, "0")}/{m.exp_year}
                    </div>
                  </div>
                </div>
              </DropdownMenu.Item>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No tienes métodos guardados.
            </div>
          )}

          <DropdownMenu.Separator className="h-px my-1 bg-black/10 dark:bg-white/10" />

          {/* Acciones */}
          <DropdownMenu.Item
             onSelect={() => { onChooseNew?.(); }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
          >
            Usar nueva tarjeta
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-white dark:fill-[#0f1115]" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
