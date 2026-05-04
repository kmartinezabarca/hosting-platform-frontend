import React from "react";
import { User, Mail, Phone, Server, Globe, Gamepad2, Info } from "lucide-react";
import { useInputClass } from "./useInputStyles";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SectionHeader({ icon: Icon, label, description }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{label}</h3>
      </div>
      {description && <p className="text-xs text-muted-foreground ml-10">{description}</p>}
    </div>
  );
}

function IconInput({ icon: Icon, inputClass, error, ...inputProps }) {
  // Ajuste dinámico de padding para el icono
  const cls = inputClass.replace("px-4", "pl-10 pr-4");
  return (
    <div className="relative group">
      <Icon className={cn(
        "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none",
        error ? "text-red-400" : "text-muted-foreground/50 group-focus-within:text-primary"
      )} />
      <input className={cls} {...inputProps} />
    </div>
  );
}

export default function ServiceFields({ formData, errors, touched, onChange, onBlur, category }) {
  const cls = (n) => useInputClass(touched, errors, n);

  const gameOptions = [
    { value: "minecraft", label: "Minecraft", description: "Java y Bedrock" },
    { value: "rust", label: "Rust", description: "Survival" },
    { value: "ark", label: "ARK", description: "Survival Evolved" },
    { value: "palworld", label: "Palworld", description: "Mundo abierto" },
  ];

  const handleSelectChange = (name, value) => {
    onChange({ target: { name, value } });
  };

  const handleSelectBlur = (name) => {
    onBlur({ target: { name } });
  };

  const contactFields = [
    { k: "firstName", label: "Nombre",   ph: "Escribe tu nombre",    type: "text", Icon: User  },
    { k: "lastName",  label: "Apellido", ph: "Escribe tu apellido",  type: "text", Icon: User  },
    { k: "email",     label: "Email",    ph: "correo@ejemplo.com",   type: "email", Icon: Mail },
    { k: "phone",     label: "Teléfono", ph: "+52 55 1234 5678",    type: "tel",  Icon: Phone },
  ];

  const getServicePlaceholder = () => {
    const maps = {
      game_server: "Ej: Survival con amigos",
      gameserver: "Ej: Survival con amigos",
      vps: "Ej: Nodo de producción",
      database: "Ej: Base de datos principal",
      hosting: "Ej: Mi sitio web",
    };
    return maps[category] || "Nombre de tu servicio";
  };

  return (
    <div className="space-y-10">
      {/* SECCIÓN 1: PROPIETARIO */}
      <section>
        <SectionHeader 
          icon={User} 
          label="Datos del Propietario" 
          description="Información necesaria para la facturación y acceso al panel."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {contactFields.map((f) => (
            <div key={f.k} className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
                {f.label} <span className="text-primary">*</span>
              </label>
              <IconInput
                icon={f.Icon}
                inputClass={cls(f.k)}
                type={f.type}
                name={f.k}
                value={formData[f.k]}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={f.ph}
                error={touched[f.k] && errors[f.k]}
              />
              {touched[f.k] && errors[f.k] && (
                <p className="text-[11px] text-red-500 font-medium ml-1">{errors[f.k]}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: CONFIGURACIÓN DEL SERVICIO */}
      <section className="p-6 rounded-2xl bg-muted/30 border border-border/50">
        <SectionHeader 
          icon={Server} 
          label="Configuración de Instancia" 
          description="Personaliza los detalles básicos de tu nuevo servicio."
        />
        
        <div className="space-y-6">
          {/* Selector de Juego si es Game Server */}
          {(category === "game_server" || category === "gameserver") && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
                Selecciona el Juego <span className="text-primary">*</span>
              </label>
              <div className="relative group">
                <Gamepad2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Select
                  value={formData.game || ""}
                  onValueChange={(value) => handleSelectChange("game", value)}
                  onOpenChange={(open) => {
                    if (!open) handleSelectBlur("game");
                  }}
                >
                  <SelectTrigger className={cn(cls("game"), "pl-10 cursor-pointer")}>
                    <SelectValue placeholder="¿A qué vamos a jugar?" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {touched.game && errors.game && (
                <p className="text-[11px] text-red-500 font-medium ml-1">{errors.game}</p>
              )}
            </div>
          )}

          {/* Nombre del Servicio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
              Etiqueta de identificación <span className="text-primary">*</span>
            </label>
            <IconInput
              icon={Server}
              inputClass={cls("serviceName")}
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={getServicePlaceholder()}
              error={touched.serviceName && errors.serviceName}
            />
            <div className="flex items-start gap-1.5 px-1 mt-1">
              <Info className="w-3 h-3 text-muted-foreground mt-0.5" />
              <p className="text-[10px] text-muted-foreground italic">
                Este nombre te ayudará a organizar tus servicios en el Dashboard.
              </p>
            </div>
            {touched.serviceName && errors.serviceName && (
              <p className="text-[11px] text-red-500 font-medium ml-1">{errors.serviceName}</p>
            )}
          </div>

          {/* Dominio para Hosting */}
          {category === "hosting" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
                Dominio Deseado
              </label>
              <IconInput
                icon={Globe}
                inputClass={cls("domain")}
                type="text"
                name="domain"
                value={formData.domain}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="ejemplo.com"
                error={touched.domain && errors.domain}
              />
              <p className="text-[11px] text-muted-foreground ml-1 italic">
                Si no tienes uno, puedes dejarlo vacío y configurarlo después.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
