import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreHorizontal,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  DollarSign,
  Download,
  Send,
  Eye,
  CreditCard,
  Loader2
} from 'lucide-react';

// Hooks de React Query
import {
  useAdminInvoices,
  useCreateAdminInvoice,
  useUpdateAdminInvoice,
  useDeleteAdminInvoice,
  useMarkInvoiceAsPaid,
  useCancelInvoice,
  useSendInvoiceReminder,
} from '../../hooks/useAdminInvoices';

const AdminInvoicesPageRefactored = () => {
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    user_id: '',
    invoice_number: '',
    amount: '',
    tax_amount: '0',
    total_amount: '',
    status: 'pending',
    due_date: '',
    description: '',
    notes: ''
  });

  // Preparar filtros para la query
  const filters = useMemo(() => {
    const params = { page: currentPage };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'all') params.status = statusFilter;
    
    // Add date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateFrom;
      
      switch (dateFilter) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (dateFrom) {
        params.date_from = dateFrom.toISOString().split('T')[0];
      }
    }
    
    return params;
  }, [searchTerm, statusFilter, dateFilter, currentPage]);

  // React Query hooks
  const { 
    data: invoicesData, 
    isLoading: invoicesLoading, 
    error: invoicesError,
    refetch: refetchInvoices
  } = useAdminInvoices(filters);

  // Mutations
  const createInvoiceMutation = useCreateAdminInvoice();
  const updateInvoiceMutation = useUpdateAdminInvoice();
  const deleteInvoiceMutation = useDeleteAdminInvoice();
  const markAsPaidMutation = useMarkInvoiceAsPaid();
  const cancelInvoiceMutation = useCancelInvoice();
  const sendReminderMutation = useSendInvoiceReminder();

  // Extraer datos de las respuestas
  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination;

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await updateInvoiceMutation.mutateAsync({ id: editingInvoice.id, invoiceData: formData });
      } else {
        await createInvoiceMutation.mutateAsync(formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;
    try {
      await deleteInvoiceMutation.mutateAsync(invoiceId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        paymentData: {
          payment_method: 'manual',
          payment_date: new Date().toISOString(),
          notes: 'Marcado como pagado por administrador'
        }
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleCancel = async (invoiceId) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    
    try {
      await cancelInvoiceMutation.mutateAsync({ id: invoiceId, reason });
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  };

  const handleSendReminder = async (invoiceId) => {
    try {
      await sendReminderMutation.mutateAsync(invoiceId);
      alert('Recordatorio enviado exitosamente');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error al enviar recordatorio');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      invoice_number: '',
      amount: '',
      tax_amount: '0',
      total_amount: '',
      status: 'pending',
      due_date: '',
      description: '',
      notes: ''
    });
    setEditingInvoice(null);
  };

  const openModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        user_id: invoice.user_id || '',
        invoice_number: invoice.invoice_number || '',
        amount: invoice.amount || '',
        tax_amount: invoice.tax_amount || '0',
        total_amount: invoice.total_amount || '',
        status: invoice.status || 'pending',
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        description: invoice.description || '',
        notes: invoice.notes || ''
      });
      setIsEditModalOpen(true);
    } else {
      resetForm();
      setIsCreateModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Pagada', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800', icon: AlertTriangle },
      cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800', icon: XCircle },
      draft: { label: 'Borrador', className: 'bg-blue-100 text-blue-800', icon: FileText }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Filtrar facturas localmente
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
    totalAmount: invoices.reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0),
    pendingAmount: invoices.filter(i => i.status === 'pending' || i.status === 'overdue')
                           .reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0)
  };

  if (invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Cargando facturas...</span>
        </div>
      </div>
    );
  }

  if (invoicesError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>Error al cargar las facturas: {invoicesError.message}</AlertDescription>
        </Alert>
        <Button onClick={() => refetchInvoices()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600 mt-1">Administra todas las facturas del sistema</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Factura</DialogTitle>
            </DialogHeader>
            {/* Form content here */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
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
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${stats.pendingAmount.toLocaleString()}</div>
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
                  placeholder="Buscar por número, usuario o descripción..."
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
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            Gestiona todas las facturas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{invoice.invoice_number}</h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{invoice.user?.first_name} {invoice.user?.last_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Vence: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{invoice.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="text-gray-900 font-bold text-lg">
                      ${parseFloat(invoice.total_amount || 0).toLocaleString()} MXN
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={() => openModal(invoice)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(invoice.id)}
                      disabled={deleteInvoiceMutation.isPending}
                    >
                      {deleteInvoiceMutation.isPending ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> : 
                        <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                    {invoice.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        disabled={markAsPaidMutation.isPending}
                      >
                        {markAsPaidMutation.isPending ? 
                          <Loader2 className="h-4 w-4 animate-spin" /> : 
                          <CheckCircle className="h-4 w-4" />
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron facturas</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {pagination.from} a {pagination.to} de {pagination.total} facturas
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span>Página {pagination.current_page} de {pagination.last_page}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  disabled={currentPage === pagination.last_page}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvoicesPageRefactored;

