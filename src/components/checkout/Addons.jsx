import React from "react";

export default function Addons({ additionalServices, formData, onChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Servicios Adicionales</h3>
      {additionalServices.map(({ id, name, description, price, field }) => {
        const checked = formData[field];
        return (
          <label
            key={id}
            className={[
              "flex items-start gap-3 rounded-xl p-4",
              "border border-black/10 dark:border-white/10",
              "bg-black/[0.02] dark:bg-white/[0.03]",
              "hover:border-foreground/20 transition cursor-pointer",
              checked ? "ring-2 ring-foreground/20" : "",
            ].join(" ")}
          >
            <input
              type="checkbox"
              name={field}
              checked={checked}
              onChange={onChange}
              className="mt-1.5 accent-foreground"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{name}</h4>
                <span className="ml-auto text-foreground font-medium">+${price}/mes</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{description}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
