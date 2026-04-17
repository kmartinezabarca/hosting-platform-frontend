import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import usersService from '../../services/userService';
import { toast } from 'sonner';

const generateSecurePassword = (options = {}) => {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options;
  
  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPasswordOptions, setShowPasswordOptions] = useState(false);
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
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

  const [dataLoaded, setDataLoaded] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, user: null });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name || formData.first_name.trim() === '') {
      errors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name || formData.last_name.trim() === '') {
      errors.last_name = 'El apellido es requerido';
    }
    
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (!isEditMode && (!formData.password || formData.password.trim() === '')) {
      errors.password = 'La contraseña es requerida';
    } else if (!isEditMode && formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!formData.role) {
      errors.role = 'El rol es requerido';
    }
    
    if (!formData.status) {
      errors.status = 'El estado es requerido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersService.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page: currentPage,
        per_page: perPage
      });
      
      let allUsers = [];
      let total = 1;
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
        total = response.data.total || allUsers.length;
        if (response.data.last_page !== undefined) {
          setTotalPages(response.data.last_page);
        } else if (response.data.meta?.last_page !== undefined) {
          setTotalPages(response.data.meta.last_page);
        } else {
          setTotalPages(Math.ceil(total / perPage) || 1);
        }
      } else if (response.data && Array.isArray(response.data)) {
        allUsers = response.data;
        total = allUsers.length;
        setTotalPages(Math.ceil(total / perPage) || 1);
      } else if (Array.isArray(response)) {
        allUsers = response;
        total = allUsers.length;
        setTotalPages(Math.ceil(total / perPage) || 1);
      } else {
        allUsers = [];
        setTotalPages(1);
      }
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, roleFilter, currentPage, perPage]);

  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);
      fetchUsers();
      return;
    }
    fetchUsers();
  }, [searchTerm, statusFilter, roleFilter, currentPage]);

  const handleSearchChange = (value) => {
    if (value !== searchTerm) {
      setSearchTerm(value);
      setCurrentPage(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Por favor completa los campos requeridos', {
        description: 'Revisa los campos marcados en rojo.'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await usersService.update(editingUser.id, formData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usersService.create(formData);
        toast.success('Usuario creado correctamente');
      }

      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (user) => {
    setConfirmModal({
      isOpen: true,
      action: 'delete',
      user: user
    });
  };

  const handleStatusChange = (user, newStatus) => {
    const statusText = newStatus === 'suspended' ? 'suspender' : 'activar';
    setConfirmModal({
      isOpen: true,
      action: 'status',
      user: user,
      newStatus: newStatus,
      message: `¿Estás seguro de que quieres ${statusText} a ${user.first_name} ${user.last_name}?`
    });
  };

  const handleConfirmAction = async () => {
    setIsActionLoading(true);
    try {
      if (confirmModal.action === 'delete') {
        await usersService.delete(confirmModal.user.id);
        toast.success('Usuario eliminado correctamente');
      } else if (confirmModal.action === 'status') {
        await usersService.changeStatus(confirmModal.user.id, confirmModal.newStatus);
        const statusText = confirmModal.newStatus === 'suspended' ? 'suspendido' : 'activado';
        toast.success(`Usuario ${statusText} correctamente`);
      }
      setConfirmModal({ isOpen: false, action: null, user: null });
      fetchUsers();
    } catch (error) {
      console.error('Error in action:', error);
      toast.error('Error al realizar la acción');
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null, user: null });
  };

  const openCreateSheet = () => {
    setIsEditMode(false);
    setEditingUser(null);
    setFormErrors({});
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: generateSecurePassword(passwordOptions),
      role: 'client',
      status: 'active',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'MX',
      postal_code: ''
    });
    setShowPassword(true);
    setShowPasswordOptions(false);
    setIsSheetOpen(true);
  };

  const openEditSheet = (user) => {
    setIsEditMode(true);
    setEditingUser(user);
    setFormErrors({});
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
    setShowPassword(false);
    setShowPasswordOptions(false);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingUser(null);
    setIsEditMode(false);
    setShowPasswordOptions(false);
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(passwordOptions);
    setFormData(p => ({ ...p, password: newPassword }));
    setShowPassword(true);
    setCopiedPassword(false);
  };

  const handleTogglePasswordOptions = () => {
    setShowPasswordOptions(!showPasswordOptions);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast.success('Contraseña copiada');
    } catch (err) {
      toast.error('Error al copiar');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
      suspended: { label: 'Suspendido', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
      pending_verification: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
      banned: { label: 'Bloqueado', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge variant="outline" className={`${config.className} px-2.5 py-1 text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
      support: { label: 'Soporte', className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
      client: { label: 'Cliente', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' }
    };
    
    const config = roleConfig[role] || roleConfig.client;
    return (
      <Badge variant="outline" className={`${config.className} px-2.5 py-1 text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const sortedUsers = useMemo(() => {
    let sorted = [...users];
    
    if (searchTerm) {
      sorted = sorted.filter(user =>
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      sorted = sorted.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      sorted = sorted.filter(user => user.role === roleFilter);
    }

    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'name') {
        aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
        bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, searchTerm, statusFilter, roleFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="h-3 w-3 opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending: users.filter(u => u.status === 'pending_verification').length,
  };

  const getActivePercentage = () => {
    if (stats.total === 0) return 0;
    return (stats.active / stats.total) * 100;
  };

  const activeFilters = [statusFilter, roleFilter].filter(f => f !== 'all').length;

  const getPaginatedUsers = () => {
    return sortedUsers;
  };

  const paginatedUsers = getPaginatedUsers();

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-56" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-9 w-20" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
            
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} usuarios registrados</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => { setDataLoaded(false); fetchUsers(); }} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="text-foreground"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-foreground" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2 text-foreground" />
            )}
            <span className="text-foreground">Actualizar</span>
          </Button>
          <Button onClick={openCreateSheet} size="sm" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</p>
                <p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
            <Progress value={100} className="h-1 mt-3 bg-slate-200/50 dark:bg-slate-700/50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Activos</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.active}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <Progress value={getActivePercentage()} className="h-1 mt-3 bg-emerald-200/50 dark:bg-emerald-800/50 [&>div]:bg-emerald-500" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50/80 to-red-50/30 dark:from-red-950/40 dark:to-red-950/20 border-red-200/50 dark:border-red-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">Suspendidos</p>
                <p className="text-2xl font-semibold mt-1 text-red-800 dark:text-red-100">{stats.suspended}</p>
              </div>
              <div className="p-2.5 bg-red-500/15 rounded-xl">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/80 to-amber-50/30 dark:from-amber-950/40 dark:to-amber-950/20 border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Pendientes</p>
                <p className="text-2xl font-semibold mt-1 text-amber-800 dark:text-amber-100">{stats.pending}</p>
              </div>
              <div className="p-2.5 bg-amber-500/15 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Header with search, filters and count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                  onClick={() => { setStatusFilter('all'); setRoleFilter('all'); }}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, sortedUsers.length)}</span> de {sortedUsers.length} usuarios
              {totalPages > 1 && <span className="ml-2 text-xs">(Página {currentPage} de {totalPages})</span>}
            </div>
          </div>
          
          {/* Filter dropdowns inline */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="pending_verification">Pendientes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support">Soporte</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Usuario
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rol
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group hidden md:table-cell"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      <SortIcon column="created_at" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name} ${user.last_name}`} />
                          <AvatarFallback className="text-xs font-medium">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => openEditSheet(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar usuario</TooltipContent>
                        </Tooltip>
                        {user.status === 'active' ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                                onClick={() => handleStatusChange(user, 'suspended')}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Suspender usuario</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                                onClick={() => handleStatusChange(user, 'active')}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Activar usuario</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                              onClick={() => handleDelete(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar usuario</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
            
            {paginatedUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {(totalPages > 0 || users.length > 0) && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b shrink-0">
              <SheetTitle className="text-xl font-semibold text-foreground">
                {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
              </SheetTitle>
              <SheetDescription className="text-foreground/70">
                {isEditMode ? 'Modifica los datos del usuario' : 'Completa la información para crear un nuevo usuario'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="basic" className="text-foreground">Información</TabsTrigger>
                    <TabsTrigger value="contact" className="text-foreground">Contacto</TabsTrigger>
                  </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-medium text-foreground">Nombre *</Label>
                      <Input 
                        id="first_name" 
                        value={formData.first_name} 
                        onChange={(e) => {
                          setFormData({...formData, first_name: e.target.value});
                          if (formErrors.first_name) setFormErrors({...formErrors, first_name: undefined});
                        }} 
                        className={`h-11 ${formErrors.first_name ? 'border-red-500 focus:border-red-500' : ''}`} 
                        placeholder="Juan"
                      />
                      {formErrors.first_name && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-medium text-foreground">Apellido *</Label>
                      <Input 
                        id="last_name" 
                        value={formData.last_name} 
                        onChange={(e) => {
                          setFormData({...formData, last_name: e.target.value});
                          if (formErrors.last_name) setFormErrors({...formErrors, last_name: undefined});
                        }} 
                        className={`h-11 ${formErrors.last_name ? 'border-red-500 focus:border-red-500' : ''}`} 
                        placeholder="Pérez"
                      />
                      {formErrors.last_name && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => {
                        setFormData({...formData, email: e.target.value});
                        if (formErrors.email) setFormErrors({...formErrors, email: undefined});
                      }} 
                      className={`h-11 ${formErrors.email ? 'border-red-500 focus:border-red-500' : ''}`} 
                      placeholder="juan@ejemplo.com"
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      {isEditMode ? 'Nueva Contraseña' : 'Contraseña *'}
                    </Label>
                    {!isEditMode && (
                      <div className="space-y-3 mb-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGeneratePassword}
                            className="flex-1 text-foreground"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Generar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleTogglePasswordOptions}
                            className="text-xs text-foreground"
                          >
                            Opciones
                          </Button>
                          {showPassword && formData.password && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCopyPassword}
                            >
                              {copiedPassword ? <Check className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" /> : <Copy className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />}
                            </Button>
                          )}
                        </div>
                        
                        {showPasswordOptions && (
                          <div className="p-3 bg-muted/50 rounded-lg space-y-3 border border-border">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-foreground">Longitud</Label>
                                <span className="text-xs font-semibold text-primary">{passwordOptions.length}</span>
                              </div>
                              <input
                                type="range"
                                min="8"
                                max="32"
                                value={passwordOptions.length}
                                onChange={(e) => setPasswordOptions(p => ({ ...p, length: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>8</span>
                                <span>32</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={passwordOptions.uppercase}
                                  onChange={(e) => setPasswordOptions(p => ({ ...p, uppercase: e.target.checked }))}
                                  className="rounded border-input w-4 h-4 accent-primary"
                                />
                                <span className="text-xs text-foreground">Mayúsculas (A-Z)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={passwordOptions.lowercase}
                                  onChange={(e) => setPasswordOptions(p => ({ ...p, lowercase: e.target.checked }))}
                                  className="rounded border-input w-4 h-4 accent-primary"
                                />
                                <span className="text-xs text-foreground">Minúsculas (a-z)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={passwordOptions.numbers}
                                  onChange={(e) => setPasswordOptions(p => ({ ...p, numbers: e.target.checked }))}
                                  className="rounded border-input w-4 h-4 accent-primary"
                                />
                                <span className="text-xs text-foreground">Números (0-9)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={passwordOptions.symbols}
                                  onChange={(e) => setPasswordOptions(p => ({ ...p, symbols: e.target.checked }))}
                                  className="rounded border-input w-4 h-4 accent-primary"
                                />
                                <span className="text-xs text-foreground">Símbolos (!@#$)</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password} 
                        onChange={(e) => {
                          setFormData({...formData, password: e.target.value});
                          if (formErrors.password) setFormErrors({...formErrors, password: undefined});
                        }} 
                        className={`h-11 pr-10 ${formErrors.password ? 'border-red-500 focus:border-red-500' : ''}`} 
                        placeholder={isEditMode ? "Dejar en blanco para no cambiar" : "Contraseña segura"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                    )}
                    {showPassword && formData.password && !formErrors.password && (
                      <p className="text-xs text-muted-foreground">
                        {formData.password.length} caracteres
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Rol *</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => {
                          setFormData({...formData, role: value});
                          if (formErrors.role) setFormErrors({...formErrors, role: undefined});
                        }}
                      >
                        <SelectTrigger className={`h-11 ${formErrors.role ? 'border-red-500' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Cliente</SelectItem>
                          <SelectItem value="support">Soporte</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.role && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.role}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Estado *</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => {
                          setFormData({...formData, status: value});
                          if (formErrors.status) setFormErrors({...formErrors, status: undefined});
                        }}
                      >
                        <SelectTrigger className={`h-11 ${formErrors.status ? 'border-red-500' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="suspended">Suspendido</SelectItem>
                          <SelectItem value="pending_verification">Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.status && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.status}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground">Teléfono</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      placeholder="+52 123 456 7890" 
                      className="h-11" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-foreground">Dirección</Label>
                    <Input 
                      id="address" 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                      className="h-11" 
                      placeholder="Calle Principal #123"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-foreground">Ciudad</Label>
                      <Input 
                        id="city" 
                        value={formData.city} 
                        onChange={(e) => setFormData({...formData, city: e.target.value})} 
                        className="h-11" 
                        placeholder="Ciudad de México"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium text-foreground">Estado</Label>
                      <Input 
                        id="state" 
                        value={formData.state} 
                        onChange={(e) => setFormData({...formData, state: e.target.value})} 
                        className="h-11" 
                        placeholder="CDMX"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">País</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MX">México</SelectItem>
                          <SelectItem value="US">Estados Unidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code" className="text-sm font-medium text-foreground">Código Postal</Label>
                      <Input 
                        id="postal_code" 
                        value={formData.postal_code} 
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})} 
                        className="h-11" 
                        placeholder="06600"
                      />
                    </div>
                  </div>
                </TabsContent>
                </Tabs>
              </div>
              
              <div className="px-6 py-4 border-t shrink-0 bg-background">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1 text-foreground" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditMode ? 'Guardando...' : 'Creando...'}
                      </>
                    ) : (
                      isEditMode ? 'Guardar Cambios' : 'Crear Usuario'
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
        onConfirm={handleConfirmAction}
        title={confirmModal.action === 'delete' ? 'Eliminar Usuario' : 'Confirmar Acción'}
        confirmText={confirmModal.action === 'delete' ? 'Eliminar' : 'Confirmar'}
        isConfirming={isActionLoading}
      >
        {confirmModal.action === 'delete' ? (
          <p>¿Estás seguro de que quieres eliminar a <strong>{confirmModal.user?.first_name} {confirmModal.user?.last_name}</strong>? Esta acción no se puede deshacer.</p>
        ) : (
          <p>{confirmModal.message}</p>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default AdminUsersPage;
