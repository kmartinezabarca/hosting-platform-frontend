import React, { useCallback } from "react";

export default function BillingCycleSwitch({
  value,
  onChange,
  cycles,
  className = "",
  ariaLabel = "Ciclo de facturación",
}) {
  const goRelative = useCallback(
    (dir) => {
      const idx = cycles.findIndex((c) => c.id === value);
      if (idx === -1) return;
      const next = (idx + dir + cycles.length) % cycles.length;
      onChange(cycles[next].id);
    },
    [cycles, value, onChange]
  );

  const onKeyDown = useCallback(
    (e, id) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(id);
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goRelative(1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goRelative(-1);
      }
    },
    [goRelative, onChange]
  );

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center gap-1 p-1 rounded-full",
        "bg-white dark:bg-[#0b0f14]",
        "ring-1 ring-black/10 dark:ring-white/10 shadow-sm",
        className,
      ].join(" ")}
    >
      {cycles.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(c.id)}
            onKeyDown={(e) => onKeyDown(e, c.id)}
            className={[
              "relative px-5 py-2 rounded-full text-sm font-medium transition",
              active
                ? "bg-[#222] text-white dark:bg-white dark:text-[#0b0f14] shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-black/20 dark:focus-visible:ring-white/30",
            ].join(" ")}
          >
            {c.name}
            {c.discount > 0 && (
              <span
                className={[
                  "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  // mint chip (light) / mint translucido (dark)
                  "bg-emerald-200/70 text-emerald-800 ring-1 ring-emerald-300",
                  "dark:bg-emerald-400/20 dark:text-emerald-200 dark:ring-emerald-400/40",
                ].join(" ")}
              >
                -{c.discount}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}