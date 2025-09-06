import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import apiClient from "@/services/apiClient"; 

const [autoRenew, setAutoRenew] = useState(!!service?.configuration?.auto_renew);
const [savingAutoRenew, setSavingAutoRenew] = useState(false);

const toggleAutoRenew = async () => {
  const next = !autoRenew;
  setSavingAutoRenew(true);
  // UI optimista
  setAutoRenew(next);
  try {
    await apiClient.patch(
      `/api/services/${service.uuid}/auto-renew`,
      { auto_renew: next },
      // { _handle401: false } // si alguna llamada no debe redirigir en 401/403
    );
  } catch (e) {
    // Revertir si falla
    setAutoRenew(!next);
    console.error("No se pudo actualizar la renovación automática", e);
  } finally {
    setSavingAutoRenew(false);
  }
};

// Componente de Fila (puedes moverlo a un archivo de componentes comunes)
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-4 border-b border-border/60">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground text-right">{value || 'No disponible'}</p>
  </div>
);

const BillingTab = ({ service }) => {
  const plan = service.plan;

  return (
    <div
      className="
      group rounded-2xl border border-border/60 bg-card/80
      shadow-sm hover:shadow-lg hover:-translate-y-0.5
      transition-all duration-300 will-change-transform
      ring-1 ring-black/5 dark:ring-white/5
    "
      role="region"
      aria-label="Plan y Facturación"
    >
      {/* Header (gradiente sutil blanco↔negro) */}
      <div
        className="
        p-4 border-b border-border/60
        bg-gradient-to-br
        from-[hsl(var(--color-pure-white)/0.04)]
        via-[hsl(var(--color-pure-white)/0.02)]
        to-[hsl(var(--color-dark-charcoal)/0.00)]
        dark:from-[hsl(var(--color-pure-white)/0.06)]
        dark:via-[hsl(var(--color-pure-white)/0.03)]
        dark:to-[hsl(var(--color-pure-white)/0.00)]
      "
      >
        <h3 className="text-lg font-semibold text-foreground">
          Plan y Facturación
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Detalles de tu suscripción y características del plan.
        </p>
      </div>

      {/* Sección de Facturación */}
      <div className="p-4">
        <div className="mb-8">
          <InfoRow label="Nombre del Plan" value={plan?.name} />
          <InfoRow label="Ciclo de Facturación" value={service.billing_cycle} />
          <InfoRow
            label="Precio del Ciclo"
            value={`$${service.price} ${(service?.currency ?? "")
              .toString()
              .toUpperCase()}`}
          />
          <InfoRow
            label="Fecha de Contratación"
            value={new Date(service.created_at).toLocaleDateString("es-ES")}
          />
          <InfoRow
            label="Próxima Factura"
            value={new Date(service.next_due_date).toLocaleDateString("es-ES")}
          />

          {/* Última fila sin borde inferior */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              Renovación Automática
            </p>

            <div className="flex items-center gap-3">
              {/* Estado actual */}
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-md ring-1 ring-black/10 dark:ring-white/10
        ${
          autoRenew
            ? "bg-accent text-foreground"
            : "bg-muted text-foreground/70"
        }`}
              >
                {autoRenew ? "Activada" : "Desactivada"}
              </span>

              {/* Botón de acción */}
              <button
                type="button"
                onClick={toggleAutoRenew}
                disabled={savingAutoRenew}
                aria-pressed={autoRenew}
                className={`
        inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors
        border border-border focus-visible:outline-none focus-visible:ring-2
        ${savingAutoRenew ? "opacity-60 cursor-not-allowed" : ""}
        ${
          autoRenew
            ? "bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/30"
            : "bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary/30"
        }
      `}
              >
                {savingAutoRenew && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {autoRenew ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Características del Plan (card interno con borde + gradiente) */}
        {plan?.features && plan.features.length > 0 && (
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
          "
          >
            <h4 className="text-md font-semibold text-foreground mb-2">
              Características Incluidas
            </h4>

            {/* 1 col en móvil, 2 en md, 3 en xl (tal como lo tenías) */}
            <ul
              role="list"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"
            >
              {plan.features.map((feature) => (
                <li
                  key={feature.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {feature.feature}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default BillingTab;
