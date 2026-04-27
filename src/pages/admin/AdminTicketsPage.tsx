import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { AdminTicketSheet } from '@/components/admin/AdminTicketSheet';
import {
  Plus, Edit, Trash2, Search, HelpCircle, CheckCircle, Clock, AlertTriangle, XCircle,
  MessageSquare, Send, ArrowUp, ArrowDown, Minus, RefreshCw, Ticket, Zap, Filter, X, Loader2, User
} from 'lucide-react';
import adminTicketsService from '../../services/adminTicketsService';
import { toast } from 'sonner';

const ticketSchema = z.object({
  user_id: z.string().min(1, 'El ID de usuario es requerido'),
  subject: z.string().min(1, 'El asunto es requerido').min(3, 'El asunto debe tener al menos 3 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').min(10, 'La descripción debe tener al menos 10 caracteres'),
  priority: z.string().default('medium'),
  category: z.string().optional(),
  status: z.string().optional(),
  assigned_to: z.string().optional(),
});


const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
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
  const [editingTicket, setEditingTicket] = useState<any>(null);
  // Ticket abierto en el panel de chat lateral
  const [chatTicket, setChatTicket] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, action: null, ticket: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { register: registerTicket, handleSubmit: handleSubmitTicket, control: controlTicket, reset: resetTicket, setValue: setValueTicket, watch: watchTicket, formState: { errors: errorsTicket, isSubmitting: isSubmittingTicket } } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { user_id: '', subject: '', description: '', priority: 'medium', category: '', status: 'open', assigned_to: '' }
  });

  // El formulario de reply fue reemplazado por AdminTicketSheet

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
      const params = { page: currentPage, per_page: perPage, search: searchTerm || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined };
      const response: any = await adminTicketsService.getAll(params);
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
      const response: any = await adminTicketsService.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response: any = await adminTicketsService.getAgents();
      setAgents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const onSubmitTicket = async (data) => {
    try {
      if (editingTicket) {
        await adminTicketsService.update(editingTicket.id, data);
        toast.success(`Ticket #${editingTicket.id} actualizado`);
      } else {
        await adminTicketsService.create(data);
        toast.success('Ticket creado exitosamente');
      }
      closeSheet();
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error saving ticket:', error);
      const message = (error as any)?.response?.data?.message || 'Error al guardar ticket';
      toast.error('Error', { description: message });
    }
  };


  const handleDelete = (ticket) => setConfirmModal({ isOpen: true, action: 'delete', ticket });

  const handleConfirmAction = async () => {
    if (!confirmModal.ticket) return;
    setIsActionLoading(true);
    try {
      if (confirmModal.action === 'delete') {
        await adminTicketsService.delete(confirmModal.ticket.id);
        toast.success('Ticket eliminado');
      } else if (confirmModal.action === 'status') {
        await adminTicketsService.changeStatus(confirmModal.ticket.id, confirmModal.newStatus);
        toast.success('Estado actualizado');
      }
      setConfirmModal({ isOpen: false, action: null, ticket: null });
      setCurrentPage(1);
      setDataLoaded(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al realizar la acción');
    } finally {
      setIsActionLoading(false);
    }
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingTicket(null);
    resetTicket();
  };

  const openEditSheet = (ticket) => {
    setEditingTicket(ticket);
    resetTicket({
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
    return <Badge variant="outline" className={`${config.className} px-2 py-0.5 text-xs font-medium`}><IconComponent className="h-3 w-3 mr-1" />{config.label}</Badge>;
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
    return <Badge variant="outline" className={`${config.className} px-2 py-0.5 text-xs font-medium`}><IconComponent className="h-3 w-3 mr-1" />{config.label}</Badge>;
  };

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    unassigned: tickets.filter(t => !t.assigned_to).length
  }), [tickets]);

  const getOpenPercentage = () => stats.total === 0 ? 0 : (stats.open / stats.total) * 100;

  const activeFilters = [statusFilter !== 'all', priorityFilter !== 'all'].filter(Boolean).length;
  const isLoadingState = loading;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestión de Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setDataLoaded(false); fetchTickets(); }} variant="outline" size="sm" disabled={isLoadingState}>
            {isLoadingState ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}Actualizar
          </Button>
          <Button onClick={() => { resetTicket(); setEditingTicket(null); setIsSheetOpen(true); }} size="sm" disabled={isLoadingState}>
            <Plus className="h-4 w-4 mr-2" />Nuevo Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-100/80 to-slate-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</p><p className="text-2xl font-semibold mt-1 text-slate-800 dark:text-slate-100">{stats.total}</p></div>
              <div className="p-2.5 bg-slate-500/15 rounded-xl"><Ticket className="h-5 w-5 text-slate-600 dark:text-slate-300" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50/80 to-blue-50/30 dark:from-blue-950/40 dark:to-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-blue-700 dark:text-blue-300">Abiertos</p><p className="text-2xl font-semibold mt-1 text-blue-800 dark:text-blue-100">{stats.open}</p></div>
              <div className="p-2.5 bg-blue-500/15 rounded-xl"><HelpCircle className="h-5 w-5 text-blue-600" /></div>
            </div>
            <Progress value={getOpenPercentage()} className="h-1 mt-3 bg-blue-200/50 dark:bg-blue-800/50 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50/80 to-red-50/30 dark:from-red-950/40 dark:to-red-950/20 border-red-200/50 dark:border-red-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-red-700 dark:text-red-300">Urgentes</p><p className="text-2xl font-semibold mt-1 text-red-800 dark:text-red-100">{stats.urgent}</p></div>
              <div className="p-2.5 bg-red-500/15 rounded-xl"><Zap className="h-5 w-5 text-red-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/40 dark:to-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Resueltos</p><p className="text-2xl font-semibold mt-1 text-emerald-800 dark:text-emerald-100">{stats.resolved}</p></div>
              <div className="p-2.5 bg-emerald-500/15 rounded-xl"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar tickets..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-9 h-9 w-48 sm:w-64 text-foreground" />
              </div>
              <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
                <Filter className="h-4 w-4 mr-1.5" />Filtros
                {activeFilters > 0 && <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilters}</Badge>}
              </Button>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }} className="h-9 text-muted-foreground px-2">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{tickets.length}</span> tickets</div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border dark:border-white/10">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem><SelectItem value="open">Abiertos</SelectItem><SelectItem value="in_progress">En Progreso</SelectItem><SelectItem value="resolved">Resueltos</SelectItem><SelectItem value="closed">Cerrados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem><SelectItem value="low">Baja</SelectItem><SelectItem value="medium">Media</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/10">
                {isLoadingState ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div></div></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-8 w-8 rounded" /></div></td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center"><Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No se encontraron tickets</p></td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><HelpCircle className="h-5 w-5 text-blue-600" /></div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">#{ticket.id}</span>
                              <p className="font-medium text-sm text-foreground truncate">{ticket.subject}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{ticket.replies_count || 0} respuestas</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">{ticket.user?.first_name} {ticket.user?.last_name}</span></div></td>
                      <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                      <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setChatTicket(ticket)}><MessageSquare className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Ver conversación</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSheet(ticket)}><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Editar</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(ticket)}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Eliminar</TooltipContent></Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {tickets.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-white/10">
              <div className="text-sm text-muted-foreground">Página <span className="font-medium text-foreground">{currentPage}</span> de <span className="font-medium text-foreground">{totalPages}</span></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoadingState}>Anterior</Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm" onClick={() => setCurrentPage(pageNum)} disabled={isLoadingState} className="h-8 w-8 p-0">{pageNum}</Button>;
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoadingState}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="bottom" className="max-h-[90vh] p-0 bg-background dark:bg-[#0f1115]">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b border-border dark:border-white/10 shrink-0">
              <SheetTitle className="text-xl font-semibold text-foreground">{editingTicket ? `Editar Ticket #${editingTicket.id}` : 'Nuevo Ticket'}</SheetTitle>
              <SheetDescription className="text-muted-foreground">{editingTicket ? 'Modifica los datos del ticket' : 'Completa la información para crear un ticket'}</SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmitTicket(onSubmitTicket)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id" className="text-sm font-medium text-foreground">ID de Usuario *</Label>
                    <Input id="user_id" type="number" {...registerTicket('user_id')} className={`h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground ${errorsTicket.user_id ? 'border-red-500' : ''}`} placeholder="1" />
                    {errorsTicket.user_id && <p className="text-xs text-red-500">{errorsTicket.user_id.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Prioridad</Label>
                    <Select value={watchTicket('priority')} onValueChange={(v) => setValueTicket('priority', v)}>
                      <SelectTrigger className="h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem><SelectItem value="medium">Media</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-foreground">Asunto *</Label>
                  <Input id="subject" {...registerTicket('subject')} className={`h-10 bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground ${errorsTicket.subject ? 'border-red-500' : ''}`} placeholder="Asunto del ticket..." />
                  {errorsTicket.subject && <p className="text-xs text-red-500">{errorsTicket.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripción *</Label>
                  <Textarea id="description" {...registerTicket('description')} className={`min-h-[100px] resize-none bg-background dark:bg-[#0f1115] border-border dark:border-white/10 text-foreground ${errorsTicket.description ? 'border-red-500' : ''}`} placeholder="Descripción del problema..." />
                  {errorsTicket.description && <p className="text-xs text-red-500">{errorsTicket.description.message}</p>}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border dark:border-white/10 shrink-0 bg-background dark:bg-[#0f1115]">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={closeSheet} className="flex-1" disabled={isSubmittingTicket}>Cancelar</Button>
                  <Button type="submit" className="flex-1" disabled={isSubmittingTicket}>
                    {isSubmittingTicket ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{editingTicket ? 'Guardando...' : 'Creando...'}</> : editingTicket ? 'Guardar Cambios' : 'Crear Ticket'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Panel lateral de conversación */}
      {chatTicket && (
        <AdminTicketSheet
          ticket={chatTicket}
          onClose={() => {
            setChatTicket(null);
            // Refresca la lista para reflejar cambios de estado/prioridad
            setDataLoaded(false);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, ticket: null })}
        onConfirm={handleConfirmAction}
        title="Eliminar Ticket"
        confirmText="Eliminar"
        isConfirming={isActionLoading}
      >
        <p>¿Estás seguro de que quieres eliminar el ticket <strong className="text-foreground">#{confirmModal.ticket?.id}</strong>? Esta acción no se puede deshacer.</p>
      </ConfirmationModal>
    </div>
  );
};

export default AdminTicketsPage;
