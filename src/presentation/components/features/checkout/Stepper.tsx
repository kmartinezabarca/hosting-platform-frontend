import React from "react";
import { Check, Gamepad2, ClipboardList, CreditCard } from "lucide-react";

export default function Stepper({ step, showInvoice }) {
  const steps = [
    { n: 1, Icon: Gamepad2, label: "Selecciona Juego", sub: "Elige tu juego favorito" },
    { n: 2, Icon: ClipboardList, label: "Información", sub: "Datos del servicio" },
    { n: 3, Icon: CreditCard, label: showInvoice ? "Revisión y Pago" : "Pago", sub: "Confirma y paga" },
  ];

  return (
    <div className="flex items-start w-full min-w-[520px] lg:min-w-[600px]">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                  done
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/40 ring-4 ring-emerald-500/15"
                    : active
                    ? "bg-foreground text-background shadow-md ring-4 ring-foreground/10"
                    : "bg-black/8 dark:bg-white/8 text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="w-4 h-4" /> : <s.Icon className="w-4 h-4" />}
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold leading-tight ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className="flex-1 mt-4 px-4">
                <div className="h-px w-full bg-slate-200 dark:bg-white/10 relative rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                      step > s.n ? "w-full bg-emerald-500" : "w-0"
                    }`}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
