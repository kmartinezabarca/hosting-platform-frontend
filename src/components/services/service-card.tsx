import React, { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  Copy, Check, PowerOff, RotateCcw, Power,
  Eye, Settings, Loader2, Wifi, Globe, Calendar,
  AlertTriangle, Cpu, HardDrive, Users, HeartPulse,
  ExternalLink, MessageSquare, MapPin, Clock,
  Activity, Network,
} from "lucide-react";

/* ─── Tonos ─────────────────────────────────────────────────────────────────── */
const TONES = {
  success: {
    text:    "text-emerald-600 dark:text-emerald-400",
    ring:    "ring-emerald-500/30",
    chipBg:  "bg-emerald-500/10 dark:bg-emerald-500/15",
    dot:     "bg-emerald-500",
    accent:  "before:bg-emerald-500",
    ctaBg:   "bg-foreground/[0.06] hover:bg-emerald-500/10 dark:bg-white/[0.06] dark:hover:bg-emerald-500/10",
    ctaBorder: "border-black/[0.06] hover:border-emerald-500/30 dark:border-white/[0.08] dark:hover:border-emerald-500/30",
    ctaText: "text-foreground hover:text-emerald-600 dark:hover:text-emerald-400",
  },
  warning: {
    text:    "text-amber-600 dark:text-amber-400",
    ring:    "ring-amber-500/30",
    chipBg:  "bg-amber-500/10 dark:bg-amber-500/15",
    dot:     "bg-amber-500",
    accent:  "before:bg-amber-500",
    ctaBg:   "bg-foreground/[0.06] hover:bg-foreground/[0.11] dark:bg-white/[0.06] dark:hover:bg-white/[0.11]",
    ctaBorder: "border-black/[0.06] dark:border-white/[0.08]",
    ctaText: "text-foreground",
  },
  error: {
    text:    "text-rose-600 dark:text-rose-400",
    ring:    "ring-rose-500/30",
    chipBg:  "bg-rose-500/10 dark:bg-rose-500/15",
    dot:     "bg-rose-500",
    accent:  "before:bg-rose-500",
    ctaBg:   "bg-foreground/[0.06] hover:bg-foreground/[0.11] dark:bg-white/[0.06] dark:hover:bg-white/[0.11]",
    ctaBorder: "border-black/[0.06] dark:border-white/[0.08]",
    ctaText: "text-foreground",
  },
  muted: {
    text:    "text-muted-foreground",
    ring:    "ring-black/10 dark:ring-white/10",
    chipBg:  "bg-black/5 dark:bg-white/10",
    dot:     "bg-muted-foreground",
    accent:  "before:bg-black/20 dark:before:bg-white/20",
    ctaBg:   "bg-foreground/[0.06] hover:bg-foreground/[0.11] dark:bg-white/[0.06] dark:hover:bg-white/[0.11]",
    ctaBorder: "border-black/[0.06] dark:border-white/[0.08]",
    ctaText: "text-foreground",
  },
};

const statusTone = (status: string) =>
  status === "active" ? "success" : status === "maintenance" ? "warning" :
  status === "suspended" ? "error" : "muted";

/* ─── Mini barra de uso ──────────────────────────────────────────────────────── */
const MiniBar = ({ label, value, isIdle = false }: { label: string; value: number; isIdle?: boolean }) => {
  // Mínimo visual de 3% para que no se vea vacío
  const display = isIdle ? 3 : Math.min(Math.max(Math.round(value), 0), 100);
  const color = display > 85 ? "bg-rose-500" : display > 65 ? "bg-amber-500" : "bg-emerald-500";
  const tclr  = display > 85 ? "text-rose-500" : display > 65 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
        {label}
      </span>
      <div className="flex-1 h-[3px] bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${display}%` }}
        />
      </div>
      <span className={clsx("w-10 text-[10px] font-bold text-right tabular-nums shrink-0", tclr)}>
        {isIdle ? "idle" : `${Math.round(value)}%`}
      </span>
    </div>
  );
};

/* ─── Spec pill ─────────────────────────────────────────────────────────────── */
const SpecPill = ({ icon: Icon, value }: { icon: React.ElementType; value: string }) => (
  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.07]">
    <Icon className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
    <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{value}</span>
  </div>
);

/* ─── Info row ───────────────────────────────────────────────────────────────── */
const InfoRow = ({
  icon: Icon, label, value, mono = false, onCopy, copied, highlight = false,
}: {
  icon: React.ElementType; label: string; value: string;
  mono?: boolean; onCopy?: () => void; copied?: boolean; highlight?: boolean;
}) => (
  <div className="group flex items-center justify-between gap-2">
    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
      <Icon className="w-3 h-3" />
      <span className="text-[11px]">{label}</span>
    </div>
    <div className="flex items-center gap-1 min-w-0">
      <span className={clsx(
        "text-[11px] font-medium truncate",
        mono && "font-mono",
        highlight ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-foreground"
      )}>
        {value}
      </span>
      {onCopy && (
        <button
          onClick={onCopy}
          className="shrink-0 opacity-100 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  </div>
);

/* ─── Icon button con tooltip ────────────────────────────────────────────────── */
/* ─── Icon button con tooltip corregido ────────────────────────────────────────── */
const IconBtn = ({
  icon: Icon, label, onClick, disabled = false,
  hoverColor = "hover:text-primary hover:bg-primary/10",
  spinClass = "",
  align = "center" // Añadimos esto: "left" | "center" | "right"
}: {
  icon: React.ElementType; label: string; onClick: () => void;
  disabled?: boolean; hoverColor?: string; spinClass?: string;
  align?: "left" | "center" | "right";
}) => {
  // Clases dinámicas para que el tooltip no se salga de la tarjeta con overflow:hidden
  const tooltipAlign = {
    left: "left-0 translate-x-0",           // Se alinea al borde izquierdo del botón
    center: "left-1/2 -translate-x-1/2",    // Centrado normal
    right: "right-0 translate-x-0"          // Se alinea al borde derecho del botón
  };

  const arrowAlign = {
    left: "left-2.5",                       // Flecha hacia la izquierda
    center: "left-1/2 -translate-x-1/2",    // Flecha al centro
    right: "right-2.5"                      // Flecha hacia la derecha
  };

  return (
    <div className="relative group/btn">
      <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          "p-1.5 rounded-lg text-muted-foreground transition-all disabled:opacity-40",
          hoverColor
        )}
      >
        <Icon className={clsx("w-3.5 h-3.5", spinClass)} />
      </button>

      {/* Tooltip ajustado para overflow-hidden */}
      <div className={clsx(
        "absolute bottom-full mb-1.5 px-2 py-0.5 rounded-md",
        "bg-foreground text-background text-[10px] font-medium whitespace-nowrap",
        "opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity",
        "shadow-lg z-10",
        tooltipAlign[align] // <--- Aplicamos alineación
      )}>
        {label}
        <div className={clsx(
          "absolute top-full border-4 border-transparent border-t-foreground",
          arrowAlign[align] // <--- Aplicamos alineación a la flecha
        )} />
      </div>
    </div>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const formatPrice = (price: number, cycle: string) => {
  const labels: Record<string, string> = {
    monthly: "mes", quarterly: "trimestre",
    semi_annually: "semestre", annually: "año",
  };
  return { amount: `$${price.toLocaleString("es-MX")}`, cycle: `/ ${labels[cycle] ?? cycle}` };
};

const daysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
};

const formatUptime = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

/** Convierte bytes a texto legible: "831.4 MB", "1.2 GB" */
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const buildSpecPills = (specs: any, isGameServer: boolean) => {
  const pills: { icon: React.ElementType; value: string }[] = [];
  if (specs?.cpu)     pills.push({ icon: Cpu,        value: specs.cpu });
  if (specs?.ram)     pills.push({ icon: HeartPulse, value: specs.ram });
  if (specs?.players && isGameServer)
                      pills.push({ icon: Users,      value: specs.players });
  if (specs?.storage) pills.push({ icon: HardDrive,  value: specs.storage });
  return pills.slice(0, 3);
};

const resolveRealStatus = (dbStatus: string, metricsState?: string) => {
  if (dbStatus !== "active") return dbStatus;
  if (metricsState === "offline")  return "stopped";
  if (metricsState === "starting") return "starting";
  if (metricsState === "stopping") return "stopping";
  return "active";
};

/* ═══════════════════════════════════════════════════════════════════════════════
   ServiceCard
═══════════════════════════════════════════════════════════════════════════════ */
const ServiceCard = ({
  service, onAction, onQuickView, onManage, onSettings,
  actionLoading, getTypeIcon, getTypeText, formatDate, copyToClipboard,
}: any) => {
 
  const TypeIcon = getTypeIcon(service.type);
  const [copiedField, setCopiedField] = useState("");

  const isActionKey = (action: string) =>
    !!(actionLoading?.[`${service?.uuid}-${action}`] || actionLoading?.[`${service?.id}-${action}`]);

  const restarting = isActionKey("restart");
  const starting   = isActionKey("start");
  const stopping   = isActionKey("stop");
  const anyAction  = restarting || starting || stopping;

  const isGameServer = service.type === "game_server";
  const metrics      = service.metrics ?? null;
  const realStatus   = resolveRealStatus(service.status, metrics?.state);

  const isProvisioning = isGameServer && service.status === "pending";
  const isFailed       = service.status === "failed";
  const isSuspended    = service.status === "suspended";
  const isActive       = realStatus === "active";
  const isStopped      = realStatus === "stopped" || realStatus === "offline";
  const isStarting     = realStatus === "starting";
  const isStopping     = realStatus === "stopping";

  const showMetrics = isActive && metrics && metrics.state === "running" && !metrics?.error;

  const toneKey =
    anyAction || isStarting || isStopping ? "warning"
    : isProvisioning ? "warning"
    : isFailed || isSuspended ? "error"
    : isActive ? "success"
    : "muted";
  const tone = TONES[toneKey];

  const statusLabel =
    restarting ? "Reiniciando" : starting ? "Iniciando" : stopping ? "Deteniendo"
    : isStarting ? "Iniciando" : isStopping ? "Deteniendo"
    : isGameServer
      ? ({ pending: "Aprovisionando", active: "En línea", suspended: "Suspendido", failed: "Error", stopped: "Detenido", offline: "Offline" }[realStatus] ?? "Desconocido")
      : ({ active: "Activo", maintenance: "Mantenimiento", suspended: "Suspendido", stopped: "Detenido" }[realStatus] ?? "Desconocido");

  const serverIp      = service.connection_details?.server_ip;
  const serverPort    = service.connection_details?.server_port;
  const connectionStr = serverIp ? `${serverIp}${serverPort ? `:${serverPort}` : ""}` : null;

  const specs     = service.specs || {};
  const specPills = buildSpecPills(specs, isGameServer);

  const days         = daysUntil(service.expires_at);
  const expiryUrgent = days !== null && days <= 3 && days >= 0;
  const expiryWarn   = days !== null && days <= 7 && days > 3;

  const { amount, cycle: cycleStr } = formatPrice(Number(service.price), service.billing_cycle);

  // Network total (rx + tx)
  const networkTotal = metrics ? formatBytes((metrics.network_rx ?? 0) + (metrics.network_tx ?? 0)) : null;

  // CPU idle si < 1%
  const cpuIdle = showMetrics && (metrics.cpu ?? 0) < 1;

  const copy = (text: string, field: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  /* ─── Body por estado ────────────────────────────────────────────────────── */
  const renderBody = () => {
    if (isFailed) return (
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl bg-rose-500/8 border border-rose-500/25">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">Error de aprovisionamiento</p>
            <p className="text-[10px] text-rose-600/70 dark:text-rose-400/60 mt-0.5">
              El nodo no respondió. Ref: #{service.external_id ?? service.id}
            </p>
          </div>
        </div>
        <button onClick={() => onQuickView(service)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/8 hover:bg-rose-500/15 border border-rose-500/25 transition-colors">
          <MessageSquare className="w-3 h-3" />
          Contactar soporte
        </button>
      </div>
    );

    if (isProvisioning) return (
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5 py-2.5 px-3 rounded-xl bg-amber-500/8 border border-amber-500/25">
          <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Creando tu servidor…</p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">Esto puede tomar 1–3 minutos.</p>
          </div>
        </div>
        {specPills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specPills.map((p, i) => <SpecPill key={i} icon={p.icon} value={p.value} />)}
          </div>
        )}
      </div>
    );

    if (isSuspended) return (
      <div className="space-y-2.5">
        <div className="flex items-start gap-2 py-2 px-3 rounded-xl bg-rose-500/8 border border-rose-500/20">
          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-700 dark:text-rose-400">Servicio suspendido. Contacta soporte o renueva tu plan.</p>
        </div>
        {specPills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specPills.map((p, i) => <SpecPill key={i} icon={p.icon} value={p.value} />)}
          </div>
        )}
        <InfoRow icon={Calendar} label="Vence" value={formatDate(service.expires_at)} />
      </div>
    );

    return (
      <div className="space-y-2.5">
        {/* Specs */}
        {specPills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specPills.map((p, i) => <SpecPill key={i} icon={p.icon} value={p.value} />)}
          </div>
        )}

        {/* Info block */}
        <div className="space-y-1.5 py-2.5 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
          {isGameServer && connectionStr && (
            <InfoRow icon={Wifi} label="Conexión" value={connectionStr} mono
              onCopy={() => copy(connectionStr, "ip")} copied={copiedField === "ip"} />
          )}
          {!isGameServer && service.domain && service.domain !== "N/A" && (
            <InfoRow icon={Globe} label="Dominio" value={service.domain}
              onCopy={() => copy(service.domain, "domain")} copied={copiedField === "domain"} />
          )}

          {/* Uptime real */}
          {showMetrics && metrics.uptime > 0 && (
            <InfoRow icon={Clock} label="Uptime" value={formatUptime(metrics.uptime)} highlight />
          )}

          {/* Nodo + red — la línea que sube el nivel */}
          {showMetrics && networkTotal && (
            <InfoRow icon={Network} label="Red" value={networkTotal} />
          )}

          {/* Región si está disponible */}
          {service.connection_details?.region && (
            <InfoRow icon={MapPin} label="Nodo" value={service.connection_details.region} />
          )}

          {/* Vencimiento */}
          <InfoRow icon={Calendar} label="Vence"
            value={days === null ? formatDate(service.expires_at) : days === 0 ? "Hoy" : days === 1 ? "Mañana" : formatDate(service.expires_at)} />
        </div>

        {/* Métricas — CPU idle si < 1%, RAM y red */}
        {showMetrics && (
          <div className="space-y-1.5">
            <MiniBar label="CPU" value={metrics.cpu ?? 0} isIdle={cpuIdle} />
            <MiniBar label="RAM" value={metrics.memory ?? 0} />
            {/* Network en vez de SSD — más relevante */}
            <div className="flex items-center gap-2">
              <span className="w-7 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">NET</span>
              <div className="flex-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Activity className="w-2.5 h-2.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                  ↑{formatBytes(metrics.network_tx ?? 0)}
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span className="text-blue-500 font-medium tabular-nums">
                  ↓{formatBytes(metrics.network_rx ?? 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Alerta de vencimiento */}
        {(expiryUrgent || expiryWarn) && (
          <div className={clsx(
            "flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] leading-tight",
            expiryUrgent
              ? "bg-rose-500/8 border border-rose-500/20 text-rose-700 dark:text-rose-400"
              : "bg-amber-500/8 border border-amber-500/20 text-amber-700 dark:text-amber-400"
          )}>
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {expiryUrgent
              ? days === 0 ? "Vence hoy — renueva ahora" : `Vence en ${days} día${days === 1 ? "" : "s"} — urgente`
              : `Vence en ${days} días`
            }
          </div>
        )}
      </div>
    );
  };

  /* ─── CTA principal ──────────────────────────────────────────────────────── */
  const renderCTA = () => {
    if (isFailed || isProvisioning) return null;

    if (isSuspended) return (
      <button onClick={() => onQuickView(service)}
        className="w-full py-2 rounded-xl text-[12px] font-semibold transition-colors bg-rose-600 hover:bg-rose-700 text-white">
        Contactar soporte
      </button>
    );

    if ((isStopped || isStopping) && isGameServer) return (
      <button onClick={() => onAction(service.uuid, "start")} disabled={starting || isStopping}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold transition-colors bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60">
        {starting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
        {starting ? "Iniciando…" : isStopping ? "Deteniéndose…" : "Iniciar servidor"}
      </button>
    );

    return (
      <button onClick={() => onManage(service)}
        className={clsx(
          "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl",
          "text-[12px] font-semibold transition-all duration-200",
          "border",
          tone.ctaBg,
          tone.ctaBorder,
          tone.ctaText,
          // Hover glow sutil para el estado activo
          toneKey === "success" && "hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]",
        )}>
        <ExternalLink className="w-3.5 h-3.5" />
        Administrar servidor
      </button>
    );
  };

  const showSpin = anyAction || isStarting || isStopping || isProvisioning;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={clsx(
        "relative overflow-hidden rounded-2xl flex flex-col",
        "bg-white dark:bg-neutral-900",
        "border border-black/[0.06] dark:border-white/[0.08]",
        "shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-l-2xl",
        tone.accent,
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={clsx(
            "inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ring-1",
            tone.chipBg, tone.ring,
          )}>
            <TypeIcon className={clsx("w-4 h-4", tone.text)} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground leading-tight truncate max-w-[11rem]">
              {service.name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[11rem]">
              {service.plan_name || getTypeText(service.type)}
            </p>
          </div>
        </div>

        <span className={clsx(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-2 shrink-0",
          "text-[10px] font-semibold ring-1",
          tone.chipBg, tone.text, tone.ring,
          (anyAction || isStarting || isStopping) && "animate-pulse",
        )}>
          {showSpin
            ? <Loader2 className="w-2 h-2 animate-spin" />
            : <span className={clsx("w-1.5 h-1.5 rounded-full", tone.dot)} />
          }
          {statusLabel}
        </span>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 flex-1 flex flex-col gap-3">
        {renderBody()}
        <div className="flex-1" />

        {/* CTA */}
        {renderCTA()}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/[0.06]">

          {/* Acciones con tooltips */}
          <div className="flex items-center gap-0.5">
            {isGameServer && isActive && (
              <>
                <IconBtn
                  align="left"
                  icon={PowerOff} label="Detener servidor"
                  onClick={() => onAction(service.uuid, "stop")}
                  disabled={stopping}
                  hoverColor="hover:text-rose-500 hover:bg-rose-500/10"
                  spinClass={stopping ? "animate-pulse" : ""}
                />
                <IconBtn
                  icon={RotateCcw} label="Reiniciar servidor"
                  onClick={() => onAction(service.uuid, "restart")}
                  disabled={restarting}
                  hoverColor="hover:text-amber-500 hover:bg-amber-500/10"
                  spinClass={restarting ? "animate-spin" : ""}
                />
              </>
            )}
            {/* <IconBtn
              icon={Eye} label="Vista rápida"
              onClick={() => onQuickView(service)}
              hoverColor="hover:text-primary hover:bg-primary/10"
            /> */}
            {(isActive || isStopped) && (
              <IconBtn
                icon={Settings} label="Configuración"
                onClick={() => onSettings(service)}
                hoverColor="hover:text-primary hover:bg-primary/10"
              />
            )}
          </div>

          {/* Precio — más prominente */}
          <button onClick={() => onManage(service)} className="group/price text-right">
            <div className="flex items-baseline gap-0.5 justify-end">
              <span className="text-base font-extrabold text-foreground tracking-tight">
                {amount}
              </span>
              <span className="text-[11px] font-normal text-muted-foreground ml-0.5">
                {cycleStr}
              </span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;