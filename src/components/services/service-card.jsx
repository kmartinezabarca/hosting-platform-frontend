import React, { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import ResourceUsageBar from "./resource-usage-bar";
import {
  MoreVertical, Copy, Check, PowerOff, RotateCcw, Power,
  Eye, Settings, RefreshCw,
} from "lucide-react";

/* TONES con clases *estáticas* (Tailwind-safe) */
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
  onDetails,
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
  const tone = TONES[statusTone(service.status)];

  const handleCopy = (text, field) => {
    if (!text) return;
    copyToClipboard(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  const ActionButton = ({ action, title, Icon, toneKey }) => {
    const t = TONES[toneKey];
    const isLoading = actionLoading[`${service.id}-${action}`];
    return (
      <button
        onClick={() => onAction(service.id, action)}
        disabled={isLoading}
        title={title}
        className={clsx(
          "p-2 rounded-lg transition-all",
          "text-muted-foreground",
          t.hoverText,
          t.hoverBg
        )}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
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
      {/* Header (sin tintes que laven el texto en dark) */}
      <div
        className="
          flex items-start justify-between p-5
          border-b border-black/5 dark:border-white/10
        "
      >
        <div className="flex items-center gap-3">
          {/* Icon chip con ring visible en dark */}
          <span
            className={clsx(
              "inline-flex items-center justify-center p-2.5 rounded-xl",
              "bg-black/5 dark:bg-white/10",
              "ring-1 ring-black/10 dark:ring-white/10"
            )}
          >
            <TypeIcon className={clsx("w-5 h-5", tone.text)} />
          </span>
          <div>
            <h3 className="font-semibold text-foreground leading-5">
              {service.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-5">
              {getTypeText(service.type)}
            </p>
          </div>
        </div>

        {/* Estado con dot + ring del tono */}
        <span
          className={clsx(
            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
            "ring-1",
            tone.chipBg,
            tone.text,
            tone.ring
          )}
        >
          <span className={clsx("size-1.5 rounded-full", tone.dot)} />
          {service.status === "active"
            ? "Activo"
            : service.status === "maintenance"
            ? "Mantenimiento"
            : service.status === "suspended"
            ? "Suspendido"
            : service.status === "stopped"
            ? "Detenido"
            : "Desconocido"}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5 flex-1 flex flex-col">
        {/* Info */}
        <div className="space-y-3 text-sm">
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
              <span className="font-medium text-foreground">{service.ip_address}</span>
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
            <h4 className="text-sm font-semibold text-foreground">Uso de Recursos</h4>
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
              onClick={() => onDetails(service)}
              title="Ver Detalles"
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
            >
              <Eye className="w-4 h-4" />
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
            <p className="text-xl font-bold text-foreground">${service.price}</p>
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
