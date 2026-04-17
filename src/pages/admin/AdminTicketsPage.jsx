import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  HelpCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Send,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Ticket,
  Zap,
  Filter,
  X,
  Loader2,
  User
} from 'lucide-react';
import adminTicketsService from '../../services/adminTicketsService';
import { toast } from 'sonner';

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isReplySheetOpen, setIsReplySheetOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [replyingTicket, setReplyingTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, ticket: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    user_id: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
    status: 'open',
    assigned_to: ''
  });

  const [replyData, setReplyData] = useState({
    message: '',
    is_internal: false
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchTickets();
    fetchCategories();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);
      return;
    }
    fetchTickets();
  }, [searchTerm, statusFilter, priorityFilter, currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      };

      const response = await adminTicketsService.getAll(params);
      const data = response.data.data || [];
      setTickets(data);
      
      const total = response.data.total || data.length;
      const lastPage = response.data.last_page || Math.ceil(total / perPage) || 1;
      setTotalPages(lastPage);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Error al cargar tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminTicketsService.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await adminTicketsService.getAgents();
      setAgents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (editingTicket) {
        await adminTicketsService.update(editingTicket.id, formData);
        toast.success(`Ticket #${editingTicket.id} actualizado`, {
          description: 'Los cambios han sido guardados.',
        });
      } else {
        await adminTicketsService.create(formData);
        toast.success('Ticket creado', {
          description: 'El ticket ha sido creado exitosamente.',
        });
      }
      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error saving ticket:', error);
      const message = error?.response?.data?.message || 'Error al guardar ticket';
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyData.message.trim()) {
      toast.error('Error', { description: 'El mensaje es requerido' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await adminTicketsService.addReply(replyingTicket.id, replyData);
      toast.success('Respuesta enviada', {
        description: 'La respuesta ha sido enviada exitosamente.',
      });
      setReplyData({ message: '', is_internal: false });
      closeReplySheet();
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error adding reply:', error);
      const message = error?.response?.data?.message || 'Error al enviar respuesta';
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (ticket) => {
    setConfirmModal({ isOpen: true, action: 'delete', ticket });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.ticket) return;
    
    setIsActionLoading(true);
    try {
      if (confirmModal.action === 'delete') {
        await adminTicketsService.delete(confirmModal.ticket.id);
        toast.success('Ticket eliminado', {
          description: `El ticket #${confirmModal.ticket.id} ha sido eliminado.`,
        });
      } else if (confirmModal.action === 'status') {
        await adminTicketsService.changeStatus(confirmModal.ticket.id, confirmModal.newStatus);
        toast.success('Estado actualizado', {
          description: 'El estado del ticket ha sido actualizado.',
        });
      }
      setConfirmModal({ isOpen: false, action: null, ticket: null });
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error', { description: 'Error al realizar la acción' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.user_id || formData.user_id === '') {
      errors.user_id = 'El ID de usuario es requerido';
    }
    
    if (!formData.subject || formData.subject.trim() === '') {
      errors.subject = 'El asunto es requerido';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'La descripción es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      subject: '',
      description: '',
      priority: 'medium',
      category: '',
      status: 'open',
      assigned_to: ''
    });
    setFormErrors({});
    setEditingTicket(null);
  };

  const openCreateSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const openEditSheet = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      user_id: ticket.user_id?.toString() || '',
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || 'medium',
      category: ticket.category || '',
      status: ticket.status || 'open',
      assigned_to: ticket.assigned_to || ''
    });
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    resetForm();
  };

  const openReplySheet = (ticket) => {
    setReplyingTicket(ticket);
    setReplyData({ message: '', is_internal: false });
    setIsReplySheetOpen(true);
  };

  const closeReplySheet = () => {
    setIsReplySheetOpen(false);
    setReplyingTicket(null);
    setReplyData({ message: '', is_internal: false });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null, ticket: null });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { label: 'Abierto', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: HelpCircle },
      in_progress: { label: 'Progreso', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Clock },
      resolved: { label: 'Resuelto', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle },
      closed: { label: 'Cerrado', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: XCircle },
      pending: { label: 'Pendiente', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.className} px-2 py-0.5 text-xs font-medium`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: 'Baja', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: ArrowDown },
      medium: { label: 'Media', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Minus },
      high: { label: 'Alta', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', icon: ArrowUp },
      urgent: { label: 'Urgente', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: Zap }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    const IconComponent = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.className} px-2 py-0.5 text-xs font-medium`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    unassigned: tickets.filter(t => !t.assigned_to).length
  }), [tickets]);

  const getOpenPercentage = () => {
    if (stats.total === 0) return 0;
    return (stats.open / stats.total) * 100;
  };

  const activeFilters = [statusFilter !== 'all', priorityFilter !== 'all'].filter(Boolean).length;
  const isLoadingState = loading;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestión de Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setDataLoaded(false); fetchTickets(); }}
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
            Nuevo Ticket
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
                <Ticket className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50/80 to-blue-50/30 dark:from-blue-950/40 dark:to-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Abiertos</p>
                <p className="text-2xl font-semibold mt-1 text-blue-800 dark:text-blue-100">{stats.open}</p>
              </div>
              <div className="p-2.5 bg-blue-500/15 rounded-xl">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={getOpenPercentage()} className="h-1 mt-3 bg-blue-200/50 dark:bg-blue-800/50 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50/80 to-red-50/30 dark:from-red-950/40 dark:to-red-950/20 border-red-200/50 dark:border-red-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">Urgentes</p>
                <p className="text-2xl font-semibold mt-1 text-red-800 dark:text-red-100">{stats.urgent}</p>
              </div>
              <div className="p-2.5 bg-red-500/15 rounded-xl">
                <Zap className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Resueltos</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.resolved}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          {/* Header with search, filters and count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tickets..."
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
                  onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
                  className="h-9 text-muted-foreground px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{tickets.length}</span> tickets
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
                  <SelectItem value="open">Abiertos</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="resolved">Resueltos</SelectItem>
                  <SelectItem value="closed">Cerrados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Fecha
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
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
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
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No se encontraron tickets</p>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">#{ticket.id}</span>
                              <p className="font-medium text-sm truncate">{ticket.subject}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{ticket.replies_count || 0} respuestas</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{ticket.user?.first_name} {ticket.user?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => openReplySheet(ticket)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Responder</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditSheet(ticket)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(ticket)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
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
          {tickets.length > 0 && (
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
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b shrink-0">
              <SheetTitle className="text-xl font-semibold">
                {editingTicket ? `Editar Ticket #${editingTicket.id}` : 'Nuevo Ticket'}
              </SheetTitle>
              <SheetDescription>
                {editingTicket ? 'Modifica los datos del ticket' : 'Completa la información para crear un ticket'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id" className="text-sm font-medium">ID de Usuario *</Label>
                    <Input
                      id="user_id"
                      type="number"
                      value={formData.user_id}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, user_id: e.target.value }));
                        if (formErrors.user_id) setFormErrors((prev) => ({ ...prev, user_id: undefined }));
                      }}
                      className={`h-10 ${formErrors.user_id ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="1"
                    />
                    {formErrors.user_id && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.user_id}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prioridad</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">Asunto *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, subject: e.target.value }));
                      if (formErrors.subject) setFormErrors((prev) => ({ ...prev, subject: undefined }));
                    }}
                    className={`h-10 ${formErrors.subject ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Asunto del ticket..."
                  />
                  {formErrors.subject && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Descripción *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, description: e.target.value }));
                      if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    className={`w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[100px] resize-none ${formErrors.description ? 'border-red-500' : ''}`}
                    placeholder="Descripción del problema..."
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t shrink-0 bg-background">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingTicket ? 'Guardando...' : 'Creando...'}
                      </>
                    ) : (
                      editingTicket ? 'Guardar Cambios' : 'Crear Ticket'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reply Sheet */}
      <Sheet open={isReplySheetOpen} onOpenChange={setIsReplySheetOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b shrink-0">
              <SheetTitle className="text-xl font-semibold">
                Responder Ticket #{replyingTicket?.id}
              </SheetTitle>
              <SheetDescription>
                {replyingTicket?.subject}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleReplySubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">Mensaje *</Label>
                  <textarea
                    id="message"
                    value={replyData.message}
                    onChange={(e) => setReplyData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[150px] resize-none"
                    placeholder="Escribe tu respuesta..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_internal"
                    checked={replyData.is_internal}
                    onChange={(e) => setReplyData((p) => ({ ...p, is_internal: e.target.checked }))}
                    className="rounded border-input w-4 h-4 accent-primary"
                  />
                  <Label htmlFor="is_internal" className="text-sm cursor-pointer">Nota interna</Label>
                </div>
              </div>

              <div className="px-6 py-4 border-t shrink-0 bg-background">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeReplySheet} className="flex-1" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Respuesta
                      </>
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
        title="Eliminar Ticket"
        confirmText="Eliminar"
        isConfirming={isActionLoading}
      >
        <p>¿Estás seguro de que quieres eliminar el ticket <strong>#{confirmModal.ticket?.id}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
};

export default AdminTicketsPage;
