import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { toast } from 'sonner';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Check,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  Loader2,
  Receipt,
  Send,
  DollarSign,
  User,
  Package,
  PlusCircle,
  MinusCircle,
  Calculator
} from 'lucide-react';
import { useAdminInvoices, useCreateAdminInvoice, useUpdateAdminInvoice, useDeleteAdminInvoice, useMarkInvoiceAsPaid } from '@/hooks/useAdminInvoices';
import usersService from '@/services/userService';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Descripción requerida'),
  quantity: z.coerce.number().positive('Cantidad debe ser mayor a 0'),
  unit_price: z.coerce.number().positive('Precio debe ser mayor a 0'),
});

const invoiceSchema = z.object({
  user_id: z.string().min(1, 'Debes seleccionar un usuario'),
  status: z.string(),
  due_date: z.string().min(1, 'La fecha de vencimiento es requerida'),
  currency: z.string(),
  tax_rate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Agrega al menos un concepto'),
});

const AdminInvoicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, invoice: null });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const userSearchRef = useRef(null);
  const userDropdownRef = useRef(null);

  const { data: invoicesData, isLoading, refetch } = useAdminInvoices({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page: currentPage,
    per_page: perPage,
  });

  const createInvoice = useCreateAdminInvoice();
  const updateInvoice = useUpdateAdminInvoice();
  const deleteInvoice = useDeleteAdminInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();

  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination;
  const totalPages = pagination?.last_page || 1;

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      user_id: '',
      status: 'pending',
      due_date: '',
      currency: 'MXN',
      tax_rate: 16,
      notes: '',
      items: [{ description: '', quantity: 1, unit_price: '' }],
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const watchedTaxRate = form.watch('tax_rate');

  const totals = useMemo(() => {
    const subtotal = (watchedItems || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
    const taxRate = parseFloat(watchedTaxRate) || 0;
    const tax = subtotal * (taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [watchedItems, watchedTaxRate]);

  const formatMXN = (n) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n || 0);

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(amount);

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

  const handleSearchChange = (value) => {
    if (value !== searchTerm) {
      setSearchTerm(value);
      setCurrentPage(1);
    }
  };

  const sortedInvoices = useMemo(() => {
    let sorted = [...invoices];
    
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'invoice_number') {
        aValue = a.invoice_number?.toLowerCase() || '';
        bValue = b.invoice_number?.toLowerCase() || '';
      } else if (sortConfig.key === 'user') {
        aValue = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
        bValue = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();
      } else if (sortConfig.key === 'total') {
        aValue = parseFloat(a.total_amount) || 0;
        bValue = parseFloat(b.total_amount) || 0;
      } else if (sortConfig.key === 'due_date') {
        aValue = new Date(a.due_date) || new Date(0);
        bValue = new Date(b.due_date) || new Date(0);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [invoices, sortConfig]);

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

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    const pending = invoices.filter(i => i.status === 'pending').length;
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    const totalAmount = invoices.reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);
    const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);
    return { total, paid, pending, overdue, totalAmount, pendingAmount };
  }, [invoices]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Pagada', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle },
      pending: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Clock },
      overdue: { label: 'Vencida', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: AlertTriangle },
      cancelled: { label: 'Cancelada', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: XCircle },
      draft: { label: 'Borrador', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: FileText }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.className} px-2.5 py-1 text-xs font-medium`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {config.label}
      </Badge>
    );
  };

  const getPaidPercentage = () => stats.total === 0 ? 0 : (stats.paid / stats.total) * 100;
  const activeFilters = [statusFilter, dateFilter].filter(f => f !== 'all').length;

  const handleSubmit = async (data) => {
    try {
      const payload = {
        user_id: data.user_id,
        status: data.status,
        due_date: data.due_date,
        currency: data.currency || 'MXN',
        tax_rate: data.tax_rate || 16,
        notes: data.notes || '',
        items: data.items.map(item => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      if (isEditMode && editingInvoice) {
        await updateInvoice.mutateAsync({ id: editingInvoice.id, invoiceData: payload });
        toast.success('Factura actualizada correctamente');
      } else {
        await createInvoice.mutateAsync(payload);
        toast.success('Factura creada correctamente');
      }

      closeSheet();
      setCurrentPage(1);
    } catch (error) {
      console.error('Error saving invoice:', error);
      const msg = error?.response?.data?.message || 'Error al guardar factura';
      toast.error(msg);
    }
  };

  const openCreateSheet = () => {
    setIsEditMode(false);
    setEditingInvoice(null);
    setSelectedUser(null);
    setUserSearch('');
    setUserDropdownOpen(false);
    form.reset({
      user_id: '',
      status: 'pending',
      due_date: '',
      currency: 'MXN',
      tax_rate: 16,
      notes: '',
      items: [{ description: '', quantity: 1, unit_price: '' }],
    });
    fetchUsers('');
    setIsSheetOpen(true);
  };

  const openEditSheet = (invoice) => {
    setIsEditMode(true);
    setEditingInvoice(invoice);

    let items = [];
    if (Array.isArray(invoice.items) && invoice.items.length > 0) {
      items = invoice.items.map(item => ({
        description: item.description || '',
        quantity: item.quantity ?? 1,
        unit_price: item.unit_price ?? item.unit_amount ?? '',
      }));
    } else {
      items = [{
        description: invoice.description || '',
        quantity: 1,
        unit_price: invoice.amount || invoice.total_amount || '',
      }];
    }

    setSelectedUser(invoice.user || null);
    setUserSearch(invoice.user ? `${invoice.user.first_name ?? ''} ${invoice.user.last_name ?? ''}`.trim() : '');

    form.reset({
      user_id: invoice.user_id || '',
      status: invoice.status || 'pending',
      due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
      currency: invoice.currency || 'MXN',
      tax_rate: invoice.tax_rate ?? 16,
      notes: invoice.notes || '',
      items,
    });

    fetchUsers('');
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingInvoice(null);
    setIsEditMode(false);
    setSelectedUser(null);
    setUserSearch('');
    setUserDropdownOpen(false);
  };

  const handleDelete = (invoice) => {
    setConfirmModal({ isOpen: true, action: 'delete', invoice });
  };

  const handleMarkAsPaid = (invoice) => {
    setConfirmModal({
      isOpen: true,
      action: 'markPaid',
      invoice,
      message: `¿Estás seguro de marcar como pagada la factura ${invoice.invoice_number}?`
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmModal.action === 'delete') {
        await deleteInvoice.mutateAsync(confirmModal.invoice.id);
        toast.success('Factura eliminada correctamente');
      } else if (confirmModal.action === 'markPaid') {
        await markAsPaid.mutateAsync({ 
          id: confirmModal.invoice.id, 
          paymentData: { payment_method: 'manual', payment_date: new Date().toISOString(), notes: 'Marcado por admin' }
        });
        toast.success('Factura marcada como pagada');
      }
      setConfirmModal({ isOpen: false, action: null, invoice: null });
    } catch (error) {
      console.error('Error in action:', error);
      toast.error('Error al realizar la acción');
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null, invoice: null });
  };

  const handleDownloadPdf = async (invoiceId) => {
    toast.error('Funcionalidad de descarga de PDF en desarrollo');
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    form.setValue('user_id', user.id);
    setUserSearch(`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim());
    setUserDropdownOpen(false);
    form.clearErrors('user_id');
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    form.setValue('user_id', '');
    setUserSearch('');
    setUserDropdownOpen(true);
    setTimeout(() => userSearchRef.current?.focus(), 50);
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting || createInvoice.isPending || updateInvoice.isPending;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} facturas en el sistema</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
          <Button onClick={openCreateSheet} size="sm" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
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
                <Receipt className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {formatCurrency(stats.totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Pagadas</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.paid}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <Progress value={getPaidPercentage()} className="h-1 mt-3 bg-emerald-200/50 dark:bg-emerald-800/50 [&>div]:bg-emerald-500" />
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
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              {formatCurrency(stats.pendingAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50/80 to-red-50/30 dark:from-red-950/40 dark:to-red-950/20 border-red-200/50 dark:border-red-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">Vencidas</p>
                <p className="text-2xl font-semibold mt-1 text-red-800 dark:text-red-100">{stats.overdue}</p>
              </div>
              <div className="p-2.5 bg-red-500/15 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Header with search, filters and count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar facturas..."
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
                  onClick={() => { setStatusFilter('all'); setDateFilter('all'); }}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{sortedInvoices.length}</span> facturas
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
                  <SelectItem value="paid">Pagadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="overdue">Vencidas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
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
                    onClick={() => handleSort('invoice_number')}
                  >
                    <div className="flex items-center gap-1">
                      Factura
                      <SortIcon column="invoice_number" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSort('user')}
                  >
                    <div className="flex items-center gap-1">
                      Cliente
                      <SortIcon column="user" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group hidden md:table-cell"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center gap-1">
                      Total
                      <SortIcon column="total" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors group hidden lg:table-cell"
                    onClick={() => handleSort('due_date')}
                  >
                    <div className="flex items-center gap-1">
                      Vencimiento
                      <SortIcon column="due_date" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><Skeleton className="h-10 w-10 rounded-lg" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : (
                  sortedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-medium truncate">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground truncate">{invoice.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {invoice.user?.first_name} {invoice.user?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{invoice.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {formatCurrency(parseFloat(invoice.total_amount || 0))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(invoice.due_date).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSheet(invoice)}><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Editar factura</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadPdf(invoice.id)}><Download className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Descargar PDF</TooltipContent></Tooltip>
                          {invoice.status === 'pending' && (
                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleMarkAsPaid(invoice)}><CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></Button></TooltipTrigger><TooltipContent>Marcar como pagada</TooltipContent></Tooltip>
                          )}
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(invoice)}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Eliminar factura</TooltipContent></Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {sortedInvoices.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No se encontraron facturas</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}>Anterior</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(pageNum)} disabled={isLoading} className="h-8 w-8 p-0">{pageNum}</Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="!w-full !max-w-[680px] p-0 flex flex-col gap-0">
          {/* Header */}
          <div className="px-7 pt-6 pb-5 border-b shrink-0 bg-gradient-to-br from-background to-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-none">
                    {isEditMode ? 'Editar Factura' : 'Nueva Factura'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEditMode ? `Editando ${editingInvoice?.invoice_number ?? '—'}` : 'El folio se genera automáticamente'}
                  </p>
                </div>
              </div>
              {isEditMode && editingInvoice && (
                <div className="shrink-0 mt-0.5">{getStatusBadge(editingInvoice.status)}</div>
              )}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-6">
                {/* Section 1: User */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-0.5">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Destinatario</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Usuario a facturar *</Label>
                    <div className="relative" ref={userDropdownRef}>
                      {selectedUser ? (
                        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-primary/5 ${form.formState.errors.user_id ? 'border-red-400' : 'border-primary/20'}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
                              <span className="text-sm font-bold text-primary">{(selectedUser.first_name?.[0] ?? '?').toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{selectedUser.first_name} {selectedUser.last_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={handleClearUser}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className={`relative flex items-center h-11 rounded-xl border-2 bg-background ${form.formState.errors.user_id ? 'border-red-400' : 'border-input'} focus-within:border-primary transition-colors`}>
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
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Buscando…</div>
                          ) : users.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</div>
                          ) : users.map(user => (
                            <button key={user.id} type="button"
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                              onMouseDown={(e) => { e.preventDefault(); handleSelectUser(user); }}>
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">{(user.first_name?.[0] ?? '?').toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.user_id && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {form.formState.errors.user_id.message}</p>}
                  </div>
                </section>

                <Separator />

                {/* Section 2: Conditions */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-0.5">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Condiciones</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="due_date" className="text-sm font-medium">Fecha de vencimiento *</Label>
                      <Input id="due_date" type="date" {...form.register('due_date')} className={`h-10 ${form.formState.errors.due_date ? 'border-red-400' : ''}`} />
                      {form.formState.errors.due_date && <p className="text-xs text-red-500">{form.formState.errors.due_date.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Estado</Label>
                      <Select {...form.register('status')} onValueChange={(v) => form.setValue('status', v)} value={form.watch('status')}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="sent">Enviada</SelectItem>
                          <SelectItem value="paid">Pagada</SelectItem>
                          <SelectItem value="overdue">Vencida</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Moneda</Label>
                      <Select {...form.register('currency')} onValueChange={(v) => form.setValue('currency', v)} value={form.watch('currency')}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MXN">MXN — Peso Mexicano</SelectItem>
                          <SelectItem value="USD">USD — Dólar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="tax_rate" className="text-sm font-medium">Tasa IVA</Label>
                      <div className="relative">
                        <Input id="tax_rate" type="number" min="0" max="100" step="0.01" {...form.register('tax_rate')} className="h-10 pr-8" placeholder="16" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">México: 16% por defecto</p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 3: Items */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Conceptos / Partidas</h3>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendItem({ description: '', quantity: 1, unit_price: '' })} className="h-8 text-xs gap-1.5">
                      <PlusCircle className="h-3.5 w-3.5" /> Agregar
                    </Button>
                  </div>

                  {form.formState.errors.items?.message && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {form.formState.errors.items.message}</p>}

                  <div className="space-y-3">
                    {itemFields.map((field, idx) => {
                      const itemErrors = form.formState.errors.items?.[idx];
                      const item = watchedItems?.[idx] || {};
                      const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                      
                      return (
                        <div key={field.id} className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${itemErrors ? 'border-red-300 bg-red-50/30 dark:bg-red-950/10' : 'border-border bg-muted/20 hover:border-muted-foreground/25'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Concepto #{idx + 1}</span>
                            <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg" disabled={itemFields.length === 1} onClick={() => removeItem(idx)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Descripción *</Label>
                            <Input {...form.register(`items.${idx}.description`)} placeholder="Ej. Plan Hosting Pro — Mensual" className={`h-10 rounded-lg text-sm ${itemErrors?.description ? 'border-red-400' : ''}`} />
                            {itemErrors?.description && <p className="text-xs text-red-500">{itemErrors.description.message}</p>}
                          </div>

                          <div className="grid grid-cols-3 gap-3 items-end">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Cantidad *</Label>
                              <Input type="number" min="0.01" step="0.01" {...form.register(`items.${idx}.quantity`)} className={`h-10 rounded-lg text-sm text-center ${itemErrors?.quantity ? 'border-red-400' : ''}`} placeholder="1" />
                              {itemErrors?.quantity && <p className="text-xs text-red-500">{itemErrors.quantity.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Precio unitario *</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
                                <Input type="number" min="0.01" step="0.01" {...form.register(`items.${idx}.unit_price`)} className={`h-10 rounded-lg text-sm pl-6 ${itemErrors?.unit_price ? 'border-red-400' : ''}`} placeholder="0.00" />
                              </div>
                              {itemErrors?.unit_price && <p className="text-xs text-red-500">{itemErrors.unit_price.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Subtotal</Label>
                              <div className="h-10 rounded-lg border bg-muted/40 px-3 flex items-center justify-end">
                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                  {lineTotal > 0 ? formatMXN(lineTotal) : <span className="text-muted-foreground font-normal">—</span>}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Totals Summary */}
                    <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 overflow-hidden">
                      <div className="px-5 py-4 space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="tabular-nums font-medium">{formatMXN(totals.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5"><Calculator className="h-3.5 w-3.5" /> IVA ({form.watch('tax_rate') || 0}%)</span>
                          <span className="tabular-nums font-medium">{formatMXN(totals.tax)}</span>
                        </div>
                      </div>
                      <div className="px-5 py-3.5 bg-primary/8 border-t flex items-center justify-between">
                        <span className="text-sm font-bold">Total a pagar</span>
                        <span className="text-lg font-bold tabular-nums text-primary">{formatMXN(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 4: Notes */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-muted-foreground/30 text-background flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Notas <span className="text-xs normal-case font-normal">(opcional)</span></h3>
                  </div>
                  <Textarea id="notes" {...form.register('notes')} className="text-sm min-h-[80px] resize-none" placeholder="Instrucciones de pago, número de orden de compra, observaciones…" />
                </section>
              </div>
            </div>

            {/* Footer sticky */}
            <div className="px-6 py-4 border-t shrink-0 bg-background">
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={closeSheet} className="flex-1 h-10" disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" className="flex-[2] h-10 font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEditMode ? 'Guardando…' : 'Creando…'}</>
                  ) : isEditMode ? (
                    'Guardar cambios'
                  ) : (
                    <><Receipt className="h-4 w-4 mr-2" />Crear factura · {formatMXN(totals.total)}</>
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
        title={confirmModal.action === 'delete' ? 'Eliminar Factura' : 'Confirmar Acción'}
        confirmText={confirmModal.action === 'delete' ? 'Eliminar' : 'Confirmar'}
        isConfirming={deleteInvoice.isPending || markAsPaid.isPending}
      >
        {confirmModal.action === 'delete' ? (
          <p>¿Estás seguro de que quieres eliminar la factura <strong>{confirmModal.invoice?.invoice_number}</strong>? Esta acción no se puede deshacer.</p>
        ) : (
          <p>{confirmModal.message}</p>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default AdminInvoicesPage;
