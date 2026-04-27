import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Gamepad2 } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

export default function ConnectionCard({ connection, status }) {
  const ipPort = connection ? `${connection.server_ip}:${connection.server_port}` : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Datos de Conexión</h3>
          <p className="text-xs text-muted-foreground">Usa estos datos en tu cliente de juego</p>
        </div>
      </div>

      {(!connection || status === 'pending' || status === 'failed') ? (
        <div className="text-center py-6">
          {status === 'failed' ? (
            <p className="text-sm text-red-500">
              Error al crear tu servidor. El equipo de soporte fue notificado.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Aprovisionando servidor…</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* IP:Port */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/40">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">IP : Puerto</p>
              <p className="text-sm font-mono font-semibold text-foreground mt-0.5">{ipPort}</p>
            </div>
            <CopyButton text={ipPort} />
          </div>

          {/* Panel link */}
          {connection.panel_url && (
            <a
              href={connection.panel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors group"
            >
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Panel de Control</p>
                <p className="text-sm font-medium text-foreground mt-0.5 group-hover:text-violet-500 transition-colors">
                  Abrir panel de juego
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 transition-colors shrink-0" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
