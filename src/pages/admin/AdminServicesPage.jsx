import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Server,
  Play,
  Pause,
  RefreshCw,
  Cloud,
  CheckCircle,
  Filter,
  X,
  Loader2,
  User,
  DollarSign,
  Settings2,
  Cpu,
  Code2,
  Shield,
  Headphones,
  Database,
  Gamepad2,
  Globe,
  Tag,
  ChevronDown,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import usersService from '../../services/userService';
import {
  useAdminServices,
  useCreateAdminService,
  useUpdateAdminService,
  useDeleteAdminService,
  useSuspendAdminService,
  useReactivateAdminService,
} from '../../hooks/useAdminServices';
import { useServicePlans } from '../../hooks/useServicePlans';
import { toast } from 'sonner';

/* ── Sub-componentes del formulario ─────────────────────────────────── */

/** Chip input reutilizable para arrays (deliverables, tech_stack, etc.) */
const TagInputField = ({ label, field, cfg, addTag, removeTag, placeholder }) => {
  const [draft, setDraft] = React.useState('');
  const tags = Array.isArray(cfg(field, [])) ? cfg(field, []) : [];
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(field, draft); setDraft(''); }
          }}
          placeholder={placeholder}
          className="h-9 rounded-lg text-sm flex-1"
        />
        <Button type="button" variant="outline" size="sm" className="h-9 px-3 rounded-lg"
          onClick={() => { addTag(field, draft); setDraft(''); }}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              {t}
              <button type="button" onClick={() => removeTag(field, i)} className="hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/** Campos comunes a servicios profesionales (proyecto o retainer) */
const ProfessionalProjectFields = ({ cfg, setCfg, addTag, removeTag, extraFields = [] }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      {[
        { key: 'start_date',          label: 'Fecha inicio',            type: 'date' },
        { key: 'end_date',            label: 'Fecha fin',               type: 'date' },
        { key: 'hours_included',      label: 'Horas incluidas',         placeholder: '160',          type: 'number' },
        { key: 'contract_reference',  label: 'Referencia de contrato',  placeholder: 'CONT-2026-001' },
        ...extraFields,
      ].map(f => (
        <div key={f.key} className="space-y-1.5">
          <Label className="text-sm font-medium">{f.label}</Label>
          <Input
            type={f.type ?? 'text'}
            value={cfg(f.key)}
            onChange={(e) => setCfg(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="h-10 rounded-lg"
          />
        </div>
      ))}
    </div>
    <TagInputField
      label="Entregables / Deliverables"
      field="deliverables"
      cfg={cfg} addTag={addTag} removeTag={removeTag}
      placeholder="Escribe un entregable y presiona Enter o +"
    />
    <TagInputField
      label="Stack tecnológico"
      field="tech_stack"
      cfg={cfg} addTag={addTag} removeTag={removeTag}
      placeholder="Laravel / React / MySQL…"
    />
  </div>
);

/* ── Componente principal ────────────────────────────────────────────── */
const AdminServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, service: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // -- Formulario -------------------------------------------------------
  const [formData, setFormData] = useState({
    user_id: '',
    service_plan_id: '',
    name: '',
    domain: '',
    status: 'active',
    billing_cycle: 'monthly',
    price: '',
    setup_fee: '0',
    notes: '',
    configuration: {},
  });
  const [formErrors, setFormErrors] = useState({});

  // -- Búsqueda de usuarios ---------------------------------------------
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const userSearchRef = useRef(null);

  // -- Plan seleccionado (objeto completo con category.slug) ------------
  const [selectedPlan, setSelectedPlan] = useState(null);

  const filters = useMemo(() => {
    const params = { page: currentPage, per_page: perPage };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (planFilter !== 'all') params.plan_id = planFilter;
    return params;
  }, [searchTerm, statusFilter, planFilter, currentPage, perPage]);

  const { 
    data: servicesData, 
    isLoading: servicesLoading,
    isFetching: servicesFetching,
    error: servicesError,
    refetch: refetchServices
  } = useAdminServices(filters);

  const { data: plansData, isLoading: plansLoading } = useServicePlans();

  const services = servicesData?.services || [];
  const pagination = servicesData?.pagination;
  const plans = plansData?.data || plansData || [];

  const createServiceMutation = useCreateAdminService();
  const updateServiceMutation = useUpdateAdminService();
  const deleteServiceMutation = useDeleteAdminService();
  const suspendServiceMutation = useSuspendAdminService();
  const reactivateServiceMutation = useReactivateAdminService();

  React.useEffect(() => {
    if (servicesData) {
      const total = pagination?.total || services.length;
      const lastPage = pagination?.last_page || Math.ceil(total / perPage) || 1;
      setTotalPages(lastPage);
    }
  }, [servicesData, services.length, perPage, pagination]);

  React.useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);
      return;
    }
  }, [dataLoaded]);

  const createService = useCreateAdminService({
    onSuccess: (data, variables) => {
      toast.success(`Servicio creado correctamente`, {
        description: `El servicio ha sido agregado exitosamente.`,
      });
      setIsSubmitting(false);
      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    },
    onError: (error, variables) => {
      const message = error?.response?.data?.message || error?.message || 'Error al crear servicio';
      toast.error(`Error al crear servicio`, {
        description: message,
      });
      setIsSubmitting(false);
    }
  });

  const updateService = useUpdateAdminService({
    onSuccess: (data, variables) => {
      toast.success(`Servicio actualizado`, {
        description: 'Los cambios han sido guardados exitosamente.',
      });
      setIsSubmitting(false);
      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    },
    onError: (error, variables) => {
      const message = error?.response?.data?.message || error?.message || 'Error al actualizar servicio';
      toast.error(`Error al actualizar servicio`, {
        description: message,
      });
      setIsSubmitting(false);
    }
  });

  const deleteService = useDeleteAdminService({
    onSuccess: () => {
      toast.success(`Servicio eliminado`, {
        description: `El servicio ha sido eliminado correctamente.`,
      });
      setIsActionLoading(false);
      setConfirmModal({ isOpen: false, service: null });
      setCurrentPage(1);
      setDataLoaded(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Error al eliminar servicio';
      toast.error('Error al eliminar servicio', {
        description: message,
      });
      setIsActionLoading(false);
    }
  });

  const suspendService = useSuspendAdminService({
    onSuccess: () => {
      toast.warning(`Servicio suspendido`, {
        description: 'El servicio ha sido suspendido correctamente.',
      });
      setIsActionLoading(false);
      setConfirmModal({ isOpen: false, service: null });
      setCurrentPage(1);
      setDataLoaded(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Error al suspender servicio';
      toast.error('Error al suspender servicio', {
        description: message,
      });
      setIsActionLoading(false);
    }
  });

  const reactivateService = useReactivateAdminService({
    onSuccess: () => {
      toast.success(`Servicio reactivado`, {
        description: 'El servicio ha sido reactivado correctamente.',
      });
      setIsActionLoading(false);
      setConfirmModal({ isOpen: false, service: null });
      setCurrentPage(1);
      setDataLoaded(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Error al reactivar servicio';
      toast.error('Error al reactivar servicio', {
        description: message,
      });
      setIsActionLoading(false);
    }
  });

  // -- Fetch usuarios ---------------------------------------------------
  const fetchUsers = useCallback(async (search = '') => {
    setUsersLoading(true);
    try {
      const res = await usersService.getAll({ search, per_page: 50 });
      const list = res?.data?.data ?? res?.data ?? res ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // -- Categoría helpers ------------------------------------------------
  const CATEGORY_META = {
    hosting:                  { label: 'Web Hosting',                      icon: Globe,      type: 'infrastructure', color: 'blue' },
    vps:                      { label: 'VPS Cloud',                        icon: Cpu,        type: 'infrastructure', color: 'purple' },
    database:                 { label: 'Base de Datos',                    icon: Database,   type: 'infrastructure', color: 'orange' },
    gameserver:               { label: 'Servidores de Juegos',             icon: Gamepad2,   type: 'infrastructure', color: 'green' },
    'database-architecture':  { label: 'Arquitectura de Bases de Datos',   icon: Database,   type: 'professional',   color: 'teal' },
    'software-development':   { label: 'Desarrollo de Software a Medida',  icon: Code2,      type: 'professional',   color: 'indigo' },
    'security-devops':        { label: 'Consultoría de Seguridad y DevOps',icon: Shield,     type: 'professional',   color: 'red' },
    'migration-modernization':{ label: 'Migración y Modernización',        icon: RefreshCw,  type: 'professional',   color: 'amber' },
    'critical-support':       { label: 'Soporte de Misión Crítica 24/7',   icon: Headphones, type: 'professional',   color: 'emerald' },
  };

  const BILLING_CYCLES_BY_SLUG = {
    hosting:                  ['monthly', 'quarterly', 'semi_annually', 'annually'],
    vps:                      ['monthly', 'quarterly', 'semi_annually', 'annually'],
    database:                 ['monthly', 'quarterly', 'annually'],
    gameserver:               ['monthly', 'quarterly', 'annually'],
    'database-architecture':  ['one_time', 'monthly'],
    'software-development':   ['one_time', 'monthly'],
    'migration-modernization':['one_time', 'monthly'],
    'security-devops':        ['one_time', 'monthly', 'annually'],
    'critical-support':       ['monthly', 'annually'],
  };

  const CYCLE_LABELS = {
    one_time:     'Pago único',
    monthly:      'Mensual',
    quarterly:    'Trimestral',
    semi_annually:'Semestral',
    annually:     'Anual',
  };

  const categorySlug = selectedPlan?.category?.slug ?? '';
  const categoryMeta = CATEGORY_META[categorySlug] ?? null;
  const allowedCycles = BILLING_CYCLES_BY_SLUG[categorySlug] ?? ['monthly', 'quarterly', 'annually'];
  const showDomain   = ['hosting', 'vps'].includes(categorySlug);
  const isInfra      = categoryMeta?.type === 'infrastructure';
  const isProf       = categoryMeta?.type === 'professional';

  const cfg = (field, defaultVal = '') =>
    formData.configuration?.[field] ?? defaultVal;
  const setCfg = (field, value) =>
    setFormData(prev => ({ ...prev, configuration: { ...prev.configuration, [field]: value } }));

  // Array helpers (deliverables, tech_stack, etc.)
  const addTag = (field, value) => {
    const v = value.trim();
    if (!v) return;
    const arr = Array.isArray(cfg(field, [])) ? cfg(field, []) : [];
    if (!arr.includes(v)) setCfg(field, [...arr, v]);
  };
  const removeTag = (field, idx) => {
    const arr = [...(cfg(field, []))];
    arr.splice(idx, 1);
    setCfg(field, arr);
  };

  // -- Validate form ----------------------------------------------------
  const validateForm = () => {
    const errors = {};
    if (!formData.user_id) errors.user_id = 'Selecciona un usuario';
    if (!formData.service_plan_id) errors.service_plan_id = 'Selecciona un plan de servicio';
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0)
      errors.price = 'El precio debe ser un número válido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    const payload = {
      user_id:          parseInt(formData.user_id),
      service_plan_id:  parseInt(formData.service_plan_id),
      status:           formData.status,
      billing_cycle:    formData.billing_cycle,
      price:            parseFloat(formData.price),
      setup_fee:        parseFloat(formData.setup_fee || 0),
      notes:            formData.notes || '',
      configuration:    formData.configuration || {},
    };
    if (formData.name?.trim()) payload.name = formData.name.trim();
    if (showDomain && formData.domain?.trim()) payload.domain = formData.domain.trim();

    if (editingService) {
      updateService.mutate({ id: editingService.id, serviceData: payload });
    } else {
      createService.mutate(payload);
    }
  };

  const handleDelete = (service) => {
    setConfirmModal({ isOpen: true, action: 'delete', service });
  };

  const handleSuspend = (service) => {
    setConfirmModal({ isOpen: true, action: 'suspend', service });
  };

  const handleReactivate = (service) => {
    setConfirmModal({ isOpen: true, action: 'reactivate', service });
  };

  const handleConfirmAction = () => {
    if (!confirmModal.service) return;
    
    setIsActionLoading(true);
    
    if (confirmModal.action === 'delete') {
      deleteService.mutate(confirmModal.service.id);
    } else if (confirmModal.action === 'suspend') {
      suspendService.mutate({ id: confirmModal.service.id, reason: 'Suspendido por admin' });
    } else if (confirmModal.action === 'reactivate') {
      reactivateService.mutate(confirmModal.service.id);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '', service_plan_id: '', name: '', domain: '',
      status: 'active', billing_cycle: 'monthly',
      price: '', setup_fee: '0', notes: '', configuration: {},
    });
    setFormErrors({});
    setEditingService(null);
    setSelectedUser(null);
    setSelectedPlan(null);
    setUserSearch('');
    setUserDropdownOpen(false);
  };

  const openCreateSheet = () => {
    resetForm();
    fetchUsers('');
    setIsSheetOpen(true);
  };

  const openEditSheet = (service) => {
    setEditingService(service);
    setFormData({
      user_id:          service.user_id?.toString() || '',
      service_plan_id:  service.service_plan_id?.toString() || '',
      name:             service.name || '',
      domain:           service.domain || '',
      status:           service.status || 'active',
      billing_cycle:    service.billing_cycle || 'monthly',
      price:            service.price?.toString() || '',
      setup_fee:        service.setup_fee?.toString() || '0',
      notes:            service.notes || '',
      configuration:    service.configuration || {},
    });
    // Pre-cargar usuario y plan
    if (service.user) {
      setSelectedUser(service.user);
      setUserSearch(`${service.user.first_name ?? ''} ${service.user.last_name ?? ''}`.trim());
    }
    if (service.service_plan) {
      setSelectedPlan(service.service_plan);
    } else {
      const found = (plansData?.data || plansData || []).find(
        p => p.id === service.service_plan_id
      );
      setSelectedPlan(found ?? null);
    }
    fetchUsers('');
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    resetForm();
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null, service: null });
  };

  const stats = useMemo(() => ({
    total: pagination?.total || services.length,
    active: services.filter(s => s.status === 'active').length,
    suspended: services.filter(s => s.status === 'suspended').length,
    pending: services.filter(s => s.status === 'pending').length,
  }), [services, pagination]);

  const getActivePercentage = () => {
    if (stats.total === 0) return 0;
    return (stats.active / stats.total) * 100;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
      suspended: { label: 'Suspendido', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
      pending: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
      cancelled: { label: 'Cancelado', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
      maintenance: { label: 'Mantenimiento', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant="outline" className={`${config.className} px-2 py-0.5 text-xs font-medium`}>{config.label}</Badge>;
  };

  const activeFilters = [statusFilter !== 'all', planFilter !== 'all'].filter(Boolean).length;
  const isLoadingState = servicesLoading || servicesFetching;

  if (servicesError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <Cloud className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error al cargar</h3>
            <p className="text-sm text-muted-foreground mb-4">{servicesError.message}</p>
            <Button onClick={() => refetchServices()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
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
          <h1 className="text-2xl font-semibold tracking-tight">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} servicios registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setDataLoaded(false); refetchServices(); }}
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
            Nuevo Servicio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</p>
                <p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl">
                <Cloud className="h-5 w-5 text-slate-600 dark:text-slate-300" />
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
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
                <Pause className="h-5 w-5 text-red-600" />
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
                <Server className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Header with search, filters and count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por dominio..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                  onClick={() => { setStatusFilter('all'); setPlanFilter('all'); }}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{services.length}</span> servicios
            </div>
          </div>

          {/* Filter dropdowns inline */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="suspended">Suspendidos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los planes</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Precio
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
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Skeleton className="h-5 w-16" />
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
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Cloud className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron servicios</p>
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Server className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{service.domain || 'Sin dominio'}</p>
                            <p className="text-xs text-muted-foreground truncate">{service.user?.email || 'Sin email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{service.user?.first_name} {service.user?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant="outline" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                          {service.plan?.name || 'Sin plan'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-sm">{service.price}</span>
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
                                onClick={() => openEditSheet(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar servicio</TooltipContent>
                          </Tooltip>
                          
                          {service.status === 'active' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  onClick={() => handleSuspend(service)}
                                  disabled={suspendService.isPending}
                                >
                                  {suspendService.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Pause className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Suspender servicio</TooltipContent>
                            </Tooltip>
                          ) : service.status === 'suspended' ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => handleReactivate(service)}
                                  disabled={reactivateService.isPending}
                                >
                                  {reactivateService.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reactivar servicio</TooltipContent>
                            </Tooltip>
                          ) : null}
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(service)}
                                disabled={deleteService.isPending}
                              >
                                {deleteService.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar servicio</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {services.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoadingState}
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
                        disabled={isLoadingState}
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
                  disabled={currentPage === totalPages || isLoadingState}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="w-full sm:max-w-[820px] p-0 flex flex-col gap-0 [&>button]:top-5 [&>button]:right-5">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="px-7 pt-6 pb-5 border-b shrink-0 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-none">
                    {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingService
                      ? `Editando ${editingService.name || editingService.domain || '#' + editingService.id}`
                      : 'El nombre se genera automáticamente si se omite'}
                  </p>
                </div>
              </div>
              {categoryMeta && (() => {
                const Icon = categoryMeta.icon;
                const colorMap = {
                  blue:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  purple:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                  orange:'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                  green:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  teal:'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
                  indigo:'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
                  red:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  amber:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  emerald:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                };
                return (
                  <Badge className={`text-xs gap-1 ${colorMap[categoryMeta.color] ?? ''} border-0`}>
                    <Icon className="h-3 w-3" />
                    {categoryMeta.label}
                  </Badge>
                );
              })()}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto">
              <div className="px-7 py-6 space-y-7">

                {/* ══ 1 — Cliente ════════════════════════════════════ */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Cliente</h3>
                  </div>

                  <div className="pl-7 space-y-2">
                    <Label className="text-sm font-medium">Usuario *</Label>
                    <div className="relative">
                      {selectedUser ? (
                        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-primary/5 ${formErrors.user_id ? 'border-red-400' : 'border-primary/20'}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
                              <span className="text-sm font-bold text-primary">
                                {(selectedUser.first_name?.[0] ?? '?').toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{selectedUser.first_name} {selectedUser.last_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                            onClick={() => { setSelectedUser(null); setFormData(p => ({ ...p, user_id: '' })); setUserSearch(''); setUserDropdownOpen(true); setTimeout(() => userSearchRef.current?.focus(), 50); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className={`relative flex items-center h-11 rounded-xl border-2 bg-background transition-colors ${formErrors.user_id ? 'border-red-400' : 'border-input'} focus-within:border-primary`}>
                          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            ref={userSearchRef}
                            type="text"
                            value={userSearch}
                            placeholder="Buscar por nombre o correo…"
                            className="h-full w-full bg-transparent pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground"
                            onChange={(e) => { setUserSearch(e.target.value); setUserDropdownOpen(true); fetchUsers(e.target.value); }}
                            onFocus={() => { setUserDropdownOpen(true); if (!users.length) fetchUsers(''); }}
                            onBlur={() => setTimeout(() => setUserDropdownOpen(false), 150)}
                          />
                          {usersLoading && <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                      )}
                      {userDropdownOpen && !selectedUser && (
                        <div className="absolute z-50 mt-1.5 w-full rounded-xl border bg-popover shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                          {usersLoading ? (
                            <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Buscando…</div>
                          ) : users.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</div>
                          ) : users.map(u => (
                            <button key={u.id} type="button" className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                              onMouseDown={(e) => { e.preventDefault(); setSelectedUser(u); setFormData(p => ({ ...p, user_id: u.id })); setUserSearch(`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()); setUserDropdownOpen(false); if (formErrors.user_id) setFormErrors(p => ({ ...p, user_id: null })); }}>
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-primary">{(u.first_name?.[0] ?? '?').toUpperCase()}</span></div>
                              <div className="min-w-0"><p className="text-sm font-medium truncate">{u.first_name} {u.last_name}</p><p className="text-xs text-muted-foreground truncate">{u.email}</p></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {formErrors.user_id && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{formErrors.user_id}</p>}
                  </div>
                </section>

                <Separator />

                {/* ══ 2 — Plan de Servicio ═══════════════════════════ */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Plan de Servicio</h3>
                  </div>

                  <div className="pl-7 space-y-2">
                    <Label className="text-sm font-medium">Plan *</Label>
                    <Select
                      value={formData.service_plan_id}
                      onValueChange={(v) => {
                        const plan = (plansData?.data || plansData || []).find(p => p.id.toString() === v);
                        setSelectedPlan(plan ?? null);
                        const slug = plan?.category?.slug ?? '';
                        const cycles = BILLING_CYCLES_BY_SLUG[slug] ?? ['monthly'];
                        setFormData(p => ({
                          ...p,
                          service_plan_id: v,
                          price: plan?.price?.toString() || p.price,
                          billing_cycle: cycles[0],
                          configuration: {},
                        }));
                        if (formErrors.service_plan_id) setFormErrors(p => ({ ...p, service_plan_id: null }));
                      }}
                    >
                      <SelectTrigger className={`h-11 rounded-xl ${formErrors.service_plan_id ? 'border-red-400' : ''}`}>
                        <SelectValue placeholder="— Selecciona un plan —" />
                      </SelectTrigger>
                      <SelectContent>
                        {plansLoading ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…</div>
                        ) : (plans || []).length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Sin planes disponibles</div>
                        ) : (plans || []).map(plan => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            <span className="font-medium">{plan.name}</span>
                            {plan.category?.name && <span className="ml-2 text-xs text-muted-foreground">— {plan.category.name}</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.service_plan_id && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{formErrors.service_plan_id}</p>}

                    {selectedPlan && (
                      <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm space-y-0.5">
                        <p className="font-medium">{selectedPlan.name}</p>
                        {selectedPlan.description && <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>}
                        {selectedPlan.price && <p className="text-xs text-muted-foreground mt-1">Precio base: <span className="font-semibold text-foreground">${selectedPlan.price} MXN</span></p>}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Nombre del servicio <span className="text-xs font-normal text-muted-foreground">(opcional — se auto-genera)</span></Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Ej. Hosting micliente.com"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* ══ 3 — Condiciones ════════════════════════════════ */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Condiciones</h3>
                  </div>

                  <div className="pl-7 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Precio (MXN) *</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                        <Input
                          type="number" min="0" step="0.01"
                          value={formData.price}
                          onChange={(e) => { setFormData(p => ({ ...p, price: e.target.value })); if (formErrors.price) setFormErrors(p => ({ ...p, price: null })); }}
                          className={`h-11 rounded-xl pl-7 ${formErrors.price ? 'border-red-400' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                      {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Cuota de instalación</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                        <Input
                          type="number" min="0" step="0.01"
                          value={formData.setup_fee}
                          onChange={(e) => setFormData(p => ({ ...p, setup_fee: e.target.value }))}
                          className="h-11 rounded-xl pl-7"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Ciclo de facturación</Label>
                      <Select value={formData.billing_cycle} onValueChange={(v) => setFormData(p => ({ ...p, billing_cycle: v }))}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {allowedCycles.map(c => (
                            <SelectItem key={c} value={c}>{CYCLE_LABELS[c] ?? c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Estado</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">⏳ Pendiente</SelectItem>
                          <SelectItem value="active">✅ Activo</SelectItem>
                          <SelectItem value="suspended">⏸ Suspendido</SelectItem>
                          <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dominio — solo hosting y vps */}
                    {showDomain && (
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" /> Dominio / Hostname
                        </Label>
                        <Input
                          value={formData.domain}
                          onChange={(e) => setFormData(p => ({ ...p, domain: e.target.value }))}
                          placeholder={categorySlug === 'vps' ? 'vps01.roke.mx' : 'micliente.com'}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* ══ 4 — Configuración técnica (dinámica) ═══════════ */}
                {selectedPlan && (isInfra || isProf) && (
                  <>
                    <Separator />
                    <section className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                          <Settings2 className="h-3.5 w-3.5" /> Configuración técnica
                        </h3>
                      </div>

                      <div className="pl-7 space-y-4">
                        {/* ── HOSTING ──────────────────────────── */}
                        {categorySlug === 'hosting' && (
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'panel_url', label: 'URL del panel (cPanel)', placeholder: 'https://cpanel.roke.mx/cliente', span: 2 },
                              { key: 'ip_address', label: 'Dirección IP', placeholder: '192.168.1.10' },
                              { key: 'php_version', label: 'Versión PHP', placeholder: '8.3' },
                              { key: 'disk_gb', label: 'Disco (GB)', placeholder: '20', type: 'number' },
                              { key: 'bandwidth_gb', label: 'Ancho de banda (GB)', placeholder: '200', type: 'number' },
                              { key: 'email_accounts', label: 'Cuentas de email', placeholder: '10', type: 'number' },
                            ].map(f => (
                              <div key={f.key} className={`space-y-1.5 ${f.span === 2 ? 'col-span-2' : ''}`}>
                                <Label className="text-sm font-medium">{f.label}</Label>
                                <Input type={f.type ?? 'text'} value={cfg(f.key)} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className="h-10 rounded-lg" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── VPS ──────────────────────────────── */}
                        {categorySlug === 'vps' && (
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'ip_address', label: 'Dirección IP', placeholder: '10.0.0.1' },
                              { key: 'ssh_port', label: 'Puerto SSH', placeholder: '22', type: 'number' },
                              { key: 'os', label: 'Sistema Operativo', placeholder: 'Ubuntu 24.04 LTS', span: 2 },
                              { key: 'cpu_cores', label: 'CPU (núcleos)', placeholder: '2', type: 'number' },
                              { key: 'ram_gb', label: 'RAM (GB)', placeholder: '4', type: 'number' },
                              { key: 'disk_gb', label: 'Disco (GB)', placeholder: '80', type: 'number' },
                              { key: 'proxmox_vmid', label: 'Proxmox VMID', placeholder: '101', type: 'number' },
                            ].map(f => (
                              <div key={f.key} className={`space-y-1.5 ${f.span === 2 ? 'col-span-2' : ''}`}>
                                <Label className="text-sm font-medium">{f.label}</Label>
                                <Input type={f.type ?? 'text'} value={cfg(f.key)} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className="h-10 rounded-lg" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── DATABASE ─────────────────────────── */}
                        {categorySlug === 'database' && (
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'host', label: 'Host', placeholder: 'db.roke.mx' },
                              { key: 'port', label: 'Puerto', placeholder: '3306', type: 'number' },
                              { key: 'engine', label: 'Motor', placeholder: 'MySQL 8.0 / PostgreSQL 16' },
                              { key: 'database_name', label: 'Nombre de la base de datos', placeholder: 'cliente_prod' },
                              { key: 'storage_gb', label: 'Almacenamiento (GB)', placeholder: '10', type: 'number' },
                              { key: 'backups', label: 'Política de backups', placeholder: 'Diario a las 03:00 UTC' },
                            ].map(f => (
                              <div key={f.key} className="space-y-1.5">
                                <Label className="text-sm font-medium">{f.label}</Label>
                                <Input type={f.type ?? 'text'} value={cfg(f.key)} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className="h-10 rounded-lg" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── GAMESERVER ───────────────────────── */}
                        {categorySlug === 'gameserver' && (
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'game', label: 'Juego', placeholder: 'Minecraft / Valheim / CS2', span: 2 },
                              { key: 'server_ip', label: 'IP del servidor', placeholder: '45.62.100.10' },
                              { key: 'server_port', label: 'Puerto', placeholder: '25565', type: 'number' },
                              { key: 'max_players', label: 'Jugadores máximos', placeholder: '20', type: 'number' },
                              { key: 'ram_mb', label: 'RAM (MB)', placeholder: '4096', type: 'number' },
                              { key: 'mod_pack', label: 'Mod pack / versión', placeholder: 'Vanilla 1.21' },
                            ].map(f => (
                              <div key={f.key} className={`space-y-1.5 ${f.span === 2 ? 'col-span-2' : ''}`}>
                                <Label className="text-sm font-medium">{f.label}</Label>
                                <Input type={f.type ?? 'text'} value={cfg(f.key)} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className="h-10 rounded-lg" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── DESARROLLO / ARQUITECTURA / MIGRACIÓN ──── */}
                        {['software-development', 'database-architecture', 'migration-modernization'].includes(categorySlug) && (
                          <ProfessionalProjectFields cfg={cfg} setCfg={setCfg} addTag={addTag} removeTag={removeTag}
                            extraFields={[{ key: 'project_manager', label: 'Project Manager', placeholder: 'Nombre del PM' }]}
                          />
                        )}

                        {/* ── SECURITY-DEVOPS ──────────────────── */}
                        {categorySlug === 'security-devops' && (
                          <ProfessionalProjectFields cfg={cfg} setCfg={setCfg} addTag={addTag} removeTag={removeTag}
                            extraFields={[{ key: 'scope', label: 'Alcance / Scope', placeholder: 'Descripción del alcance del proyecto' }]}
                          />
                        )}

                        {/* ── CRITICAL SUPPORT ─────────────────── */}
                        {categorySlug === 'critical-support' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { key: 'sla_response_minutes', label: 'SLA respuesta (min)', placeholder: '15', type: 'number' },
                                { key: 'sla_uptime_percent', label: 'SLA uptime (%)', placeholder: '99.9', type: 'number' },
                                { key: 'escalation_contact', label: 'Contacto de escalación', placeholder: 'ops@empresa.mx', span: 2 },
                                { key: 'monitoring_tool', label: 'Herramienta de monitoreo', placeholder: 'Zabbix / Grafana / Datadog', span: 2 },
                              ].map(f => (
                                <div key={f.key} className={`space-y-1.5 ${f.span === 2 ? 'col-span-2' : ''}`}>
                                  <Label className="text-sm font-medium">{f.label}</Label>
                                  <Input type={f.type ?? 'text'} value={cfg(f.key)} onChange={(e) => setCfg(f.key, e.target.value)} placeholder={f.placeholder} className="h-10 rounded-lg" />
                                </div>
                              ))}
                            </div>
                            <TagInputField label="Canales de contacto" field="contact_channels" cfg={cfg} addTag={addTag} removeTag={removeTag} placeholder="email / phone / slack / whatsapp" />
                            <TagInputField label="Sistemas cubiertos" field="covered_systems" cfg={cfg} addTag={addTag} removeTag={removeTag} placeholder="hosting principal / base de datos producción" />
                          </div>
                        )}
                      </div>
                    </section>
                  </>
                )}

                <Separator />

                {/* ══ 5 — Notas ══════════════════════════════════════ */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-muted-foreground/30 text-background flex items-center justify-center text-[10px] font-bold shrink-0">5</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Notas <span className="text-xs normal-case font-normal">(opcional)</span>
                    </h3>
                  </div>
                  <div className="pl-7">
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                      className="rounded-xl text-sm min-h-[80px] resize-none"
                      placeholder="Instrucciones especiales, credenciales temporales, contexto del cliente…"
                    />
                  </div>
                </section>

              </div>
            </div>

            {/* ── Footer sticky ─────────────────────────────────── */}
            <div className="px-7 py-4 border-t shrink-0 bg-background/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={closeSheet} className="flex-1 h-11 rounded-xl" disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-2 h-11 rounded-xl px-8 font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingService ? 'Guardando…' : 'Creando…'}</>
                  ) : editingService ? (
                    'Guardar cambios'
                  ) : (
                    <><Server className="h-4 w-4 mr-2" />Crear servicio{formData.price ? ` · $${parseFloat(formData.price || 0).toLocaleString('es-MX')} MXN` : ''}</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.action === 'delete' ? 'Eliminar Servicio' :
          confirmModal.action === 'suspend' ? 'Suspender Servicio' :
          'Reactivar Servicio'
        }
        confirmText={
          confirmModal.action === 'delete' ? 'Eliminar' :
          confirmModal.action === 'suspend' ? 'Suspender' :
          'Reactivar'
        }
        isConfirming={isActionLoading}
      >
        {confirmModal.action === 'delete' ? (
          <p>¿Estás seguro de que quieres eliminar el servicio <strong>{confirmModal.service?.domain || 'este servicio'}</strong>? Esta acción no se puede deshacer.</p>
        ) : confirmModal.action === 'suspend' ? (
          <p>¿Estás seguro de que quieres suspender el servicio <strong>{confirmModal.service?.domain || 'este servicio'}</strong>?</p>
        ) : (
          <p>¿Estás seguro de que quieres reactivar el servicio <strong>{confirmModal.service?.domain || 'este servicio'}</strong>?</p>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default AdminServicesPage;
