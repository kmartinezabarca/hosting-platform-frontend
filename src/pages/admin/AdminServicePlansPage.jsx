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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Star, Eye, EyeOff } from 'lucide-react';
import servicePlansService from '../../services/servicePlans';

const AdminServicePlansPage = () => {
  const [servicePlans, setServicePlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [billingCycles, setBillingCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    category_id: '',
    slug: '',
    name: '',
    description: '',
    base_price: '',
    setup_fee: '0',
    is_popular: false,
    is_active: true,
    sort_order: '0',
    specifications: {},
    features: [],
    pricing: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, categoriesRes, cyclesRes] = await Promise.all([
        servicePlansService.getServicePlans(),
        servicePlansService.getCategories(),
        servicePlansService.getBillingCycles()
      ]);
      
      setServicePlans(plansRes.data || []);
      setCategories(categoriesRes.data || []);
      setBillingCycles(cyclesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await servicePlansService.updateServicePlan(editingPlan.uuid, formData);
      } else {
        await servicePlansService.createServicePlan(formData);
      }

      fetchData();
      resetForm();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving service plan:', error);
    }
  };

  const handleDelete = async (uuid) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) return;
    
    try {
      await servicePlansService.deleteServicePlan(uuid);
      fetchData();
    } catch (error) {
      console.error('Error deleting service plan:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      slug: '',
      name: '',
      description: '',
      base_price: '',
      setup_fee: '0',
      is_popular: false,
      is_active: true,
      sort_order: '0',
      specifications: {},
      features: [],
      pricing: []
    });
    setEditingPlan(null);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      category_id: plan.category_id.toString(),
      slug: plan.slug,
      name: plan.name,
      description: plan.description || '',
      base_price: plan.base_price.toString(),
      setup_fee: plan.setup_fee.toString(),
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      sort_order: plan.sort_order.toString(),
      specifications: plan.specifications || {},
      features: plan.features?.map(f => f.feature) || [],
      pricing: plan.pricing?.map(p => ({
        billing_cycle_id: p.billing_cycle_id,
        price: p.price.toString()
      })) || []
    });
    setIsEditModalOpen(true);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addPricing = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, { billing_cycle_id: '', price: '' }]
    }));
  };

  const updatePricing = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const removePricing = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  const filteredPlans = servicePlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plan.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const PlanForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="pricing">Precios</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Categoría</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="hosting-starter"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Hosting Starter"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del plan..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="base_price">Precio Base</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                placeholder="99.99"
                required
              />
            </div>
            <div>
              <Label htmlFor="setup_fee">Costo de Configuración</Label>
              <Input
                id="setup_fee"
                type="number"
                step="0.01"
                value={formData.setup_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, setup_fee: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label htmlFor="is_popular">Plan Popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Características del Plan</h3>
            <Button type="button" onClick={addFeature} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Característica
            </Button>
          </div>
          
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Ej: 10 GB de almacenamiento SSD"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Precios por Ciclo de Facturación</h3>
            <Button type="button" onClick={addPricing} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Precio
            </Button>
          </div>
          
          {formData.pricing.map((pricing, index) => (
            <div key={index} className="flex gap-2">
              <Select
                value={pricing.billing_cycle_id.toString()}
                onValueChange={(value) => updatePricing(index, 'billing_cycle_id', parseInt(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ciclo de facturación" />
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map(cycle => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                value={pricing.price}
                onChange={(e) => updatePricing(index, 'price', e.target.value)}
                placeholder="Precio"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePricing(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>

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
          {editingPlan ? 'Actualizar' : 'Crear'} Plan
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando planes de servicio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planes de Servicio</h1>
          <p className="text-muted-foreground">Gestiona los planes de servicio disponibles</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Plan de Servicio</DialogTitle>
            </DialogHeader>
            <PlanForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar planes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de planes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.is_popular && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.category?.name}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {plan.is_active ? (
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
                  <div className="text-2xl font-bold">${plan.base_price}</div>
                  <div className="text-sm text-muted-foreground">Precio base</div>
                </div>
                
                {plan.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {plan.features && plan.features.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Características:</div>
                    <ul className="text-sm space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {feature.feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-muted-foreground">
                          • Y {plan.features.length - 3} más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.uuid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No se encontraron planes de servicio</div>
        </div>
      )}

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plan de Servicio</DialogTitle>
          </DialogHeader>
          <PlanForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServicePlansPage;

