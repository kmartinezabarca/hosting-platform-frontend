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
import { servicesService } from '../../services/serviceService';

const ClientServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  // Cargar servicios del usuario desde la API
  useEffect(() => {
    const fetchUserServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await servicesService.getUserServices();
        
        if (response.success) {
          // Transformar los datos de la API al formato esperado por el frontend
          const transformedServices = response.data.map(service => ({
            id: service.id,
            uuid: service.uuid,
            name: service.name || service.plan_name,
            type: mapCategoryToType(service.category),
            status: service.status,
            domain: service.connection_details?.domain || service.connection_details?.ip_address || 'N/A',
            ip_address: service.connection_details?.ip_address || 'N/A',
            port: service.connection_details?.port || null,
            created_at: service.created_at,
            expires_at: service.next_due_date,
            specs: parseSpecifications(service.specifications, service.category),
            metrics: generateMockMetrics(service.status), // TODO: Implementar métricas reales
            price: service.price,
            currency: 'MXN', // TODO: Obtener de la configuración
            billing_cycle: service.billing_cycle,
            plan_name: service.plan_name,
            plan_slug: service.plan_slug,
            category: service.category,
            setup_fee: service.setup_fee,
            notes: service.notes
          }));
          
          setServices(transformedServices);
        } else {
          setError('Error al cargar los servicios');
        }
      } catch (error) {
        console.error('Error fetching user services:', error);
        setError('Error de conexión al cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchUserServices();
  }, []);

  // Función para mapear categorías del backend a tipos del frontend
  const mapCategoryToType = (category) => {
    const categoryMap = {
      'hosting': 'shared_hosting',
      'vps': 'vps',
      'cloud': 'vps',
      'gameserver': 'game_server',
      'database': 'database',
      'db': 'database'
    };
    
    return categoryMap[category?.toLowerCase()] || 'shared_hosting';
  };

  // Función para parsear especificaciones según el tipo de servicio
  const parseSpecifications = (specs, category) => {
    if (!specs) return {};
    
    const categoryType = mapCategoryToType(category);
    
    switch (categoryType) {
      case 'shared_hosting':
        return {
          storage: specs.storage || specs.disk || '10 GB SSD',
          bandwidth: specs.bandwidth || 'Ilimitado',
          databases: specs.databases || specs.mysql_databases || '5 MySQL',
          email_accounts: specs.email_accounts || specs.emails || 'Ilimitadas',
          ssl: specs.ssl || 'Incluido',
          backup: specs.backup || 'Diario'
        };
      
      case 'vps':
        return {
          ram: specs.ram || specs.memory || '4 GB DDR4',
          cpu: specs.cpu || specs.cores || '2 vCores',
          storage: specs.storage || specs.disk || '50 GB NVMe',
          bandwidth: specs.bandwidth || '1 TB',
          os: specs.os || specs.operating_system || 'Ubuntu 22.04',
          root_access: specs.root_access || 'Completo'
        };
      
      case 'game_server':
        return {
          ram: specs.ram || specs.memory || '4 GB DDR4',
          cpu: specs.cpu || specs.cores || '2 vCores',
          storage: specs.storage || specs.disk || '25 GB NVMe',
          players: specs.players || specs.max_players || '20 slots',
          version: specs.version || specs.game_version || '1.20.4',
          mods: specs.mods || specs.mod_support || 'Vanilla'
        };
      
      case 'database':
        return {
          engine: specs.engine || specs.db_engine || 'MySQL 8.0',
          ram: specs.ram || specs.memory || '8 GB',
          storage: specs.storage || specs.disk || '100 GB SSD',
          connections: specs.connections || specs.max_connections || '100 max',
          backup: specs.backup || 'Automático',
          replication: specs.replication || 'Single'
        };
      
      default:
        return specs;
    }
  };

  // Función para generar métricas mock basadas en el estado del servicio
  const generateMockMetrics = (status) => {
    if (status === 'suspended' || status === 'terminated') {
      return {
        uptime: 0,
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: Math.floor(Math.random() * 30) + 20, // Mantener algo de uso de disco
        bandwidth_used: 0,
        bandwidth_limit: 100
      };
    }
    
    return {
      uptime: Math.random() * 5 + 95, // 95-100%
      cpu_usage: Math.floor(Math.random() * 60) + 10, // 10-70%
      memory_usage: Math.floor(Math.random() * 50) + 20, // 20-70%
      disk_usage: Math.floor(Math.random() * 40) + 20, // 20-60%
      bandwidth_used: Math.random() * 10 + 1, // 1-11 GB
      bandwidth_limit: 100
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'pending': return 'text-warning';
      case 'suspended': return 'text-error';
      case 'terminated': return 'text-muted-foreground';
      case 'failed': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'pending': return 'bg-warning/10';
      case 'suspended': return 'bg-error/10';
      case 'terminated': return 'bg-muted/10';
      case 'failed': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'Pendiente';
      case 'suspended': return 'Suspendido';
      case 'terminated': return 'Terminado';
      case 'failed': return 'Fallido';
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
      let response;
      
      switch (action) {
        case 'start':
        case 'restart':
          response = await servicesService.reactivateService(serviceId);
          break;
        case 'stop':
          response = await servicesService.suspendService(serviceId, 'Detenido por el usuario');
          break;
        default:
          throw new Error(`Acción no soportada: ${action}`);
      }
      
      if (response.success) {
        // Actualizar el estado del servicio localmente
        setServices(services.map(service => {
          if (service.id === serviceId) {
            let newStatus = service.status;
            switch (action) {
              case 'start':
              case 'restart':
                newStatus = 'active';
                break;
              case 'stop':
                newStatus = 'suspended';
                break;
            }
            return { 
              ...service, 
              status: newStatus,
              metrics: generateMockMetrics(newStatus)
            };
          }
          return service;
        }));
      } else {
        throw new Error(response.message || 'Error al realizar la acción');
      }
      
    } catch (error) {
      console.error(`Error performing ${action} on service ${serviceId}:`, error);
      // Aquí podrías mostrar una notificación de error
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

  if (error) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
        <div className="text-center bg-white dark:bg-card border border-dashed border-border/60 rounded-2xl p-16">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4 inline-block">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Error al cargar los servicios
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#222222] text-white dark:bg-white dark:text-[#101214] shadow-sm hover:shadow-md hover:brightness-110"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
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
