import React from "react";
import { Check, Plus, Puzzle } from "lucide-react";

function SectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md bg-foreground/10 dark:bg-white/10 flex items-center justify-center shrink-0">
        <Puzzle className="w-3.5 h-3.5 text-foreground" />
      </div>
      <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
        Servicios Adicionales
      </h3>
    </div>
  );
}

interface AddonItem {
  uuid?: string;
  id?: string | number;
  name: string;
  description?: string;
  price: number | string;
}

export default function Addons({
  addons = [],
  selectedAddOns = [],
  onChange,
}: {
  addons?: AddonItem[];
  selectedAddOns?: (string | number)[];
  onChange?: (selected: (string | number)[]) => void;
}) {
  if (addons.length === 0) return null;

  const toggleAddOn = (id) => {
    if (!onChange) return;
    onChange(
      selectedAddOns.includes(id)
        ? selectedAddOns.filter((item) => item !== id)
        : [...selectedAddOns, id]
    );
  };

  return (
    <div>
      <SectionHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addons.map((addon) => {
          const id = (addon.uuid || addon.id) as string;
          const selected = selectedAddOns.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleAddOn(id)}
              className={[
                "relative text-left rounded-2xl p-4 border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                selected
                  ? "border-foreground bg-foreground/[0.04] dark:bg-foreground/[0.06] shadow-sm"
                  : "border-black/10 dark:border-white/10 hover:border-foreground/25 dark:hover:border-white/25",
              ].join(" ")}
            >
              {/* Check / plus indicator */}
              <div
                className={[
                  "absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                  selected
                    ? "bg-foreground text-background scale-100"
                    : "bg-black/8 dark:bg-white/8 scale-90",
                ].join(" ")}
              >
                {selected ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3 text-muted-foreground" />
                )}
              </div>

              <p className="font-semibold text-sm text-foreground pr-8 leading-snug">
                {addon.name}
              </p>
              {addon.description && (
                <p className="text-xs text-muted-foreground mt-1 pr-8 leading-relaxed">
                  {addon.description}
                </p>
              )}
              <p className="text-sm font-bold text-foreground mt-2.5">
                +${Number(addon.price)?.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground"> /ciclo</span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
