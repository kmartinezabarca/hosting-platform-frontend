import React from "react";
import { Check } from "lucide-react";

export default function StepDot({ done, current, number, title }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "grid place-items-center w-9 h-9 rounded-full text-sm font-semibold transition-colors",
          done
            ? "bg-primary text-primary-foreground"
            : current
            ? "bg-foreground/90 text-background"
            : "bg-black/10 text-foreground/70 dark:bg-white/10 dark:text-white/70",
        ].join(" ")}
        aria-current={current ? "step" : undefined}
      >
        {done ? <Check className="w-4 h-4" /> : number}
      </div>
      <span
        className={[
          "text-sm font-medium",
          done || current ? "text-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        {title}
      </span>
    </div>
  );
}
