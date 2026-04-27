import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import {
  Plus, Edit, Trash2, Search, Eye, EyeOff, DollarSign, Package, RefreshCw, Sparkles, Filter, X, Loader2
} from 'lucide-react';
import { useAdminAddOns, useAdminServicePlans, useAdminCreateAddOn, useAdminUpdateAddOn, useAdminDeleteAddOn } from '@/hooks/useAdminAddOns';
import { toast } from 'sonner';

const addOnSchema = z.object({
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  name: z.string().min(1, 'El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.string().min(1, 'El precio es requerido').refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'El precio debe ser un número válido mayor o igual a 0'),
  currency: z.string().default('MXN'),
  is_active: z.boolean().default(true),
  service_plans: z.array(z.number()).default([]),
});

const AdminAddOnsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; addOn: any }>({ isOpen: false, addOn: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(addOnSchema),
    defaultValues: {
      slug: '',
      name: '',
      description: '',
      price: '',
      currency: 'MXN',
      is_active: true,
      service_plans: [],
    }
  });

  const servicePlansValues = watch('service_plans') || [];

  const listParams = useMemo(() => ({
    search: searchTerm || undefined,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page: currentPage,
    per_page: perPage
  }), [searchTerm, statusFilter, currentPage, perPage]);

  const { data: addOnsData, isLoading, refetch, isFetching } = useAdminAddOns(listParams, {});
  const { data: plansData, isLoading: isLoadingPlans } = useAdminServicePlans();

  const addOns: any[] = (addOnsData as any)?.rows ?? (addOnsData as any)?.data ?? [];
  const pagination: any = (addOnsData as any)?.meta ?? {};
  const servicePlans: any[] = (plansData as any)?.rows ?? (plansData as any)?.data ?? [];

  useEffect(() => {
    if (addOnsData) {
      const total = pagination?.total || addOns.length;
      const lastPage = pagination?.last_page || Math.ceil(total / perPage) || 1;
      setTotalPages(lastPage);
    }
  }, [addOnsData, addOns.length, perPage, pagination]);

  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  const createAddOnMutation = useAdminCreateAddOn();
  const updateAddOnMutation = useAdminUpdateAddOn();
  const deleteAddOnMutation = useAdminDeleteAddOn();

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, price: parseFloat(data.price || 0) };
      if (editingAddOn) {
        await updateAddOnMutation.mutateAsync({ uuid: editingAddOn.uuid, data: payload });
        toast.success(`Add-on "${data.name}" actualizado correctamente`);
      } else {
        await createAddOnMutation.mutateAsync(payload);
        toast.success(`Add-on "${data.name}" creado correctamente`);
      }
      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Error al guardar add-on';
      toast.error('Error', { description: message });
    }
  };

  const handleDelete = (addOn: any) => {
    setConfirmModal({ isOpen: true, addOn });
  };

  const handleConfirmDelete = async () => {
    setIsActionLoading(true);
    try {
      await deleteAddOnMutation.mutateAsync(confirmModal.addOn?.uuid);
      toast.success('Add-on eliminado correctamente');
      setConfirmModal({ isOpen: false, addOn: null });
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Error al eliminar add-on';
      toast.error('Error', { description: message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingAddOn(null);
    reset();
  };

  const openEditSheet = (addOn) => {
    setEditingAddOn(addOn);
    reset({
      slug: addOn.slug ?? '',
      name: addOn.name ?? '',
      description: addOn.description ?? '',
      price: (addOn.price ?? '').toString(),
      currency: addOn.currency ?? 'MXN',
      is_active: Boolean(addOn.is_active),
      service_plans: addOn.plans?.map((p) => p.id) ?? [],
    });
    setIsSheetOpen(true);
  };

  const handleServicePlanChange = (planId, checked) => {
    const current = servicePlansValues;
    setValue('service_plans', checked ? [...current, planId] : current.filter(id => id !== planId), { shouldValidate: true });
  };

  const stats = useMemo(() => ({
    total: pagination?.total || addOns.length,
    activos: addOns.filter((a) => a.is_active).length,
    avg: addOns.length > 0 ? addOns.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0) / addOns.length : 0
  }), [addOns, pagination]);

  const getActivePercentage = () => stats.total === 0 ? 0 : (stats.activos / stats.total) * 100;

  const activeFilters = [statusFilter !== 'all'].filter(Boolean).length;

  const isLoadingState = isLoading || isFetching;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add-ons</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} add-ons registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setDataLoaded(false); refetch(); }}
            variant="outline"
            size="sm"
            disabled={isLoadingState}
          >
            {isLoadingState ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button onClick={() => { reset(); setEditingAddOn(null); setIsSheetOpen(true); }} size="sm" disabled={isLoadingState}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Add-on
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</p>
                <p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl">
                <Package className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
            <Progress value={100} className="h-1 mt-3 bg-slate-200/50 dark:bg-slate-700/50" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Activos</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.activos}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <Eye className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <Progress value={getActivePercentage()} className="h-1 mt-3 bg-emerald-200/50 dark:bg-emerald-800/50 [&>div]:bg-emerald-500" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50/80 to-violet-50/30 dark:from-violet-950/40 dark:to-violet-950/20 border-violet-200/50 dark:border-violet-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Precio Prom.</p>
                <p className="text-2xl font-semibold mt-1 text-violet-800 dark:text-violet-100">${stats.avg.toFixed(0)}</p>
              </div>
              <div className="p-2.5 bg-violet-500/15 rounded-xl">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add-ons Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Header with search, filters and count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar add-ons..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 w-48 sm:w-64 text-foreground"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9"
              >
                <Filter className="h-4 w-4 mr-1.5" />
                Filtros
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{addOns.length}</span> add-ons
            </div>
          </div>

          {/* Filter dropdowns inline */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border dark:border-white/10">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Add-on
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {isLoadingState ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : addOns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron add-ons</p>
                    </td>
                  </tr>
                ) : (
                  addOns.map((addOn) => (
                    <tr key={addOn.id || addOn.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{addOn.name}</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">{addOn.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-sm text-foreground">{addOn.price}</span>
                          <span className="text-xs text-muted-foreground">{addOn.currency}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{addOn.description || 'Sin descripción'}</p>
                      </td>
                      <td className="px-4 py-3">
                        {addOn.is_active ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <Eye className="h-3 w-3 mr-1" />Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                            <EyeOff className="h-3 w-3 mr-1" />Inactivo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditSheet(addOn)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar add-on</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(addOn)}
                                disabled={deleteAddOnMutation.isPending}
                              >
                                {deleteAddOnMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar add-on</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {addOns.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-white/10">
              <div className="text-sm text-muted-foreground">
                Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoadingState}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoadingState}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoadingState}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0 bg-background dark:bg-[#0f1115]">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b border-border dark:border-white/10 shrink-0">
              <SheetTitle className="text-xl font-semibold text-foreground">
                {editingAddOn ? 'Editar Add-on' : 'Nuevo Add-on'}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                {editingAddOn ? 'Modifica los datos del add-on' : 'Completa la información para crear un nuevo add-on'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                      placeholder="SSL Extra"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug *</Label>
                    <Input
                      id="slug"
                      {...register('slug')}
                      className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                      placeholder="ssl-extra"
                    />
                    {errors.slug && (
                      <p className="text-xs text-red-500">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={2}
                    className="resize-none bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                    placeholder="Descripción del add-on..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-foreground">Precio (MXN) *</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register('price')}
                      className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                      placeholder="99.00"
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">{errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Moneda</Label>
                    <div className="h-10 px-3 flex items-center rounded-md border border-border dark:border-white/10 bg-muted dark:bg-[#0f1115] text-sm text-foreground">
                      MXN (Peso Mexicano)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    {...register('is_active')}
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-foreground">Add-on Activo</Label>
                </div>

                {servicePlans.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Planes de Servicio</Label>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto border border-border dark:border-white/10 rounded-lg p-3 bg-background dark:bg-[#0f1115]">
                      {servicePlans.map((plan) => (
                        <label key={plan.id} className="flex items-center gap-3 cursor-pointer text-foreground">
                          <input
                            type="checkbox"
                            checked={servicePlansValues.includes(plan.id)}
                            onChange={(e) => handleServicePlanChange(plan.id, e.target.checked)}
                            className="rounded border-input w-4 h-4 accent-primary"
                          />
                          <span className="text-sm">{plan.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border dark:border-white/10 shrink-0 bg-background dark:bg-[#0f1115]">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingAddOn ? 'Guardando...' : 'Creando...'}
                      </>
                    ) : (
                      editingAddOn ? 'Guardar Cambios' : 'Crear Add-on'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, addOn: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Add-on"
        confirmText="Eliminar"
        isConfirming={isActionLoading}
      >
        <p>¿Estás seguro de que quieres eliminar el add-on <strong className="text-foreground">{confirmModal.addOn?.name}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
};

export default AdminAddOnsPage;
