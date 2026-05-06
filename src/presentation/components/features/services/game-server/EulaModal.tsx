import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Loader2, CheckSquare, Square } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@presentation/components/ui/dialog';
import { useAcceptGameServerEula } from '@application/hooks/useGameServer';
import { toast } from 'sonner';
import { cn } from '@shared/utils/utils';

// ── EulaModal ─────────────────────────────────────────────────────────────────

/**
 * Blocking modal shown when eula_accepted === false for a Java Minecraft server.
 * Cannot be dismissed — user must accept the EULA to proceed.
 */
export default function EulaModal({ serviceUuid }: { serviceUuid: string }) {
  const [accepted, setAccepted] = useState(false);
  const accept                  = useAcceptGameServerEula(serviceUuid);

  const handleAccept = () => {
    accept.mutate(undefined, {
      onSuccess: (res) => {
        if (!res.success) {
          toast.error(res.message ?? 'No se pudo aceptar el EULA. Inténtalo de nuevo.');
        }
        // Hook already invalidates the config query — modal disappears automatically
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ?? 'Error al aceptar el EULA. Inténtalo de nuevo.',
        );
      },
    });
  };

  return (
    <Dialog
      open
      // Prevent closing via Escape or backdrop click — user must accept
      onOpenChange={() => {}}
    >
      <DialogContent
        // Remove the default close button
        className="sm:max-w-md gap-0 p-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Top accent */}
        <div className="h-1.5 w-full bg-amber-500 rounded-t-lg" />

        <div className="p-6 space-y-5">
          {/* Icon + header */}
          <div className="flex flex-col items-center text-center gap-3 pt-1">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold">
                Acepta el EULA de Minecraft
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Mojang (Microsoft) exige aceptar su Acuerdo de Licencia de Usuario Final (EULA)
                antes de poder ejecutar un servidor de Minecraft Java Edition.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Info card */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
            <p>
              Al aceptar el EULA confirmas que has leído y estás de acuerdo con los términos
              de Mojang para el uso del software del servidor.
            </p>
            <a
              href="https://aka.ms/MinecraftEULA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline mt-1"
            >
              Leer el EULA completo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Checkbox */}
          <button
            type="button"
            onClick={() => setAccepted((v) => !v)}
            className={cn(
              'w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
              accepted
                ? 'border-emerald-500/40 bg-emerald-500/[0.06]'
                : 'border-border bg-background hover:bg-muted/40',
            )}
          >
            {accepted
              ? <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              : <Square      className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />}
            <span className={cn(
              'text-sm font-medium leading-relaxed',
              accepted ? 'text-foreground' : 'text-muted-foreground',
            )}>
              He leído y acepto el{' '}
              <a
                href="https://aka.ms/MinecraftEULA"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:underline"
              >
                EULA de Minecraft
              </a>{' '}
              de Mojang / Microsoft.
            </span>
          </button>

          {/* Accept button */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={!accepted || accept.isPending}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              accepted
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {accept.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {accept.isPending ? 'Aceptando…' : 'Aceptar y continuar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
