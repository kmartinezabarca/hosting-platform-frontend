import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Globe, Cpu, Database, Gamepad2, Shield, Code2, RefreshCw, Headphones,
  Plus, Edit, Trash2, Search, Loader2, Tag, CheckCircle, Package, Layers,
  X, Filter,
} from 'lucide-react';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Label } from '@presentation/components/ui/label';
import { Textarea } from '@presentation/components/ui/textarea';
import { Badge } from '@presentation/components/ui/badge';
import { Separator } from '@presentation/components/ui/separator';
import { Sheet, SheetContent } from '@presentation/components/ui/sheet';
import { Card, CardContent } from '@presentation/components/ui/card';
import { Skeleton } from '@presentation/components/ui/skeleton';
import { Switch } from '@presentation/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@presentation/components/ui/tooltip';
import ConfirmationModal from '@presentation/components/features/modals/ConfirmationModal';
import { StatCard } from '@presentation/components/ui/stat-card';
import { toast } from '@presentation/components/features/ToastProvider';
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
} from '@application/hooks/useAdminCategories';

// ── Icon catalog ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Globe, Cpu, Database, Gamepad2, Shield, Code2, RefreshCw, Headphones, Package, Tag, Layers,
};

const ICON_OPTIONS = [
  { value: 'Globe',      label: 'Hosting'       },
  { value: 'Cpu',        label: 'VPS / Cloud'   },
  { value: 'Database',   label: 'Base de Datos' },
  { value: 'Gamepad2',   label: 'Game Server'   },
  { value: 'Shield',     label: 'Seguridad'     },
  { value: 'Code2',      label: 'Desarrollo'    },
  { value: 'RefreshCw',  label: 'Migración'     },
  { value: 'Headphones', label: 'Soporte'        },
  { value: 'Package',    label: 'General'        },
  { value: 'Tag',        label: 'Etiqueta'       },
  { value: 'Layers',     label: 'Capas'          },
];

const COLOR_PRESETS = [
  { label: 'Azul',    color: 'text-blue-600',    bg: 'bg-blue-500/10',    dot: '#2563eb' },
  { label: 'Morado',  color: 'text-purple-600',  bg: 'bg-purple-500/10',  dot: '#9333ea' },
  { label: 'Verde',   color: 'text-emerald-600', bg: 'bg-emerald-500/10', dot: '#059669' },
  { label: 'Naranja', color: 'text-orange-600',  bg: 'bg-orange-500/10',  dot: '#ea580c' },
  { label: 'Rojo',    color: 'text-red-600',     bg: 'bg-red-500/10',     dot: '#dc2626' },
  { label: 'Cian',    color: 'text-cyan-600',    bg: 'bg-cyan-500/10',    dot: '#0891b2' },
  { label: 'Violeta', color: 'text-violet-600',  bg: 'bg-violet-500/10',  dot: '#7c3aed' },
  { label: 'Teal',    color: 'text-teal-600',    bg: 'bg-teal-500/10',    dot: '#0d9488' },
  { label: 'Índigo',  color: 'text-indigo-600',  bg: 'bg-indigo-500/10',  dot: '#4f46e5' },
  { label: 'Ámbar',   color: 'text-amber-600',   bg: 'bg-amber-500/10',   dot: '#d97706' },
];

const PER_PAGE = 15;

// ── Zod schema ────────────────────────────────────────────────────────────────
const categorySchema = z.object({
  name:        z.string().min(1, 'El nombre es requerido').max(100),
  slug:        z.string().min(1, 'El slug es requerido').max(50)
                .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
  icon:        z.string().optional(),
  color:       z.string().optional(),
  bg_color:    z.string().optional(),
  is_active:   z.boolean(),
  sort_order:  z.number().int().min(0),
});

type CategoryForm = z.infer<typeof categorySchema>;

// ── Small icon badge ──────────────────────────────────────────────────────────
const CategoryBadge: React.FC<{
  iconName?: string | null;
  colorClass?: string | null;
  bgClass?: string | null;
}> = ({ iconName, colorClass, bgClass }) => {
  const Icon = (iconName && ICON_MAP[iconName]) ? ICON_MAP[iconName] : Package;
  return (
    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${bgClass || 'bg-primary/10'}`}>
      <Icon className={`h-4 w-4 ${colorClass || 'text-primary'}`} />
    </div>
  );
};



// ── Page ──────────────────────────────────────────────────────────────────────
const AdminCategoriesPage: React.FC = () => {
  // ── Server-side filter state ────────────────────────────────────────────────
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');          // debounced
  const [statusFilter, setStatusFilter] = useState<'' | '1' | '0'>('');
  const [showFilters, setShowFilters]  = useState(false);

  // Debounce search → reset to page 1 when it changes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 400);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }, []);

  const queryParams = useMemo(() => ({
    page,
    per_page: PER_PAGE,
    ...(search      ? { search }                               : {}),
    ...(statusFilter !== '' ? { is_active: statusFilter === '1' } : {}),
  }), [page, search, statusFilter]);

  const { data, isLoading, isFetching, refetch } = useAdminCategories(queryParams);

  const categories = data?.data   ?? [];
  const meta       = data?.meta;

  // ── Stats (from current full result, shown even when filtered) ──────────────
  const stats = useMemo(() => {
    const active = categories.filter(c => c.is_active).length;
    return {
      total:    meta?.total ?? 0,
      active,
      inactive: categories.length - active,
    };
  }, [meta, categories]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  // ── Sheet state ─────────────────────────────────────────────────────────────
  const [isSheetOpen, setIsSheetOpen]         = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [confirmDelete, setConfirmDelete]     = useState<any>(null);
  const [selectedPreset, setSelectedPreset]   = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', icon: 'Package', color: '', bg_color: '', is_active: true, sort_order: 0 },
  });

  const watchName    = watch('name');
  const watchIcon    = watch('icon');
  const watchColor   = watch('color');
  const watchBgColor = watch('bg_color');
  const watchActive  = watch('is_active');

  const activeFilters = [statusFilter !== ''].filter(Boolean).length;

  const openCreate = () => {
    reset({ name: '', slug: '', description: '', icon: 'Package', color: '', bg_color: '', is_active: true, sort_order: meta?.total ?? 0 });
    setSelectedPreset(null);
    setEditingCategory(null);
    setIsSheetOpen(true);
  };

  const openEdit = (cat: any) => {
    reset({
      name: cat.name ?? '', slug: cat.slug ?? '', description: cat.description ?? '',
      icon: cat.icon ?? 'Package', color: cat.color ?? '', bg_color: cat.bg_color ?? '',
      is_active: cat.is_active, sort_order: cat.sort_order,
    });
    const idx = COLOR_PRESETS.findIndex(p => p.color === cat.color);
    setSelectedPreset(idx >= 0 ? idx : null);
    setEditingCategory(cat);
    setIsSheetOpen(true);
  };

  const closeSheet = () => { setIsSheetOpen(false); setEditingCategory(null); setSelectedPreset(null); };

  const applyPreset = (idx: number) => {
    const p = COLOR_PRESETS[idx];
    setValue('color', p.color);
    setValue('bg_color', p.bg);
    setSelectedPreset(idx);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!editingCategory) {
      setValue('slug', name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ uuid: editingCategory.uuid, payload: data });
        toast.success('Categoría actualizada', { description: 'Los cambios se han guardado correctamente' });
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Categoría creada', { description: 'La categoría se ha creado correctamente' });
      }
      closeSheet();
    } catch (err: any) {
      toast.error('Error', { description: err?.response?.data?.message || err?.message || 'Error al guardar' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.uuid);
      toast.success('Categoría eliminada', { description: 'La categoría se ha eliminado correctamente' });
      // if we deleted the last item on this page, go back one page
      if (categories.length === 1 && page > 1) setPage(p => p - 1);
    } catch (err: any) {
      toast.error('Error', { description: err?.response?.data?.message || 'No se pudo eliminar' });
    } finally {
      setConfirmDelete(null);
    }
  };

  const changeStatusFilter = (val: '' | '1' | '0') => {
    setStatusFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta ? `${meta.total} categorías en el catálogo` : 'Cargando…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Tag}         label="Total"    value={meta?.total ?? 0} accent="slate"   loading={isFetching} />
        <StatCard icon={CheckCircle} label="Activas"  value={stats.active}    accent="emerald" loading={isFetching} />
        <StatCard icon={X}           label="Inactivas" value={stats.inactive}  accent="red"     loading={isFetching} />
      </div>

      {/* Table card */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar categoría…"
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-9 pr-8 h-9 w-48 sm:w-64 text-foreground"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(v => !v)}
                className="h-9"
              >
                <Filter className="h-4 w-4 mr-1.5" />Filtros
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>

              {activeFilters > 0 && (
                <Button
                  variant="ghost" size="sm" className="h-9 text-muted-foreground px-2"
                  onClick={() => changeStatusFilter('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Fetching spinner */}
            {isFetching && !isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Filter pills */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border dark:border-white/10">
              {([
                { value: '',  label: 'Todas'     },
                { value: '1', label: 'Activas'   },
                { value: '0', label: 'Inactivas' },
              ] as const).map(f => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => changeStatusFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Planes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {isFetching ? (
                  Array.from({ length: PER_PAGE }).map((_, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-12 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {search ? 'Sin resultados para la búsqueda' : 'No hay categorías todavía'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  categories.map(cat => {
                    const planCount = cat.service_plans_count ?? 0;
                    return (
                      <tr
                        key={cat.uuid}
                        className={`hover:bg-muted/30 transition-colors ${isFetching ? 'opacity-60' : ''}`}
                      >
                        {/* Nombre + ícono */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <CategoryBadge iconName={cat.icon} colorClass={cat.color} bgClass={cat.bg_color} />
                            <p className="font-medium text-sm text-foreground">{cat.name}</p>
                          </div>
                        </td>
                        {/* Slug */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {cat.slug}
                          </span>
                        </td>
                        {/* Descripción */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-sm text-muted-foreground truncate max-w-[280px]">
                            {cat.description || <span className="italic opacity-50">Sin descripción</span>}
                          </p>
                        </td>
                        {/* Planes */}
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs gap-1">
                            <Package className="h-3 w-3" />
                            {planCount}
                          </Badge>
                        </td>
                        {/* Estado */}
                        <td className="px-4 py-3">
                          {cat.is_active
                            ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">Activa</Badge>
                            : <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 text-xs">Inactiva</Badge>
                          }
                        </td>
                        {/* Acciones */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar categoría</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => planCount === 0 && setConfirmDelete(cat)}
                                  disabled={planCount > 0 || deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending && confirmDelete?.uuid === cat.uuid
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {planCount > 0 ? `Tiene ${planCount} plan${planCount !== 1 ? 'es' : ''} asociado${planCount !== 1 ? 's' : ''}` : 'Eliminar'}
                              </TooltipContent>
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

          {/* Pagination (always visible) */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Página <span className="font-medium">{page}</span> de <span className="font-medium">{meta?.last_page ?? 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>Anterior</Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, meta?.last_page ?? 1) }, (_, i) => {
                  const totalPages = meta?.last_page ?? 1;
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <Button key={pageNum} variant={page === pageNum ? "default" : "ghost"} size="sm" onClick={() => setPage(pageNum)} disabled={isFetching} className="h-8 w-8 p-0">{pageNum}</Button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta?.last_page ?? 1, p + 1))} disabled={page === (meta?.last_page ?? 1) || isFetching}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Create / Edit Sheet ──────────────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={open => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="!w-full !max-w-[560px] p-0 flex flex-col gap-0 bg-background dark:bg-[#0f1115]">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <CategoryBadge iconName={watchIcon} colorClass={watchColor} bgClass={watchBgColor} />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {editingCategory ? editingCategory.name : 'Define un nuevo grupo del catálogo'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* 1 — Info básica */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Información básica</h3>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nombre *</Label>
                  <Input
                    value={watchName}
                    onChange={handleNameChange}
                    placeholder="Ej. Servidores de Juegos"
                    className="h-10 rounded-lg bg-background dark:bg-[#0f1115] border-border dark:border-white/10"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Slug *
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(identificador único)</span>
                  </Label>
                  <Input
                    {...register('slug')}
                    placeholder="gameserver"
                    className="h-10 rounded-lg bg-background dark:bg-[#0f1115] border-border dark:border-white/10 font-mono text-sm"
                  />
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Descripción</Label>
                  <Textarea
                    {...register('description')}
                    placeholder="Descripción breve de esta categoría…"
                    className="min-h-[72px] resize-none rounded-lg bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-sm"
                  />
                </div>
              </section>

              <Separator />

              {/* 2 — Ícono */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ícono</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const Icon = ICON_MAP[opt.value];
                    const sel  = watchIcon === opt.value;
                    return (
                      <button
                        key={opt.value} type="button"
                        onClick={() => setValue('icon', opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-colors ${
                          sel ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="leading-tight text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <Separator />

              {/* 3 — Color */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Color</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx} type="button"
                      onClick={() => applyPreset(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        selectedPreset === idx
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.dot }} />
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Clase texto</Label>
                    <Input
                      {...register('color')}
                      placeholder="text-blue-600"
                      className="h-9 text-sm font-mono rounded-lg bg-background dark:bg-[#0f1115] border-border dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Clase fondo</Label>
                    <Input
                      {...register('bg_color')}
                      placeholder="bg-blue-500/10"
                      className="h-9 text-sm font-mono rounded-lg bg-background dark:bg-[#0f1115] border-border dark:border-white/10"
                    />
                  </div>
                </div>
                {/* Live preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                  <CategoryBadge iconName={watchIcon} colorClass={watchColor} bgClass={watchBgColor} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{watchName || 'Nombre de categoría'}</p>
                    <p className="text-xs text-muted-foreground">Vista previa</p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* 4 — Config */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Configuración</h3>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">Activa</p>
                    <p className="text-xs text-muted-foreground">Visible en catálogo y disponible para planes</p>
                  </div>
                  <Switch checked={watchActive} onCheckedChange={val => setValue('is_active', val)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Orden
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(menor = primero)</span>
                  </Label>
                  <Input
                    type="number" min={0} step={1}
                    {...register('sort_order', { valueAsNumber: true })}
                    className="h-10 w-28 rounded-lg bg-background dark:bg-[#0f1115] border-border dark:border-white/10"
                  />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border dark:border-white/10 shrink-0 bg-background dark:bg-[#0f1115]">
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={closeSheet} className="flex-1 h-10" disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-[2] h-10 font-semibold" disabled={isSubmitting}>
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingCategory ? 'Guardando…' : 'Creando…'}</>
                    : editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        confirmText="Eliminar"
        isConfirming={deleteMutation.isPending}
      >
        <p>
          ¿Estás seguro de eliminar{' '}
          <strong className="text-foreground">{confirmDelete?.name}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default AdminCategoriesPage;
