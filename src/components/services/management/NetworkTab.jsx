import React from 'react';

const InfoRow = ({ label, value }) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-foreground sm:col-span-2 sm:mt-0">{value}</dd>
  </div>
);

const NetworkTab = ({ service }) => {
  return (
    <div
      className="
      group rounded-2xl border border-border/60 bg-card/80
      shadow-sm hover:shadow-lg hover:-translate-y-0.5
      transition-all duration-300 will-change-transform
      ring-1 ring-black/5 dark:ring-white/5 p-4
    "
      role="region"
      aria-label="Configuración de Red"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Configuración de Red
          </h3>
          <p className="text-muted-foreground mt-1">
            Detalles de conexión y direccionamiento de tu servicio.
          </p>
        </div>

        <dl className="divide-y divide-border">
          <InfoRow
            label="Dirección IP Pública"
            value={service.ip_address || "No asignada"}
          />
          <InfoRow
            label="Dominio Principal"
            value={service.domain || "No configurado"}
          />
          <InfoRow label="Puerto Principal" value={service.port || "N/A"} />
          <InfoRow
            label="Detalles de Conexión"
            value={
              <pre className="text-xs bg-muted p-2 rounded-md">
                {JSON.stringify(service.connection_details, null, 2)}
              </pre>
            }
          />
        </dl>
      </div>
    </div>
  );
};

export default NetworkTab;
