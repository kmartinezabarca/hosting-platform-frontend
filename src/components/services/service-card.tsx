import React, { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import ResourceUsageBar from "./resource-usage-bar";
import {
  FilePenLine, Copy, Check, PowerOff, RotateCcw, Power,
  Eye, Settings, RefreshCw, Loader2,
} from "lucide-react";

/* TONES con clases estáticas (Tailwind-safe) */
const TONES = {
  success: {
    text: "text-emerald-600 dark:text-emerald-400",
    hoverText: "hover:text-emerald-500",
    hoverBg: "hover:bg-emerald-500/10",
    ring: "ring-emerald-500/25",
    chipBg: "bg-emerald-500/15",
    dot: "bg-emerald-500",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-300",
    hoverText: "hover:text-amber-500",
    hoverBg: "hover:bg-amber-500/10",
    ring: "ring-amber-500/25",
    chipBg: "bg-amber-500/15",
    dot: "bg-amber-500",
  },
  error: {
    text: "text-rose-600 dark:text-rose-400",
    hoverText: "hover:text-rose-500",
    hoverBg: "hover:bg-rose-500/10",
    ring: "ring-rose-500/25",
    chipBg: "bg-rose-500/15",
    dot: "bg-rose-500",
  },
  muted: {
    text: "text-muted-foreground",
    hoverText: "hover:text-foreground",
    hoverBg: "hover:bg-black/5 dark:hover:bg-white/5",
    ring: "ring-black/10 dark:ring-white/10",
    chipBg: "bg-black/5 dark:bg-white/10",
    dot: "bg-muted-foreground",
  },
};

const statusTone = (status) =>
  status === "active" ? "success" :
  status === "maintenance" ? "warning" :
  status === "suspended" ? "error" : "muted";

const ServiceCard = ({
  service,
  onAction,
  onQuickView,
  onManage,
  onSettings,
  actionLoading,
  getTypeIcon,
  getTypeText,
  getUsageColor,
  getUsageBarColor,
  formatDate,
  copyToClipboard,
}) => {
  const TypeIcon = getTypeIcon(service.type);
  const [copied, setCopied] = useState("");

  /** --- Helpers de estado transitorio por acción --- */
  const isActionKey = (action) =>
    !!(actionLoading?.[`${service?.uuid}-${action}`] || actionLoading?.[`${service?.id}-${action}`]);

  const restarting = isActionKey("restart");
  const starting   = isActionKey("start");
  const stopping   = isActionKey("stop");

  const isGameServer = Boolean(service.is_game_server);

  // Si hay acción en curso, forzamos tono "warning" y label transitorio
  const toneKey = (restarting || starting || stopping)
    ? "warning"
    : (isGameServer && service.status === "pending")
    ? "warning"
    : statusTone(service.status);
  const tone = TONES[toneKey];

  // Game server status labels take priority
  const statusLabel = (() => {
    if (restarting) return "Reiniciando";
    if (starting)   return "Iniciando";
    if (stopping)   return "Deteniendo";
    if (isGameServer) {
      switch (service.status) {
        case "pending":    return "Creando servidor...";
        case "active":     return "En línea";
        case "suspended":  return "Suspendido";
        case "failed":     return "Error";
        case "stopped":    return "Detenido";
        default:           return "Desconocido";
      }
    }
    switch (service.status) {
      case "active": return "Activo";
      case "maintenance": return "Mantenimiento";
      case "suspended": return "Suspendido";
      case "stopped": return "Detenido";
      default: return "Desconocido";
    }
  })();

  // For pending game servers, animate the status chip
  const isProvisioningGameServer = isGameServer && service.status === "pending";

  const handleCopy = (text, field) => {
    if (!text) return;
    copyToClipboard(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  /** Botón genérico de acción con feedback de loading */
  const ActionButton = ({ action, title, Icon, toneKey }) => {
    const t = TONES[toneKey];
    const loading = isActionKey(action);

    // Icono con animación según acción
    const LoadingIcon =
      action === "restart" ? RotateCcw :
      action === "start"   ? Power :
      action === "stop"    ? PowerOff :
      RefreshCw;

    const loadingClass =
      action === "restart" ? "animate-spin" : "animate-pulse";

    return (
      <button
        onClick={() => onAction(service.uuid, action)}
        disabled={loading}
        title={title}
        className={clsx(
          "p-2 rounded-lg transition-all",
          "text-muted-foreground",
          t.hoverText,
          t.hoverBg,
          loading && "cursor-wait"
        )}
      >
        {loading ? (
          <LoadingIcon className={clsx("w-4 h-4", loadingClass)} />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </button>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        overflow-hidden rounded-2xl flex flex-col
        bg-white dark:bg-[#101214]
        border border-black/5 dark:border-white/10
        shadow-sm hover:shadow-lg transition-shadow
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          {/* Icon chip; gira si está reiniciando */}
          <span
            className={clsx(
              "inline-flex items-center justify-center p-2.5 rounded-xl",
              "bg-black/5 dark:bg-white/10",
              "ring-1 ring-black/10 dark:ring-white/10"
            )}
          >
            <TypeIcon
              className={clsx(
                "w-5 h-5",
                tone.text,
                restarting
              )}
            />
          </span>
          <div>
            <h3 className="font-semibold text-foreground leading-5 truncate max-w-[16rem]">
              {service.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-5">
              {getTypeText(service.type)}
            </p>
          </div>
        </div>

        {/* Status chip (amarillo mientras hay acción) */}
        <span
          className={clsx(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
            "ring-1",
            tone.chipBg,
            tone.text,
            tone.ring,
            (restarting || starting || stopping) && "animate-pulse"
          )}
        >
          {isProvisioningGameServer ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className={clsx("size-1.5 rounded-full", tone.dot)} />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5 flex-1 flex flex-col">
        {/* Info */}
        <div className="space-y-3 text-sm">
          {/* Game server active: show IP:port prominently */}
          {isGameServer && service.status === "active" && service.ip_address ? (
            <div className="group flex items-center justify-between">
              <span className="text-muted-foreground">Conexión:</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-semibold text-foreground truncate">
                  {service.ip_address}{service.port ? `:${service.port}` : ""}
                </span>
                <button
                  onClick={() => handleCopy(
                    `${service.ip_address}${service.port ? `:${service.port}` : ""}`,
                    "ip"
                  )}
                  className="transition-opacity opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
                  title="Copiar IP:Puerto"
                >
                  {copied === "ip" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ) : !isGameServer ? (
            <>
              <div className="group flex items-center justify-between">
                <span className="text-muted-foreground">Dominio:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-foreground truncate">
                    {service.domain || "N/A"}
                  </span>
                  <button
                    onClick={() => handleCopy(service.domain, "domain")}
                    className={clsx(
                      "transition-opacity opacity-0 group-hover:opacity-100",
                      "text-muted-foreground hover:text-primary"
                    )}
                    title="Copiar dominio"
                  >
                    {copied === "domain" ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="group flex items-center justify-between">
                <span className="text-muted-foreground">Dirección IP:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {service.ip_address}
                  </span>
                  <button
                    onClick={() => handleCopy(service.ip_address, "ip")}
                    className="transition-opacity opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
                    title="Copiar IP"
                  >
                    {copied === "ip" ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {/* Game server pending: provisioning message */}
          {isGameServer && service.status === "pending" && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Loader2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Tu servidor está siendo aprovisionado. Esto puede tomar unos minutos.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expira:</span>
            <span className="font-medium text-foreground">
              {formatDate(service.expires_at)}
            </span>
          </div>
        </div>

        {/* Uso de recursos */}
        {service.metrics && (
          <div className="space-y-4 pt-5 border-t border-black/5 dark:border-white/10">
            <h4 className="text-sm font-semibold text-foreground">
              Uso de Recursos
            </h4>
            <ResourceUsageBar
              name="CPU"
              usage={service.metrics.cpu_usage}
              color={getUsageColor(service.metrics.cpu_usage)}
              barColor={getUsageBarColor(service.metrics.cpu_usage)}
            />
            <ResourceUsageBar
              name="Memoria"
              usage={service.metrics.memory_usage}
              color={getUsageColor(service.metrics.memory_usage)}
              barColor={getUsageBarColor(service.metrics.memory_usage)}
            />
            <ResourceUsageBar
              name="Disco"
              usage={service.metrics.disk_usage}
              color={getUsageColor(service.metrics.disk_usage)}
              barColor={getUsageBarColor(service.metrics.disk_usage)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1">
            {service.status === "active" && (
              <>
                <ActionButton
                  action="stop"
                  title="Detener"
                  Icon={PowerOff}
                  toneKey="error"
                />
                <ActionButton
                  action="restart"
                  title="Reiniciar"
                  Icon={RotateCcw}
                  toneKey="warning"
                />
              </>
            )}
            {service.status === "stopped" && (
              <ActionButton
                action="start"
                title="Iniciar"
                Icon={Power}
                toneKey="success"
              />
            )}

            <button
              onClick={() => onQuickView(service)}
              title="Vista Rápida"
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManage(service);
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
              title="Gestionar Servicio"
            >
              <FilePenLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSettings(service)}
              title="Configuración"
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-foreground">
              ${service.price}
            </p>
            <p className="text-xs text-muted-foreground">
              /{service.billing_cycle === "monthly" ? "mes" : "año"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;