import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Network, Loader2 } from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors font-medium shrink-0"
    >
      {copied
        ? <Check className="w-3 h-3 text-emerald-500" />
        : <Copy className="w-3 h-3 text-muted-foreground" />
      }
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

export default function ConnectionCard({ connection, status }) {
  const ipPort = connection ? `${connection.server_ip}:${connection.server_port}` : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <Network className="w-4 h-4 text-violet-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Conexión</h3>
      </div>

      {(!connection || status === 'pending' || status === 'failed') ? (
        <div className="flex items-center gap-2.5 py-3">
          {status === 'failed' ? (
            <p className="text-sm text-red-500">Error al obtener datos de conexión.</p>
          ) : (
            <>
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
              <p className="text-sm text-muted-foreground">Aprovisionando servidor…</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* IP:Puerto */}
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-muted/50">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                IP : Puerto
              </p>
              <p className="text-sm font-mono font-semibold text-foreground truncate">{ipPort}</p>
            </div>
            <CopyButton text={ipPort!} />
          </div>
        </div>
      )}
    </div>
  );
}