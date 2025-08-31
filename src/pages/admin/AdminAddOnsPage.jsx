import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, DollarSign, Package } from 'lucide-react';
import addOnsService from '../../services/addOnsService';

const AdminAddOnsPage = () => {
  const [addOns, setAddOns] = useState([]);
  const [servicePlans, setServicePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState(null);

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    price: '',
    currency: 'MXN',
    is_active: true,
    metadata: {},
    service_plans: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [addOnsRes, plansRes] = await Promise.all([
        addOnsService.getAddOns(),
        addOnsService.getServicePlans()
      ]);
      
      setAddOns(addOnsRes.data || []);
      setServicePlans(plansRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddOn) {
        await addOnsService.updateAddOn(editingAddOn.uuid, formData);
      } else {
        await addOnsService.createAddOn(formData);
      }

      fetchData();
      resetForm();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving add-on:', error);
    }
  };

  const handleDelete = async (uuid) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este add-on?')) return;
    
    try {
      await addOnsService.deleteAddOn(uuid);
      fetchData();
    } catch (error) {
      console.error('Error deleting add-on:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      name: '',
      description: '',
      price: '',
      currency: 'MXN',
      is_active: true,
      metadata: {},
      service_plans: []
    });
    setEditingAddOn(null);
  };

  const openEditModal = (addOn) => {
    setEditingAddOn(addOn);
    setFormData({
      slug: addOn.slug,
      name: addOn.name,
      description: addOn.description || '',
      price: addOn.price.toString(),
      currency: addOn.currency,
      is_active: addOn.is_active,
      metadata: addOn.metadata || {},
      service_plans: addOn.plans?.map(p => p.id) || []
    });
    setIsEditModalOpen(true);
  };

  const handleServicePlanChange = (planId, checked) => {
    setFormData(prev => ({
      ...prev,
      service_plans: checked
        ? [...prev.service_plans, planId]
        : prev.service_plans.filter(id => id !== planId)
    }));
  };

  const filteredAddOns = addOns.filter(addOn => {
    const matchesSearch = addOn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addOn.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (addOn.description && addOn.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && addOn.is_active) ||
                         (statusFilter === 'inactive' && !addOn.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const AddOnForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="ssl-certificate"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Certificado SSL"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descripción del add-on..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="29.99"
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Moneda</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
              <SelectItem value="USD">USD - Dólar Americano</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Add-on Activo</Label>
      </div>

      <div>
        <Label className="text-base font-medium">Planes de Servicio Compatibles</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona los planes de servicio que pueden usar este add-on
        </p>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
          {servicePlans.map((plan) => (
            <div key={plan.id} className="flex items-center space-x-2">
              <Checkbox
                id={`plan-${plan.id}`}
                checked={formData.service_plans.includes(plan.id)}
                onCheckedChange={(checked) => handleServicePlanChange(plan.id, checked)}
              />
              <Label htmlFor={`plan-${plan.id}`} className="text-sm">
                {plan.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {editingAddOn ? 'Actualizar' : 'Crear'} Add-on
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando add-ons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Add-ons</h1>
          <p className="text-muted-foreground">Gestiona los complementos disponibles para los planes</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Add-on
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Add-on</DialogTitle>
            </DialogHeader>
            <AddOnForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Add-ons</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addOns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add-ons Activos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addOns.filter(a => a.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${addOns.length > 0 ? (addOns.reduce((sum, a) => sum + parseFloat(a.price), 0) / addOns.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar add-ons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de add-ons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAddOns.map((addOn) => (
          <Card key={addOn.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {addOn.name}
                    <Badge variant={addOn.is_active ? "default" : "secondary"}>
                      {addOn.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{addOn.slug}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {addOn.is_active ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    ${addOn.price} {addOn.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">Precio mensual</div>
                </div>
                
                {addOn.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {addOn.description}
                  </p>
                )}

                {addOn.plans && addOn.plans.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Planes compatibles:</div>
                    <div className="flex flex-wrap gap-1">
                      {addOn.plans.slice(0, 2).map((plan) => (
                        <Badge key={plan.id} variant="outline" className="text-xs">
                          {plan.name}
                        </Badge>
                      ))}
                      {addOn.plans.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{addOn.plans.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(addOn)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(addOn.uuid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAddOns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No se encontraron add-ons</div>
        </div>
      )}

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Add-on</DialogTitle>
          </DialogHeader>
          <AddOnForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAddOnsPage;

