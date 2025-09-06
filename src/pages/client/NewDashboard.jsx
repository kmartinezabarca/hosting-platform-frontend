import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Globe,
  DollarSign,
  Activity,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Plus,
  HardDrive,
  Database,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/dashboard/stat-card";
import DashboardCard from "../../components/dashboard/dashboard-card";
import DetailsModal from "../../components/dashboard/DetailsModal";
import ActionCard from '../../components/dashboard/ActionCard';
import { useQueryClient } from "@tanstack/react-query";
import {
  useDashboardStats,
  useDashboardServices,
  useDashboardActivity,
} from "../../hooks/useDashboard";
import { formatCurrency } from "@/lib/formatters";

const NewDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    isFetching: isFetchingStats,
  } = useDashboardStats();
  const {
    data: servicesResponse,
    isLoading: isLoadingServices,
    isFetching: isFetchingServices,
  } = useDashboardServices();
  const {
    data: activityResponse,
    isLoading: isLoadingActivity,
    isFetching: isFetchingActivity,
  } = useDashboardActivity();

  const isLoading = isLoadingStats || isLoadingServices || isLoadingActivity;
  const isRefreshing =
    isFetchingStats || isFetchingServices || isFetchingActivity;
  const stats = statsResponse;
  const services = servicesResponse || [];
  const activity = activityResponse || [];

  const openModal = (contentType) => {
    setModalContent(contentType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalContent(null), 300);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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

  const mapCategoryToType = (category) => {
    const categoryMap = {
      hosting: "shared_hosting",
      vps: "vps",
      cloud: "vps",
      gameserver: "game_server",
      database: "database",
      db: "database",
    };

    return categoryMap[category?.toLowerCase()] || "shared_hosting";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "shared_hosting":
        return Globe;
      case "vps":
        return Server;
      case "game_server":
        return Users;
      case "database":
        return Database;
      default:
        return Server;
    }
  };

  const getTypeLabel = (type) => {
    switch ((type || "").toLowerCase()) {
      case "shared_hosting":
        return "Hosting compartido";
      case "vps":
        return "VPS";
      case "game_server":
        return "Servidor de juego";
      case "database":
        return "Base de datos";
      default:
        return "Servicio";
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "maintenance":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
      case "suspended":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400";
      default:
        // deja tus colores por defecto
        return "";
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

  if (isLoading) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              disabled={isRefreshing}
              className="p-3 rounded-xl transition-colors hover:bg-accent text-muted-foreground"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
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
        {/* Servicios Activos */}
        <StatCard
          icon={Server}
          title="Servicios Activos"
          value={stats?.services?.active ?? 0}
          subtitle={`${stats?.services?.total ?? 0} total • ${
            stats?.services?.maintenance ?? 0
          } en mantenimiento`}
          delta={stats?.services?.trend ?? null}
          colorClass="text-primary"
          onClick={() => openModal("services")}
          delay={0.1}
        />

        {/* Dominios */}
        <StatCard
          icon={Globe}
          title="Dominios Registrados"
          value={stats?.domains?.total ?? 0}
          subtitle={`${stats?.domains?.active ?? 0} activos • ${
            stats?.domains?.pending ?? 0
          } pendientes`}
          delta={stats?.domains?.trend ?? null}
          colorClass="text-success"
          delay={0.2}
        />

        {/* Gasto Mensual */}
        <StatCard
          icon={DollarSign}
          title="Gasto Mensual"
          value={formatCurrency(stats?.billing?.monthly_spend ?? 0, "MXN")}
          subtitle={
            stats?.billing?.cycle
              ? `Ciclo: ${stats.billing.cycle}`
              : "Sin facturación activa"
          }
          delta={stats?.billing?.trend ?? null}
          colorClass="text-warning"
          onClick={() => openModal("billing")}
          delay={0.3}
        />

        {/* Rendimiento */}
        <StatCard
          icon={Activity}
          title="Rendimiento"
          value={
            (stats?.performance?.uptime ?? 0) >= 99.5
              ? "Excelente"
              : (stats?.performance?.uptime ?? 0) >= 95
              ? "Bueno"
              : (stats?.performance?.uptime ?? 0) > 0
              ? "Regular"
              : "Sin datos"
          }
          subtitle={
            stats?.performance?.uptime != null
              ? `Uptime: ${stats.performance.uptime}%`
              : "Sin métricas"
          }
          colorClass="text-info"
          delay={0.4}
        />
      </div>

      <DetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contentType={modalContent}
        stats={stats}
      />

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
              {services.slice(0, 3).map((s) => {
                const type = mapCategoryToType(s.category_slug ?? s.type);
                const Icon = getTypeIcon(type);

                return (
                  <li key={s.uuid}>
                    <Link
                      to={`/client/services/details/${s.uuid}`}
                      className="
                group flex items-center gap-4 p-3 rounded-xl
                hover:bg-black/5 dark:hover:bg-white/5 transition-colors
              "
                    >
                      {/* icon chip (dinámico) */}
                      <span
                        className="inline-flex items-center justify-center rounded-lg p-2.5
                           bg-black/5 dark:bg-white/10"
                      >
                        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      </span>

                      {/* text */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {s.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {getTypeLabel(type)}
                        </p>
                      </div>

                      {/* status pill */}
                      <span
                        className={`
                  shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                  ring-1 ring-black/10 dark:ring-white/10
                  bg-black/5 text-foreground/80 dark:bg-white/10
                  ${getStatusColor(s.status)}
                `}
                      >
                        {getStatusText(s.status)}
                      </span>
                    </Link>
                  </li>
                );
              })}
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
              {activity.slice(0, 4).map((it) => {
                const Icon = getActivityIcon(it.type);

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
        transition={{ delay: 0.6 }}
        className="mt-8 mb-8"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            to="/client/services/new?type=vps"
            icon={Server}
            title="Contratar VPS"
            description="Servidor virtual privado"
            colorClass="text-primary"
          />
          <ActionCard
            to="/client/domains/register"
            icon={Globe}
            title="Registrar Dominio"
            description="Asegura tu nombre en la web."
            colorClass="text-success"
          />
          <ActionCard
            to="/client/backups"
            icon={Database}
            title="Gestionar Backups"
            description="Copias de seguridad."
            colorClass="text-warning"
          />
          <ActionCard
            to="/client/tickets"
            icon={MessageSquare}
            title="Crear Ticket"
            description="Soporte técnico."
            colorClass="text-info"
          />
        </div>
      </motion.div>

      {/* Error message */}
      {isErrorStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-4 border-l-4 border-warning bg-warning/5"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">Advertencia</p>
              <p className="text-sm text-muted-foreground">
                No se pudieron cargar los datos del dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NewDashboard;
