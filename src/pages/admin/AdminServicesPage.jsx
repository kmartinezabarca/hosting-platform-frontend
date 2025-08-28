import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreHorizontal,
  Server,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Settings,
  Eye
} from 'lucide-react';
import adminServicesService from '../../services/adminServices';
import servicePlansService from '../../services/servicePlans';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    service_plan_id: '',
    domain: '',
    status: 'active',
    billing_cycle: 'monthly',
    price: '',
    setup_fee: '0',
    notes: ''
  });

  useEffect(() => {
    fetchServices();
    fetchPlans();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await adminServicesService.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        plan_id: planFilter !== 'all' ? planFilter : undefined
      });
      
      setServices(response.data || response);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await servicePlansService.getAll();
      setPlans(response.data || response);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await adminServicesService.update(editingService.id, formData);
      } else {
        await adminServicesService.create(formData);
      }

      fetchServices();
      resetForm();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;
    
    try {
      await adminServicesService.delete(serviceId);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      await adminServicesService.changeStatus(serviceId, newStatus);
      fetchServices();
    } catch (error) {
      console.error('Error changing service status:', error);
    }
  };

  const handleSuspend = async (serviceId, reason) => {
    try {
      await adminServicesService.suspend(serviceId, reason);
      fetchServices();
    } catch (error) {
      console.error('Error suspending service:', error);
    }
  };

  const handleReactivate = async (serviceId) => {
    try {
      await adminServicesService.reactivate(serviceId);
      fetchServices();
    } catch (error) {
      console.error('Error reactivating service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      service_plan_id: '',
      domain: '',
      status: 'active',
      billing_cycle: 'monthly',
      price: '',
      setup_fee: '0',
      notes: ''
    });
    setEditingService(null);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      user_id: service.user_id || '',
      service_plan_id: service.service_plan_id || '',
      domain: service.domain || '',
      status: service.status || 'active',
      billing_cycle: service.billing_cycle || 'monthly',
      price: service.price || '',
      setup_fee: service.setup_fee || '0',
      notes: service.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
      maintenance: { label: 'Mantenimiento', className: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesPlan = planFilter === 'all' || service.service_plan_id?.toString() === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Statistics
  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'active').length,
    suspended: services.filter(s => s.status === 'suspended').length,
    pending: services.filter(s => s.status === 'pending').length,
    cancelled: services.filter(s => s.status === 'cancelled').length,
    maintenance: services.filter(s => s.status === 'maintenance').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
          <p className="text-gray-600 mt-1">Administra todos los servicios de hosting</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Servicio
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <Pause className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <Square className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por dominio, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Servicios ({filteredServices.length})</CardTitle>
          <CardDescription>
            Gestiona todos los servicios de hosting de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Server className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{service.domain || 'Sin dominio'}</h3>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{service.user?.first_name} {service.user?.last_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Server className="h-3 w-3" />
                        <span>{service.plan?.name || 'Plan no definido'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Creado: {new Date(service.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="text-gray-900 font-medium">
                      ${service.price} MXN
                    </div>
                    <div className="text-gray-600">
                      {service.billing_cycle === 'monthly' ? 'Mensual' : 
                       service.billing_cycle === 'yearly' ? 'Anual' : 
                       service.billing_cycle}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {service.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspend(service.id, 'Suspendido por administrador')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : service.status === 'suspended' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivate(service.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : null}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Service Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="billing">Facturación</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="user_id">ID de Usuario</Label>
                  <Input
                    id="user_id"
                    type="number"
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    required
                    placeholder="ID del usuario propietario"
                  />
                </div>
                
                <div>
                  <Label htmlFor="service_plan_id">Plan de Servicio</Label>
                  <Select value={formData.service_plan_id} onValueChange={(value) => setFormData({...formData, service_plan_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price} MXN
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="domain">Dominio</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    placeholder="ejemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                <div>
                  <Label htmlFor="billing_cycle">Ciclo de Facturación</Label>
                  <Select value={formData.billing_cycle} onValueChange={(value) => setFormData({...formData, billing_cycle: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semi_annually">Semestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setup_fee">Costo de Configuración</Label>
                    <Input
                      id="setup_fee"
                      type="number"
                      step="0.01"
                      value={formData.setup_fee}
                      onChange={(e) => setFormData({...formData, setup_fee: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Notas adicionales sobre el servicio"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingService ? 'Actualizar Servicio' : 'Crear Servicio'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServicesPage;

