import React from "react";
import StepDot from "./StepDot";

export default function Stepper({ step, showInvoice }) {
  const steps = [
    { number: 1, title: "Información" },
    { number: 2, title: showInvoice ? "Revisión y Pago" : "Pago" },
  ];
  return (
    <div className="flex items-center justify-center gap-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.number}>
          <StepDot
            done={step > s.number}
            current={step === s.number}
            number={s.number}
            title={s.title}
          />
          {i < steps.length - 1 && (
            <div
              className={`h-px w-20 ${
                step > s.number ? "bg-foreground/80" : "bg-black/10 dark:bg-white/10"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
