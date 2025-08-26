import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ResourceUsageBar from "./resource-usage-bar";
import {
  XCircle,
  Copy,
  Check,
  FileText,
  Terminal,
  ExternalLink,
} from "lucide-react";

/* Tonos estáticos Tailwind (seguros para prod) */
const TONES = {
  success: {
    text: "text-emerald-600 dark:text-emerald-400",
    chipBg: "bg-emerald-500/15",
    ring: "ring-emerald-500/25",
    dot: "bg-emerald-500",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-300",
    chipBg: "bg-amber-500/15",
    ring: "ring-amber-500/25",
    dot: "bg-amber-500",
  },
  error: {
    text: "text-rose-600 dark:text-rose-400",
    chipBg: "bg-rose-500/15",
    ring: "ring-rose-500/25",
    dot: "bg-rose-500",
  },
  muted: {
    text: "text-muted-foreground",
    chipBg: "bg-black/5 dark:bg-white/10",
    ring: "ring-black/10 dark:ring-white/10",
    dot: "bg-muted-foreground",
  },
};
const toneByStatus = (s) =>
  s === "active" ? "success" :
  s === "maintenance" ? "warning" :
  s === "suspended" ? "error" : "muted";

/* --- Modal premium con soporte dark/light --- */
const ServiceDetailModal = ({ service, onClose, ...props }) => {
  const [copied, setCopied] = useState("");
  if (!service) return null;

  const TypeIcon = props.getTypeIcon(service.type);
  const tone = TONES[toneByStatus(service.status)];

  const handleCopy = (text, field) => {
    if (!text) return;
    props.copyToClipboard(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  const InfoRow = ({ label, value, canCopy = false, copyValue }) => (
    <div
      className="
        group flex items-center justify-between gap-3 p-3 rounded-lg
        bg-black/5 dark:bg-white/5
        ring-1 ring-black/5 dark:ring-white/5
      "
    >
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">
          {value}
        </span>
        {canCopy && (
          <button
            onClick={() => handleCopy(copyValue, label)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            title={`Copiar ${label}`}
          >
            {copied === label ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  const ActionButton = ({ text, Icon, primary = false }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={
        primary
          ? `
        inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
        bg-[#222222] text-white
        dark:bg-white dark:text-[#101214]
        shadow-sm hover:shadow-md hover:brightness-110 active:translate-y-px
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#222222]/40 dark:focus-visible:ring-white/40
        transition
      `
          : `
        inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
        bg-black/5 dark:bg-white/10 text-foreground
        ring-1 ring-black/10 dark:ring-white/10
        hover:bg-black/7.5 dark:hover:bg-white/15 hover:shadow
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35
        transition
      `
      }
    >
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </motion.button>
  );

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        /* z-60 no existe en Tailwind → usa valor arbitrario */
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="
            w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col
            rounded-2xl bg-white dark:bg-[#101214]
            border border-black/5 dark:border-white/10
            shadow-2xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span
                className="
                  inline-flex items-center justify-center p-3 rounded-xl
                  bg-black/5 dark:bg-white/10
                  ring-1 ring-black/10 dark:ring-white/10
                "
              >
                <TypeIcon className={`w-6 h-6 ${tone.text}`} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {service.name}
                </h2>
                <p className="text-muted-foreground">
                  {props.getTypeText(service.type)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-muted-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Cerrar"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información general */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Información General
                </h3>
                <div className="space-y-3">
                  <div
                    className="
                      flex items-center justify-between gap-3 p-3 rounded-lg
                      bg-black/5 dark:bg-white/5
                      ring-1 ring-black/5 dark:ring-white/5
                    "
                  >
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span
                      className={`
                        inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium
                        ring-1 ${tone.chipBg} ${tone.text} ${tone.ring}
                      `}
                    >
                      <span className={`size-1.5 rounded-full ${tone.dot}`} />
                      {props.getStatusText(service.status)}
                    </span>
                  </div>

                  {service.domain && (
                    <InfoRow
                      label="Dominio"
                      value={service.domain}
                      canCopy
                      copyValue={service.domain}
                    />
                  )}
                  <InfoRow
                    label="Dirección IP"
                    value={service.ip_address}
                    canCopy
                    copyValue={service.ip_address}
                  />
                  <InfoRow
                    label="Creado"
                    value={props.formatDate(service.created_at)}
                  />
                  <InfoRow
                    label="Expira"
                    value={props.formatDate(service.expires_at)}
                  />
                </div>
              </div>

              {/* Especificaciones */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Especificaciones
                </h3>
                <div className="space-y-3">
                  {Object.entries(service.specs).map(([key, value]) => (
                    <InfoRow
                      key={key}
                      label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      value={value}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Métricas */}
            {service.metrics && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Métricas de Rendimiento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ResourceUsageBar
                    name="CPU"
                    usage={service.metrics.cpu_usage}
                    color={props.getUsageColor(service.metrics.cpu_usage)}
                    barColor={props.getUsageBarColor(service.metrics.cpu_usage)}
                  />
                  <ResourceUsageBar
                    name="Memoria"
                    usage={service.metrics.memory_usage}
                    color={props.getUsageColor(service.metrics.memory_usage)}
                    barColor={props.getUsageBarColor(service.metrics.memory_usage)}
                  />
                  <ResourceUsageBar
                    name="Disco"
                    usage={service.metrics.disk_usage}
                    color={props.getUsageColor(service.metrics.disk_usage)}
                    barColor={props.getUsageBarColor(service.metrics.disk_usage)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="
              flex flex-col sm:flex-row justify-end items-center gap-2 sm:gap-3
              p-4 mt-auto border-t border-black/5 dark:border-white/10
              bg-slate-50/70 dark:bg-[#0b0e10]/70
              rounded-b-2xl
            "
          >
            <ActionButton text="Ver Logs" Icon={FileText} />
            <ActionButton text="Consola" Icon={Terminal} />
            <ActionButton text="Acceder al Panel" Icon={ExternalLink} primary />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceDetailModal;
