import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { Plus, Edit, Trash2, Search, RefreshCw, Server, CheckCircle, Clock, AlertTriangle, XCircle, Loader2, Filter, X, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import systemStatusAdminService from "@/services/systemStatusAdminService";

const statusSchema = z.object({
  service_name: z.string().min(1, "El nombre del servicio es requerido"),
  status: z.string().min(1, "El estado es requerido"),
  message: z.string().optional(),
  last_updated: z.string().min(1, "La fecha es requerida"),
});

export default function AdminSystemStatusPage() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTypeFilter, setStatusTypeFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; status: any }>({ isOpen: false, status: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: { service_name: "", status: "operational", message: "", last_updated: new Date().toISOString().split("T")[0] }
  });

  useEffect(() => { fetchStatuses(); }, []);
  useEffect(() => { if (!dataLoaded) { setDataLoaded(true); return; } fetchStatuses(); }, [statusTypeFilter]);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const data = await systemStatusAdminService.getAll();
      setStatuses(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      toast.error("Error al cargar el estado del sistema");
      console.error(error);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingStatus) {
        await systemStatusAdminService.update(editingStatus.uuid, data);
        toast.success(`Servicio "${data.service_name}" actualizado`);
      } else {
        await systemStatusAdminService.create(data);
        toast.success(`Servicio "${data.service_name}" creado`);
      }
      closeForm();
      fetchStatuses();
    } catch (error) {
      console.error(error);
      const message = (error as any)?.response?.data?.message || "Error al guardar el estado del sistema";
      toast.error("Error", { description: message });
    }
  };

  const handleDelete = (status) => setConfirmModal({ isOpen: true, status });

  const handleConfirmDelete = async () => {
    if (!confirmModal.status) return;
    setIsActionLoading(true);
    try {
      await systemStatusAdminService.delete(confirmModal.status.uuid);
      toast.success("Servicio eliminado");
      setConfirmModal({ isOpen: false, status: null });
      fetchStatuses();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el servicio");
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStatus(null);
    reset({ service_name: "", status: "operational", message: "", last_updated: new Date().toISOString().split("T")[0] });
  };

  const openCreateForm = () => {
    reset({ service_name: "", status: "operational", message: "", last_updated: new Date().toISOString().split("T")[0] });
    setEditingStatus(null);
    setShowForm(true);
  };

  const openEditForm = (status) => {
    setEditingStatus(status);
    reset({
      service_name: status.service_name || "",
      status: status.status || "operational",
      message: status.message || "",
      last_updated: status.last_updated ? status.last_updated.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setShowForm(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      operational: { label: "Operacional", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: CheckCircle, bgGradient: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30" },
      degraded_performance: { label: "Rendimiento Degradado", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock, bgGradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30" },
      partial_outage: { label: "Interrupción Parcial", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: AlertTriangle, bgGradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30" },
      major_outage: { label: "Interrupción Total", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: XCircle, bgGradient: "from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30" }
    };
    return configs[status] || configs.operational;
  };

  const filteredStatuses = statuses.filter((status) => {
    const matchesSearch = !searchTerm || status.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) || (status.message && status.message.toLowerCase().includes(searchTerm.toLowerCase()));
    let matchesFilter = true;
    if (statusTypeFilter === "operational") matchesFilter = status.status === "operational";
    else if (statusTypeFilter === "issues") matchesFilter = status.status !== "operational";
    return matchesSearch && matchesFilter;
  });

  const stats = { total: statuses.length, operational: statuses.filter(s => s.status === "operational").length, issues: statuses.filter(s => s.status !== "operational").length };
  const getHealthPercentage = () => stats.total === 0 ? 100 : (stats.operational / stats.total) * 100;
  const activeFilters = [statusTypeFilter !== "all"].filter(Boolean).length;

  if (loading && statuses.length === 0) {
    return (
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={closeForm} disabled={isSubmitting} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold">
              {editingStatus ? "Editar Servicio" : "Nuevo Servicio"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={closeForm} disabled={isSubmitting} size="sm">
              Cancelar
            </Button>
            <Button type="button" onClick={() => (document.getElementById('status-form') as HTMLFormElement | null)?.requestSubmit()} disabled={isSubmitting} size="sm">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingStatus ? "Guardando..." : "Creando..."}</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{editingStatus ? "Guardar Cambios" : "Crear Servicio"}</>
              )}
            </Button>
          </div>
        </div>

        <form id="status-form" onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="service_name" className="text-sm font-medium">Nombre del Servicio *</Label>
                  <Input 
                    id="service_name" 
                    {...register('service_name')} 
                    className={`h-9 ${errors.service_name ? "border-red-500" : ""}`} 
                    placeholder="Ej: API de Pagos" 
                  />
                  {errors.service_name && <p className="text-xs text-red-500">{errors.service_name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="last_updated" className="text-sm font-medium">Última Actualización *</Label>
                  <Input 
                    id="last_updated" 
                    type="date" 
                    {...register('last_updated')} 
                    className={`h-9 ${errors.last_updated ? "border-red-500" : ""}`} 
                  />
                  {errors.last_updated && <p className="text-xs text-red-500">{errors.last_updated.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Estado del Servicio *</Label>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v, { shouldValidate: true })}>
                  <SelectTrigger className={`h-9 ${errors.status ? "border-red-500" : ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        Operacional
                      </div>
                    </SelectItem>
                    <SelectItem value="degraded_performance">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        Rendimiento Degradado
                      </div>
                    </SelectItem>
                    <SelectItem value="partial_outage">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Interrupción Parcial
                      </div>
                    </SelectItem>
                    <SelectItem value="major_outage">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Interrupción Total
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm font-medium">Mensaje de Estado</Label>
                <Textarea 
                  id="message" 
                  {...register('message')} 
                  className="min-h-[80px] resize-none text-sm" 
                  placeholder="Mensaje adicional sobre el estado del servicio..." 
                />
                <p className="text-xs text-muted-foreground">Este mensaje se mostrará a los usuarios</p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estado del Sistema</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} servicios monitoreados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchStatuses()} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button onClick={openCreateForm} size="sm" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Servicios Totales</p>
                <p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl">
                <Server className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Operacionales</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.operational}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{getHealthPercentage().toFixed(0)}% saludable</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50/80 to-orange-50/30 dark:from-orange-950/40 dark:to-orange-950/20 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Con Problemas</p>
                <p className="text-2xl font-semibold mt-1 text-orange-800 dark:text-orange-100">{stats.issues}</p>
              </div>
              <div className="p-2.5 bg-orange-500/15 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar servicio..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-9 h-9 w-48 sm:w-64" 
                />
              </div>
              <Button 
                variant={activeFilters > 0 ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusTypeFilter(statusTypeFilter === "all" ? "operational" : statusTypeFilter === "operational" ? "issues" : "all")} 
                className="h-9"
              >
                <Filter className="h-4 w-4 mr-1.5" />
                {statusTypeFilter === "all" ? "Todos" : statusTypeFilter === "operational" ? "Operacionales" : "Con Problemas"}
              </Button>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStatusTypeFilter("all")} className="h-9 text-muted-foreground px-2">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredStatuses.length}</span> servicios
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Servicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Última Actualización</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><Skeleton className="h-10 w-full" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-6 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredStatuses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Server className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron servicios</p>
                    </td>
                  </tr>
                ) : (
                  filteredStatuses.map((status) => {
                    const config = getStatusConfig(status.status);
                    const IconComponent = config.icon;
                    return (
                      <tr key={status.uuid} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${config.bgGradient}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{status.service_name}</p>
                              {status.message && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{status.message}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="outline" className={config.className}>{config.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">
                            {new Date(status.last_updated).toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(status)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar servicio</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(status)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar servicio</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, status: null })} 
        onConfirm={handleConfirmDelete} 
        title="Eliminar Servicio" 
        confirmText="Eliminar" 
        isConfirming={isActionLoading}
      >
        <p>¿Estás seguro de que quieres eliminar el servicio <strong>{confirmModal.status?.service_name}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
}
