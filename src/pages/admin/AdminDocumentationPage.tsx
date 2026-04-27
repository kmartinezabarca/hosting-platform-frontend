import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import BlogEditor from "@/components/admin/BlogEditor";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  ArrowLeft,
  Save
} from "lucide-react";
import { toast } from "sonner";
import documentationAdminService from "@/services/documentationAdminService";

const docSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  slug: z.string().min(1, "El slug es requerido").regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones"),
  content: z.string().min(1, "El contenido es requerido"),
  category: z.string().optional(),
  is_published: z.boolean().default(false),
});

export default function AdminDocumentationPage() {
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; doc: any }>({ isOpen: false, doc: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(docSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      category: "",
      is_published: false,
    }
  });

  const content = watch("content");
  const is_published = watch("is_published");

  useEffect(() => {
    fetchDocumentation();
  }, []);

  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);
      return;
    }
    fetchDocumentation();
  }, [statusFilter]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const data = await documentationAdminService.getAll();
      setDocumentation(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      toast.error("Error al cargar la documentación");
      console.error(error);
      setDocumentation([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const title = watch("title");
    if (!title) return;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      if (editingDoc) {
        await documentationAdminService.update(editingDoc.uuid, data);
        toast.success(`Documentación "${data.title}" actualizada`);
      } else {
        await documentationAdminService.create(data);
        toast.success(`Documentación "${data.title}" creada`);
      }
      closeForm();
      fetchDocumentation();
    } catch (error) {
      console.error(error);
      const message = (error as any)?.response?.data?.message || "Error al guardar la documentación";
      toast.error("Error", { description: message });
    }
  };

  const handleDelete = (doc) => setConfirmModal({ isOpen: true, doc });

  const handleConfirmDelete = async () => {
    if (!confirmModal.doc) return;
    setIsActionLoading(true);
    try {
      await documentationAdminService.delete(confirmModal.doc.uuid);
      toast.success("Documentación eliminada");
      setConfirmModal({ isOpen: false, doc: null });
      fetchDocumentation();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la documentación");
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeConfirmModal = () => setConfirmModal({ isOpen: false, doc: null });

  const openCreateForm = () => {
    setEditingDoc(null);
    reset({ title: "", slug: "", content: "", category: "", is_published: false });
    setShowForm(true);
  };

  const openEditForm = (doc) => {
    setEditingDoc(doc);
    reset({
      title: doc.title || "",
      slug: doc.slug || "",
      content: doc.content || "",
      category: doc.category || "",
      is_published: doc.is_published || false,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDoc(null);
    reset();
  };

  const filteredDocs = documentation.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && doc.is_published) ||
      (statusFilter === "draft" && !doc.is_published);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: documentation.length,
    published: documentation.filter(d => d.is_published).length,
    drafts: documentation.filter(d => !d.is_published).length,
  };

  if (loading && documentation.length === 0) {
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
        <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={closeForm} disabled={isSubmitting} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold">
              {editingDoc ? "Editar Documentación" : "Nueva Documentación"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={closeForm} disabled={isSubmitting} size="sm">
              Cancelar
            </Button>
            <Button type="button" onClick={() => (document.getElementById("doc-form") as HTMLFormElement | null)?.requestSubmit()} disabled={isSubmitting} size="sm">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingDoc ? "Guardando..." : "Creando..."}</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{editingDoc ? "Guardar Cambios" : "Crear Documentación"}</>
              )}
            </Button>
          </div>
        </div>

        <form id="doc-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-sm font-medium">Título *</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      onBlur={generateSlug}
                      className={`h-9 ${errors.title ? "border-red-500" : ""}`}
                      placeholder="Título de la documentación"
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="slug" className="text-sm font-medium">Slug *</Label>
                    <Input
                      id="slug"
                      {...register("slug")}
                      className={`h-9 font-mono text-sm ${errors.slug ? "border-red-500" : ""}`}
                      placeholder="nombre-documento"
                    />
                    {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
                  <Input
                    id="category"
                    {...register("category")}
                    className="h-9"
                    placeholder="Categoría de la documentación"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm font-medium">Contenido *</Label>
                {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                <div className={`border rounded-lg overflow-hidden ${errors.content ? 'border-red-500' : 'border-input'}`}>
                  <BlogEditor
                    content={content}
                    onChange={(html) => setValue("content", html, { shouldValidate: true })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Configuración</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="is_published" className="cursor-pointer">
                      {is_published ? "Publicado" : "Borrador"}
                    </Label>
                    <Switch
                      id="is_published"
                      checked={is_published}
                      onCheckedChange={(checked) => setValue("is_published", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documentación</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} documentos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchDocumentation()} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button onClick={openCreateForm} size="sm" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Documentación
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</p>
                <p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl">
                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Publicados</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.published}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/80 to-amber-50/30 dark:from-amber-950/40 dark:to-amber-950/20 border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Borradores</p>
                <p className="text-2xl font-semibold mt-1 text-amber-800 dark:text-amber-100">{stats.drafts}</p>
              </div>
              <div className="p-2.5 bg-amber-500/15 rounded-xl">
                <EyeOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
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
                  placeholder="Buscar documentación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 w-48 sm:w-64"
                />
              </div>
              <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
                <Filter className="h-4 w-4 mr-1.5" />
                Filtros
              </Button>
              {showFilters && (
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={statusFilter === "published" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter("published")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Publicados
                  </Button>
                  <Button
                    variant={statusFilter === "draft" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter("draft")}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Borradores
                  </Button>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredDocs.length}</span> documentos
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><Skeleton className="h-10 w-full" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontró documentación</p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">{doc.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{doc.category || "Sin categoría"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {doc.is_published ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <Eye className="h-3 w-3 mr-1" />Publicado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            <EyeOff className="h-3 w-3 mr-1" />Borrador
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
                                onClick={() => openEditForm(doc)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar documentación</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(doc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar documentación</TooltipContent>
                          </Tooltip>
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

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Documentación"
        confirmText="Eliminar"
        isConfirming={isActionLoading}
      >
        <p>¿Estás seguro de que quieres eliminar la documentación <strong>{confirmModal.doc?.title}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
}
