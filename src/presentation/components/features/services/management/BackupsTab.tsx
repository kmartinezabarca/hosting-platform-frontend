import React from 'react';
import { HardDrive, Clock, RefreshCw, Database, Zap } from 'lucide-react';
import { useServiceBackups, useCreateBackup, useRestoreBackup } from '@application/hooks/useServices';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BackupsTab = ({ service }) => {
  const { data: backups, isLoading } = useServiceBackups(service.uuid);
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();

  const handleCreateBackup = () => {
    const name = `Backup ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
    toast.promise(
      createBackup.mutateAsync({ serviceId: service.uuid, name }),
      {
        loading: 'Creando backup...',
        success: 'Backup creado exitosamente',
        error: 'Error al crear el backup',
      }
    );
  };

  const handleRestore = (backupId) => {
    if (!window.confirm('¿Estás seguro de restaurar este backup? El estado actual del servidor se perderá.')) return;
    
    toast.promise(
      restoreBackup.mutateAsync({ serviceId: service.uuid, backupId }),
      {
        loading: 'Restaurando backup...',
        success: 'Restauración iniciada',
        error: 'Error al restaurar el backup',
      }
    );
  };

  const usedBytes = (backups || []).reduce((acc, b) => acc + (b.size || b.bytes || 0), 0);
  const usedGb = usedBytes / (1024 ** 3);
  const quotaGb = service.plan?.limits?.backups || 3;
  const pct = Math.min(100, (usedGb / quotaGb) * 100);

  return (
    <div className="space-y-6">
      <div className="group rounded-2xl border border-border/60 bg-card/80 shadow-sm p-6 ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-foreground">Copias de Seguridad</h3>
            <p className="text-muted-foreground mt-1">Administra tus puntos de restauración y protege tus datos.</p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={createBackup.isPending || ((backups?.length || 0) >= quotaGb)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Crear Backup Ahora
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Almacenamiento</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{usedGb.toFixed(2)} GB</span>
              <span className="text-xs text-muted-foreground mb-1">de {quotaGb} GB</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Backups</span>
            </div>
            <span className="text-2xl font-bold">{backups?.length || 0}</span>
            <span className="text-xs text-muted-foreground ml-2">archivos</span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Retención</span>
            </div>
            <span className="text-2xl font-bold">7 Días</span>
            <span className="text-xs text-muted-foreground ml-2">automática</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-foreground px-1">Backups Recientes</h4>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground animate-pulse">Cargando backups...</div>
          ) : backups?.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
              No hay backups disponibles todavía.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Nombre / Fecha</th>
                    <th className="px-4 py-3">Tamaño</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(backups || []).map((backup) => (
                    <tr key={backup.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-foreground">{backup.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {format(new Date(backup.created_at), "PPP 'a las' p", { locale: es })}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {((backup.size || backup.bytes || 0) / (1024 ** 2)).toFixed(2)} MB
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleRestore(backup.uuid)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Restaurar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupsTab;
