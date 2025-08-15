import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, Globe, Database, Cpu, HardDrive, Wifi, Shield, 
  Play, Pause, RotateCcw, Settings, MoreVertical, Plus,
  Activity, AlertCircle, CheckCircle, Clock, Zap, Users,
  BarChart3, TrendingUp, RefreshCw, ExternalLink, Copy,
  Terminal, FileText, Download, Upload, Eye, Edit3,
  Trash2, Power, PowerOff, Search, Filter, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  // Mock data - En producción esto vendría del backend
  const mockServices = [
    {
      id: 1,
      name: 'Web Hosting Pro',
      type: 'shared_hosting',
      status: 'active',
      domain: 'miempresa.com',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T10:00:00Z',
      expires_at: '2026-01-15T10:00:00Z',
      specs: {
        storage: '50 GB SSD',
        bandwidth: 'Ilimitado',
        databases: '10 MySQL',
        email_accounts: 'Ilimitadas',
        ssl: 'Incluido',
        backup: 'Diario'
      },
      metrics: {
        uptime: 99.9,
        cpu_usage: 15,
        memory_usage: 45,
        disk_usage: 32,
        bandwidth_used: 2.5,
        bandwidth_limit: 100
      },
      price: 29.99,
      currency: 'USD',
      billing_cycle: 'monthly'
    },
    {
      id: 2,
      name: 'Minecraft Server Premium',
      type: 'game_server',
      status: 'active',
      domain: 'mc.miservidor.net',
      ip_address: '192.168.1.101',
      port: 25565,
      created_at: '2025-01-10T15:30:00Z',
      expires_at: '2025-04-10T15:30:00Z',
      specs: {
        ram: '8 GB DDR4',
        cpu: '4 vCores',
        storage: '100 GB NVMe',
        players: '50 slots',
        version: '1.20.4',
        mods: 'Forge/Fabric'
      },
      metrics: {
        uptime: 98.5,
        cpu_usage: 65,
        memory_usage: 78,
        disk_usage: 45,
        players_online: 12,
        players_max: 50
      },
      price: 49.99,
      currency: 'USD',
      billing_cycle: 'monthly'
    },
    {
      id: 3,
      name: 'VPS Cloud Enterprise',
      type: 'vps',
      status: 'maintenance',
      domain: 'vps.miapp.io',
      ip_address: '192.168.1.102',
      created_at: '2025-01-05T09:15:00Z',
      expires_at: '2025-07-05T09:15:00Z',
      specs: {
        ram: '16 GB DDR4',
        cpu: '8 vCores',
        storage: '500 GB NVMe',
        bandwidth: '10 TB',
        os: 'Ubuntu 22.04',
        root_access: 'Completo'
      },
      metrics: {
        uptime: 99.8,
        cpu_usage: 35,
        memory_usage: 52,
        disk_usage: 68,
        bandwidth_used: 1.2,
        bandwidth_limit: 10
      },
      price: 89.99,
      currency: 'USD',
      billing_cycle: 'monthly'
    },
    {
      id: 4,
      name: 'Database Cluster',
      type: 'database',
      status: 'suspended',
      domain: 'db.miapp.com',
      ip_address: '192.168.1.103',
      created_at: '2024-12-20T14:20:00Z',
      expires_at: '2025-03-20T14:20:00Z',
      specs: {
        engine: 'PostgreSQL 15',
        ram: '32 GB',
        storage: '1 TB SSD',
        connections: '500 max',
        backup: 'Automático',
        replication: 'Master-Slave'
      },
      metrics: {
        uptime: 0,
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 75,
        connections_active: 0,
        connections_max: 500
      },
      price: 149.99,
      currency: 'USD',
      billing_cycle: 'monthly'
    }
  ];

  useEffect(() => {
    // Simular carga de datos del backend
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 1200);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'maintenance': return 'text-warning';
      case 'suspended': return 'text-error';
      case 'stopped': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'maintenance': return 'bg-warning/10';
      case 'suspended': return 'bg-error/10';
      case 'stopped': return 'bg-muted/10';
      default: return 'bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'maintenance': return 'Mantenimiento';
      case 'suspended': return 'Suspendido';
      case 'stopped': return 'Detenido';
      default: return 'Desconocido';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'shared_hosting': return Globe;
      case 'vps': return Server;
      case 'game_server': return Users;
      case 'database': return Database;
      default: return Server;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'shared_hosting': return 'Web Hosting';
      case 'vps': return 'VPS';
      case 'game_server': return 'Servidor de Juegos';
      case 'database': return 'Base de Datos';
      default: return 'Servicio';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleServiceAction = async (serviceId, action) => {
    setActionLoading({ ...actionLoading, [`${serviceId}-${action}`]: true });
    
    try {
      // Simular acción del servicio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar el estado del servicio según la acción
      setServices(services.map(service => {
        if (service.id === serviceId) {
          let newStatus = service.status;
          switch (action) {
            case 'start':
              newStatus = 'active';
              break;
            case 'stop':
              newStatus = 'stopped';
              break;
            case 'restart':
              newStatus = 'active';
              break;
            default:
              break;
          }
          return { ...service, status: newStatus };
        }
        return service;
      }));
      
    } catch (error) {
      console.error(`Error performing ${action} on service ${serviceId}:`, error);
    } finally {
      setActionLoading({ ...actionLoading, [`${serviceId}-${action}`]: false });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías mostrar una notificación de éxito
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-error';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesType = typeFilter === 'all' || service.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="loading-skeleton h-8 w-48"></div>
          <div className="loading-skeleton h-10 w-32"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-premium p-6">
              <div className="loading-skeleton h-6 w-3/4 mb-4"></div>
              <div className="loading-skeleton h-4 w-full mb-2"></div>
              <div className="loading-skeleton h-4 w-2/3 mb-4"></div>
              <div className="loading-skeleton h-32 w-full"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Mis Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos tus servicios de hosting y servidores
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-premium btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Contratar Servicio
        </motion.button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card-premium p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar servicios..."
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
            <option value="active">Activo</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="suspended">Suspendido</option>
            <option value="stopped">Detenido</option>
          </select>

          {/* Filtro de tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-premium"
          >
            <option value="all">Todos los tipos</option>
            <option value="shared_hosting">Web Hosting</option>
            <option value="vps">VPS</option>
            <option value="game_server">Servidor de Juegos</option>
            <option value="database">Base de Datos</option>
          </select>
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => {
            const TypeIcon = getTypeIcon(service.type);
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium hover-lift"
              >
                <div className="p-6">
                  
                  {/* Header del servicio */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${getStatusBgColor(service.status)}`}>
                        <TypeIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{getTypeText(service.type)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(service.status)} ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </span>
                      <button className="p-1 hover:bg-accent rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Información del servicio */}
                  <div className="space-y-3 mb-4">
                    {service.domain && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Dominio:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{service.domain}</span>
                          <button
                            onClick={() => copyToClipboard(service.domain)}
                            className="p-1 hover:bg-accent rounded transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">IP:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">{service.ip_address}</span>
                        <button
                          onClick={() => copyToClipboard(service.ip_address)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {service.port && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Puerto:</span>
                        <span className="text-sm font-medium text-foreground">{service.port}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expira:</span>
                      <span className="text-sm font-medium text-foreground">{formatDate(service.expires_at)}</span>
                    </div>
                  </div>

                  {/* Métricas de uso */}
                  {service.metrics && (
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium text-foreground">Uso de Recursos</h4>
                      
                      {/* CPU */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">CPU</span>
                          <span className={`text-xs font-medium ${getUsageColor(service.metrics.cpu_usage)}`}>
                            {service.metrics.cpu_usage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getUsageBarColor(service.metrics.cpu_usage)}`}
                            style={{ width: `${service.metrics.cpu_usage}%` }}
                          />
                        </div>
                      </div>

                      {/* Memoria */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Memoria</span>
                          <span className={`text-xs font-medium ${getUsageColor(service.metrics.memory_usage)}`}>
                            {service.metrics.memory_usage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getUsageBarColor(service.metrics.memory_usage)}`}
                            style={{ width: `${service.metrics.memory_usage}%` }}
                          />
                        </div>
                      </div>

                      {/* Disco */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Disco</span>
                          <span className={`text-xs font-medium ${getUsageColor(service.metrics.disk_usage)}`}>
                            {service.metrics.disk_usage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${getUsageBarColor(service.metrics.disk_usage)}`}
                            style={{ width: `${service.metrics.disk_usage}%` }}
                          />
                        </div>
                      </div>

                      {/* Información adicional según el tipo */}
                      {service.type === 'game_server' && service.metrics.players_online !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">Jugadores:</span>
                          <span className="text-xs font-medium text-foreground">
                            {service.metrics.players_online}/{service.metrics.players_max}
                          </span>
                        </div>
                      )}

                      {service.metrics.uptime !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">Uptime:</span>
                          <span className="text-xs font-medium text-success">
                            {service.metrics.uptime}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Acciones del servicio */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      {service.status === 'active' ? (
                        <>
                          <button
                            onClick={() => handleServiceAction(service.id, 'stop')}
                            disabled={actionLoading[`${service.id}-stop`]}
                            className="p-2 hover:bg-error/10 hover:text-error rounded-lg transition-colors"
                            title="Detener servicio"
                          >
                            {actionLoading[`${service.id}-stop`] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleServiceAction(service.id, 'restart')}
                            disabled={actionLoading[`${service.id}-restart`]}
                            className="p-2 hover:bg-warning/10 hover:text-warning rounded-lg transition-colors"
                            title="Reiniciar servicio"
                          >
                            {actionLoading[`${service.id}-restart`] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      ) : service.status === 'stopped' ? (
                        <button
                          onClick={() => handleServiceAction(service.id, 'start')}
                          disabled={actionLoading[`${service.id}-start`]}
                          className="p-2 hover:bg-success/10 hover:text-success rounded-lg transition-colors"
                          title="Iniciar servicio"
                        >
                          {actionLoading[`${service.id}-start`] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setShowServiceModal(true);
                        }}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        title="Configuración"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        ${service.price}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{service.billing_cycle === 'monthly' ? 'mes' : 'año'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full">
            <div className="card-premium p-12 text-center">
              <Server className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No se encontraron servicios'
                  : 'No tienes servicios aún'
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Contrata tu primer servicio de hosting para comenzar'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <button className="btn-premium btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Contratar Primer Servicio
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles del servicio */}
      <AnimatePresence>
        {showServiceModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowServiceModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${getStatusBgColor(selectedService.status)}`}>
                    {React.createElement(getTypeIcon(selectedService.type), {
                      className: `w-6 h-6 ${getStatusColor(selectedService.status)}`
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedService.name}</h2>
                    <p className="text-muted-foreground">{getTypeText(selectedService.type)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Información general */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Información General</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(selectedService.status)} ${getStatusColor(selectedService.status)}`}>
                        {getStatusText(selectedService.status)}
                      </span>
                    </div>
                    
                    {selectedService.domain && (
                      <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                        <span className="text-sm text-muted-foreground">Dominio:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{selectedService.domain}</span>
                          <button
                            onClick={() => copyToClipboard(selectedService.domain)}
                            className="p-1 hover:bg-accent rounded transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Dirección IP:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">{selectedService.ip_address}</span>
                        <button
                          onClick={() => copyToClipboard(selectedService.ip_address)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Creado:</span>
                      <span className="text-sm font-medium text-foreground">{formatDate(selectedService.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Expira:</span>
                      <span className="text-sm font-medium text-foreground">{formatDate(selectedService.expires_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Especificaciones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Especificaciones</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(selectedService.specs).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas detalladas */}
              {selectedService.metrics && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Métricas de Rendimiento</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">CPU</span>
                        <span className={`text-sm font-medium ${getUsageColor(selectedService.metrics.cpu_usage)}`}>
                          {selectedService.metrics.cpu_usage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(selectedService.metrics.cpu_usage)}`}
                          style={{ width: `${selectedService.metrics.cpu_usage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Memoria</span>
                        <span className={`text-sm font-medium ${getUsageColor(selectedService.metrics.memory_usage)}`}>
                          {selectedService.metrics.memory_usage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(selectedService.metrics.memory_usage)}`}
                          style={{ width: `${selectedService.metrics.memory_usage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Disco</span>
                        <span className={`text-sm font-medium ${getUsageColor(selectedService.metrics.disk_usage)}`}>
                          {selectedService.metrics.disk_usage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(selectedService.metrics.disk_usage)}`}
                          style={{ width: `${selectedService.metrics.disk_usage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border">
                <button className="btn-premium btn-ghost">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Logs
                </button>
                <button className="btn-premium btn-ghost">
                  <Terminal className="w-4 h-4 mr-2" />
                  Consola
                </button>
                <button className="btn-premium btn-ghost">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </button>
                <button className="btn-premium btn-primary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acceder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientServicesPage;


