import React from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";

// Hook para copiar al portapapeles (sin cambios)
const useCopyToClipboard = () => {
  const [copied, setCopied] = React.useState(false);
  const copy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return [copied, copy];
};

// El nuevo componente de fila, mucho más limpio
const InfoRow = ({ label, value, canCopy = false }) => {
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="flex justify-between items-center py-4 border-b border-border/60">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground text-right">
          {value || "No disponible"}
        </p>
        {canCopy && (
          <button
            onClick={() => copy(value)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <ClipboardCheck className="w-4 h-4 text-blue-500" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const GeneralSettingsTab = ({ service }) => {
  return (
    <div
      className="
    group rounded-2xl border border-border/60 bg-card/80
    shadow-sm hover:shadow-lg hover:-translate-y-0.5
    transition-all duration-300 will-change-transform
    ring-1 ring-black/5 dark:ring-white/5
  "
      role="region"
      aria-label="Información General del servicio"
    >
      {/* Header del card */}
      <div className="p-4 border-b border-border/60">
        <h3 className="text-lg font-semibold text-foreground">
          Información General
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Detalles principales de tu servicio contratado.
        </p>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <InfoRow label="ID del Servicio" value={service.uuid} canCopy />
        <InfoRow label="Nombre del Plan" value={service.plan_name} />
        <InfoRow label="Categoría" value={service.category} />
        <InfoRow label="Dirección IP" value={service.ip_address} canCopy />
        <InfoRow label="Ciclo de Facturación" value={service.billing_cycle} />
        <InfoRow
          label="Precio"
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

        {/* La última fila no lleva borde inferior */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">Notas</p>
          <p className="text-sm font-medium text-foreground">
            {service.notes || "No hay notas."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsTab;
