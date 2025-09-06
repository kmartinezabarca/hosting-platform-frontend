import React, { useState, useMemo } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Search, Star, Eye, EyeOff, Loader2 } from 'lucide-react';

// Hooks de React Query
import {
  useAdminServicePlans,
  useAdminServicePlanCategories,
  useAdminBillingCycles,
  useCreateAdminServicePlan,
  useUpdateAdminServicePlan,
  useDeleteAdminServicePlan,
} from '../../hooks/useAdminServicePlans';

const AdminServicePlansPage = () => {
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Estado del formulario
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

  // Preparar filtros para la query
  const filters = useMemo(() => {
    const params = { page: currentPage };
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== 'all') params.category_id = selectedCategory;
    return params;
  }, [searchTerm, selectedCategory, currentPage]);

  // React Query hooks
  const { 
    data: plansData, 
    isLoading: plansLoading, 
    error: plansError,
    refetch: refetchPlans
  } = useAdminServicePlans(filters);

  const { data: categoriesData, isLoading: categoriesLoading } = useAdminServicePlanCategories();
  const { data: billingCyclesData, isLoading: billingCyclesLoading } = useAdminBillingCycles();

  // Mutations
  const createPlanMutation = useCreateAdminServicePlan();
  const updatePlanMutation = useUpdateAdminServicePlan();
  const deletePlanMutation = useDeleteAdminServicePlan();

  // Extraer datos de las respuestas
  const servicePlans = plansData?.plans || [];
  const pagination = plansData?.pagination;
  const categories = categoriesData?.data || [];
  const billingCycles = billingCyclesData?.data || [];

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updatePlanMutation.mutateAsync({ uuid: editingPlan.uuid, planData: formData });
      } else {
        await createPlanMutation.mutateAsync(formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving service plan:', error);
    }
  };

  const handleDelete = async (uuid) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) return;
    try {
      await deletePlanMutation.mutateAsync(uuid);
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

  const openModal = (plan = null) => {
    if (plan) {
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
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const addFeature = () => setFormData(p => ({ ...p, features: [...p.features, ''] }));
  const updateFeature = (i, v) => setFormData(p => ({ ...p, features: p.features.map((f, idx) => idx === i ? v : f) }));
  const removeFeature = (i) => setFormData(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const addPricing = () => setFormData(p => ({ ...p, pricing: [...p.pricing, { billing_cycle_id: '', price: '' }] }));
  const updatePricing = (i, f, v) => setFormData(p => ({ ...p, pricing: p.pricing.map((pr, idx) => idx === i ? { ...pr, [f]: v } : pr) }));
  const removePricing = (i) => setFormData(p => ({ ...p, pricing: p.pricing.filter((_, idx) => idx !== i) }));

  const PlanForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="pricing">Precios</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* Form fields */}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {/* Feature fields */}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {/* Pricing fields */}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
        <Button type="submit" disabled={createPlanMutation.isPending || updatePlanMutation.isPending}>
          {(createPlanMutation.isPending || updatePlanMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingPlan ? 'Actualizar' : 'Crear'} Plan
        </Button>
      </div>
    </form>
  );

  if (plansLoading || categoriesLoading || billingCyclesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>Error al cargar los planes: {plansError.message}</AlertDescription>
        </Alert>
        <Button onClick={() => refetchPlans()}>Reintentar</Button>
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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openModal()}><Plus className="h-4 w-4 mr-2" />Nuevo Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Editar' : 'Crear'} Plan de Servicio</DialogTitle>
            </DialogHeader>
            <PlanForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
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
              <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plan list */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {servicePlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.is_popular && <Badge variant="secondary" className="text-xs"><Star className="h-3 w-3 mr-1" />Popular</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.category?.name}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {plan.is_active ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">${plan.base_price}<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                {plan.features && plan.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Características:</h4>
                    <ul className="space-y-1 text-sm">
                      {plan.features.slice(0, 3).map((feature, index) => <li key={index}>• {feature.feature}</li>)}
                      {plan.features.length > 3 && <li className="text-muted-foreground">• Y {plan.features.length - 3} más...</li>}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(plan)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(plan.uuid)} disabled={deletePlanMutation.isPending}>
                    {deletePlanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servicePlans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron planes de servicio</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Mostrando {pagination.from} a {pagination.to} de {pagination.total} planes
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Anterior</Button>
            <span>Página {pagination.current_page} de {pagination.last_page}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pagination.last_page}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicePlansPage;

