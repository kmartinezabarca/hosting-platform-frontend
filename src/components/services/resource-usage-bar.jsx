import React from "react";
import clsx from "clsx";

const ResourceUsageBar = ({ name, usage, color, barColor }) => {
  const value = Math.min(100, Math.max(0, Number(usage) || 0));
  const id = `usage-${name?.toString().toLowerCase().replace(/\s+/g, "-")}`;
  const tone =
    /(success)/.test(`${color} ${barColor}`) ? "success" :
    /(warning)/.test(`${color} ${barColor}`) ? "warning" :
    /(error|danger|rose|red)/.test(`${color} ${barColor}`) ? "error" :
    "success";

  const TEXT = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    error:   "text-rose-500",
  }[tone];

  const BAR = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error:   "bg-rose-500",
  }[tone];

  return (
    <div role="group" aria-labelledby={id}>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span id={id} className="font-medium text-muted-foreground">
          {name}
        </span>
        <span className={clsx("font-semibold tabular-nums", TEXT)}>
          {value}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-labelledby={id}
        title={`${name}: ${value}%`}
        className="
          relative w-full h-1.5 overflow-hidden rounded-full
          bg-black/10 dark:bg-white/10
          ring-1 ring-black/5 dark:ring-white/5
        "
      >
        <div
          className={clsx("h-full rounded-full transition-all duration-500 ease-out", BAR)}
          style={{ width: `${value}%` }}
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
        />
      </div>
    </div>
  );
};

export default ResourceUsageBar;

