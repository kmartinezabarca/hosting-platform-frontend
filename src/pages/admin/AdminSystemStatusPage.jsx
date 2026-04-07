import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

export default function AdminSystemStatusPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    service_name: "",
    status: "operational",
    message: "",
    last_updated: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/system-status");
      setStatuses(response.data.data || []);
    } catch (error) {
      toast.error("Error al cargar el estado del sistema");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.service_name || !formData.status) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/admin/system-status/${editingId}`, formData);
        toast.success("Estado del sistema actualizado exitosamente");
      } else {
        await apiClient.post("/admin/system-status", formData);
        toast.success("Estado del sistema creado exitosamente");
      }
      setIsOpen(false);
      setFormData({
        service_name: "",
        status: "operational",
        message: "",
        last_updated: new Date().toISOString().split("T")[0],
      });
      setEditingId(null);
      fetchStatuses();
    } catch (error) {
      toast.error("Error al guardar el estado del sistema");
      console.error(error);
    }
  };

  const handleEdit = (status) => {
    setFormData(status);
    setEditingId(status.uuid);
    setIsOpen(true);
  };

  const handleDelete = async (uuid) => {
    try {
      await apiClient.delete(`/admin/system-status/${uuid}`);
      toast.success("Estado del sistema eliminado exitosamente");
      setDeleteConfirm(null);
      fetchStatuses();
    } catch (error) {
      toast.error("Error al eliminar el estado del sistema");
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "degraded_performance":
        return "bg-yellow-100 text-yellow-800";
      case "partial_outage":
        return "bg-orange-100 text-orange-800";
      case "major_outage":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "operational":
        return "Operacional";
      case "degraded_performance":
        return "Rendimiento Degradado";
      case "partial_outage":
        return "Interrupción Parcial";
      case "major_outage":
        return "Interrupción Total";
      default:
        return status;
    }
  };

  const filteredStatuses = statuses.filter((status) =>
    status.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estado del Sistema</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  service_name: "",
                  status: "operational",
                  message: "",
                  last_updated: new Date().toISOString().split("T")[0],
                });
              }}
              className="gap-2"
            >
              <Plus size={20} />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Estado del Sistema" : "Nuevo Estado del Sistema"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service_name">Nombre del Servicio *</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) =>
                    setFormData({ ...formData, service_name: e.target.value })
                  }
                  placeholder="Nombre del servicio"
                />
              </div>
              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="degraded_performance">Rendimiento Degradado</SelectItem>
                    <SelectItem value="partial_outage">Interrupción Parcial</SelectItem>
                    <SelectItem value="major_outage">Interrupción Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Mensaje adicional sobre el estado"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="last_updated">Última Actualización *</Label>
                <Input
                  id="last_updated"
                  type="date"
                  value={formData.last_updated}
                  onChange={(e) =>
                    setFormData({ ...formData, last_updated: e.target.value })
                  }
                />
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
            placeholder="Buscar servicio..."
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
          {filteredStatuses.map((status) => (
            <div
              key={status.uuid}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{status.service_name}</h3>
                  {status.message && (
                    <p className="text-sm text-gray-600 mt-2">{status.message}</p>
                  )}
                  <div className="mt-3 flex gap-2 items-center">
                    <span className={`text-xs px-3 py-1 rounded font-medium ${getStatusColor(status.status)}`}>
                      {getStatusLabel(status.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Actualizado: {new Date(status.last_updated).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(status)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Dialog open={deleteConfirm === status.uuid}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(status.uuid)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                      </DialogHeader>
                      <p>¿Estás seguro de que deseas eliminar este estado del sistema?</p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(status.uuid)}
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
          {filteredStatuses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay estados del sistema disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
