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
      <h3 className="text-lg font-semibold text-foreground">Servicios adicionales</h3>
      {addons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay servicios adicionales disponibles para este plan.
        </p>
      ) : (
        addons.map((addon) => (
          <label
            key={addon.uuid || addon.id}
            className="flex items-start gap-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-accent"
          >
            <input
              type="checkbox"
              checked={selectedAddOns.includes(addon.uuid || addon.id)}
              onChange={() => toggleAddOn(addon.uuid || addon.id)}
              className="mt-1"
            />
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{addon.name}</span>
              {addon.description && (
                <span className="text-sm text-muted-foreground">{addon.description}</span>
              )}
              <span className="text-sm text-foreground">
                ${addon.price?.toFixed(2) ?? "0.00"}
              </span>
            </div>
          </label>
        ))
      )}
    </div>
  );
}
