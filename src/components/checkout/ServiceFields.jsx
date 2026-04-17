import React from "react";
import { User, Mail, Phone, Server, Globe } from "lucide-react";
import { useInputClass } from "./useInputStyles";

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md bg-foreground/10 dark:bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-foreground" />
      </div>
      <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">{label}</h3>
    </div>
  );
}

function IconInput({ icon: Icon, inputClass, ...inputProps }) {
  const cls = inputClass.replace("px-4", "pl-10 pr-4");
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
      <input className={cls} {...inputProps} />
    </div>
  );
}

export default function ServiceFields({ formData, errors, touched, onChange, onBlur, category }) {
  const cls = (n) => useInputClass(touched, errors, n);

  const contactFields = [
    { k: "firstName", label: "Nombre *",   ph: "Tu nombre",          type: "text", Icon: User  },
    { k: "lastName",  label: "Apellido *",  ph: "Tu apellido",         type: "text", Icon: User  },
    { k: "email",     label: "Email *",     ph: "tu@email.com",        type: "email", Icon: Mail  },
    { k: "phone",     label: "Teléfono *",  ph: "+52 55 1234 5678",    type: "tel",  Icon: Phone },
  ];

  return (
    <div className="space-y-8">
      {/* Datos de contacto */}
      <div>
        <SectionHeader icon={User} label="Datos de Contacto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contactFields.map((f) => (
            <div key={f.k}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
              <IconInput
                icon={f.Icon}
                inputClass={cls(f.k)}
                type={f.type}
                name={f.k}
                value={formData[f.k]}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={f.ph}
                aria-invalid={!!errors[f.k]}
              />
              {errors[f.k] && (
                <p className="mt-1 text-xs text-red-500">{errors[f.k]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Datos del servicio */}
      <div>
        <SectionHeader icon={Server} label="Datos del Servicio" />
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre del Servicio *
            </label>
            <IconInput
              icon={Server}
              inputClass={cls("serviceName")}
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="Mi sitio web"
              aria-invalid={!!errors.serviceName}
            />
            {errors.serviceName && (
              <p className="mt-1 text-xs text-red-500">{errors.serviceName}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">
              Te ayudará a identificar este servicio en tu panel.
            </p>
          </div>

          {category === "hosting" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Dominio{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <IconInput
                icon={Globe}
                inputClass={cls("domain")}
                type="text"
                name="domain"
                value={formData.domain}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="midominio.com"
                aria-invalid={!!errors.domain}
              />
              {errors.domain && (
                <p className="mt-1 text-xs text-red-500">{errors.domain}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                Puedes configurarlo después de la contratación.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
