import React from 'react';
import { HardDrive, CloudUpload, Clock, History, RefreshCw } from 'lucide-react';

const BackupsTab = ({ service }) => {
  const lastBackup = service?.backups?.last_run
    ? new Date(service.backups.last_run).toLocaleString('es-ES')
    : 'No disponible';

  const schedule = service?.backups?.schedule || 'No configurado';
  const retention = service?.backups?.retention ?? '—';
  const usedGb = Number(service?.backups?.used_gb ?? 0);
  const quotaGb = Number(service?.backups?.quota_gb ?? 0);
  const pct = quotaGb > 0 ? Math.min(100, Math.round((usedGb / quotaGb) * 100)) : 0;

  return (
    <div
      className="
        group rounded-2xl border border-border/60 bg-card/80
        shadow-sm hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-300 will-change-transform
        ring-1 ring-black/5 dark:ring-white/5
      "
      role="region"
      aria-label="Copias de Seguridad"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/60 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Copias de Seguridad</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Crea, gestiona y restaura backups de tu servicio.
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
          <History className="w-3.5 h-3.5 text-primary" />
          Último: {lastBackup}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Bloque: Backup rápido */}
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
              <CloudUpload className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <h5 className="font-medium text-foreground">Backup rápido</h5>
              <p className="text-sm text-muted-foreground">
                Genera una copia bajo demanda del estado actual.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estado: Próximamente</span>
            <button
              type="button"
              disabled
              className="text-xs px-3 py-1.5 rounded-md bg-muted text-foreground/70 cursor-not-allowed"
            >
              Próximamente
            </button>
          </div>
        </section>

        {/* Bloque: Programación y retención */}
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
              <Clock className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <h5 className="font-medium text-foreground">Programación y retención</h5>
              <p className="text-sm text-muted-foreground">
                {`Horario: ${schedule} · Retención: ${retention}`}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Configura frecuencia y número de copias.</span>
            <button
              type="button"
              disabled
              className="text-xs px-3 py-1.5 rounded-md bg-muted text-foreground/70 cursor-not-allowed"
            >
              Próximamente
            </button>
          </div>
        </section>

        {/* Bloque: Almacenamiento usado */}
        <section className="rounded-xl border border-border p-4 bg-background/60">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-lg p-2.5 bg-secondary">
              <HardDrive className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0 w-full">
              <h5 className="font-medium text-foreground">Almacenamiento de backups</h5>
              <p className="text-sm text-muted-foreground">
                {quotaGb > 0 ? `${usedGb} GB de ${quotaGb} GB` : `${usedGb} GB usados`}
              </p>

              {/* Barra de progreso */}
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${pct}%` }}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bloque: Restaurar */}
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
              <RefreshCw className="w-5 h-5 text-primary" />
            </span>
            <div className="min-w-0">
              <h5 className="font-medium text-foreground">Restaurar desde backup</h5>
              <p className="text-sm text-muted-foreground">
                Selecciona un punto de restauración para volver atrás de forma segura.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estado: Próximamente</span>
            <button
              type="button"
              disabled
              className="text-xs px-3 py-1.5 rounded-md bg-muted text-foreground/70 cursor-not-allowed"
            >
              Próximamente
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BackupsTab;
