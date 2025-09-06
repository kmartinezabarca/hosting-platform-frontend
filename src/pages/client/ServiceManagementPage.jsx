import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  Network,
  Shield,
  Database,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";
import { useServiceDetails } from "../../hooks/useServices";

// Componentes de las pestañas
import GeneralSettingsTab from "../../components/services/management/GeneralSettingsTab";
import NetworkTab from "../../components/services/management/NetworkTab";
import SecurityTab from "../../components/services/management/SecurityTab";
import BackupsTab from "../../components/services/management/BackupsTab";
import DangerZoneTab from "../../components/services/management/DangerZoneTab";
import ServiceManagementHeader from "../../components/services/management/ServiceManagementHeader";
import PlanBillingCard from '../../components/services/management/PlanBillingCard';
import SkeletonServiceManagement from "../../components/skeletons/SkeletonServiceManagement";
import ErrorState from "@/components/ui/ErrorState";

const ServiceManagementPage = () => {
  const { serviceId } = useParams();
  const [activeTab, setActiveTab] = useState("general");

  const {
    data: service,
    isLoading,
    isError,
    error,
  } = useServiceDetails(serviceId);

  const tabs = [
    { id: "general", label: "General", icon: Server },
    { id: 'billing', label: 'Plan y Facturación', icon: CircleDollarSign },
    { id: "network", label: "Red", icon: Network },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "backups", label: "Backups", icon: Database },
    { id: "actions", label: "Acciones", icon: AlertTriangle, isDanger: true },
  ];

  const renderContent = () => {
    if (!service) return null;
    switch (activeTab) {
      case "general":
        return <GeneralSettingsTab service={service} />;
      case "billing":
        return <PlanBillingCard service={service} />;
      case "network":
        return <NetworkTab service={service} />;
      case "security":
        return <SecurityTab service={service} />;
      case "backups":
        return <BackupsTab service={service} />;
      case "actions":
        return <DangerZoneTab service={service} />;
      default:
        return <GeneralSettingsTab service={service} />;
    }
  };

  if (isLoading) {
    return <SkeletonServiceManagement />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Error al Cargar el Servicio"
        hint="No pudimos encontrar los detalles para este servicio. Es posible que el ID sea incorrecto o que haya ocurrido un problema en el servidor."
        error={error}
        primaryAction={{
          label: "Volver a Mis Servicios",
          to: "/client/services",
          icon: ArrowLeft,
          variant: "primary",
        }}
      />
    );
  }

  return (
    // Contenedor principal con más padding vertical
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ServiceManagementHeader service={service} isLoading={false} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Menú Lateral */}
        <aside className="lg:col-span-1">
          <div
            className="
      group rounded-2xl border border-border/60 bg-card/80
      shadow-sm hover:shadow-lg hover:-translate-y-0.5
      transition-all duration-300 will-change-transform
      ring-1 ring-black/5 dark:ring-white/5
    "
            role="complementary"
            aria-label="Navegación de secciones"
          >
            <nav className="flex flex-col space-y-1 p-3 md:p-4">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                const btnBase =
                  "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2";

                const btnActiveNormal =
                  "bg-accent text-foreground ring-1 ring-primary/15";
                const btnInactiveNormal =
                  "text-muted-foreground hover:bg-secondary/50 hover:text-foreground";

                const btnActiveDanger =
                  "bg-destructive/10 text-destructive ring-1 ring-destructive/20";
                const btnInactiveDanger =
                  "text-destructive/80 hover:bg-destructive/10";

                const classBtn = [
                  btnBase,
                  tab.isDanger
                    ? isActive
                      ? btnActiveDanger
                      : btnInactiveDanger
                    : isActive
                    ? btnActiveNormal
                    : btnInactiveNormal,
                ].join(" ");

                const iconClass = [
                  "w-5 h-5 flex-shrink-0",
                  tab.isDanger
                    ? isActive
                      ? "text-destructive"
                      : "text-destructive/90"
                    : isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                ].join(" ");

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={classBtn}
                  >
                    <tab.icon className={iconClass} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="lg:col-span-3">
          <div className="p-2 sm:p-0">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default ServiceManagementPage;
