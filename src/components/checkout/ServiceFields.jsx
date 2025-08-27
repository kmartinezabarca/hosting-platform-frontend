import React from "react";
import { useInputClass } from "./useInputStyles";

export default function ServiceFields({
  formData, errors, touched, onChange, onBlur, category
}) {
  const inputClass = (n) => useInputClass(touched, errors, n);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { k: "firstName", label: "Nombre *", ph: "Tu nombre" },
          { k: "lastName", label: "Apellido *", ph: "Tu apellido" },
          { k: "email", label: "Email *", ph: "tu@email.com", type: "email" },
          { k: "phone", label: "Teléfono *", ph: "+52 55 1234 5678", type: "tel" },
        ].map((f) => (
          <div key={f.k}>
            <label className="block text-sm font-medium text-foreground mb-2">{f.label}</label>
            <input
              type={f.type || "text"}
              name={f.k}
              value={formData[f.k]}
              onChange={onChange}
              onBlur={onBlur}
              className={inputClass(f.k)}
              placeholder={f.ph}
              aria-invalid={!!errors[f.k]}
            />
            {errors[f.k] && <p className="mt-1 text-sm text-red-600">{errors[f.k]}</p>}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Nombre del Servicio *</label>
        <input
          type="text"
          name="serviceName"
          value={formData.serviceName}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass("serviceName")}
          placeholder="Mi sitio web"
          aria-invalid={!!errors.serviceName}
        />
        {errors.serviceName && <p className="mt-1 text-sm text-red-600">{errors.serviceName}</p>}
        <p className="text-muted-foreground text-sm mt-1">
          Este nombre te ayudará a identificar tu servicio en el panel.
        </p>
      </div>

      {category === "hosting" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Dominio (Opcional)</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClass("domain")}
            placeholder="midominio.com"
            aria-invalid={!!errors.domain}
          />
          {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
          <p className="text-muted-foreground text-sm mt-1">
            Puedes configurar tu dominio después de la contratación.
          </p>
        </div>
      )}
    </>
  );
}
