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
  CreditCard
} from 'lucide-react';
import adminInvoicesService from '../../services/adminInvoices';

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

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

      const response = await adminInvoicesService.getAll(params);
      setInvoices(response.data || response);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await adminInvoicesService.update(editingInvoice.id, formData);
      } else {
        await adminInvoicesService.create(formData);
      }

      fetchInvoices();
      resetForm();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;
    
    try {
      await adminInvoicesService.delete(invoiceId);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await adminInvoicesService.markAsPaid(invoiceId, {
        payment_method: 'manual',
        payment_date: new Date().toISOString(),
        notes: 'Marcado como pagado por administrador'
      });
      fetchInvoices();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleMarkAsOverdue = async (invoiceId) => {
    try {
      await adminInvoicesService.markAsOverdue(invoiceId);
      fetchInvoices();
    } catch (error) {
      console.error('Error marking invoice as overdue:', error);
    }
  };

  const handleCancel = async (invoiceId) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    
    try {
      await adminInvoicesService.cancel(invoiceId, reason);
      fetchInvoices();
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  };

  const handleSendReminder = async (invoiceId) => {
    try {
      await adminInvoicesService.sendReminder(invoiceId);
      alert('Recordatorio enviado exitosamente');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error al enviar recordatorio');
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    try {
      const pdfBlob = await adminInvoicesService.generatePdf(invoiceId);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `factura-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar PDF');
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

  const openEditModal = (invoice) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600 mt-1">Administra todas las facturas del sistema</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Factura
            </Button>
          </DialogTrigger>
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
            <Button onClick={fetchInvoices} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
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
                    <div className="text-gray-600">
                      Creada: {new Date(invoice.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(invoice.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {invoice.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(invoice.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
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

      {/* Create/Edit Invoice Modal */}
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
              {editingInvoice ? 'Editar Factura' : 'Crear Nueva Factura'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="amounts">Montos y Fechas</TabsTrigger>
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
                    placeholder="ID del usuario"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invoice_number">Número de Factura</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                    required
                    placeholder="INV-2024-001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Descripción del servicio facturado"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="paid">Pagada</SelectItem>
                      <SelectItem value="overdue">Vencida</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="amounts" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Monto Base</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        const taxAmount = parseFloat(formData.tax_amount) || 0;
                        setFormData({
                          ...formData, 
                          amount: e.target.value,
                          total_amount: (amount + taxAmount).toString()
                        });
                      }}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_amount">Impuestos</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      step="0.01"
                      value={formData.tax_amount}
                      onChange={(e) => {
                        const amount = parseFloat(formData.amount) || 0;
                        const taxAmount = parseFloat(e.target.value) || 0;
                        setFormData({
                          ...formData, 
                          tax_amount: e.target.value,
                          total_amount: (amount + taxAmount).toString()
                        });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="total_amount">Monto Total</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Notas adicionales"
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
                {editingInvoice ? 'Actualizar Factura' : 'Crear Factura'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoicesPage;

