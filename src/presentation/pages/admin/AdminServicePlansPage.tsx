import React, { useState, useMemo, useEffect, startTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSoftwareVersions } from '@application/hooks/useSoftwareVersions';
import { eggNameToIdentifier } from '@infrastructure/services/softwareVersionService';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Label } from '@presentation/components/ui/label';
import { Textarea } from '@presentation/components/ui/textarea';
import { Switch } from '@presentation/components/ui/switch';
import { Checkbox } from '@presentation/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@presentation/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@presentation/components/ui/sheet';
import { Card, CardContent } from '@presentation/components/ui/card';
import { Badge } from '@presentation/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@presentation/components/ui/tabs';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@presentation/components/ui/tooltip';
import ConfirmationModal from '@presentation/components/features/modals/ConfirmationModal';
import { StatCard } from '@presentation/components/ui/stat-card';
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
  Settings2,
  Gamepad2,
  AlertTriangle,
  CheckCheck,
  FileText,
} from 'lucide-react';
import {
  useAdminServicePlans,
  useAdminServicePlan,
  useAdminServicePlanCategories,
  useAdminBillingCycles,
  useCreateAdminServicePlan,
  useUpdateAdminServicePlan,
  useDeleteAdminServicePlan,
  useBulkDeleteAdminServicePlans,
  useBulkActivateAdminServicePlans,
  useBulkDeactivateAdminServicePlans,
} from '@application/hooks/useAdminServicePlans';
import { toast } from '@presentation/components/features/ToastProvider';

const planSchema = z.object({
  category_id: z.string().min(1, 'La categoría es requerida'),
  slug: z.string().min(1, 'El slug es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  // base_price es opcional a nivel campo; superRefine lo requiere solo para planes de pago
  base_price: z.string().optional().default(''),
  setup_fee: z.string().optional(),
  stripe_price_id: z.string().optional(),
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
  // ── Pterodactyl fields ────────────────────────────────────────────────────
  provisioner:             z.string().optional(),
  pterodactyl_egg:         z.string().optional(),
  pterodactyl_version:     z.string().optional(),
  // Laravel serializa arrays PHP vacíos como [] en JSON; normalizar a {} antes de validar
  pterodactyl_environment: z.preprocess(
    (val) => (Array.isArray(val) || val === null || val === undefined ? {} : val),
    z.record(z.string()).optional()
  ),
  // ── Claves SAT para CFDI ─────────────────────────────────────────────────
  sat_clave_prod_serv:     z.string().max(10).optional(),
  sat_clave_unidad:        z.string().max(3).optional(),
  // ── Tipo de plan ─────────────────────────────────────────────────────────
  plan_type:               z.enum(['paid', 'free', 'trial']).default('paid'),
  trial_days:              z.string().optional(),
  converts_to_plan_id:     z.string().optional(),
}).superRefine((data, ctx) => {
  // base_price solo es requerido para planes de pago
  if (data.plan_type === 'paid' && (!data.base_price || data.base_price.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 1,
      type: 'string',
      inclusive: true,
      message: 'El precio es requerido para planes de pago',
      path: ['base_price'],
    });
  }
});

// ── Egg options ───────────────────────────────────────────────────────────────

const EGG_OPTIONS = [
  // ── PaperMC family ────────────────────────────────────────────────────────
  { label: 'Paper MC',               value: 'paper mc',                envKey: 'MC_VERSION'              },
  { label: 'Purpur',                 value: 'purpur',                  envKey: 'MC_VERSION'              },
  { label: 'Purpur Geyser',          value: 'purpur-geyser',           envKey: 'MC_VERSION'              },
  { label: 'Folia',                  value: 'folia',                   envKey: 'MC_VERSION'              },
  // ── Spigot ───────────────────────────────────────────────────────────────
  { label: 'Spigot',                 value: 'spigot',                  envKey: 'MC_VERSION'              },
  // ── Modded — Fabric / Quilt ──────────────────────────────────────────────
  { label: 'Fabric',                 value: 'fabric',                  envKey: 'FABRIC_LOADER_VERSION'   },
  { label: 'Quilt',                  value: 'quilt',                   envKey: 'QUILT_LOADER_VERSION'    },
  // ── Modded — Forge / Maven ───────────────────────────────────────────────
  { label: 'Forge',                  value: 'forge',                   envKey: 'FORGE_VERSION'           },
  { label: 'NeoForge',               value: 'neoforge',                envKey: 'NEOFORGE_VERSION'        },
  { label: 'Arclight',               value: 'arclight',                envKey: 'ARCLIGHT_VERSION'        },
  { label: 'Sponge (SpongeVanilla)', value: 'sponge',                  envKey: 'SPONGE_VERSION'          },
  // ── Vanilla ──────────────────────────────────────────────────────────────
  { label: 'Vanilla Java',           value: 'vanilla java',            envKey: 'MC_VERSION'              },
  { label: 'Vanilla Bedrock',        value: 'vanilla bedrock',         envKey: 'MC_VERSION'              },
  // ── Bedrock server ───────────────────────────────────────────────────────
  { label: 'Nukkit (Bedrock)',        value: 'nukkit',                  envKey: 'NUKKIT_VERSION'          },
  // ── Proxy ─────────────────────────────────────────────────────────────────
  { label: 'Velocity',               value: 'velocity',                envKey: 'VELOCITY_VERSION'        },
  { label: 'BungeeCord',             value: 'bungeecord',              envKey: 'BUNGEE_VERSION'          },
];

// ── PterodactylTab component ──────────────────────────────────────────────────

const PterodactylTab = ({ watch, setValue }: { watch: any; setValue: any }) => {
  const provisioner   = watch('provisioner')       as string;
  const selectedEgg   = watch('pterodactyl_egg')   as string;
  const selectedVer   = watch('pterodactyl_version') as string;

  const identifier    = eggNameToIdentifier(selectedEgg);
  const { data: versions = [], isLoading: versionsLoading } = useSoftwareVersions(identifier, !!identifier);

  const isPterodactyl = provisioner === 'pterodactyl';

  // When version changes, update pterodactyl_environment too
  const handleVersionChange = (ver: string) => {
    setValue('pterodactyl_version', ver);
    const egg    = EGG_OPTIONS.find(e => e.value === selectedEgg);
    const envKey = egg?.envKey ?? 'VERSION';
    setValue('pterodactyl_environment', { [envKey]: ver });
  };

  // When egg changes, reset version and re-trigger environment
  const handleEggChange = (egg: string) => {
    setValue('pterodactyl_egg', egg);
    setValue('pterodactyl_version', 'latest');
    const eggOpt = EGG_OPTIONS.find(e => e.value === egg);
    setValue('pterodactyl_environment', { [eggOpt?.envKey ?? 'VERSION']: 'latest' });
  };

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium text-foreground">Proveedor de aprovisionamiento</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">Selecciona si este plan usa Pterodactyl para servidores de juego.</p>
        <Select value={provisioner || 'none'} onValueChange={(v) => setValue('provisioner', v === 'none' ? '' : v)}>
          <SelectTrigger className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground">
            <SelectValue placeholder="Sin proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin proveedor</SelectItem>
            <SelectItem value="pterodactyl">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-violet-500" />Pterodactyl
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPterodactyl && (
        <>
          {/* Egg selector */}
          <div>
            <Label className="text-sm font-medium text-foreground">Tipo de servidor (Egg)</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              El egg de Pterodactyl determina qué software se instalará.
            </p>
            <Select value={selectedEgg} onValueChange={handleEggChange}>
              <SelectTrigger className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground">
                <SelectValue placeholder="Seleccionar egg…" />
              </SelectTrigger>
              <SelectContent>
                {EGG_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Version selector */}
          {selectedEgg && (
            <div>
              <Label className="text-sm font-medium text-foreground">Versión del servidor</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                Se guarda en la variable de entorno del egg. Selecciona "latest" para siempre la más reciente.
              </p>

              {versionsLoading ? (
                <Select disabled>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Cargando versiones…" />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              ) : (
                <>
                  <Select value={selectedVer} onValueChange={handleVersionChange}>
                    <SelectTrigger className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {versions.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!identifier && (
                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>No se pudieron cargar las versiones. Se usará &quot;latest&quot;.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Environment variables summary */}
          {selectedEgg && selectedVer && (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-xs">
              <p className="font-medium text-foreground mb-2">Variable de entorno generada:</p>
              <div className="font-mono text-muted-foreground">
                <span className="text-blue-500 dark:text-blue-400">
                  {EGG_OPTIONS.find(e => e.value === selectedEgg)?.envKey ?? 'VERSION'}
                </span>
                {' = '}
                <span className="text-emerald-600 dark:text-emerald-400">{selectedVer}</span>
              </div>
            </div>
          )}
        </>
      )}

      {!isPterodactyl && (
        <div className="text-center py-10 text-muted-foreground">
          <Gamepad2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecciona <strong>Pterodactyl</strong> como proveedor para configurar el servidor de juego.</p>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

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
  const [isSheetReady, setIsSheetReady] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingPlanUuid, setEditingPlanUuid] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; plan: any }>({ isOpen: false, plan: null });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      category_id: '',
      slug: '',
      name: '',
      description: '',
      base_price: '',
      setup_fee: '0',
      stripe_price_id: '',
      is_popular: false,
      is_active: true,
      sort_order: '0',
      features: [],
      pricing: [],
      specifications: [],
      provisioner: '',
      pterodactyl_egg: '',
      pterodactyl_version: 'latest',
      pterodactyl_environment: {},
      sat_clave_prod_serv: '81161501',
      sat_clave_unidad: 'E48',
      plan_type: 'paid' as const,
      trial_days: '',
      converts_to_plan_id: '',
    }
  });

  const features = watch('features') || [];
  const pricing = watch('pricing') || [];
  const specifications = watch('specifications') || [];
  const planType = watch('plan_type');


  const filters = useMemo(() => {
    const params: Record<string, any> = { page: currentPage, per_page: perPage };
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== 'all') params.category_id = selectedCategory;
    if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
    return params;
  }, [searchTerm, selectedCategory, statusFilter, currentPage, perPage]);

  const { data: plansData, isLoading: plansLoading, isFetching: plansFetching, error: plansError, refetch: refetchPlans } = useAdminServicePlans(filters);
  const { data: categoriesData, isLoading: categoriesLoading } = useAdminServicePlanCategories();
  const { data: billingCyclesData, isLoading: billingCyclesLoading } = useAdminBillingCycles();
  const { data: planDetailRaw, isLoading: planDetailLoading } = useAdminServicePlan(editingPlanUuid);

  const createPlanMutation = useCreateAdminServicePlan();
  const updatePlanMutation = useUpdateAdminServicePlan();
  const deletePlanMutation = useDeleteAdminServicePlan();
  const bulkDeleteMutation = useBulkDeleteAdminServicePlans();
  const bulkActivateMutation = useBulkActivateAdminServicePlans();
  const bulkDeactivateMutation = useBulkDeactivateAdminServicePlans();

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

  // Poblar el form con el detalle completo del plan cuando llega desde la API
  useEffect(() => {
    if (!editingPlanUuid || !planDetailRaw) return;
    const plan = (planDetailRaw as any)?.data ?? planDetailRaw;
    if (!plan?.uuid) return;
    setEditingPlan(plan);
    startTransition(() => {
      reset({
        category_id:              plan.category_id?.toString() || '',
        slug:                     plan.slug,
        name:                     plan.name,
        description:              plan.description || '',
        base_price:               plan.base_price?.toString() || '',
        setup_fee:                plan.setup_fee?.toString() || '0',
        stripe_price_id:          plan.stripe_price_id || '',
        is_popular:               plan.is_popular,
        is_active:                plan.is_active,
        sort_order:               plan.sort_order?.toString() || '0',
        features:                 plan.features?.map((f: any) => f.feature ?? f) || [],
        pricing:                  plan.pricing?.map((p: any) => ({
          billing_cycle_id: p.billing_cycle_id,
          price:            p.price?.toString() || '',
        })) || [],
        specifications:           Object.entries(plan.specifications || {}).map(([key, value]) => ({ key, value: value as string })),
        provisioner:              plan.provisioner || '',
        pterodactyl_egg:          plan.pterodactyl_egg || '',
        pterodactyl_version:      plan.pterodactyl_version || 'latest',
        pterodactyl_environment:  plan.pterodactyl_environment || {},
        sat_clave_prod_serv:      plan.sat_clave_prod_serv || '81161501',
        sat_clave_unidad:         plan.sat_clave_unidad || 'E48',
        plan_type:                (plan.plan_type as 'paid' | 'free' | 'trial') || 'paid',
        trial_days:               plan.trial_days?.toString() || '',
        converts_to_plan_id:      plan.converts_to_plan_id?.toString() || '',
      });
    });
  }, [planDetailRaw, editingPlanUuid, reset]);

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
        // Convertir sentinels a null para el backend
        converts_to_plan_id: data.converts_to_plan_id && data.converts_to_plan_id !== 'none'
          ? Number(data.converts_to_plan_id)
          : null,
        trial_days: data.trial_days ? Number(data.trial_days) : null,
        // Para free/trial, forzar base_price a 0
        base_price: (data.plan_type === 'free' || data.plan_type === 'trial') ? '0' : data.base_price,
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

  const handleDelete = (plan) => {
    setBulkActionType(null);
    setConfirmModal({ isOpen: true, plan });
  };

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

  // ── Bulk actions ──────────────────────────────────────────────────────────────

  const handleBulkAction = (type: 'activate' | 'deactivate' | 'delete') => {
    setBulkActionType(type);
    setConfirmModal({ isOpen: true, plan: null });
  };

  const handleConfirmBulkAction = async () => {
    if (!bulkActionType || selectedUuids.length === 0) return;
    setIsActionLoading(true);
    try {
      if (bulkActionType === 'activate') {
        await bulkActivateMutation.mutateAsync(selectedUuids);
        toast.success(`${selectedUuids.length} plan(es) activado(s)`);
      } else if (bulkActionType === 'deactivate') {
        await bulkDeactivateMutation.mutateAsync(selectedUuids);
        toast.success(`${selectedUuids.length} plan(es) desactivado(s)`);
      } else if (bulkActionType === 'delete') {
        await bulkDeleteMutation.mutateAsync(selectedUuids);
        toast.success(`${selectedUuids.length} plan(es) eliminado(s)`);
      }
      setSelectedUuids([]);
      setBulkActionType(null);
      setConfirmModal({ isOpen: false, plan: null });
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Error al realizar la acción masiva');
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUuids.length === servicePlans.length) {
      setSelectedUuids([]);
    } else {
      setSelectedUuids(servicePlans.map(p => p.uuid));
    }
  };

  const toggleSelect = (uuid: string) => {
    setSelectedUuids(prev =>
      prev.includes(uuid) ? prev.filter(u => u !== uuid) : [...prev, uuid]
    );
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setIsSheetReady(false);
    setEditingPlan(null);
    setEditingPlanUuid(null);
    reset();
  };

  const openEditSheet = (plan) => {
    setIsSheetReady(false);
    setEditingPlanUuid(plan.uuid);
    setEditingPlan(plan);
    setIsSheetOpen(true);
    // Render the heavy form content only after the open animation finishes
    setTimeout(() => setIsSheetReady(true), 220);
  };

  const addFeature = () => setValue('features', [...features, '']);
  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setValue('features', newFeatures);
  };
  const removeFeature = (index) => setValue('features', features.filter((_, i) => i !== index));

  const addPricing = () => setValue('pricing', [...pricing, { billing_cycle_id: '' as any, price: '' }] as any);
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
          <Button onClick={() => { setDataLoaded(false); refetchPlans(); }} variant="outline" size="sm" disabled={plansFetching}>
            {plansFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button onClick={() => { reset(); setEditingPlan(null); setIsSheetReady(false); setIsSheetOpen(true); setTimeout(() => setIsSheetReady(true), 220); }} size="sm" disabled={plansLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total" value={stats.total} accent="slate" loading={plansFetching} />
        <StatCard icon={Zap} label="Activos" value={stats.active} progress={getActivePercentage()} accent="emerald" loading={plansFetching} />
        <StatCard icon={Star} label="Populares" value={stats.popular} accent="violet" loading={plansFetching} />
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

          {/* Bulk action bar */}
          {selectedUuids.length > 0 && (
            <div className="flex items-center gap-2 mb-3 px-2 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <CheckCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{selectedUuids.length} seleccionado(s)</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')} className="h-8 text-xs">
                  <Eye className="h-3.5 w-3.5 mr-1" />Activar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')} className="h-8 text-xs">
                  <EyeOff className="h-3.5 w-3.5 mr-1" />Desactivar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')} className="h-8 text-xs">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUuids([])} className="h-8 text-xs text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      className="mt-0.5"
                      checked={servicePlans.length > 0 && selectedUuids.length === servicePlans.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Características</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {plansFetching || categoriesLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-4 rounded" /></td>
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
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron planes</p>
                    </td>
                  </tr>
                ) : (
                  servicePlans.map((plan) => (
                    <tr key={plan.id || plan.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          className="mt-0.5"
                          checked={selectedUuids.includes(plan.uuid)}
                          onCheckedChange={() => toggleSelect(plan.uuid)}
                          aria-label={`Seleccionar ${plan.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${plan.is_popular ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {plan.is_popular ? <Star className="h-5 w-5 text-violet-600 dark:text-violet-400" /> : <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm text-foreground truncate">{plan.name}</p>
                              {plan.is_popular && (
                                <Badge variant="secondary" className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                  <Star className="h-3 w-3 mr-1" />Popular
                                </Badge>
                              )}
                              {plan.plan_type === 'free' && (
                                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                                  Gratis
                                </Badge>
                              )}
                              {plan.plan_type === 'trial' && (
                                <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                                  Trial {plan.trial_days}d
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
                        {plan.plan_type === 'free' || plan.plan_type === 'trial' ? (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm text-blue-500">$0</span>
                            <span className="text-xs text-muted-foreground">
                              {plan.plan_type === 'trial' ? `· ${plan.trial_days}d trial` : '· Gratis'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-sm text-foreground">{plan.base_price}</span>
                            <span className="text-xs text-muted-foreground">MXN</span>
                          </div>
                        )}
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
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">{plan.features_count || 0} características</span>
                          {plan.sat_clave_prod_serv && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-500/80">
                              <FileText className="h-2.5 w-2.5" />
                              {plan.sat_clave_prod_serv} / {plan.sat_clave_unidad || 'E48'}
                            </span>
                          )}
                        </div>
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
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || plansFetching}>Anterior</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(pageNum)} disabled={plansFetching} className="h-8 w-8 p-0">
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || plansFetching}>Siguiente</Button>
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
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-semibold text-foreground">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</SheetTitle>
                {planDetailLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <SheetDescription className="text-muted-foreground">
                {editingPlan ? `Modifica los datos de "${editingPlan.name}"` : 'Completa la información para crear un nuevo plan'}
              </SheetDescription>
            </SheetHeader>
            
            {!isSheetReady ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
            <form
              onSubmit={handleSubmit(onSubmit, (formErrors) => {
                // Mostrar el primer error de validación que haya fallado
                const msgs = Object.values(formErrors)
                  .map((e: any) => e?.message)
                  .filter(Boolean);
                toast.error(msgs[0] || 'Revisa los campos marcados en rojo');
                console.error('[PlanForm] Validation errors:', formErrors);
              })}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-4 shrink-0 bg-muted dark:bg-[#1a1a1a]">
                    <TabsTrigger value="basic">Info</TabsTrigger>
                    <TabsTrigger value="features">Características</TabsTrigger>
                    <TabsTrigger value="pricing">Precios</TabsTrigger>
                    <TabsTrigger value="specs">Specs</TabsTrigger>
                    <TabsTrigger value="pterodactyl" className="flex items-center gap-1">
                      <Gamepad2 className="h-3.5 w-3.5" />Game
                    </TabsTrigger>
                  </TabsList>

                  {editingPlan && planDetailLoading ? (
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                      </div>
                      <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full rounded-lg" /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full rounded-lg" /></div>
                      </div>
                      <div className="flex gap-6"><Skeleton className="h-6 w-32 rounded-full" /><Skeleton className="h-6 w-28 rounded-full" /></div>
                    </div>
                  ) : (
                  <>
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
                        <Controller
                          name="category_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ''}
                              onValueChange={field.onChange}
                              disabled={categoriesLoading}
                            >
                              <SelectTrigger className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground">
                                <SelectValue placeholder={categoriesLoading ? 'Cargando…' : 'Seleccionar categoría'} />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    <span>{cat.name}</span>
                                    {cat.is_active === false && (
                                      <span className="ml-2 text-xs text-muted-foreground">(inactiva)</span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base_price" className="text-sm font-medium text-foreground">
                          Precio Base (MXN)
                          {planType !== 'paid'
                            ? <span className="ml-2 text-xs font-normal text-blue-500">(fijo en $0)</span>
                            : <span className="text-red-500"> *</span>
                          }
                        </Label>
                        <Input
                          id="base_price"
                          type="number"
                          {...register('base_price')}
                          disabled={planType !== 'paid'}
                          className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="99.00"
                        />
                        {watch('plan_type') === 'paid' && errors.base_price && (
                          <p className="text-xs text-red-500">{errors.base_price.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe_price_id" className="text-sm font-medium text-foreground">Stripe Price ID</Label>
                        <Input 
                          id="stripe_price_id" 
                          {...register('stripe_price_id')} 
                          className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground font-mono text-sm" 
                          placeholder="price_xxxxxxxxxxxxxx" 
                        />
                        <p className="text-xs text-muted-foreground">ID del producto en Stripe para pagos</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup_fee" className="text-sm font-medium text-foreground">Setup Fee (MXN)</Label>
                        <Input 
                          id="setup_fee" 
                          type="number" 
                          {...register('setup_fee')} 
                          className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" 
                          placeholder="0.00" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Controller
                          name="is_popular"
                          control={control}
                          render={({ field }) => (
                            <Switch id="is_popular" checked={field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                        <Label htmlFor="is_popular" className="text-sm font-medium cursor-pointer text-foreground">Plan Popular</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Controller
                          name="is_active"
                          control={control}
                          render={({ field }) => (
                            <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                        <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-foreground">Plan Activo</Label>
                      </div>
                    </div>

                    {/* ── Tipo de plan ── */}
                    {(() => {
                      const planType = watch('plan_type') || 'paid';
                      const allPlans = servicePlans.filter(p => p.plan_type === 'paid' || !p.plan_type);
                      return (
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <p className="text-sm font-medium text-foreground">Tipo de plan</p>
                          </div>

                          {/* Selector tipo */}
                          <div className="grid grid-cols-3 gap-2">
                            {([
                              { value: 'paid',  label: 'De pago',  desc: 'Requiere tarjeta', color: 'emerald' },
                              { value: 'free',  label: 'Gratuito', desc: 'Siempre $0',       color: 'blue'    },
                              { value: 'trial', label: 'Trial',    desc: 'X días gratis',    color: 'violet'  },
                            ] as const).map(opt => {
                              const active = planType === opt.value;
                              const colors: Record<string, string> = {
                                emerald: active ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-border/60 text-muted-foreground hover:border-emerald-500/40',
                                blue:    active ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'             : 'border-border/60 text-muted-foreground hover:border-blue-500/40',
                                violet:  active ? 'bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400'      : 'border-border/60 text-muted-foreground hover:border-violet-500/40',
                              };
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setValue('plan_type', opt.value)}
                                  className={`flex flex-col items-center gap-1 rounded-lg border-2 py-3 px-2 transition-all ${colors[opt.color]}`}
                                >
                                  <span className="text-sm font-semibold">{opt.label}</span>
                                  <span className="text-[10px] opacity-70">{opt.desc}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Aviso de precio $0 */}
                          {(planType === 'free' || planType === 'trial') && (
                            <div className="flex items-start gap-2 rounded-lg bg-blue-500/8 border border-blue-500/20 p-3 text-xs text-blue-600 dark:text-blue-400">
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <span>
                                {planType === 'free'
                                  ? 'Plan gratuito: el precio se enviará como $0. No se procesará ningún cobro.'
                                  : 'Plan trial: gratuito durante el periodo definido. Al vencer, el servicio se suspende automáticamente.'}
                              </span>
                            </div>
                          )}

                          {/* Trial: días y plan de conversión */}
                          {planType === 'trial' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-foreground">Duración del trial (días) *</Label>
                                <Input
                                  {...register('trial_days')}
                                  type="number"
                                  min="1"
                                  max="365"
                                  placeholder="14"
                                  className="h-9 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                                />
                                <p className="text-[10px] text-muted-foreground">Al vencer se suspende y se notifica al usuario.</p>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-foreground">Convierte a plan</Label>
                                <Controller
                                  name="converts_to_plan_id"
                                  control={control}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value || 'none'}
                                      onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                                    >
                                      <SelectTrigger className="h-9 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground text-xs">
                                        <SelectValue placeholder="Ninguno (solo suspende)" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">Ninguno — solo suspende</SelectItem>
                                        {allPlans.map(p => (
                                          <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name} — ${p.base_price}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                                <p className="text-[10px] text-muted-foreground">Plan de pago sugerido al usuario al expirar.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* ── Claves SAT ── */}
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-foreground">Facturación SAT (CFDI)</p>
                      </div>
                      <p className="text-xs text-muted-foreground -mt-1">
                        Estas claves se graban en cada concepto del CFDI al contratar este plan.
                        Se heredan a los add-ons del mismo contrato.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ClaveProdServ */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-foreground">ClaveProdServ</Label>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {[
                              { code: '81161501', label: 'Hosting' },
                              { code: '81161500', label: 'VPS / Game' },
                              { code: '81111501', label: 'Sysadmin' },
                              { code: '43232100', label: 'Software' },
                            ].map(({ code, label }) => {
                              const active = watch('sat_clave_prod_serv') === code;
                              return (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => setValue('sat_clave_prod_serv', code)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                                    active
                                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-500'
                                      : 'bg-muted/40 border-border/60 text-muted-foreground hover:border-blue-500/30 hover:text-blue-500/70'
                                  }`}
                                >
                                  {code}
                                  <span className="ml-1 font-sans not-italic opacity-60">{label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <Input
                            {...register('sat_clave_prod_serv')}
                            placeholder="81161501"
                            maxLength={10}
                            className="h-9 text-sm font-mono bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                          />
                        </div>

                        {/* ClaveUnidad */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-foreground">ClaveUnidad</Label>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {[
                              { code: 'E48', label: 'Servicio' },
                              { code: 'ACT', label: 'Actividad' },
                              { code: 'MTH', label: 'Mes' },
                              { code: 'DAY', label: 'Día' },
                            ].map(({ code, label }) => {
                              const active = watch('sat_clave_unidad') === code;
                              return (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => setValue('sat_clave_unidad', code)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                                    active
                                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-500'
                                      : 'bg-muted/40 border-border/60 text-muted-foreground hover:border-blue-500/30 hover:text-blue-500/70'
                                  }`}
                                >
                                  {code}
                                  <span className="ml-1 font-sans not-italic opacity-60">{label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <Input
                            {...register('sat_clave_unidad')}
                            placeholder="E48"
                            maxLength={3}
                            className="h-9 text-sm font-mono bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-blue-500/5 border border-blue-500/15 text-[10px] font-mono text-muted-foreground">
                        <span className="text-blue-500">ClaveProdServ:</span>
                        <span className="text-foreground">{watch('sat_clave_prod_serv') || '81161501'}</span>
                        <span className="mx-1 opacity-40">·</span>
                        <span className="text-blue-500">ClaveUnidad:</span>
                        <span className="text-foreground">{watch('sat_clave_unidad') || 'E48'}</span>
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

                  <TabsContent value="pterodactyl" className="space-y-5">
                    <PterodactylTab watch={watch} setValue={setValue} />
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
                </>
              )}
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
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => { setConfirmModal({ isOpen: false, plan: null }); setBulkActionType(null); }}
        onConfirm={bulkActionType ? handleConfirmBulkAction : handleConfirmDelete}
        title={bulkActionType ? (bulkActionType === 'delete' ? 'Eliminar Planes' : bulkActionType === 'activate' ? 'Activar Planes' : 'Desactivar Planes') : 'Eliminar Plan'}
        confirmText={bulkActionType === 'delete' ? 'Eliminar' : bulkActionType === 'activate' ? 'Activar' : 'Desactivar'}
        isConfirming={isActionLoading}
      >
        {bulkActionType ? (
          <p>¿Estás seguro de que quieres <strong>{bulkActionType === 'delete' ? 'eliminar' : bulkActionType === 'activate' ? 'activar' : 'desactivar'}</strong> <strong className="text-foreground">{selectedUuids.length} plan(es)</strong>?</p>
        ) : (
          <p>¿Estás seguro de que quieres eliminar el plan <strong className="text-foreground">{confirmModal.plan?.name}</strong>? Esta acción no se puede deshacer.</p>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default AdminServicePlansPage;
