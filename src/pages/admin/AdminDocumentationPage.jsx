import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import documentationAdminService from "@/services/documentationAdminService";

export default function AdminDocumentationPage() {
  const [documentation, setDocumentation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, doc: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    is_published: false,
  });

  const [formErrors, setFormErrors] = useState({});

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
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (editingDoc) {
        await documentationAdminService.update(editingDoc.uuid, formData);
        toast.success(`Documentación "${formData.title}" actualizada`, {
          description: "Los cambios han sido guardados.",
        });
      } else {
        await documentationAdminService.create(formData);
        toast.success(`Documentación "${formData.title}" creada`, {
          description: "La documentación ha sido creada exitosamente.",
        });
      }
      closeSheet();
      fetchDocumentation();
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || "Error al guardar la documentación";
      toast.error("Error", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (doc) => {
    setConfirmModal({ isOpen: true, doc });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.doc) return;
    
    setIsActionLoading(true);
    try {
      await documentationAdminService.delete(confirmModal.doc.uuid);
      toast.success("Documentación eliminada", {
        description: `La documentación "${confirmModal.doc.title}" ha sido eliminada.`,
      });
      setConfirmModal({ isOpen: false, doc: null });
      fetchDocumentation();
    } catch (error) {
      console.error(error);
      toast.error("Error", { description: "Error al eliminar la documentación" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title || formData.title.trim() === "") {
      errors.title = "El título es requerido";
    }
    
    if (!formData.slug || formData.slug.trim() === "") {
      errors.slug = "El slug es requerido";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "El slug solo puede contener letras minúsculas, números y guiones";
    }
    
    if (!formData.content || formData.content.trim() === "") {
      errors.content = "El contenido es requerido";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      category: "",
      is_published: false,
    });
    setFormErrors({});
    setEditingDoc(null);
  };

  const openCreateSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const openEditSheet = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title || "",
      slug: doc.slug || "",
      content: doc.content || "",
      category: doc.category || "",
      is_published: doc.is_published || false,
    });
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    resetForm();
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, doc: null });
  };

  const filteredDocs = documentation.filter((doc) => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && doc.is_published) ||
      (statusFilter === "draft" && !doc.is_published);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: documentation.length,
    published: documentation.filter(d => d.is_published).length,
    draft: documentation.filter(d => !d.is_published).length,
  };

  const activeFilters = [statusFilter !== "all"].filter(Boolean).length;
  const isLoadingState = loading;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documentación</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} artículos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setDataLoaded(false); fetchDocumentation(); }}
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
          <Button onClick={openCreateSheet} size="sm" disabled={isLoadingState}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Documentación
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
                <Eye className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/80 to-amber-50/30 dark:from-amber-950/40 dark:to-amber-950/20 border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Borradores</p>
                <p className="text-2xl font-semibold mt-1 text-amber-800 dark:text-amber-100">{stats.draft}</p>
              </div>
              <div className="p-2.5 bg-amber-500/15 rounded-xl">
                <EyeOff className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Header with search, filters and count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar documentación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 w-48 sm:w-64"
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
                  onClick={() => setStatusFilter("all")}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredDocs.length}</span> artículos
            </div>
          </div>

          {/* Filter dropdowns inline */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-3 text-xs rounded-md border border-input bg-background"
              >
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingState ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
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
                                onClick={() => openEditSheet(doc)}
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

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b shrink-0">
              <SheetTitle className="text-xl font-semibold">
                {editingDoc ? "Editar Documentación" : "Nueva Documentación"}
              </SheetTitle>
              <SheetDescription>
                {editingDoc ? "Modifica los datos de la documentación" : "Completa la información para crear nueva documentación"}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
                    }}
                    onBlur={generateSlug}
                    className={`h-10 ${formErrors.title ? "border-red-500 focus:border-red-500" : ""}`}
                    placeholder="Título de la documentación"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, slug: e.target.value }));
                      if (formErrors.slug) setFormErrors(prev => ({ ...prev, slug: undefined }));
                    }}
                    className={`h-10 ${formErrors.slug ? "border-red-500 focus:border-red-500" : ""}`}
                    placeholder="nombre-documento"
                  />
                  {formErrors.slug && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.slug}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="h-10"
                    placeholder="Categoría de la documentación"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contenido *</Label>
                  {formErrors.content && (
                    <p className="text-xs text-red-500">{formErrors.content}</p>
                  )}
                  <BlogEditor
                    content={formData.content}
                    onChange={(html) => {
                      setFormData(prev => ({ ...prev, content: html }));
                      if (formErrors.content) setFormErrors(prev => ({ ...prev, content: undefined }));
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="is_published" className="text-sm font-medium cursor-pointer">Publicado</Label>
                </div>
              </div>

              <div className="px-6 py-4 border-t shrink-0 bg-background">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingDoc ? "Guardando..." : "Creando..."}
                      </>
                    ) : (
                      editingDoc ? "Guardar Cambios" : "Crear Documentación"
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
