import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2, Receipt, User, Wallet, CalendarClock, ShieldCheck, Server, Cpu } from 'lucide-react';
import { Button } from '@presentation/components/ui/button';
import { Card, CardContent } from '@presentation/components/ui/card';
import { Badge } from '@presentation/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@presentation/components/ui/tabs';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { useAdminService } from '@application/hooks/useAdminServices';
import { useAdminInvoice } from '@application/hooks/useAdminInvoices';
import {
  useAdminGameServer,
  useProvisionGameServer,
  useSuspendGameServer,
  useUnsuspendGameServer,
  useReinstallGameServer,
  useDeleteGameServer,
} from '@application/hooks/useAdminGameServers';
import { toast } from '@presentation/components/features/ToastProvider';
import AdminGameServerDetailPanel from '@presentation/components/features/admin/AdminGameServerDetailPanel';

function statusBadge(status?: string) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    suspended: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    cancelled: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  };
  return map[status || ''] || map.pending;
}

function invoiceStatusBadge(status?: string) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    overdue: 'bg-red-500/10 text-red-600 border-red-500/20',
    cancelled: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  };
  return map[status || ''] || map.pending;
}

const fmtDate = (val?: string | null) => (val ? new Date(val).toLocaleString() : '—');
const fmtMoney = (val?: string | number | null, currency = 'MXN') => {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return `0.00 ${currency}`;
  return `${n.toFixed(2)} ${currency}`;
};

export default function AdminServiceDetailPage() {
  const { uuid = '' } = useParams();
  const serviceQ = useAdminService(uuid);
  const serviceRaw = serviceQ.data as any;
  const service = (serviceRaw?.data ?? serviceRaw) as any;

  const gameServerUuid = service?.uuid || '';
  const gsDetailQ = useAdminGameServer(gameServerUuid);
  const gsRaw = gsDetailQ.data as any;
  const linkedGameServer = (gsRaw?.data ?? gsRaw) || null;

  const invQ = useAdminInvoice(service?.id || '');
  const invRaw = invQ.data as any;
  const invData = invRaw?.data ?? invRaw;
  const invoices = Array.isArray(invData?.data)
    ? invData.data
    : Array.isArray(invData)
      ? invData
      : [];

  const provisionMut = useProvisionGameServer();
  const suspendMut = useSuspendGameServer();
  const unsuspendMut = useUnsuspendGameServer();
  const reinstallMut = useReinstallGameServer();
  const deleteMut = useDeleteGameServer();

  const runAction = (action: 'provision' | 'suspend' | 'unsuspend' | 'reinstall' | 'delete') => {
    if (!linkedGameServer?.id) {
      toast.error('No hay servidor de juego vinculado');
      return;
    }
    const map: Record<string, { mut: any; ok: string }> = {
      provision: { mut: provisionMut, ok: 'Aprovisionamiento iniciado' },
      suspend: { mut: suspendMut, ok: 'Servidor suspendido' },
      unsuspend: { mut: unsuspendMut, ok: 'Servidor reactivado' },
      reinstall: { mut: reinstallMut, ok: 'Reinstalación iniciada' },
      delete: { mut: deleteMut, ok: 'Servidor eliminado' },
    };
    map[action].mut.mutate(linkedGameServer.id, {
      onSuccess: () => toast.success(map[action].ok),
      onError: (e: any) => toast.error(e?.response?.data?.message || 'Error al ejecutar acción'),
    });
  };

  const loading = serviceQ.isLoading;
  const tech = linkedGameServer || {};
  const ptero = tech.pterodactyl_status || {};
  const limits = tech.limits || {};
  const featureLimits = tech.feature_limits || {};
  const panelUrl = tech.panel_url || service?.panel_url || service?.connection_details?.panel_url;
  const display = service?.connection_details?.display || tech?.connection_details?.display || '—';
  const port = service?.connection_details?.frp_port || service?.connection_details?.server_port || tech?.connection_details?.frp_port || tech?.connection_details?.server_port || '—';
  const invoiceCount = invoices.length;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-[#0f1115] dark:to-cyan-950/20 p-5 shadow-sm">
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="outline" size="sm" className="bg-white/80 dark:bg-white/[0.04]">
              <Link to="/admin/services"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Link>
            </Button>
            <div className="min-w-0">
              {loading ? <Skeleton className="h-8 w-80" /> : <h1 className="text-3xl font-bold tracking-tight text-foreground truncate">{service?.name || service?.domain || `Servicio #${service?.id}`}</h1>}
              {loading ? <Skeleton className="h-4 w-56 mt-2" /> : <p className="text-sm text-muted-foreground mt-1">Cliente: {service?.user?.first_name} {service?.user?.last_name}</p>}
            </div>
          </div>
          {!loading && <Badge variant="outline" className={`${statusBadge(service?.status)} font-semibold`}>{service?.status || 'pending'}</Badge>}
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/80 dark:bg-[#1a1a1a] rounded-xl p-1">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="technical">Control Técnico</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
              ) : (
                <>
                  <div className="rounded-xl border border-border/60 p-4"><p className="text-xs text-muted-foreground">Plan</p><p className="text-sm font-medium text-foreground mt-1">{service?.plan?.name || '—'}</p></div>
                  <div className="rounded-xl border border-border/60 p-4"><p className="text-xs text-muted-foreground">Precio</p><p className="text-sm font-medium text-foreground mt-1">{fmtMoney(service?.price, 'MXN')}</p></div>
                  <div className="rounded-xl border border-border/60 p-4"><p className="text-xs text-muted-foreground">Ciclo</p><p className="text-sm font-medium text-foreground mt-1">{service?.billing_cycle || 'monthly'}</p></div>
                  <div className="rounded-xl border border-border/60 p-4"><p className="text-xs text-muted-foreground">Próximo cobro</p><p className="text-sm font-medium text-foreground mt-1">{fmtDate(service?.next_due_date)}</p></div>
                </>
              )}
            </CardContent>
          </Card>

          {!loading && (
            <Card className="bg-card border-border/50">
              <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/60 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> Cliente</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Nombre:</span> {service?.user?.first_name} {service?.user?.last_name}</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Email:</span> {service?.user?.email || '—'}</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">UUID usuario:</span> <span className="font-mono text-xs">{service?.user?.uuid || service?.user_id || '—'}</span></p>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> Comercial</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Setup fee:</span> {fmtMoney(service?.setup_fee, 'MXN')}</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Payment intent:</span> <span className="font-mono text-xs">{service?.payment_intent_id || '—'}</span></p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Pendientes:</span> {service?.pending_changes_count ?? 0}</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Facturas asociadas:</span> {invoiceCount}</p>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Tiempos</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Creado:</span> {fmtDate(service?.created_at)}</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Actualizado:</span> {fmtDate(service?.updated_at)}</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Terminado:</span> {fmtDate(service?.terminated_at)}</p>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Identificadores</p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">UUID servicio:</span> <span className="font-mono text-xs">{service?.uuid || '—'}</span></p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Plan UUID:</span> <span className="font-mono text-xs">{service?.plan?.uuid || service?.plan_id || '—'}</span></p>
                  <p className="text-sm text-foreground"><span className="text-muted-foreground">Pterodactyl UUID:</span> <span className="font-mono text-xs">{service?.pterodactyl_server_uuid || tech?.pterodactyl_uuid || '—'}</span></p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-4 mt-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-5 space-y-4">
              {!linkedGameServer && !gsDetailQ.isLoading && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> No se encontró servidor de juego vinculado para este servicio.
                </div>
              )}

              {gsDetailQ.isLoading || loading ? (
                <Skeleton className="h-[560px] w-full rounded-2xl" />
              ) : (
                linkedGameServer && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/60 p-4 lg:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Server className="h-3.5 w-3.5" /> Estado técnico</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-muted-foreground">IP:Puerto:</span> <span className="font-mono">{display}:{port}</span></p>
                          <p><span className="text-muted-foreground">Panel:</span> <span className="font-mono text-xs">{panelUrl || '—'}</span></p>
                          <p><span className="text-muted-foreground">Estado Pterodactyl:</span> {ptero.status || tech.status || 'unknown'}</p>
                          <p><span className="text-muted-foreground">Suspendido:</span> {ptero.suspended ? 'Sí' : 'No'}</p>
                          <p><span className="text-muted-foreground">Node:</span> {ptero.node ?? tech.node ?? service?.server_node_id ?? '—'}</p>
                          <p><span className="text-muted-foreground">External ID:</span> {service?.external_id ?? '—'}</p>
                          <p><span className="text-muted-foreground">Egg ID:</span> {service?.selected_egg_id ?? '—'}</p>
                          <p><span className="text-muted-foreground">Pterodactyl user ID:</span> {service?.pterodactyl_user_id ?? '—'}</p>
                          <p><span className="text-muted-foreground">Max players:</span> {service?.max_players ?? '—'}</p>
                          <p><span className="text-muted-foreground">Restart required:</span> {service?.restart_required ? 'Sí' : 'No'}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Límites</p>
                        <div className="space-y-1.5 text-sm">
                          <p><span className="text-muted-foreground">RAM:</span> {limits.memory ?? '—'} MB</p>
                          <p><span className="text-muted-foreground">CPU:</span> {limits.cpu ?? '—'}%</p>
                          <p><span className="text-muted-foreground">Disco:</span> {limits.disk ?? '—'} MB</p>
                          <p><span className="text-muted-foreground">IO:</span> {limits.io ?? '—'}</p>
                          <p><span className="text-muted-foreground">DBs:</span> {featureLimits.databases ?? '—'}</p>
                          <p><span className="text-muted-foreground">Backups:</span> {featureLimits.backups ?? '—'}</p>
                        </div>
                      </div>
                    </div>

                    <AdminGameServerDetailPanel server={linkedGameServer} embedded />
                  </>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              {invQ.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay facturas asociadas para este servicio.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="rounded-lg border border-border/60 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{inv.invoice_number || `Factura #${inv.id || 'N/A'}`}</p>
                          <p className="text-xs text-muted-foreground">Creada: {fmtDate(inv.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{fmtMoney(inv.total, inv.currency || 'MXN')}</p>
                          <Badge variant="outline" className={`mt-1 ${invoiceStatusBadge(inv.status)}`}>{inv.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                        <p><span className="text-foreground">Vence:</span> {fmtDate(inv.due_date)}</p>
                        <p><span className="text-foreground">Pagada:</span> {fmtDate(inv.paid_at)}</p>
                        <p><span className="text-foreground">Método:</span> {inv.payment_method || '—'}</p>
                        <p><span className="text-foreground">Subtotal:</span> {fmtMoney(inv.subtotal, inv.currency || 'MXN')}</p>
                        <p><span className="text-foreground">Impuesto:</span> {fmtMoney(inv.tax_amount, inv.currency || 'MXN')} ({inv.tax_rate || '0'}%)</p>
                        <p><span className="text-foreground">Referencia:</span> <span className="font-mono">{inv.payment_reference || '—'}</span></p>
                        <p><span className="text-foreground">Notas:</span> {inv.notes || '—'}</p>
                        <p><span className="text-foreground">PDF:</span> {inv.pdf_path || '—'}</p>
                        <p><span className="text-foreground">XML:</span> {inv.xml_path || '—'}</p>
                      </div>

                      {!!inv.items?.length && (
                        <div className="mt-3 rounded-md border border-border/50">
                          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">Conceptos</div>
                          <div className="divide-y divide-border/40">
                            {inv.items.map((it: any) => (
                              <div key={it.id || it.uuid} className="px-3 py-2 text-xs flex items-center justify-between gap-2">
                                <span className="text-foreground truncate">{it.description || `Item #${it.id}`}</span>
                                <span className="font-mono text-muted-foreground">{fmtMoney(it.total ?? it.unit_price ?? 0, inv.currency || 'MXN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(provisionMut.isPending || suspendMut.isPending || unsuspendMut.isPending || reinstallMut.isPending || deleteMut.isPending) && (
        <div className="fixed bottom-6 right-6 rounded-xl border border-border bg-background px-4 py-2 shadow-xl text-sm flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Ejecutando acción técnica...
        </div>
      )}
    </div>
  );
}
