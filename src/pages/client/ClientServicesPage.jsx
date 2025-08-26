import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
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
import ServiceFilters from '../../components/services/service-filters';
import ServiceCard from '../../components/services/service-card';
import ServiceDetailModal from '../../components/services/service-detail-modal';

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
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
      {/* --- Cabecera de la Página --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos tus servicios de hosting y servidores.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/client/contract-service"
            className="
              inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
              bg-[#222222] text-white
              dark:bg-white dark:text-[#101214]
              shadow-sm hover:shadow-md hover:brightness-110 active:translate-y-px
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[#222222]/40 dark:focus-visible:ring-white/40
              transition
            "
          >
            <Plus className="w-4 h-4" />
            Contratar Servicio
          </Link>
        </motion.div>
      </div>

      {/* --- Filtros (usando el nuevo componente) --- */}
      <ServiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* --- Grid de Servicios --- */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <AnimatePresence>
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                actionLoading={actionLoading}
                onAction={handleServiceAction}
                onDetails={() => setSelectedService(service)}
                onSettings={() => {
                  /* Tu lógica de settings */
                }}
                getStatusColor={getStatusColor}
                getStatusBgColor={getStatusBgColor}
                getStatusText={getStatusText}
                getTypeIcon={getTypeIcon}
                getTypeText={getTypeText}
                getUsageColor={getUsageColor}
                getUsageBarColor={getUsageBarColor}
                formatDate={formatDate}
                copyToClipboard={copyToClipboard}
              />
            ))
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full"
            >
              <div className="text-center bg-white dark:bg-card border border-dashed border-border/60 rounded-2xl p-16">
                <div className="p-4 bg-slate-100 dark:bg-accent/20 rounded-full mb-4 inline-block">
                  <Server className="w-12 h-12 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Prueba a cambiar los filtros o el término de búsqueda.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- Modal Detalles del Servicio --- */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        copyToClipboard={copyToClipboard}
        getTypeIcon={getTypeIcon}
        getStatusColor={getStatusColor}
        getStatusBgColor={getStatusBgColor}
        getStatusText={getStatusText}
        getTypeText={getTypeText}
        formatDate={formatDate}
        getUsageColor={getUsageColor}
        getUsageBarColor={getUsageBarColor}
      />
    </div>
  );
};

export default ClientServicesPage;


