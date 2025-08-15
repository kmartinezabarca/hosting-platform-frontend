import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Search, Filter, Clock, AlertCircle, 
  CheckCircle, XCircle, Send, Paperclip, Eye, MoreVertical,
  Calendar, User, Tag, ArrowUpRight, RefreshCw, Trash2,
  Edit3, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientTicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState(new Set());

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  // Mock data - En producción esto vendría del backend
  const mockTickets = [
    {
      id: 1,
      subject: 'Problema con el servidor de Minecraft',
      description: 'Mi servidor de Minecraft no está iniciando correctamente después de la última actualización.',
      priority: 'high',
      status: 'open',
      category: 'technical',
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T14:20:00Z',
      last_reply_at: '2025-01-15T14:20:00Z',
      replies_count: 2,
      replies: [
        {
          id: 1,
          message: 'Hola, gracias por contactarnos. Estamos revisando el problema con tu servidor. ¿Podrías proporcionarnos los logs del servidor?',
          user: { name: 'Soporte ROKE', role: 'support' },
          created_at: '2025-01-15T12:00:00Z',
          is_internal: false
        },
        {
          id: 2,
          message: 'Aquí están los logs que solicitaste. El error aparece al intentar cargar los plugins.',
          user: { name: user?.first_name || 'Usuario', role: 'client' },
          created_at: '2025-01-15T14:20:00Z',
          is_internal: false
        }
      ]
    },
    {
      id: 2,
      subject: 'Consulta sobre facturación',
      description: 'Tengo una pregunta sobre mi última factura. Aparece un cargo que no reconozco.',
      priority: 'medium',
      status: 'in_progress',
      category: 'billing',
      created_at: '2025-01-14T09:15:00Z',
      updated_at: '2025-01-14T16:45:00Z',
      last_reply_at: '2025-01-14T16:45:00Z',
      replies_count: 3,
      replies: []
    },
    {
      id: 3,
      subject: 'Solicitud de aumento de recursos',
      description: 'Me gustaría aumentar la RAM de mi VPS de 4GB a 8GB. ¿Cuál sería el proceso?',
      priority: 'low',
      status: 'closed',
      category: 'general',
      created_at: '2025-01-12T14:30:00Z',
      updated_at: '2025-01-13T10:15:00Z',
      last_reply_at: '2025-01-13T10:15:00Z',
      replies_count: 4,
      replies: []
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-info';
      case 'in_progress': return 'text-warning';
      case 'waiting_customer': return 'text-accent';
      case 'closed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'open': return 'bg-info/10';
      case 'in_progress': return 'bg-warning/10';
      case 'waiting_customer': return 'bg-accent/10';
      case 'closed': return 'bg-success/10';
      default: return 'bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Progreso';
      case 'waiting_customer': return 'Esperando Respuesta';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-info';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'technical': return 'Técnico';
      case 'billing': return 'Facturación';
      case 'general': return 'General';
      case 'feature_request': return 'Solicitud de Función';
      case 'bug_report': return 'Reporte de Error';
      default: return 'General';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Simular creación de ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTicketData = {
        id: tickets.length + 1,
        ...newTicket,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_reply_at: null,
        replies_count: 0,
        replies: []
      };

      setTickets([newTicketData, ...tickets]);
      setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (ticketId) => {
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      // Simular envío de respuesta
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newReply = {
        id: Date.now(),
        message: replyMessage,
        user: { name: user?.first_name || 'Usuario', role: 'client' },
        created_at: new Date().toISOString(),
        is_internal: false
      };

      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              replies: [...ticket.replies, newReply],
              replies_count: ticket.replies_count + 1,
              last_reply_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : ticket
      ));

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          replies: [...selectedTicket.replies, newReply],
          replies_count: selectedTicket.replies_count + 1
        });
      }

      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const toggleTicketExpansion = (ticketId) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="loading-skeleton h-8 w-48"></div>
          <div className="loading-skeleton h-10 w-32"></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-premium p-6">
              <div className="loading-skeleton h-6 w-3/4 mb-3"></div>
              <div className="loading-skeleton h-4 w-full mb-2"></div>
              <div className="loading-skeleton h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus solicitudes de soporte técnico
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-premium btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Ticket
        </motion.button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card-premium p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-10"
              />
            </div>
          </div>

          {/* Filtro de estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-premium"
          >
            <option value="all">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En Progreso</option>
            <option value="waiting_customer">Esperando Respuesta</option>
            <option value="closed">Cerrado</option>
          </select>

          {/* Filtro de prioridad */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-premium"
          >
            <option value="all">Todas las prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          {/* Filtro de categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-premium"
          >
            <option value="all">Todas las categorías</option>
            <option value="technical">Técnico</option>
            <option value="billing">Facturación</option>
            <option value="general">General</option>
            <option value="feature_request">Solicitud de Función</option>
            <option value="bug_report">Reporte de Error</option>
          </select>
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium hover-lift"
            >
              <div className="p-6">
                
                {/* Header del ticket */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        #{ticket.id} {ticket.subject}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(ticket.status)} ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted/20 ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityText(ticket.priority)}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{getCategoryText(ticket.category)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{ticket.replies_count} respuestas</span>
                      </div>
                      {ticket.last_reply_at && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Última respuesta: {formatDate(ticket.last_reply_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleTicketExpansion(ticket.id)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      {expandedTickets.has(ticket.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Contenido expandido */}
                <AnimatePresence>
                  {expandedTickets.has(ticket.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border pt-4"
                    >
                      
                      {/* Respuestas */}
                      {ticket.replies && ticket.replies.length > 0 && (
                        <div className="space-y-4 mb-6">
                          <h4 className="font-medium text-foreground">Conversación</h4>
                          {ticket.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`flex space-x-3 ${
                                reply.user.role === 'client' ? 'flex-row-reverse space-x-reverse' : ''
                              }`}
                            >
                              <div className={`p-2 rounded-full ${
                                reply.user.role === 'client' 
                                  ? 'bg-primary/10' 
                                  : 'bg-success/10'
                              }`}>
                                <User className={`w-4 h-4 ${
                                  reply.user.role === 'client' 
                                    ? 'text-primary' 
                                    : 'text-success'
                                }`} />
                              </div>
                              <div className={`flex-1 ${
                                reply.user.role === 'client' ? 'text-right' : ''
                              }`}>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-foreground">
                                    {reply.user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <div className={`p-3 rounded-xl ${
                                  reply.user.role === 'client'
                                    ? 'bg-primary/10 text-foreground'
                                    : 'bg-muted/20 text-foreground'
                                }`}>
                                  <p className="text-sm">{reply.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulario de respuesta */}
                      {ticket.status !== 'closed' && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-foreground">Responder</h4>
                          <div className="flex space-x-3">
                            <div className="flex-1">
                              <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Escribe tu respuesta..."
                                rows={3}
                                className="input-premium resize-none"
                              />
                            </div>
                            <button
                              onClick={() => handleSendReply(ticket.id)}
                              disabled={!replyMessage.trim() || sendingReply}
                              className="btn-premium btn-primary px-4 py-2 h-fit"
                            >
                              {sendingReply ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="card-premium p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                ? 'No se encontraron tickets'
                : 'No tienes tickets aún'
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer ticket de soporte para obtener ayuda'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && categoryFilter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-premium btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Ticket
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de crear ticket */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Crear Nuevo Ticket</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Describe brevemente tu problema"
                    className="input-premium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prioridad
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="input-premium"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Categoría
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="input-premium"
                    >
                      <option value="general">General</option>
                      <option value="technical">Técnico</option>
                      <option value="billing">Facturación</option>
                      <option value="feature_request">Solicitud de Función</option>
                      <option value="bug_report">Reporte de Error</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Describe detalladamente tu problema o consulta"
                    rows={6}
                    className="input-premium resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-premium btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-premium btn-primary"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientTicketsPage;

