import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Zap, Loader2, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGameServerPower, useGameServerUsage } from '@/hooks/useGameServer';
import { cn } from '@/lib/utils';

// ── Typed-confirm modal ────────────────────────────────────────────────────────

interface ConfirmConfig {
  signal:      PowerSignal;
  title:       string;
  description: string;
  confirmWord: string;          // user must type this exactly (case-insensitive)
  variant:     'danger' | 'warning';
}

function ConfirmModal({
  config,
  isPending,
  onConfirm,
  onClose,
}: {
  config:     ConfirmConfig;
  isPending:  boolean;
  onConfirm:  () => void;
  onClose:    () => void;
}) {
  const [typed, setTyped]     = useState('');
  const inputRef              = useRef<HTMLInputElement>(null);
  const isDanger              = config.variant === 'danger';
  const isValid               = typed.trim().toUpperCase() === config.confirmWord.toUpperCase();

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Submit on Enter when valid
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !isPending) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-80 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className={cn('h-1 w-full', isDanger ? 'bg-red-500' : 'bg-amber-500')} />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
              isDanger ? 'bg-red-500/10' : 'bg-amber-500/10',
            )}>
              {isDanger
                ? <ShieldAlert className="w-5 h-5 text-red-500" />
                : <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground">{config.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{config.description}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Typed confirmation */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-2.5">
            <p className="text-xs text-muted-foreground">
              Para confirmar, escribe{' '}
              <span className="font-bold font-mono text-foreground tracking-wide">
                {config.confirmWord}
              </span>{' '}
              en el campo de abajo:
            </p>
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={handleKey}
              placeholder={config.confirmWord}
              spellCheck={false}
              autoComplete="off"
              className={cn(
                'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background font-mono tracking-widest',
                'focus:outline-none focus:ring-2 transition-colors placeholder:text-muted-foreground/40 placeholder:tracking-normal',
                isValid
                  ? 'border-emerald-500/50 focus:ring-emerald-500/20 text-foreground'
                  : 'border-border focus:ring-ring text-foreground',
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!isValid || isPending}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isDanger
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20',
              )}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── State labels ───────────────────────────────────────────────────────────────

const STATE_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  running:  { label: 'En línea',       color: 'text-emerald-500', dot: 'bg-emerald-500 shadow-[0_0_6px_1px_rgba(52,211,153,0.5)]' },
  starting: { label: 'Iniciando…',     color: 'text-sky-400',     dot: 'bg-sky-400 animate-pulse' },
  stopping: { label: 'Deteniendo…',    color: 'text-amber-400',   dot: 'bg-amber-400 animate-pulse' },
  offline:  { label: 'Fuera de línea', color: 'text-slate-400',   dot: 'bg-slate-400' },
};

type PowerSignal = 'restart' | 'stop' | 'start' | 'kill';

// ── Component ──────────────────────────────────────────────────────────────────

export default function PowerControlCard({ serviceUuid, isSuspended }: { serviceUuid: string; isSuspended?: boolean }) {
  const { data: usage }  = useGameServerUsage(serviceUuid);
  const powerMut         = useGameServerPower(serviceUuid);
  const [modal, setModal] = useState<ConfirmConfig | null>(null);

  const state: string        = (usage as any)?.state ?? 'offline';
  const stateInfo            = STATE_LABELS[state] ?? STATE_LABELS.offline;
  const isTransitioning      = state === 'starting' || state === 'stopping';

  const executePower = (signal: PowerSignal) => {
    setModal(null);
    powerMut.mutate(signal, {
      onSuccess: () => {
        const msgs: Record<PowerSignal, string> = {
          start:   'Servidor iniciando…',
          stop:    'Servidor deteniéndose…',
          restart: 'Servidor reiniciando…',
          kill:    'Servidor forzado a apagarse.',
        };
        toast.success(msgs[signal]);
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        if (status === 422)      toast.error('Servidor suspendido — no autorizado.');
        else if (status === 503) toast.error('No se pudo conectar al panel. Inténtalo de nuevo.');
        else                     toast.error('Error al enviar el comando.');
      },
    });
  };

  const handleAction = (signal: PowerSignal) => {
    const configs: Partial<Record<PowerSignal, ConfirmConfig>> = {
      stop: {
        signal,
        title:       'Detener servidor',
        description: 'El servidor se apagará correctamente. Los jugadores conectados serán desconectados.',
        confirmWord: 'DETENER',
        variant:     'warning',
      },
      restart: {
        signal,
        title:       'Reiniciar servidor',
        description: 'El servidor se reiniciará. Puede tardar unos segundos en volver a estar disponible.',
        confirmWord: 'REINICIAR',
        variant:     'warning',
      },
      kill: {
        signal,
        title:       'Forzar apagado',
        description: 'Apagado inmediato sin guardar datos. Puede causar corrupción. Usa solo en emergencias.',
        confirmWord: 'FORZAR APAGADO',
        variant:     'danger',
      },
    };

    const cfg = configs[signal];
    if (cfg) {
      setModal(cfg);
    } else {
      // Start — no confirmation needed
      executePower(signal);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Control Maestro</h3>
          </div>
          {/* Live state pill */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-500",
            state === 'running' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/60 border-border/60"
          )}>
            <span className={cn('w-2 h-2 rounded-full shrink-0', stateInfo.dot, state === 'running' && "animate-pulse")} />
            <span className={cn('text-[10px] font-bold uppercase tracking-wider', stateInfo.color)}>{stateInfo.label}</span>
          </div>
        </div>

        <div className="p-5">
          {isSuspended ? (
            <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-4 py-5 text-sm text-amber-700 dark:text-amber-400 text-center leading-relaxed">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 opacity-50" />
              <p className="font-semibold">Servidor Suspendido</p>
              <p className="text-xs opacity-80 mt-1">Contacta a soporte para reactivarlo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Main action buttons */}
              {state === 'offline' && (
                <button
                  onClick={() => handleAction('start')}
                  disabled={powerMut.isPending || isTransitioning}
                  className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 active:scale-[0.97] transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {powerMut.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />}
                  Iniciar Servidor
                </button>
              )}

              {state === 'running' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('stop')}
                    disabled={powerMut.isPending || isTransitioning}
                    className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-500 active:scale-[0.97] transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {powerMut.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Square className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />}
                    Detener
                  </button>
                  <button
                    onClick={() => handleAction('restart')}
                    disabled={powerMut.isPending || isTransitioning}
                    className="group flex items-center justify-center gap-2 py-3 rounded-xl border border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400 text-sm font-bold hover:bg-violet-500/10 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {powerMut.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
                    Reiniciar
                  </button>
                </div>
              )}

              {isTransitioning && (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-muted/50 text-muted-foreground text-sm font-bold border border-dashed border-border">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {state === 'starting' ? 'Iniciando...' : 'Deteniendo...'}
                </div>
              )}

              {/* Kill switch — always visible but restrained */}
              <div className="pt-2">
                <button
                  onClick={() => handleAction('kill')}
                  disabled={powerMut.isPending || isTransitioning || state === 'offline'}
                  className="w-full py-2 rounded-lg border border-transparent text-muted-foreground/50 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3 h-3" />
                  Forzar Apagado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {modal && (
        <ConfirmModal
          config={modal}
          isPending={powerMut.isPending}
          onConfirm={() => executePower(modal.signal)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
