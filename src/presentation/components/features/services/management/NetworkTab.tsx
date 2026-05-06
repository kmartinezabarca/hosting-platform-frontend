import React, { useState } from 'react';
import { Globe, ShieldCheck, Hash, Copy, Check, Network } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NetworkTab = ({ service }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const connection = service.connection_details || {};
  const displayAddr = connection.display || (connection.server_ip ? `${connection.server_ip}:${connection.server_port}` : 'No asignada');
  const rawIp = connection.server_ip ? `${connection.server_ip}:${connection.server_port}` : 'N/A';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="group rounded-2xl border border-border/60 bg-card/80 shadow-sm p-6 ring-1 ring-black/5 dark:ring-white/5">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground">Configuración de Red</h3>
          <p className="text-muted-foreground mt-1">Detalles de conexión y direccionamiento de tu servicio.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Professional Address Card */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
              <Globe className="w-20 h-20" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Dirección de Conexión Profesional</span>
              <div className="flex items-center justify-between gap-4">
                <span className="text-2xl font-mono font-bold text-foreground tracking-tight">{displayAddr}</span>
                <button 
                  onClick={() => handleCopy(displayAddr, 'display')}
                  className="p-2.5 rounded-xl bg-background border border-border hover:border-primary/50 transition-all shadow-sm"
                >
                  {copied === 'display' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw IP Card */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">IP Numérica</span>
                </div>
                <button onClick={() => handleCopy(rawIp, 'raw')} className="text-muted-foreground hover:text-primary transition-colors">
                  {copied === 'raw' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <span className="text-sm font-mono font-medium">{rawIp}</span>
            </div>

            {/* Protection Card */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Protección DDoS</span>
              </div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Activa y Protegiendo
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/60">
          <h4 className="text-sm font-bold text-foreground mb-4">Puertos Adicionales</h4>
          <div className="bg-muted/20 rounded-xl border border-border p-8 text-center">
            <Network className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay puertos adicionales asignados a este servicio.</p>
            <button className="mt-4 text-xs font-bold text-primary hover:underline">Solicitar puerto adicional</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTab;
