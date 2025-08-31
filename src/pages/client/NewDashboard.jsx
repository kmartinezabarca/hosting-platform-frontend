import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Globe,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  RefreshCw,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/dashboard/stat-card";
import DashboardCard from "../../components/dashboard/dashboard-card";

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
      const [statsResponse, servicesResponse, activityResponse] =
        await Promise.all([
          dashboardService.getStats(),
          dashboardService.getServices(),
          dashboardService.getActivity(),
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
      console.error("Error fetching dashboard data:", err);
      setError("Error al cargar los datos del dashboard");

      // Set empty states instead of mock data
      setStats({
        services: { total: 0, active: 0, maintenance: 0, suspended: 0 },
        domains: { total: 0, active: 0, pending: 0 },
        billing: { monthly_spend: 0, currency: "USD" },
        performance: { uptime: null },
      });

      setServices([]);
      setActivity([]);
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
      case "active":
        return "text-success";
      case "maintenance":
        return "text-warning";
      case "suspended":
        return "text-error";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "active":
        return "bg-success/10";
      case "maintenance":
        return "bg-warning/10";
      case "suspended":
        return "bg-error/10";
      default:
        return "bg-muted/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Activo";
      case "maintenance":
        return "Mantenimiento";
      case "suspended":
        return "Suspendido";
      default:
        return "Desconocido";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "deployment":
        return Zap;
      case "payment":
        return CreditCard;
      case "backup":
        return HardDrive;
      case "domain":
        return Globe;
      case "service_created":
        return Server;
      case "payment_received":
        return DollarSign;
      case "ticket_created":
        return AlertCircle;
      case "login":
        return Shield;
      default:
        return Activity;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
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
                <div
                  key={i}
                  className="loading-skeleton h-16 w-full rounded-xl"
                ></div>
              ))}
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="loading-skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="loading-skeleton h-12 w-full rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8">
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 
             bg-white dark:bg-card 
            "
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                ¡Bienvenido de vuelta,{" "}
                {user?.first_name || user?.name || "Usuario"}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Tu plataforma de hosting tecnológica y moderna está lista para
                usar
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-xl transition-colors hover:bg-accent text-muted-foreground"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Estado de servicios dinámico */}
            {stats?.services?.total > 0 ? (
              stats?.services?.active === stats?.services?.total ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  {/* CAMBIO: Aumentamos el contraste del color */}
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">
                    Todos los servicios operativos
                  </span>
                </div>
              ) : stats?.services?.active > 0 ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  {/* CAMBIO: Aumentamos el contraste del color */}
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">
                    {stats.services.active} de {stats.services.total} servicios
                    activos
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  {/* CAMBIO: Aumentamos el contraste del color */}
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Servicios requieren atención</span>
                </div>
              )
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <AlertCircle className="w-5 h-5" />{" "}
                {/* El color se hereda de text-muted-foreground */}
                <span className="text-sm">Sin servicios contratados</span>
              </div>
            )}

            {/* Estado de cuenta dinámico */}
            {user?.email_verified_at ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                {/* CAMBIO: Aumentamos el contraste del color */}
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Cuenta verificada</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                {/* CAMBIO: Aumentamos el contraste del color */}
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Verificar cuenta</span>
              </div>
            )}

            {/* Rendimiento dinámico basado en servicios activos */}
            {stats?.services?.active > 0 ? (
              stats?.services?.maintenance === 0 &&
              stats?.services?.suspended === 0 ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  {/* CAMBIO: Aumentamos el contraste del color */}
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Rendimiento óptimo</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  {/* CAMBIO: Aumentamos el contraste del color */}
                  <Activity className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Rendimiento afectado</span>
                </div>
              )
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Activity className="w-5 h-5" />{" "}
                {/* El color se hereda de text-muted-foreground */}
                <span className="text-sm">Sin métricas disponibles</span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl bg-black/5 dark:bg-white/10"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl bg-black/5 dark:bg-white/10"></div>
      </motion.div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {/* Tarjeta 1: Servicios Activos */}
        <StatCard
          icon={Server}
          title="Servicios Activos"
          value={stats?.services?.active || 0}
          details={`${stats?.services?.total || 0} total • ${
            stats?.services?.maintenance || 0
          } en mantenimiento`}
          trend={stats?.services?.trend ?? undefined}
          colorClass="text-primary"
          delay={0.1}
        />

        {/* Tarjeta 2: Dominios */}
        <StatCard
          icon={Globe}
          title="Dominios Registrados"
          value={stats?.domains?.total || 0}
          details={`${stats?.domains?.active || 0} activos • ${
            stats?.domains?.pending || 0
          } pendientes`}
          trend={stats?.domains?.trend ?? undefined}
          colorClass="text-success"
          delay={0.2}
        />

        {/* Tarjeta 3: Gasto Mensual */}
        <StatCard
          icon={DollarSign}
          title="Gasto Mensual"
          value={`$${stats?.billing?.monthly_spend || "0.00"}`}
          details={
            stats?.billing?.cycle
              ? `Ciclo: ${stats.billing.cycle}`
              : "Sin facturación activa"
          }
          trend={stats?.billing?.trend ? -stats.billing.trend : undefined}
          colorClass="text-warning"
          delay={0.3}
        />

        {/* Tarjeta 4: Rendimiento */}
        <StatCard
          icon={Activity}
          title="Rendimiento"
          value={
            stats?.performance?.uptime >= 99.5
              ? "Excelente"
              : stats?.performance?.uptime >= 95
              ? "Bueno"
              : stats?.performance?.uptime
              ? "Regular"
              : "Sin datos"
          }
          details={
            stats?.performance?.uptime
              ? `Uptime: ${stats.performance.uptime}%`
              : "Sin métricas"
          }
          // No hay "tendencia" numérica para el rendimiento en este formato
          trend={undefined}
          colorClass="text-info"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* --- Tarjeta Premium: Servicios Recientes --- */}
        <DashboardCard
          title="Servicios Recientes"
          buttonText="Ver todos"
          buttonLink="/client/services"
          delay={0.45}
          xOffset={-20}
        >
          {services.length > 0 ? (
            <ul className="space-y-2">
              {services.slice(0, 3).map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/client/services/${s.id}`}
                    className="
              group flex items-center gap-4 p-3 rounded-xl
              hover:bg-black/5 dark:hover:bg-white/5 transition-colors
            "
                  >
                    {/* icon chip */}
                    <span
                      className="inline-flex items-center justify-center rounded-lg p-2.5
                             bg-black/5 dark:bg-white/10"
                    >
                      <Server className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </span>

                    {/* text */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {s.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {s.type}
                      </p>
                    </div>

                    {/* status pill (usa tus helpers si ya los tienes) */}
                    <span
                      className="
                shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                ring-1 ring-black/10 dark:ring-white/10
                bg-black/5 text-foreground/80 dark:bg-white/10
              "
                    >
                      {getStatusText(s.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            // estado vacío premium
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-black/5 dark:bg-white/10 mb-4">
                <Server className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No hay servicios activos
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Cuando contrates un nuevo servicio, aparecerá aquí.
              </p>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/client/services/new"
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
          )}
        </DashboardCard>

        {/* --- Tarjeta Premium: Actividad Reciente (Diseño Timeline) --- */}
        <DashboardCard
          title="Actividad Reciente"
          buttonText="Ver historial"
          buttonLink="/client/activity"
          delay={0.5}
          xOffset={20}
        >
          {activity.length > 0 ? (
            <ul className="relative mt-2">
              {/* rail con gradiente */}
              <span
                aria-hidden
                className="
        pointer-events-none absolute left-8 top-3 bottom-3 w-px
        bg-gradient-to-b
        from-black/10 via-black/8 to-transparent
        dark:from-white/15 dark:via-white/10 dark:to-transparent
      "
              />

              {activity.slice(0, 4).map((it, i, arr) => {
                const Icon = getActivityIcon(it.type);
                const isLast = i === arr.length - 1;

                return (
                  <motion.li
                    key={it.id}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                    className="group relative pl-16 pr-2 py-2 rounded-xl"
                  >
                    {/* nodo */}
                    <span
                      className="
              absolute left-5 top-2 inline-flex items-center justify-center
              size-7 rounded-full
              bg-white/85 dark:bg-[#0f1316]/85
              ring-1 ring-black/10 dark:ring-white/12
              shadow-[0_2px_6px_rgba(0,0,0,0.06)]
            "
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {/* brillo sutil */}
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent dark:from-white/10"
                      />
                    </span>

                    {/* contenido */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {it.action}
                        </p>
                        <time className="text-xs text-muted-foreground">
                          {it.time}
                        </time>
                      </div>
                    </div>

                    {/* highlight en hover */}
                    <span
                      aria-hidden
                      className="
              absolute inset-0 -z-10 rounded-xl
              ring-1 ring-transparent
              group-hover:bg-black/5 dark:group-hover:bg-white/5
              group-hover:ring-black/10 dark:group-hover:ring-white/10
              transition
            "
                    />
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            // estado vacío premium
            <div className="text-center py-10 flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-black/5 dark:bg-white/10 mb-4">
                <Activity className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Sin actividad reciente
              </h3>
              <p className="text-sm text-muted-foreground">
                Las acciones importantes de tu cuenta aparecerán aquí.
              </p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-premium p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors hover-lift">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Contratar VPS</p>
              <p className="text-sm text-muted-foreground">
                Servidor virtual privado
              </p>
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
              <p className="text-sm text-muted-foreground">
                Copia de seguridad
              </p>
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
