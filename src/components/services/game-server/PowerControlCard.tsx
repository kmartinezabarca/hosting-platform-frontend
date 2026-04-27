import React, { useState } from 'react';
import { Play, Square, RotateCcw, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useGameServerPower, useGameServerUsage } from '@/hooks/useGameServer';
import { cn } from '@/lib/utils';

function ConfirmModal({ title, description, danger, onConfirm, onClose, isPending }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-background rounded-2xl border border-border shadow-2xl p-6">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', danger ? 'bg-red-500/10' : 'bg-amber-500/10')}>
          <AlertTriangle className={cn('w-6 h-6', danger ? 'text-red-500' : 'text-amber-500')} />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{description}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn('flex-1 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2',
              danger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-amber-500 text-white hover:bg-amber-600')}
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

const STATE_LABELS = {
  running: { label: 'En línea', color: 'text-emerald-500', dot: 'bg-emerald-500' },
  starting: { label: 'Iniciando...', color: 'text-blue-500', dot: 'bg-blue-500 animate-pulse' },
  stopping: { label: 'Deteniendo...', color: 'text-amber-500', dot: 'bg-amber-500 animate-pulse' },
  offline: { label: 'Fuera de línea', color: 'text-red-500', dot: 'bg-red-500' },
};

export default function PowerControlCard({ serviceUuid, isSuspended }: any) {
  const { data: usage } = useGameServerUsage(serviceUuid);
  const powerMut = useGameServerPower(serviceUuid);
  const [confirmModal, setConfirmModal] = useState<any>(null); // { signal, title, description, danger }

  // Auto-polling already handled by useGameServerUsage
  const state: string = (usage as any)?.state ?? 'offline';
  const stateInfo = (STATE_LABELS as any)[state] ?? STATE_LABELS.offline;
  const isTransitioning = state === 'starting' || state === 'stopping';

  const executePower = (signal: any) => {
    powerMut.mutate(signal, {
      onSuccess: () => {
        const msgs = { start: 'Servidor iniciando…', stop: 'Servidor deteniéndose…', restart: 'Servidor reiniciando…', kill: 'Servidor forzado a apagarse.' };
        toast.success(msgs[signal] ?? 'Comando enviado');
      },
      onError: (err: any) => {
        const status = (err as any)?.response?.status;
        if (status === 422) toast.error('Servidor suspendido — no autorizado');
        else if (status === 503) toast.error('No se pudo conectar al panel. Inténtalo de nuevo.');
        else toast.error('Error al enviar el comando');
      },
    });
    setConfirmModal(null);
  };

  const handleAction = (signal: any) => {
    if (signal === 'stop') {
      setConfirmModal({ signal, title: 'Detener servidor', description: '¿Estás seguro? Los jugadores conectados serán desconectados.', danger: false });
    } else if (signal === 'kill') {
      setConfirmModal({ signal, title: 'Forzar apagado', description: 'Apagado inmediato — puede corromper datos no guardados. Solo en emergencias.', danger: true });
    } else {
      executePower(signal);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
              <Zap className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Control del Servidor</h3>
              <p className="text-xs text-muted-foreground">Gestiona el estado de tu servidor</p>
            </div>
          </div>
          {/* State indicator */}
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', stateInfo.dot)} />
            <span className={cn('text-xs font-medium', stateInfo.color)}>{stateInfo.label}</span>
          </div>
        </div>

        {isSuspended ? (
          <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 text-center">
            Servidor suspendido. Contacta a soporte para reactivarlo.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main controls */}
            <div className="flex gap-2">
              {(state === 'offline') && (
                <button
                  onClick={() => handleAction('start')}
                  disabled={powerMut.isPending || isTransitioning}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {powerMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Iniciar
                </button>
              )}
              {(state === 'running') && (
                <>
                  <button
                    onClick={() => handleAction('stop')}
                    disabled={powerMut.isPending || isTransitioning}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {powerMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                    Detener
                  </button>
                  <button
                    onClick={() => handleAction('restart')}
                    disabled={powerMut.isPending || isTransitioning}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {powerMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Reiniciar
                  </button>
                </>
              )}
              {isTransitioning && (
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {state === 'starting' ? 'Iniciando...' : 'Deteniendo...'}
                </div>
              )}
            </div>

            {/* Kill switch */}
            <button
              onClick={() => handleAction('kill')}
              disabled={powerMut.isPending || isTransitioning || state === 'offline'}
              className="w-full py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/[0.06] text-xs font-medium transition-colors disabled:opacity-30 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Forzar apagado (kill) — solo emergencias
            </button>
          </div>
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          {...confirmModal}
          isPending={powerMut.isPending}
          onConfirm={() => executePower(confirmModal.signal)}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </>
  );
}
