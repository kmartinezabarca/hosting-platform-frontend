import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

export default function AdminApiDocumentationPage() {
  const [documentation, setDocumentation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    is_published: false,
  });

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/api-documentation");
      setDocumentation(response.data.data || []);
    } catch (error) {
      toast.error("Error al cargar la documentación de API");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/admin/api-documentation/${editingId}`, formData);
        toast.success("Documentación de API actualizada exitosamente");
      } else {
        await apiClient.post("/admin/api-documentation", formData);
        toast.success("Documentación de API creada exitosamente");
      }
      setIsOpen(false);
      setFormData({
        title: "",
        slug: "",
        content: "",
        category: "",
        is_published: false,
      });
      setEditingId(null);
      fetchDocumentation();
    } catch (error) {
      toast.error("Error al guardar la documentación de API");
      console.error(error);
    }
  };

  const handleEdit = (doc) => {
    setFormData(doc);
    setEditingId(doc.uuid);
    setIsOpen(true);
  };

  const handleDelete = async (uuid) => {
    try {
      await apiClient.delete(`/admin/api-documentation/${uuid}`);
      toast.success("Documentación de API eliminada exitosamente");
      setDeleteConfirm(null);
      fetchDocumentation();
    } catch (error) {
      toast.error("Error al eliminar la documentación de API");
      console.error(error);
    }
  };

  const filteredDocs = documentation.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documentación de API</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  slug: "",
                  content: "",
                  category: "",
                  is_published: false,
                });
              }}
              className="gap-2"
            >
              <Plus size={20} />
              Nueva Documentación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Documentación de API" : "Nueva Documentación de API"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título de la documentación"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="slug-de-url"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Categoría"
                />
              </div>
              <div>
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Contenido de la documentación"
                  rows={8}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
                <Label htmlFor="published">Publicado</Label>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingId ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input
            placeholder="Buscar documentación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="grid gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.uuid}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{doc.title}</h3>
                  <p className="text-sm text-gray-600">
                    {doc.category && `Categoría: ${doc.category}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {doc.content}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        doc.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {doc.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(doc)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Dialog open={deleteConfirm === doc.uuid}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(doc.uuid)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                      </DialogHeader>
                      <p>¿Estás seguro de que deseas eliminar esta documentación?</p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(doc.uuid)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay documentación disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
}
