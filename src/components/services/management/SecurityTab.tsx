import React from 'react';
import { Shield, ShieldCheck, KeyRound, Lock } from 'lucide-react';

const SecurityTab = ({ service }) => {
  return (
    <div
      className="
        group rounded-2xl border border-border/60 bg-card/80
        shadow-sm hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-300 will-change-transform
        ring-1 ring-black/5 dark:ring-white/5
      "
      role="region"
      aria-label="Seguridad del servicio"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/60 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Seguridad</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el firewall, claves SSH y otras opciones de seguridad.
          </p>
        </div>

        {/* Estado general */}
        <span
          className="
            shrink-0 inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium
            ring-1 ring-black/10 dark:ring-white/10
            bg-accent text-foreground
          "
        >
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          Protección básica activa
        </span>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Bloque: Firewall */}
        <section
          className="
            rounded-xl border border-border p-4
            bg-gradient-to-br
            from-[hsl(var(--color-pure-white)/0.04)]
            via-[hsl(var(--color-pure-white)/0.02)]
            to-[hsl(var(--color-dark-charcoal)/0.00)]
            dark:from-[hsl(var(--color-pure-white)/0.06)]
            dark:via-[hsl(var(--color-pure-white)/0.03)]
            dark:to-[hsl(var(--color-pure-white)/0.00)]
            hover:border-primary/30 transition-colors
          "
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-lg p-2.5 bg-secondary">
              <Shield className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <h5 className="font-medium text-foreground">Firewall</h5>
              <p className="text-sm text-muted-foreground">
                Controla puertos abiertos y reglas de tráfico.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estado: Próximamente</span>
            <button
              type="button"
              disabled
              className="
                text-xs px-3 py-1.5 rounded-md
                bg-muted text-foreground/70 cursor-not-allowed
              "
            >
              Próximamente
            </button>
          </div>
        </section>

        {/* Bloque: Claves SSH */}
        <section
          className="
            rounded-xl border border-border p-4
            bg-gradient-to-br
            from-[hsl(var(--color-pure-white)/0.04)]
            via-[hsl(var(--color-pure-white)/0.02)]
            to-[hsl(var(--color-dark-charcoal)/0.00)]
            dark:from-[hsl(var(--color-pure-white)/0.06)]
            dark:via-[hsl(var(--color-pure-white)/0.03)]
            dark:to-[hsl(var(--color-pure-white)/0.00)]
            hover:border-primary/30 transition-colors
          "
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-lg p-2.5 bg-secondary">
              <KeyRound className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <h5 className="font-medium text-foreground">Claves SSH</h5>
              <p className="text-sm text-muted-foreground">
                Agrega o revoca llaves para acceso seguro.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estado: Próximamente</span>
            <button
              type="button"
              disabled
              className="
                text-xs px-3 py-1.5 rounded-md
                bg-muted text-foreground/70 cursor-not-allowed
              "
            >
              Próximamente
            </button>
          </div>
        </section>

        {/* Bloque: Buenas prácticas */}
        <section className="rounded-xl border border-border p-4 bg-background/60">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-lg p-2.5 bg-secondary">
              <Lock className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <h5 className="font-medium text-foreground">Buenas prácticas</h5>
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Usa claves SSH en lugar de contraseñas.</li>
                <li>Restringe puertos innecesarios en el firewall.</li>
                <li>Activa alertas o monitoreo de inicio de sesión.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SecurityTab;
