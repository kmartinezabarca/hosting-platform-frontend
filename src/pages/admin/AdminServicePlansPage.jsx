import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Package,
  Zap,
  DollarSign,
  Filter,
  X,
  Settings2
} from 'lucide-react';
import {
  useAdminServicePlans,
  useAdminServicePlanCategories,
  useAdminBillingCycles,
  useCreateAdminServicePlan,
  useUpdateAdminServicePlan,
  useDeleteAdminServicePlan,
} from '../../hooks/useAdminServicePlans';
import { toast } from 'sonner';

const planSchema = z.object({
  category_id: z.string().min(1, 'La categoría es requerida'),
  slug: z.string().min(1, 'El slug es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  base_price: z.string().min(1, 'El precio es requerido').refine(val => parseFloat(val) > 0, 'El precio debe ser mayor a 0'),
  setup_fee: z.string().optional(),
  is_popular: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.string().optional(),
  features: z.array(z.string()).optional(),
  pricing: z.array(z.object({
    billing_cycle_id: z.number(),
    price: z.string()
  })).optional(),
  specifications: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).optional(),
});

const AdminServicePlansPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, plan: null });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      category_id: '',
      slug: '',
      name: '',
      description: '',
      base_price: '',
      setup_fee: '0',
      is_popular: false,
      is_active: true,
      sort_order: '0',
      features: [],
      pricing: [],
      specifications: []
    }
  });

  const features = watch('features') || [];
  const pricing = watch('pricing') || [];
  const specifications = watch('specifications') || [];

  const filters = useMemo(() => {
    const params = { page: currentPage, per_page: perPage };
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== 'all') params.category_id = selectedCategory;
    if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
    return params;
  }, [searchTerm, selectedCategory, statusFilter, currentPage, perPage]);

  const { data: plansData, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useAdminServicePlans(filters);
  const { data: categoriesData, isLoading: categoriesLoading } = useAdminServicePlanCategories();
  const { data: billingCyclesData, isLoading: billingCyclesLoading } = useAdminBillingCycles();

  const createPlanMutation = useCreateAdminServicePlan();
  const updatePlanMutation = useUpdateAdminServicePlan();
  const deletePlanMutation = useDeleteAdminServicePlan();

  const servicePlans = plansData?.data || [];
  const categories = categoriesData?.data || [];
  const billingCycles = billingCyclesData?.data || [];

  useEffect(() => {
    if (plansData) {
      const total = plansData.pagination?.total || servicePlans.length;
      const lastPage = plansData.pagination?.last_page || Math.ceil(total / perPage) || 1;
      setTotalPages(lastPage);
    }
  }, [plansData, servicePlans.length, perPage]);

  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  const stats = useMemo(() => ({
    total: plansData?.pagination?.total || servicePlans.length,
    active: servicePlans.filter(p => p.is_active).length,
    popular: servicePlans.filter(p => p.is_popular).length,
  }), [servicePlans, plansData]);

  const getActivePercentage = () => stats.total === 0 ? 0 : (stats.active / stats.total) * 100;
  const activeFilters = [selectedCategory !== 'all', statusFilter !== 'all'].filter(Boolean).length;

  const onSubmit = async (data) => {
    try {
      const specsObject = Object.fromEntries(
        (data.specifications || [])
          .filter(s => s.key?.trim())
          .map(s => [s.key.trim(), s.value])
      );
      const payload = {
        ...data,
        specifications: Object.keys(specsObject).length > 0 ? specsObject : null,
      };
      if (editingPlan) {
        await updatePlanMutation.mutateAsync({ uuid: editingPlan.uuid, planData: payload });
        toast.success('Plan actualizado correctamente');
      } else {
        await createPlanMutation.mutateAsync(payload);
        toast.success('Plan creado correctamente');
      }
      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error saving service plan:', error);
      toast.error('Error al guardar plan');
    }
  };

  const handleDelete = (plan) => setConfirmModal({ isOpen: true, plan });

  const handleConfirmDelete = async () => {
    setIsActionLoading(true);
    try {
      await deletePlanMutation.mutateAsync(confirmModal.plan.uuid);
      toast.success('Plan eliminado correctamente');
      setConfirmModal({ isOpen: false, plan: null });
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error deleting service plan:', error);
      toast.error('Error al eliminar plan');
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingPlan(null);
    reset();
  };

  const openEditSheet = (plan) => {
    setEditingPlan(plan);
    reset({
      category_id: plan.category_id?.toString() || '',
      slug: plan.slug,
      name: plan.name,
      description: plan.description || '',
      base_price: plan.base_price?.toString() || '',
      setup_fee: plan.setup_fee?.toString() || '0',
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      sort_order: plan.sort_order?.toString() || '0',
      features: plan.features?.map(f => f.feature) || [],
      pricing: plan.pricing?.map(p => ({
        billing_cycle_id: p.billing_cycle_id,
        price: p.price?.toString() || ''
      })) || [],
      specifications: Object.entries(plan.specifications || {}).map(([key, value]) => ({ key, value }))
    });
    setIsSheetOpen(true);
  };

  const addFeature = () => setValue('features', [...features, '']);
  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setValue('features', newFeatures);
  };
  const removeFeature = (index) => setValue('features', features.filter((_, i) => i !== index));

  const addPricing = () => setValue('pricing', [...pricing, { billing_cycle_id: '', price: '' }]);
  const updatePricing = (index, field, value) => {
    const newPricing = [...pricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setValue('pricing', newPricing);
  };
  const removePricing = (index) => setValue('pricing', pricing.filter((_, i) => i !== index));

  const addSpec = () => setValue('specifications', [...specifications, { key: '', value: '' }]);
  const updateSpec = (index, field, val) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: val };
    setValue('specifications', updated);
  };
  const removeSpec = (index) => setValue('specifications', specifications.filter((_, i) => i !== index));

  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'Sin categoría';

  if (plansError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md bg-background dark:bg-[#0f1115]">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Error al cargar</h3>
            <p className="text-sm text-muted-foreground mb-4">{plansError.message}</p>
            <Button onClick={() => refetchPlans()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Planes de Servicio</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} planes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setDataLoaded(false); refetchPlans(); }} variant="outline" size="sm" disabled={plansLoading}>
            {plansLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button onClick={() => { reset(); setEditingPlan(null); setIsSheetOpen(true); }} size="sm" disabled={plansLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
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
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.active}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <Progress value={getActivePercentage()} className="h-1 mt-3 bg-emerald-200/50 dark:bg-emerald-800/50 [&>div]:bg-emerald-500" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50/80 to-violet-50/30 dark:from-violet-950/40 dark:to-violet-950/20 border-violet-200/50 dark:border-violet-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Populares</p>
                <p className="text-2xl font-semibold mt-1 text-violet-800 dark:text-violet-100">{stats.popular}</p>
              </div>
              <div className="p-2.5 bg-violet-500/15 rounded-xl">
                <Star className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar planes..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 w-48 sm:w-64 text-foreground"
                />
              </div>
              <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
                <Filter className="h-4 w-4 mr-1.5" />
                Filtros
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilters}</Badge>
                )}
              </Button>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory('all'); setStatusFilter('all'); }} className="h-9 text-muted-foreground px-2">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{servicePlans.length}</span> planes
            </div>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border dark:border-white/10">
              <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Características</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {plansLoading || categoriesLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div></div></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-8 w-8 rounded" /></div></td>
                    </tr>
                  ))
                ) : servicePlans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron planes</p>
                    </td>
                  </tr>
                ) : (
                  servicePlans.map((plan) => (
                    <tr key={plan.id || plan.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${plan.is_popular ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {plan.is_popular ? <Star className="h-5 w-5 text-violet-600 dark:text-violet-400" /> : <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-foreground truncate">{plan.name}</p>
                              {plan.is_popular && (
                                <Badge variant="secondary" className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                  <Star className="h-3 w-3 mr-1" />Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{plan.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20">
                          {getCategoryName(plan.category_id)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-sm text-foreground">{plan.base_price}</span>
                          <span className="text-xs text-muted-foreground">MXN</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {plan.is_active ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <Eye className="h-3 w-3 mr-1" />Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                            <EyeOff className="h-3 w-3 mr-1" />Inactivo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{plan.features?.length || 0} características</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSheet(plan)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar plan</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(plan)} disabled={deletePlanMutation.isPending}>
                                {deletePlanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar plan</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-white/10">
              <div className="text-sm text-muted-foreground">Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || plansLoading}>Anterior</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(pageNum)} disabled={plansLoading} className="h-8 w-8 p-0">
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || plansLoading}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="!w-full !max-w-[640px] p-0 flex flex-col gap-0 bg-background dark:bg-[#0f1115]">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b border-border dark:border-white/10 shrink-0">
              <SheetTitle className="text-xl font-semibold text-foreground">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                {editingPlan ? 'Modifica los datos del plan' : 'Completa la información para crear un nuevo plan'}
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4 shrink-0 bg-muted dark:bg-[#1a1a1a]">
                    <TabsTrigger value="basic">Información</TabsTrigger>
                    <TabsTrigger value="features">Características</TabsTrigger>
                    <TabsTrigger value="pricing">Precios</TabsTrigger>
                    <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre del Plan *</Label>
                        <Input id="name" {...register('name')} className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" placeholder="Plan Básico" />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug *</Label>
                        <Input id="slug" {...register('slug')} className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" placeholder="plan-basico" />
                        {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</Label>
                      <Textarea id="description" {...register('description')} className="resize-none bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" placeholder="Descripción del plan..." rows={2} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Categoría *</Label>
                        <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                          <SelectTrigger className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base_price" className="text-sm font-medium text-foreground">Precio Base (MXN) *</Label>
                        <Input id="base_price" type="number" {...register('base_price')} className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" placeholder="99.00" />
                        {errors.base_price && <p className="text-xs text-red-500">{errors.base_price.message}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Switch id="is_popular" {...register('is_popular')} />
                        <Label htmlFor="is_popular" className="text-sm font-medium cursor-pointer text-foreground">Plan Popular</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch id="is_active" {...register('is_active')} />
                        <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-foreground">Plan Activo</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-3">
                    <div className="flex justify-between items-center shrink-0">
                      <Label className="text-sm font-medium text-foreground">Características</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addFeature} className="shrink-0">
                        <Plus className="h-4 w-4 mr-1" />Agregar
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="Característica..." className="flex-1 h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="h-10 w-10 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {features.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No hay características agregadas</p>
                          <p className="text-xs mt-1">Usa el botón "Agregar" para añadir</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-3">
                    <div className="flex justify-between items-center shrink-0">
                      <Label className="text-sm font-medium text-foreground">Precios por Ciclo</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addPricing} className="shrink-0">
                        <Plus className="h-4 w-4 mr-1" />Agregar
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {pricing.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Select value={item.billing_cycle_id?.toString() || ''} onValueChange={(v) => updatePricing(index, 'billing_cycle_id', Number(v))}>
                            <SelectTrigger className="w-36 h-10 shrink-0 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground">
                              <SelectValue placeholder="Ciclo" />
                            </SelectTrigger>
                            <SelectContent>
                              {billingCycles.map(cycle => (
                                <SelectItem key={cycle.id} value={cycle.id.toString()}>{cycle.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input type="number" value={item.price} onChange={(e) => updatePricing(index, 'price', e.target.value)} placeholder="Precio" className="flex-1 h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removePricing(index)} className="h-10 w-10 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {pricing.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No hay precios agregados</p>
                          <p className="text-xs mt-1">Usa el botón "Agregar" para añadir</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="specs" className="space-y-3">
                    <div className="flex justify-between items-center shrink-0">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Especificaciones Técnicas</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Pares clave → valor visibles en la ficha del plan</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addSpec} className="shrink-0">
                        <Plus className="h-4 w-4 mr-1" />Agregar
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={spec.key}
                            onChange={(e) => updateSpec(index, 'key', e.target.value)}
                            placeholder="Clave (ej. ram)"
                            className="w-36 shrink-0 h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground font-mono text-sm"
                          />
                          <span className="text-muted-foreground shrink-0 select-none">→</span>
                          <Input
                            value={spec.value}
                            onChange={(e) => updateSpec(index, 'value', e.target.value)}
                            placeholder="Valor (ej. 4 GB RAM)"
                            className="flex-1 h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSpec(index)}
                            className="h-10 w-10 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {specifications.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                          <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Sin especificaciones definidas</p>
                          <p className="text-xs mt-1">Ejemplos: <span className="font-mono">ram → 4 GB RAM</span>, <span className="font-mono">storage → 100 GB SSD</span></p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="px-6 py-4 border-t border-border dark:border-white/10 shrink-0 bg-background dark:bg-[#0f1115]">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1" disabled={isSubmitting}>Cancelar</Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingPlan ? 'Guardando...' : 'Creando...'}</>
                    ) : (
                      editingPlan ? 'Guardar Cambios' : 'Crear Plan'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, plan: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Plan"
        confirmText="Eliminar"
        isConfirming={isActionLoading}
      >
        <p>¿Estás seguro de que quieres eliminar el plan <strong className="text-foreground">{confirmModal.plan?.name}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
};

export default AdminServicePlansPage;
