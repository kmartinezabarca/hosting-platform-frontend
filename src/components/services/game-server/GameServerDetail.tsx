import React, { useEffect, useState } from "react";
import {
  ArrowLeft, Gamepad2, AlertTriangle, Loader2,
  Cpu, HardDrive, MemoryStick, Database, Archive,
  Settings2, Package, Coffee, CheckCircle2,
  Copy, Check, Network, BarChart2, Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PowerControlCard from "./PowerControlCard";
import MetricsCard from "./MetricsCard";
import ModsManager from "./ModsManager";
import GameServerSettings from "./GameServerSettings";
import EulaModal from "./EulaModal";
import { GameServerConsole } from "@/components/services/GameServerConsole";
import {
  useGameServerUsage,
  useGameServerConfiguration,
  useFixGameServerJava,
} from "@/hooks/useGameServer";
import { useGameServerStartup } from "@/hooks/useGameServerStartup";

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_MAP = {
  pending: {
    label: "Aprovisionando",
    dotClass: "bg-amber-400 animate-pulse",
    textClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bannerClass: "border-amber-500/20 bg-amber-500/[0.06]",
  },
  active: {
    label: "En línea",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bannerClass: "",
  },
  suspended: {
    label: "Suspendido",
    dotClass: "bg-orange-400",
    textClass: "text-orange-600 dark:text-orange-400",
    badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    bannerClass: "border-orange-500/20 bg-orange-500/[0.06]",
  },
  terminated: {
    label: "Terminado",
    dotClass: "bg-slate-400",
    textClass: "text-slate-500",
    badgeClass: "border-slate-600 bg-slate-800 text-slate-400",
    bannerClass: "",
  },
  failed: {
    label: "Error",
    dotClass: "bg-red-500",
    textClass: "text-red-500",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-500",
    bannerClass: "border-red-500/20 bg-red-500/[0.06]",
  },
} as const;
type ServiceStatus = keyof typeof STATUS_MAP;

// ── Tabs ───────────────────────────────────────────────────────────────────────

type Tab = "console" | "metrics" | "settings" | "mods";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "console", label: "Consola", Icon: Terminal },
  // { id: "metrics", label: "Recursos", Icon: BarChart2 },
  { id: "settings", label: "Configuración", Icon: Settings2 },
  { id: "mods", label: "Mods / Plugins", Icon: Package },
];

// ── Header ─────────────────────────────────────────────────────────────────────

function PageHeader({ service, eggName, currentVersion }: {
  service: any; eggName: string; currentVersion: string;
}) {
  const [copied, setCopied] = useState(false);
  const status = (service.status as ServiceStatus) ?? "active";
  const sm = STATUS_MAP[status] ?? STATUS_MAP.active;
  const ipPort = service.connection
    ? `${service.connection.server_ip}:${service.connection.server_port}`
    : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Left: identity */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/[0.07] border border-primary/[0.12] flex items-center justify-center">
            <Gamepad2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-background",
            sm.dotClass,
          )} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-semibold text-foreground truncate leading-tight">
              {service.name}
            </h1>
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium",
              sm.badgeClass,
            )}>
              {sm.label}
            </span>
          </div>
          {/* Meta strip */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-xs text-muted-foreground">
            {service.plan?.name && <span>{service.plan.name}</span>}
            {eggName && <><span className="opacity-40">·</span><span className="capitalize">{eggName}</span></>}
            {currentVersion && (
              <><span className="opacity-40">·</span>
                <code className="bg-muted px-1.5 py-px rounded font-mono text-[10px]">v{currentVersion}</code></>
            )}
          </div>
        </div>
      </div>

      {/* Right: IP copy pill */}
      {ipPort && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(ipPort);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="self-start sm:self-center flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors text-xs font-mono text-muted-foreground hover:text-foreground shrink-0"
        >
          {copied
            ? <Check className="w-3 h-3 text-emerald-500" />
            : <Copy className="w-3 h-3" />}
          {ipPort}
        </button>
      )}
    </div>
  );
}

// ── Alert banner ───────────────────────────────────────────────────────────────

function AlertBanner({ status }: { status: string }) {
  if (!["pending", "failed", "suspended"].includes(status)) return null;
  const sm = STATUS_MAP[status as ServiceStatus];
  const cfg = {
    pending: { Icon: Loader2, iconClass: "text-amber-500 animate-spin", title: "Aprovisionando servidor", body: "Esto puede tardar unos minutos." },
    failed: { Icon: AlertTriangle, iconClass: "text-red-500", title: "Error al aprovisionar", body: "El equipo de soporte fue notificado automáticamente." },
    suspended: { Icon: AlertTriangle, iconClass: "text-orange-500", title: "Servidor suspendido", body: "Contacta a soporte para reactivar este servidor." },
  }[status as "pending" | "failed" | "suspended"];
  if (!cfg) return null;
  const { Icon, iconClass, title, body } = cfg;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", sm.bannerClass)}>
      <Icon className={cn("w-4 h-4 mt-px shrink-0", iconClass)} />
      <div>
        <p className={cn("font-medium text-sm", sm.textClass)}>{title}</p>
        <p className="text-xs text-muted-foreground mt-px">{body}</p>
      </div>
    </div>
  );
}

// ── Compact server info (sidebar) ─────────────────────────────────────────────

function ServerInfoCard({ service }: { service: any }) {
  const limits = service.plan?.limits;
  const feat = service.plan?.feature_limits;
  if (!limits && !feat) return null;

  const fmtMem = (mb: number) => mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`;
  const fmtDisk = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`;
  const fmtCpu = (c: number) => { const n = c / 100; return `${n % 1 === 0 ? n : n.toFixed(1)} núcleo${n !== 1 ? "s" : ""}`; };

  const rows = [
    ...(limits ? [
      { Icon: MemoryStick, label: "RAM", value: fmtMem(limits.memory), color: "text-blue-500" },
      { Icon: Cpu, label: "CPU", value: fmtCpu(limits.cpu), color: "text-violet-500" },
      { Icon: HardDrive, label: "Disco", value: fmtDisk(limits.disk), color: "text-emerald-500" },
    ] : []),
    ...(feat ? [
      { Icon: Database, label: "DBs", value: String(feat.databases), color: "text-amber-500" },
      { Icon: Archive, label: "Backups", value: String(feat.backups), color: "text-sky-500" },
    ] : []),
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Plan</p>
      </div>
      <div className="divide-y divide-border/50">
        {rows.map(({ Icon, label, value, color }) => (
          <div key={label} className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className={cn("w-3 h-3 shrink-0", color)} />
              {label}
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Java modal (sin cambios) ───────────────────────────────────────────────────

function JavaVersionModal({ serviceUuid, currentJava, mcVersion, onDismiss }: {
  serviceUuid: string; currentJava: number; mcVersion: string; onDismiss: () => void;
}) {
  const startup = useGameServerStartup(serviceUuid);
  const fixJava = useFixGameServerJava(serviceUuid);
  const dockerImages: Record<string, string> = startup.data?.docker_images ?? {};
  const javaOptions = Object.entries(dockerImages)
    .map(([label, image]) => {
      const match = label.match(/\d+/) ?? image.match(/java_(\d+)/);
      const version = match ? parseInt(match[0], 10) : 0;
      return { label: label.replace(/^java\s/i, "Java "), image, version };
    })
    .filter(o => o.version > 0)
    .sort((a, b) => b.version - a.version);
  const [selectedImage, setSelectedImage] = useState<string>(javaOptions[0]?.image ?? "");
  const selectedVersion = javaOptions.find(o => o.image === selectedImage)?.version ?? 0;

  const handleFix = () => {
    fixJava.mutate(selectedVersion, {
      onSuccess: (data) => {
        toast.success(data.message ?? `Java actualizado a Java ${data.new_java}.`);
        toast.info("Reinicia el servidor para aplicar el cambio.");
        onDismiss();
      },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? "Error al actualizar."),
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-500/[0.06] border-b border-amber-500/20">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Java incompatible</h2>
            <p className="text-xs text-muted-foreground mt-0.5">El servidor no puede iniciarse con la versión actual.</p>
          </div>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-3 py-2.5">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Actual</p>
              <p className="text-sm font-semibold font-mono text-foreground mt-0.5">
                Java {currentJava}
                {mcVersion && <span className="ml-2 text-xs font-normal text-muted-foreground font-sans">· MC {mcVersion}</span>}
              </p>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          {startup.isLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando versiones…
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {javaOptions.map(({ label, image, version }) => {
                const isSelected = selectedImage === image;
                return (
                  <button key={image} onClick={() => setSelectedImage(image)}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg border text-xs font-semibold transition-all",
                      isSelected
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
                    )}>
                    <span className="font-mono text-sm">{label}</span>
                    {version === currentJava && <span className="text-[9px] text-muted-foreground">actual</span>}
                    {isSelected && version !== currentJava && <CheckCircle2 className="absolute top-1 right-1 w-2.5 h-2.5 text-amber-500" />}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">No se borran archivos. Necesitarás reiniciar el servidor.</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/20">
          <button onClick={onDismiss} disabled={fixJava.isPending}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleFix} disabled={fixJava.isPending || !selectedImage || startup.isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50">
            {fixJava.isPending
              ? <><Loader2 className="w-3 h-3 animate-spin" />Actualizando…</>
              : <><Coffee className="w-3 h-3" />Cambiar a Java {selectedVersion}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function GameServerDetail({ service }: { service: any }) {
  const { data: usage } = useGameServerUsage(service.uuid, service.status === "active");
  const isSuspended = (usage as any)?.is_suspended ?? service.status === "suspended";
  const isActive = service.status === "active";

  const eggName =
    service.game_software ?? service.egg_name ?? service.game_server?.egg_name ??
    service.game_server?.software ?? service.software ?? "Paper";

  const currentVersion =
    service.game_version ?? service.game_server?.version ?? service.version ?? "";

  const { data: config } = useGameServerConfiguration(service.uuid, service.status !== "pending");
  const javaMismatch = config?.java_version_mismatch ?? false;
  const currentJava = config?.runtime?.java_version ?? 0;
  const requiredJava = config?.required_java_version ?? 0;
  const mcVersion = config?.runtime?.version ?? currentVersion;

  const [activeTab, setActiveTab] = useState<Tab>("console");
  const [javaModalDismissed, setJavaModalDismissed] = useState(false);
  const [consoleDetectedJava, setConsoleDetectedJava] = useState<number>(0);
  const [serverReady, setServerReady] = useState(false);
  const [consoleDetectedEula, setConsoleDetectedEula] = useState(false);

  const modalRequiredJava = consoleDetectedJava > 0 ? consoleDetectedJava : requiredJava;
  const serverState = (usage as any)?.state ?? "";
  const serverIsUp = serverState === "running" || serverState === "starting";
  const hasJavaIssue = javaMismatch || consoleDetectedJava > 0;
  const showJavaModal = hasJavaIssue && !javaModalDismissed && modalRequiredJava !== currentJava && !serverIsUp && !serverReady;
  const showEulaModal = !showJavaModal && consoleDetectedEula;

  useEffect(() => {
    if (config?.eula_accepted) {
      setConsoleDetectedEula(false);
    }
  }, [config?.eula_accepted]);

  return (
    <>
      {showJavaModal && (
        <JavaVersionModal
          serviceUuid={service.uuid}
          currentJava={currentJava}
          mcVersion={mcVersion}
          onDismiss={() => setJavaModalDismissed(true)}
        />
      )}
      {showEulaModal && <EulaModal serviceUuid={service.uuid} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Header ── */}
        <div className="space-y-1">
          <Link to="/client/services"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group mb-3">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Mis Servicios
          </Link>
          <PageHeader service={service} eggName={eggName} currentVersion={currentVersion} />
        </div>

        {/* ── Alert ── */}
        <AlertBanner status={service.status} />

        {/* ── Tabs ── */}
        <div className="flex items-center gap-px border-b border-border">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Console ── */}
        {activeTab === "console" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            {/* Console */}
            <div className="lg:col-span-3">
              <GameServerConsole
                serviceUuid={service.uuid}
                enabled={isActive}
                className="h-[520px]"
                onServerReady={() => { setServerReady(true); setJavaModalDismissed(true); }}
                onJavaVersionError={(v) => { setServerReady(false); if (v > 0) setConsoleDetectedJava(v); setJavaModalDismissed(false); }}
                onEulaRequired={() => { setConsoleDetectedEula(true); setServerReady(false); }}
              />
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <PowerControlCard serviceUuid={service.uuid} isSuspended={isSuspended} />
              {isActive && (
                <MetricsCard serviceUuid={service.uuid} planLimits={service.plan?.limits} />
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Metrics ── */}
        {/* {activeTab === "metrics" && (
          <div className="max-w-2xl">
            {isActive
              ? <MetricsCard serviceUuid={service.uuid} planLimits={service.plan?.limits} />
              : <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
                <BarChart2 className="w-8 h-8 opacity-20" />
                <p className="text-sm">El servidor no está activo.</p>
              </div>
            }
          </div>
        )} */}

        {/* ── Tab: Settings ── */}
        {activeTab === "settings" && (
          <div>
            <GameServerSettings
              serviceUuid={service.uuid}
              enabled={isActive}
              currentSoftware={String(eggName).toLowerCase()}
              currentVersion={currentVersion}
              restartRequired={service.restart_required}
              pendingChangesCount={service.pending_changes_count}
              forceShowEulaModal={consoleDetectedEula}
            />
          </div>
        )}

        {/* ── Tab: Mods ── */}
        {activeTab === "mods" && (
          <ModsManager
            serviceUuid={service.uuid}
            eggName={eggName}
            restartServerRequired={service.restart_required}
            pendingChangesCount={service.pending_changes_count}
          />
        )}

      </div>
    </>
  );
}
