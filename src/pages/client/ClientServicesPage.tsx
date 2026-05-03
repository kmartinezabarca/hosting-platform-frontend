import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Globe, Database, Gamepad2, RefreshCw, Plus } from "lucide-react";
import ServiceFilters from "../../components/services/service-filters";
import ServiceCardImport from "../../components/services/service-card";
const ServiceCard = ServiceCardImport as React.ComponentType<any>;
import ServiceDetailModal from "../../components/services/service-detail-modal";
import { useUserServices } from "../../hooks/useServices";
import { useServiceActions } from "../../hooks/useServiceActions";
import { useServicesMetrics } from "../../hooks/useServicesMetrics";
import ErrorState from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

const ClientServicesPage = () => {
  const {
    data: services = [] as any[],
    isLoading,
    isError,
    error,
    refetch,
  } = useUserServices();

  const { handleServiceAction, actionLoading } = useServiceActions();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const hasActiveGameServers = (services as any[]).some(
    (s) => s.type === "game_server" && s.status === "active"
  );

  const { data: metricsMap = {} } = useServicesMetrics(hasActiveGameServers);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      active: "text-success", pending: "text-warning",
      suspended: "text-error", terminated: "text-muted-foreground", failed: "text-error",
    };
    return map[status] ?? "text-muted-foreground";
  };

  const getStatusBgColor = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-success/10", pending: "bg-warning/10",
      suspended: "bg-error/10", terminated: "bg-muted/10", failed: "bg-error/10",
    };
    return map[status] ?? "bg-muted/10";
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      active: "Activo", pending: "Pendiente", suspended: "Suspendido",
      terminated: "Terminado", failed: "Fallido",
    };
    return map[status] ?? "Desconocido";
  };

  const getTypeIcon = (type: string, isGameServer = false) => {
    if (isGameServer || type === "game_server") return Gamepad2;
    const map: Record<string, React.ElementType> = {
      shared_hosting: Globe, vps: Server, database: Database,
    };
    return map[type] ?? Server;
  };

  const getTypeText = (type: string) => {
    const map: Record<string, string> = {
      shared_hosting: "Web Hosting", vps: "VPS",
      game_server: "Servidor de Juegos", database: "Base de Datos",
    };
    return map[type] ?? "Servicio";
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric", month: "short", year: "numeric",
    });

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const getUsageColor = (pct: number) =>
    pct >= 90 ? "text-error" : pct >= 70 ? "text-warning" : "text-success";

  const getUsageBarColor = (pct: number) =>
    pct >= 90 ? "bg-error" : pct >= 70 ? "bg-warning" : "bg-success";

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const filteredServices = (services as any[]).filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    const matchesType   = typeFilter   === "all" || service.type   === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-busy="true" aria-live="polite">
        <div className="flex items-center justify-between mb-8">
          <div className="min-w-0">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card/80 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-border/60">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <ErrorState
        title="Error al cargar los servicios"
        error={error}
        hint="Intenta nuevamente. Si el problema persiste, contacta a soporte."
        primaryAction={{ label: "Reintentar", onClick: () => refetch(), icon: RefreshCw, variant: "primary" }}
        secondaryAction={undefined}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
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

      {/* Filtros */}
      <ServiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <AnimatePresence>
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.uuid}
                service={{
                  ...service,
                  // Inyectar métricas cacheadas del hook unificado.
                  // null si el servidor no es game server o no está activo.
                  metrics: metricsMap[service.uuid] ?? service.metrics ?? null,
                }}
                actionLoading={actionLoading}
                onAction={handleServiceAction}
                onQuickView={() => setSelectedService(service)}
                onManage={() => navigate(`/client/services/${service.uuid}`)}
                onSettings={() => navigate(`/client/services/${service.uuid}/manage`)}
                getStatusColor={getStatusColor}
                getStatusBgColor={getStatusBgColor}
                getStatusText={getStatusText}
                getTypeIcon={(type: string) => getTypeIcon(type, service.type === "game_server")}
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

      {/* Modal */}
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