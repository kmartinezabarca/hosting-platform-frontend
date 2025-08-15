import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Globe, DollarSign, Activity, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Zap, Shield, Users, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Plus,
  Cpu, HardDrive, Wifi, Database, RefreshCw
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard';
import { useAuth } from '../../context/AuthContext';

const NewDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsResponse, servicesResponse, activityResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getServices(),
        dashboardService.getActivity()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (servicesResponse.success) {
        setServices(servicesResponse.data);
      }

      if (activityResponse.success) {
        setActivity(activityResponse.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
      
      // Fallback to mock data if API fails
      setStats({
        services: { total: 3, active: 3, maintenance: 0, suspended: 0 },
        domains: { total: 5 },
        billing: { monthly_spend: 127.50, currency: 'USD' }
      });
      
      setServices([
        {
          id: 1,
          name: "Web Hosting Pro",
          type: "Shared Hosting",
          status: "active",
          created_at: "2025-01-15T10:00:00Z"
        },
        {
          id: 2,
          name: "Minecraft Server",
          type: "Game Server",
          status: "active",
          created_at: "2025-01-10T15:30:00Z"
        },
        {
          id: 3,
          name: "VPS Cloud",
          type: "Virtual Server",
          status: "maintenance",
          created_at: "2025-01-05T09:15:00Z"
        }
      ]);
      
      setActivity([
        {
          id: 1,
          type: "service_created",
          description: "Nuevo servicio Web Hosting Pro creado",
          timestamp: "2025-01-15T10:00:00Z"
        },
        {
          id: 2,
          type: "payment_received",
          description: "Pago recibido por $29.99",
          timestamp: "2025-01-14T14:30:00Z"
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'maintenance': return 'text-warning';
      case 'suspended': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'maintenance': return 'bg-warning/10';
      case 'suspended': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'maintenance': return 'Mantenimiento';
      case 'suspended': return 'Suspendido';
      default: return 'Desconocido';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'service_created': return Server;
      case 'payment_received': return DollarSign;
      case 'ticket_created': return AlertCircle;
      case 'login': return Shield;
      default: return Activity;
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

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
        <div className="space-y-4">
          <div className="loading-skeleton h-8 w-64"></div>
          <div className="loading-skeleton h-4 w-96"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-premium p-6">
              <div className="loading-skeleton h-12 w-12 rounded-xl mb-4"></div>
              <div className="loading-skeleton h-6 w-24 mb-2"></div>
              <div className="loading-skeleton h-4 w-16"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-premium p-6">
            <div className="loading-skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="loading-skeleton h-16 w-full rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="loading-skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="loading-skeleton h-12 w-full rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header de bienvenida */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-hero rounded-2xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                ¡Bienvenido de vuelta, {user?.first_name || user?.name || 'Usuario'}!
              </h1>
              <p className="text-white/80 text-lg">
                Tu plataforma de hosting tecnológica y moderna está lista para usar
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">Todos los servicios operativos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Cuenta verificada</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Rendimiento óptimo</span>
            </div>
          </div>
        </div>
        
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Servicios Activos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6 hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center space-x-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground">
              {stats?.services?.active || 0}
            </h3>
            <p className="text-muted-foreground">Servicios Activos</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.services?.total || 0} total • {stats?.services?.maintenance || 0} en mantenimiento
            </p>
          </div>
        </motion.div>

        {/* Dominios */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6 hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-success/10 rounded-xl">
              <Globe className="w-6 h-6 text-success" />
            </div>
            <div className="flex items-center space-x-1 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+2</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground">
              {stats?.domains?.total || 0}
            </h3>
            <p className="text-muted-foreground">Dominios Registrados</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos activos y configurados
            </p>
          </div>
        </motion.div>

        {/* Gasto Mensual */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-accent/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div className="flex items-center space-x-1 text-error text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>-5%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground">
              ${stats?.billing?.monthly_spend || 0}
            </h3>
            <p className="text-muted-foreground">Gasto Mensual</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ciclo de facturación actual
            </p>
          </div>
        </motion.div>

        {/* Rendimiento */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-6 hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-info/10 rounded-xl">
              <Activity className="w-6 h-6 text-info" />
            </div>
            <div className="flex items-center space-x-1 text-success text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>99.9%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground">
              Excelente
            </h3>
            <p className="text-muted-foreground">Rendimiento</p>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime promedio este mes
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Servicios Recientes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Servicios Recientes</h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1">
              <span>Ver todos</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {services.length > 0 ? (
              services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-center space-x-4 p-4 bg-accent/20 rounded-xl hover-lift">
                  <div className={`p-2 rounded-lg ${getStatusBgColor(service.status)}`}>
                    <Server className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(service.status)} ${getStatusColor(service.status)}`}>
                      {getStatusText(service.status)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(service.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay servicios</h3>
                <p className="text-muted-foreground mb-4">Comienza contratando tu primer servicio</p>
                <button className="btn-premium btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Contratar Servicio
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actividad Reciente */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Actividad Reciente</h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1">
              <span>Ver historial</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.slice(0, 4).map((item) => {
                const Icon = getActivityIcon(item.type);
                return (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sin actividad reciente</h3>
                <p className="text-muted-foreground">La actividad de tu cuenta aparecerá aquí</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Acciones Rápidas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-premium p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6">Acciones Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors hover-lift">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Contratar VPS</p>
              <p className="text-sm text-muted-foreground">Servidor virtual privado</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-success/5 hover:bg-success/10 rounded-xl transition-colors hover-lift">
            <div className="p-2 bg-success/10 rounded-lg">
              <Globe className="w-5 h-5 text-success" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Registrar Dominio</p>
              <p className="text-sm text-muted-foreground">Nuevo dominio web</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-xl transition-colors hover-lift">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Database className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Backup Servicios</p>
              <p className="text-sm text-muted-foreground">Copia de seguridad</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-info/5 hover:bg-info/10 rounded-xl transition-colors hover-lift">
            <div className="p-2 bg-info/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-info" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Crear Ticket</p>
              <p className="text-sm text-muted-foreground">Soporte técnico</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-4 border-l-4 border-warning bg-warning/5"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">Advertencia</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NewDashboard;

