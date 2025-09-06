import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser, 
  useChangeUserStatus,
  useUsersStats 
} from '../../hooks/useUsers';
import { toast } from 'sonner';

const AdminUsersPage = () => {
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'client',
    status: 'active',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'MX',
    postal_code: ''
  });

  // Parámetros para la consulta de usuarios
  const queryParams = useMemo(() => ({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined
  }), [searchTerm, statusFilter, roleFilter]);

  // Hooks de React Query
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useUsers(queryParams);

  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useUsersStats();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const changeStatusMutation = useChangeUserStatus();

  // Extraer datos de la respuesta
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          userData: formData
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await createUserMutation.mutateAsync(formData);
        toast.success('Usuario creado correctamente');
      }

      resetForm();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al guardar usuario';
      toast.error(errorMessage);
    }
  };

  // Manejar eliminación de usuario
  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(errorMessage);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await changeStatusMutation.mutateAsync({ userId, status: newStatus });
      toast.success('Estado del usuario actualizado');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar estado';
      toast.error(errorMessage);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'client',
      status: 'active',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'MX',
      postal_code: ''
    });
    setEditingUser(null);
  };

  // Abrir modal de edición
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || 'MX',
      postal_code: user.postal_code || ''
    });
    setIsEditModalOpen(true);
  };

  // Funciones para badges
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-800' },
      pending_verification: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      banned: { label: 'Bloqueado', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Administrador', className: 'bg-purple-100 text-purple-800' },
      support: { label: 'Soporte', className: 'bg-blue-100 text-blue-800' },
      client: { label: 'Cliente', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = roleConfig[role] || roleConfig.client;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Calcular estadísticas locales si no hay datos del servidor
  const stats = useMemo(() => {
    if (statsData) {
      return statsData;
    }
    
    // Fallback: calcular estadísticas localmente
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      pending: users.filter(u => u.status === 'pending_verification').length,
      admins: users.filter(u => u.role === 'admin').length,
      clients: users.filter(u => u.role === 'client').length
    };
  }, [users, statsData]);

  // Loading state
  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (usersError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar usuarios</h3>
          <p className="text-gray-600 mb-4">
            {usersError.message || 'Ha ocurrido un error inesperado'}
          </p>
          <Button onClick={() => refetchUsers()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra todos los usuarios de la plataforma</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Crear Usuario
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.total
              )}
            </div>
            <p className="text-xs text-gray-600">Todos los usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.active
              )}
            </div>
            <p className="text-xs text-gray-600">
              {stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}% del total` : '0% del total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.suspended
              )}
            </div>
            <p className="text-xs text-gray-600">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.pending
              )}
            </div>
            <p className="text-xs text-gray-600">Verificación pendiente</p>
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
                  placeholder="Buscar por nombre o email..."
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
                <SelectItem value="pending_verification">Pendientes</SelectItem>
                <SelectItem value="banned">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="support">Soporte</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
          <CardDescription>
            Gestiona la información y permisos de todos los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_full_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name} ${user.last_name}`} />
                    <AvatarFallback>
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Registro: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="text-gray-900 font-medium">
                      {user.services_count || 0} servicios
                    </div>
                    <div className="text-gray-600">
                      {user.tickets_count || 0} tickets
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending && editingUser?.id === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {user.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        className="text-red-600 hover:text-red-700"
                        disabled={changeStatusMutation.isPending}
                      >
                        {changeStatusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, 'active')}
                        className="text-green-600 hover:text-green-700"
                        disabled={changeStatusMutation.isPending}
                      >
                        {changeStatusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit User Modal */}
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
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="contact">Contacto y Dirección</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">
                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="support">Soporte</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="pending_verification">Pendiente</SelectItem>
                        <SelectItem value="banned">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MX">México</SelectItem>
                        <SelectItem value="US">Estados Unidos</SelectItem>
                        <SelectItem value="CA">Canadá</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Código Postal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    />
                  </div>
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
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {(createUserMutation.isPending || updateUserMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;

