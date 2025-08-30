import React from "react";

export default function Addons({ addons = [], selectedAddOns = [], onChange }) {
  // toggles a given add-on id on/off
  const toggleAddOn = (id) => {
    if (!onChange) return;
    if (selectedAddOns.includes(id)) {
      onChange(selectedAddOns.filter((item) => item !== id));
    } else {
      onChange([...selectedAddOns, id]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Servicios adicionales
      </h3>
      {addons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay servicios adicionales disponibles para este plan.
        </p>
      ) : (
        addons.map((addon) => (
          <label
            key={addon.uuid || addon.id}
           className={[
              "flex items-start gap-3 rounded-xl p-4",
              "border border-black/10 dark:border-white/10",
              "bg-black/[0.02] dark:bg-white/[0.03]",
              "hover:border-foreground/20 transition cursor-pointer",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={selectedAddOns.includes(addon.uuid || addon.id)}
              onChange={() => toggleAddOn(addon.uuid || addon.id)}
              className="mt-1.5 accent-foreground"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {addon.name}
                </span>
                <span className="ml-auto text-foreground font-medium">
                  ${Number(addon.price)?.toFixed(2) ?? "0.00"}
                </span>
              </div>
              {addon.description && (
                <span className="text-sm text-muted-foreground">
                  {addon.description}
                </span>
              )}
            </div>
          </label>
        ))
      )}
    </div>
  );
}
