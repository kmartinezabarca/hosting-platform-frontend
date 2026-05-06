import React from 'react';
import { Cpu, Loader2, X, ArrowRight, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useFixGameServerJava } from '@/hooks/useGameServer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  serviceUuid:      string;
  currentJava:      number;
  requiredJava:     number;
  currentVersion:   string;
  onDismiss:        () => void;
}

// ── JavaVersionModal ───────────────────────────────────────────────────────────

/**
 * Shown when java_version_mismatch === true.
 * The user can dismiss it (Cancel) but the server won't start until fixed.
 * "Actualizar" calls POST /services/{uuid}/game-server/fix-java.
 */
export default function JavaVersionModal({
  serviceUuid,
  currentJava,
  requiredJava,
  currentVersion,
  onDismiss,
}: Props) {
  const fixJava = useFixGameServerJava(serviceUuid);

  const handleFix = () => {
    fixJava.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data.message ?? `Java actualizado a Java ${data.new_java}.`);
        toast.info('Reinicia el servidor para aplicar el cambio.', { duration: 6000 });
        // Hook already invalidates config query — modal disappears via parent re-render
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ?? 'Error al actualizar Java. Inténtalo de nuevo.',
        );
      },
    });
  };

  return (
    <Dialog
      open
      onOpenChange={() => {}}
    >
      <DialogContent
        className="sm:max-w-md gap-0 p-0 overflow-hidden [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-orange-500 rounded-t-lg" />

        <div className="p-6 space-y-5">
          {/* Header row */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-base font-bold leading-snug">
                  Versión de Java incompatible
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  El servidor no podrá arrancar con la imagen Docker actual.
                </DialogDescription>
              </DialogHeader>
            </div>
            {/* Dismiss button — exists but server stays broken */}
            <button
              onClick={onDismiss}
              disabled={fixJava.isPending}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Version mismatch visual */}
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.06] p-4">
            <div className="flex items-center justify-between gap-3">
              {/* Current Java */}
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Actual</p>
                <p className="text-2xl font-bold text-orange-500">Java {currentJava}</p>
                <p className="text-xs text-muted-foreground mt-0.5">en uso ahora</p>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />

              {/* Required Java */}
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Requerido</p>
                <p className="text-2xl font-bold text-emerald-500">Java {requiredJava}</p>
                <p className="text-xs text-muted-foreground mt-0.5">para MC {currentVersion}</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Minecraft{' '}
              <span className="font-semibold text-foreground">{currentVersion}</span>{' '}
              requiere{' '}
              <span className="font-semibold text-foreground">Java {requiredJava}</span>,
              pero el servidor está configurado con{' '}
              <span className="font-semibold text-foreground">Java {currentJava}</span>.
              Al actualizar, el Docker image se cambiará automáticamente y el servidor
              podrá arrancar correctamente.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onDismiss}
              disabled={fixJava.isPending}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors font-medium disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleFix}
              disabled={fixJava.isPending}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98]',
                'shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {fixJava.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Actualizando…</>
                : <><RefreshCw className="w-4 h-4" /> Actualizar a Java {requiredJava}</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
