import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Globe, Database, Users, RefreshCw, Plus } from "lucide-react";
import ServiceFilters from "../../components/services/service-filters";
import ServiceCard from "../../components/services/service-card";
import ServiceDetailModal from "../../components/services/service-detail-modal";
import { useUserServices } from "../../hooks/useServices";
import { useServiceActions } from "../../hooks/useServiceActions";
import ErrorState from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

const ClientServicesPage = () => {
  const {
    data: services = [],
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

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-success";
      case "pending":
        return "text-warning";
      case "suspended":
        return "text-error";
      case "terminated":
        return "text-muted-foreground";
      case "failed":
        return "text-error";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "active":
        return "bg-success/10";
      case "pending":
        return "bg-warning/10";
      case "suspended":
        return "bg-error/10";
      case "terminated":
        return "bg-muted/10";
      case "failed":
        return "bg-error/10";
      default:
        return "bg-muted/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Activo";
      case "pending":
        return "Pendiente";
      case "suspended":
        return "Suspendido";
      case "terminated":
        return "Terminado";
      case "failed":
        return "Fallido";
      default:
        return "Desconocido";
    }
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

  const getTypeText = (type) => {
    switch (type) {
      case "shared_hosting":
        return "Web Hosting";
      case "vps":
        return "VPS";
      case "game_server":
        return "Servidor de Juegos";
      case "database":
        return "Base de Datos";
      default:
        return "Servicio";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "text-error";
    if (percentage >= 70) return "text-warning";
    return "text-success";
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return "bg-error";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;
    const matchesType = typeFilter === "all" || service.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-busy="true" aria-live="polite">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="min-w-0">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Grid de cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="
              group rounded-2xl border border-border/60 bg-card/80
              shadow-sm hover:shadow-lg hover:-translate-y-0.5
              transition-all duration-300 will-change-transform
              ring-1 ring-black/5 dark:ring-white/5 overflow-hidden
            "
            >
              {/* Header del card */}
              <div className="p-5 border-b border-border/60">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              {/* Cuerpo del card */}
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

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar los servicios"
        error={error}
        hint="Intenta nuevamente. Si el problema persiste, contacta a soporte."
        primaryAction={{
          label: "Reintentar",
          onClick: () => refetch(),
          icon: RefreshCw,
          variant: "primary",
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                key={service.uuid}
                service={service}
                actionLoading={actionLoading}
                onAction={handleServiceAction}
                onQuickView={() => setSelectedService(service)}
                onManage={() => navigate(`/client/services/${service.uuid}`)}
                onSettings={() =>
                  navigate(`/client/services/${service.uuid}/manage`)
                }
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
