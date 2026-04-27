import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { Plus, Edit, Trash2, Search, Tag, RefreshCw, Filter, X, Loader2 } from 'lucide-react';
import BlogService from '@/services/blogService';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

const AdminBlogCategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; category: any }>({ isOpen: false, category: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', is_active: true, sort_order: 0 }
  });

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (!dataLoaded) { setDataLoaded(true); return; } fetchCategories(); }, [statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await BlogService.adminGetCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Error al cargar las categorías');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const name = watch('name');
    if (!name) return;
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    setValue('slug', slug, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await BlogService.adminUpdateCategory(editingCategory.id, data);
        toast.success(`Categoría "${data.name}" actualizada`);
      } else {
        await BlogService.adminCreateCategory(data);
        toast.success(`Categoría "${data.name}" creada`);
      }
      closeSheet();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      const message = (err as any)?.response?.data?.message || 'Error al guardar la categoría';
      toast.error('Error', { description: message });
    }
  };

  const handleDelete = (category) => setConfirmModal({ isOpen: true, category });

  const handleConfirmDelete = async () => {
    if (!confirmModal.category) return;
    setIsActionLoading(true);
    try {
      await BlogService.adminDeleteCategory(confirmModal.category.id);
      toast.success('Categoría eliminada');
      setConfirmModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      const message = (err as any)?.response?.data?.message || 'Error al eliminar la categoría';
      toast.error('Error', { description: message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingCategory(null);
    reset();
  };

  const openEditSheet = (category) => {
    setEditingCategory(category);
    reset({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      is_active: category.isActive ?? category.is_active ?? true,
      sort_order: category.sortOrder ?? category.sort_order ?? 0,
    });
    setIsSheetOpen(true);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchTerm || category.name.toLowerCase().includes(searchTerm.toLowerCase()) || category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && category.isActive) || (statusFilter === 'inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = { total: categories.length, active: categories.filter(c => c.isActive || c.is_active).length, inactive: categories.filter(c => !c.isActive && !c.is_active).length };
  const activeFilters = [statusFilter !== 'all'].filter(Boolean).length;
  const isLoadingState = loading;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categorías del Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} categorías registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setDataLoaded(false); fetchCategories(); }} variant="outline" size="sm" disabled={isLoadingState}>
            {isLoadingState ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}Actualizar
          </Button>
          <Button onClick={() => { reset({ name: '', slug: '', description: '', is_active: true, sort_order: 0 }); setEditingCategory(null); setIsSheetOpen(true); }} size="sm" disabled={isLoadingState}>
            <Plus className="h-4 w-4 mr-2" />Nueva Categoría
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</p><p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p></div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl"><Tag className="h-5 w-5 text-slate-600 dark:text-slate-300" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Activas</p><p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.active}</p></div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl"><Tag className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50/80 to-slate-50/30 dark:from-slate-950/40 dark:to-slate-950/20 border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-700 dark:text-slate-300">Inactivas</p><p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.inactive}</p></div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl"><Tag className="h-5 w-5 text-slate-500" /></div>
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
                <Input placeholder="Buscar categorías..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 w-48 sm:w-64 text-foreground" />
              </div>
              <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
                <Filter className="h-4 w-4 mr-1.5" />Filtros
                {activeFilters > 0 && <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilters}</Badge>}
              </Button>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="h-9 text-muted-foreground px-2"><X className="h-4 w-4" /></Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{filteredCategories.length}</span> categorías</div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border dark:border-white/10">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground">
                <option value="all">Todos</option><option value="active">Activas</option><option value="inactive">Inactivas</option>
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Orden</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {isLoadingState ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-8 w-8 rounded" /></div></td>
                    </tr>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center"><Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No se encontraron categorías</p></td></tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><Tag className="h-5 w-5 text-violet-600" /></div>
                          <p className="font-medium text-sm text-foreground">{category.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-muted-foreground font-mono">{category.slug}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-muted-foreground truncate max-w-xs">{category.description || 'Sin descripción'}</span></td>
                      <td className="px-4 py-3">
                        {category.isActive || category.is_active ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Activa</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">Inactiva</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-muted-foreground">{category.sortOrder || category.sort_order || 0}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSheet(category)}><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Editar categoría</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(category)}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Eliminar categoría</TooltipContent></Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0 bg-background dark:bg-[#0f1115]">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b border-border dark:border-white/10 shrink-0">
              <SheetTitle className="text-xl font-semibold text-foreground">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</SheetTitle>
              <SheetDescription className="text-muted-foreground">{editingCategory ? 'Modifica los datos de la categoría' : 'Completa la información para crear una nueva categoría'}</SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Nombre *</Label>
                  <Input id="name" {...register('name')} onBlur={generateSlug} className={`h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground ${errors.name ? 'border-red-500' : ''}`} placeholder="Nombre de la categoría" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug *</Label>
                  <Input id="slug" {...register('slug')} className={`h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground ${errors.slug ? 'border-red-500' : ''}`} placeholder="nombre-categoria" />
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</Label>
                  <textarea id="description" {...register('description')} className="w-full px-3 py-2 rounded-md border border-input bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-sm min-h-[80px] resize-none text-foreground" placeholder="Descripción de la categoría..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sort_order" className="text-sm font-medium text-foreground">Orden</Label>
                    <Input id="sort_order" type="number" {...register('sort_order', { valueAsNumber: true })} className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground" placeholder="0" />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch id="is_active" {...register('is_active')} />
                    <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-foreground">Categoría Activa</Label>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border dark:border-white/10 shrink-0 bg-background dark:bg-[#0f1115]">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1" disabled={isSubmitting}>Cancelar</Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingCategory ? 'Guardando...' : 'Creando...'}</> : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, category: null })} onConfirm={handleConfirmDelete} title="Eliminar Categoría" confirmText="Eliminar" isConfirming={isActionLoading}>
        <p>¿Estás seguro de que quieres eliminar la categoría <strong className="text-foreground">{confirmModal.category?.name}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
};

export default AdminBlogCategoriesPage;
