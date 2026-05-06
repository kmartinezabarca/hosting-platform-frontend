import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  Globe,
  Layers,
  Loader2,
  Network,
  RotateCcw,
  Save,
  Server,
  Settings2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Users,
  Zap,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@shared/utils/utils";
import {
  useGameServerConfiguration,
  useUpdateGameServerProperties,
  useUpdateGameServerSoftware,
  useNestEggs,
} from "@application/hooks/useGameServer";
import type { GameServerProperties } from "@infrastructure/services/serviceService";
import { useSoftwareVersions, useInvalidateSoftwareVersions } from "@application/hooks/useSoftwareVersions";
import { eggNameToIdentifier, getRequiredJavaVersion } from "@infrastructure/services/softwareVersionService";
import type { SoftwareIdentifier } from "@infrastructure/services/softwareVersionService";
import EulaModal from "./EulaModal";

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = "software" | "properties";

interface Props {
  serviceUuid: string;
  enabled?: boolean;
  currentSoftware?: string;
  currentVersion?: string;
  restartRequired?: boolean;
  pendingChangesCount?: number;
  forceShowEulaModal?: boolean;
}

function isJavaSoftware(software: string): boolean {
  const normalized = (software || "").toLowerCase();
  const nonJavaEggs = ["bedrock", "velocity", "bungeecord", "bungee", "nukkit", "proxy"];
  return !nonJavaEggs.some((k) => normalized.includes(k));
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_PROPERTIES: GameServerProperties = {
  max_players: 20,
  gamemode: "survival",
  difficulty: "easy",
  white_list: false,
  online_mode: true,
  allow_flight: false,
  pvp: true,
  spawn_protection: 16,
  motd: "A Minecraft Server",
  resource_pack: "",
  resource_pack_prompt: "",
};

const GAME_MODES = [
  { value: "survival",  label: "Supervivencia" },
  { value: "creative",  label: "Creativo" },
  { value: "adventure", label: "Aventura" },
  { value: "spectator", label: "Espectador" },
];

const DIFFICULTIES = [
  { value: "peaceful", label: "Pacífico" },
  { value: "easy",     label: "Fácil" },
  { value: "normal",   label: "Normal" },
  { value: "hard",     label: "Difícil" },
];

// Per-software visual config
interface SoftwareVisual {
  color: string;       // Tailwind color token (without "bg-" / "text-" prefix)
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const SOFTWARE_VISUAL: Record<string, SoftwareVisual> = {
  // PaperMC family
  paper:          { color: "blue",    icon: Zap,      badge: "Recomendado" },
  velocity:       { color: "cyan",    icon: Network,  badge: "Proxy" },
  folia:          { color: "rose",    icon: Cpu,      badge: "Experimental" },
  // Purpur family
  purpur:         { color: "violet",  icon: Sparkles, badge: undefined },
  // Fabric / Quilt (modding)
  fabric:         { color: "amber",   icon: Code2,    badge: "Modding" },
  quilt:          { color: "indigo",  icon: Layers,   badge: "Modding" },
  // Forge / Maven modding
  forge:          { color: "orange",  icon: Layers,   badge: "Modding" },
  neoforge:       { color: "amber",   icon: Code2,    badge: "Modding" },
  arclight:       { color: "rose",    icon: Cpu,      badge: "Híbrido" },
  sponge:         { color: "indigo",  icon: Globe,    badge: "API" },
  // Vanilla / Mojang oficial
  vanilla:        { color: "emerald", icon: Server,   badge: undefined },
  bedrock:        { color: "orange",  icon: Globe,    badge: "Bedrock" },
  // Spigot ecosystem
  spigot:         { color: "emerald", icon: Zap,      badge: undefined },
  bungeecord:     { color: "cyan",    icon: Network,  badge: "Proxy" },
  // Bedrock server
  nukkit:         { color: "violet",  icon: Layers,   badge: "Bedrock" },
};

const COLOR_MAP: Record<string, { card: string; icon: string; badge: string; ring: string; check: string }> = {
  blue:    { card: "border-blue-500 bg-blue-500/[0.03] dark:bg-blue-500/[0.05]",     icon: "bg-blue-500 text-white",    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",       ring: "ring-blue-500/20",   check: "bg-blue-500" },
  violet:  { card: "border-violet-500 bg-violet-500/[0.03] dark:bg-violet-500/[0.05]", icon: "bg-violet-500 text-white", badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300", ring: "ring-violet-500/20", check: "bg-violet-500" },
  indigo:  { card: "border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05]", icon: "bg-indigo-500 text-white", badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300", ring: "ring-indigo-500/20", check: "bg-indigo-500" },
  amber:   { card: "border-amber-500 bg-amber-500/[0.03] dark:bg-amber-500/[0.05]",  icon: "bg-amber-500 text-white",   badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",    ring: "ring-amber-500/20",  check: "bg-amber-500" },
  emerald: { card: "border-emerald-500 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]", icon: "bg-emerald-500 text-white", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300", ring: "ring-emerald-500/20", check: "bg-emerald-500" },
  orange:  { card: "border-orange-500 bg-orange-500/[0.03] dark:bg-orange-500/[0.05]", icon: "bg-orange-500 text-white", badge: "bg-orange-50 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300", ring: "ring-orange-500/20", check: "bg-orange-500" },
  cyan:    { card: "border-cyan-500 bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05]",     icon: "bg-cyan-500 text-white",    badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",       ring: "ring-cyan-500/20",   check: "bg-cyan-500" },
  rose:    { card: "border-rose-500 bg-rose-500/[0.03] dark:bg-rose-500/[0.05]",     icon: "bg-rose-500 text-white",    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",       ring: "ring-rose-500/20",   check: "bg-rose-500" },
  default: { card: "border-foreground/50 bg-foreground/[0.02]",                      icon: "bg-foreground text-background", badge: "bg-muted text-muted-foreground",                                    ring: "ring-foreground/10", check: "bg-foreground" },
};

function getSoftwareVisual(name: string): SoftwareVisual {
  const key = eggNameToIdentifier(name ?? "") ?? "";
  return SOFTWARE_VISUAL[key] ?? { color: "default", icon: Server };
}

// ── Root Component ────────────────────────────────────────────────────────────

export default function GameServerSettings({
  serviceUuid,
  enabled = true,
  currentSoftware,
  currentVersion,
  restartRequired,
  pendingChangesCount,
  forceShowEulaModal = false,
}: Props) {
  const [tab, setTab]              = useState<TabId>("software");
  const [javaDismissed, setJavaDismissed] = useState(false);

  const configQuery  = useGameServerConfiguration(serviceUuid, enabled);
  const optionsQuery = useNestEggs(
    configQuery.data?.runtime?.nest_id ?? 0,
    !!configQuery.data?.runtime?.nest_id,
  );

  const options = optionsQuery.data ?? [];
  const config  = configQuery.data;
  const runtime = config?.runtime ?? {
    software: currentSoftware || "paper",
    version:  currentVersion  || "latest",
    egg_id:   undefined,
  };

  const effectiveRestartRequired = config?.restart_required ?? restartRequired;
  const effectivePendingCount    = config?.pending_changes_count ?? pendingChangesCount ?? 0;

  // ── Java version mismatch detection ───────────────────────────────────────
  const javaMismatch    = config?.java_version_mismatch ?? false;
  const requiredJava    = config?.required_java_version ?? 21;
  const currentJava     = (config?.runtime?.java_version as number | undefined) ?? 17;
  const showJavaModal   = javaMismatch && !javaDismissed;

  // ── EULA detection ─────────────────────────────────────────────────────────
  // Priority: Java mismatch modal > EULA modal.
  // Show EULA only when there is no active Java mismatch modal.
  const eulaAccepted = config?.eula_accepted ?? true;
  const softwareName = (runtime.software ?? currentSoftware ?? "").toLowerCase();
  const isJavaEdition = isJavaSoftware(softwareName);
  const showEulaModal = ((!eulaAccepted && isJavaEdition) || forceShowEulaModal) && !showJavaModal;

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Settings2 className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Configuración del servidor</h2>
            <p className="text-xs text-muted-foreground truncate">Software, versión y propiedades</p>
          </div>
        </div>
        {effectiveRestartRequired && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">
            <RotateCcw className="w-3 h-3" />
            {effectivePendingCount || 1} cambio{(effectivePendingCount || 1) !== 1 ? "s" : ""} pendiente{(effectivePendingCount || 1) !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-5 pt-0">
        <div className="flex gap-0 overflow-x-auto">
          <TabButton active={tab === "software"} icon={Server} onClick={() => setTab("software")}>
            Software
          </TabButton>
          <TabButton active={tab === "properties"} icon={SlidersHorizontal} onClick={() => setTab("properties")}>
            server.properties
          </TabButton>
        </div>
      </div>

      {/* Error banner */}
      {configQuery.isError && (
        <div className="mx-5 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2 items-start">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
          <span>No se pudo cargar la configuración del servidor. Se muestran valores base.</span>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {tab === "software" ? (
          <SoftwarePanel
            serviceUuid={serviceUuid}
            options={options}
            runtime={runtime}
            isLoadingOptions={optionsQuery.isLoading}
          />
        ) : (
          <ServerPropertiesPanel
            serviceUuid={serviceUuid}
            properties={{ ...DEFAULT_PROPERTIES, ...(config?.server_properties ?? {}) }}
          />
        )}
      </div>
      {showEulaModal && <EulaModal serviceUuid={serviceUuid} />}
    </section>
  );
}

// ── Software Panel ────────────────────────────────────────────────────────────

export function SoftwarePanel({
  serviceUuid,
  options = [],
  runtime,
  isLoadingOptions = false,
}: {
  serviceUuid: string;
  options: any[];
  runtime: any;
  isLoadingOptions?: boolean;
}) {
  const updateSoftware   = useUpdateGameServerSoftware(serviceUuid);
  const invalidateVersions = useInvalidateSoftwareVersions();

  const [software, setSoftware] = useState<number | undefined>(runtime.egg_id);
  const [version,  setVersion]  = useState<string>(runtime.version ?? "latest");

  // Track previous software egg_id to detect actual changes
  const prevSoftwareRef = useRef<number | undefined>(runtime.egg_id);

  // Sync when runtime loads from server
  useEffect(() => {
    setSoftware(runtime.egg_id);
    setVersion(runtime.version ?? "latest");
    prevSoftwareRef.current = runtime.egg_id;
  }, [runtime.egg_id, runtime.version]);

  const selectedOption = options.find((o: any) => o.id === software) ?? options[0];
  const identifier     = eggNameToIdentifier(selectedOption?.name ?? "") as SoftwareIdentifier | null;
  const visual         = getSoftwareVisual(selectedOption?.name ?? "");
  const colors         = COLOR_MAP[visual.color] ?? COLOR_MAP.default;

  const {
    data: apiVersions,
    isLoading: versionsLoading,
    isFetching: versionsFetching,
  } = useSoftwareVersions(identifier, !!identifier);

  // Build final versions list: prefer API data; fallback to egg's versions; last resort: ["latest"]
  const versions: string[] = (() => {
    if (apiVersions && apiVersions.length > 0) {
      // Ensure "latest" is always an option at the top
      return apiVersions.includes("latest") ? apiVersions : ["latest", ...apiVersions];
    }
    if (selectedOption?.versions?.length > 0) return selectedOption.versions;
    return ["latest"];
  })();

  // ── Version reset when software changes ────────────────────────────────────
  // We use a ref to detect when the egg actually changed (not just a re-render).
  useEffect(() => {
    if (prevSoftwareRef.current === software) return;
    prevSoftwareRef.current = software;

    // Immediately reset version to "latest" as placeholder while new versions load
    setVersion("latest");
  }, [software]);

  // Once new versions finish loading, set to first real version (not "latest" unless that's all there is)
  useEffect(() => {
    if (versionsLoading || versionsFetching) return;
    if (versions.length === 0) return;

    // If current version doesn't exist in the new list, pick the first real version
    if (!versions.includes(version)) {
      const firstReal = versions.find((v) => v !== "latest") ?? versions[0];
      setVersion(firstReal);
    }
  }, [versions, versionsLoading, versionsFetching]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty = software !== runtime.egg_id || version !== runtime.version;

  // ── Java version change detection ─────────────────────────────────────────
  const currentJava  = runtime.java_version as number | undefined;
  const requiredJava = getRequiredJavaVersion(version);
  // Only warn when we know the current java version AND it differs from required
  const javaWillChange = currentJava !== undefined && requiredJava !== currentJava;
  const javaUpgrade    = javaWillChange && requiredJava > (currentJava ?? 0);
  const javaDowngrade  = javaWillChange && requiredJava < (currentJava ?? 0);

  const handleSoftwareClick = (option: any) => {
    if (option.id === software) return;
    setSoftware(option.id);
    // Version will be reset by the useEffect above once software state updates
  };

  const save = () => {
    updateSoftware.mutate(
      { software: String(software ?? ""), version },
      {
        onSuccess: (data: any) => {
          const reinstalled = data?.data?.reinstall_triggered ?? false;
          if (reinstalled) {
            toast.success(
              "Software cambiado — el servidor se está reinstalando con el nuevo JAR. Esto puede tardar 1-2 minutos.",
              { duration: 8000 }
            );
          } else {
            toast.success("Versión actualizada. Reinicia el servidor para aplicar los cambios.");
          }
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Error al actualizar el software."),
      },
    );
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoadingOptions) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[108px] rounded-2xl border border-border bg-muted/30 animate-pulse" />
          ))}
        </div>
        <div className="h-24 rounded-2xl border border-dashed border-border bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Software cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option: any) => {
          const isActive   = software === option.id;
          const v          = getSoftwareVisual(option.name);
          const c          = COLOR_MAP[v.color] ?? COLOR_MAP.default;
          const Icon       = v.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSoftwareClick(option)}
              className={cn(
                "relative text-left flex flex-col p-4 rounded-2xl border-2 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isActive
                  ? `${c.card} ring-4 ${c.ring}`
                  : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/20 hover:shadow-sm",
              )}
            >
              {/* Active check */}
              {isActive && (
                <span className={cn("absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center", c.check)}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}

              {/* Icon + Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-2 rounded-lg transition-colors", isActive ? c.icon : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground")}>
                  <Icon className="w-4 h-4" />
                </div>
                {v.badge && (
                  <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full", isActive ? c.badge : "bg-muted text-muted-foreground")}>
                    {v.badge}
                  </span>
                )}
              </div>

              {/* Name + Description */}
              <p className="text-sm font-bold text-foreground leading-tight mb-1">{option.name}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {option.description || "Servidor de Minecraft"}
              </p>
            </button>
          );
        })}
      </div>

      {/* Version selector */}
      <div className={cn(
        "rounded-2xl border border-dashed border-border bg-muted/20 overflow-hidden transition-all duration-300",
      )}>
        {/* Version header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-dashed border-border/60">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Versión del servidor</span>
            {identifier && !versionsLoading && (
              <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {versions.filter(v => v !== "latest").length} disponibles
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {selectedOption?.name ?? "—"}
            </span>
            {identifier && (
              <button
                type="button"
                title="Recargar versiones"
                onClick={() => invalidateVersions(identifier)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", versionsFetching && "animate-spin")} />
              </button>
            )}
          </div>
        </div>

        {/* Version body */}
        <div className="px-4 py-3">
          {!identifier ? (
            /* No matching identifier */
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                No hay versiones disponibles vía API para{" "}
                <strong>{selectedOption?.name}</strong>. Se usará <code className="font-mono">latest</code>.
              </span>
            </div>
          ) : versionsLoading ? (
            /* Loading state */
            <div className="flex items-center gap-2.5 h-10">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Cargando versiones de {selectedOption?.name}…</span>
            </div>
          ) : (
            /* Version select */
            // key forces re-render (and resets scroll position) when software changes
            <div key={software} className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-xl bg-background border border-border text-sm font-medium text-foreground focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 outline-none transition-all cursor-pointer appearance-none"
                >
                  {versions.map((v: string) => (
                    <option key={v} value={v}>
                      {v === "latest" ? "latest — más reciente" : `v${v}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

              {/* Version hint */}
              {version === "latest" && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Se instalará la versión más reciente estable.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Java version change warning */}
      {isDirty && javaWillChange && (
        <div
          className={cn(
            "mx-4 mb-3 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
            javaUpgrade
              ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          )}
        >
          <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              {javaUpgrade
                ? `Esta versión requiere Java ${requiredJava}`
                : `Esta versión usa Java ${requiredJava} (tu servidor tiene Java ${currentJava})`}
            </p>
            <p className="text-xs opacity-80">
              {javaUpgrade
                ? `Tu servidor actualmente usa Java ${currentJava}. Al guardar, la imagen Docker se actualizará automáticamente a Java ${requiredJava} y el servidor se reinstalará.`
                : `La versión seleccionada es más antigua y solo necesita Java ${requiredJava}. La imagen Docker se actualizará automáticamente.`}
            </p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <ActionBar
        disabled={!isDirty || updateSoftware.isPending}
        isPending={updateSoftware.isPending}
        onSave={save}
        text="Aplicar cambios"
      />
    </div>
  );
}

// ── Server Properties Panel ───────────────────────────────────────────────────

function ServerPropertiesPanel({
  serviceUuid,
  properties,
}: {
  serviceUuid: string;
  properties: GameServerProperties;
}) {
  const updateProperties = useUpdateGameServerProperties(serviceUuid);
  const [form, setForm]  = useState<GameServerProperties>(properties);

  useEffect(() => {
    setForm(properties);
  }, [properties]);

  const setValue = <K extends keyof GameServerProperties>(key: K, value: GameServerProperties[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    updateProperties.mutate(form, {
      onSuccess: () => toast.success("server.properties guardado. Reinicia el servidor para aplicar."),
      onError:   (err: any) => toast.error(err?.response?.data?.message || "No se pudo guardar server.properties"),
    });
  };

  return (
    <div className="space-y-5">
      {/* Gameplay */}
      <PropertyGroup label="Jugabilidad">
        <SelectSetting
          label="Modo de juego"
          meta="gamemode"
          value={String(form.gamemode)}
          options={GAME_MODES}
          onChange={(v) => setValue("gamemode", v)}
        />
        <SelectSetting
          label="Dificultad"
          meta="difficulty"
          value={String(form.difficulty)}
          options={DIFFICULTIES}
          onChange={(v) => setValue("difficulty", v)}
        />
        <ToggleSetting
          label="PvP"
          meta="pvp"
          description="Combate jugador vs jugador"
          checked={!!form.pvp}
          onChange={(v) => setValue("pvp", v)}
        />
        <ToggleSetting
          label="Volar"
          meta="allow-flight"
          description="Permite volar en modo supervivencia"
          checked={!!form.allow_flight}
          onChange={(v) => setValue("allow_flight", v)}
        />
      </PropertyGroup>

      {/* Players */}
      <PropertyGroup label="Jugadores">
        <NumberSetting
          icon={Users}
          label="Slots máximos"
          meta="max-players"
          value={Number(form.max_players ?? 20)}
          min={1}
          max={500}
          onChange={(v) => setValue("max_players", v)}
        />
        <ToggleSetting
          label="Lista blanca"
          meta="white-list"
          description="Solo jugadores en whitelist pueden entrar"
          checked={!!form.white_list}
          onChange={(v) => setValue("white_list", v)}
        />
        <ToggleSetting
          label="Modo crackeado"
          meta="online-mode: false"
          description="Permite cuentas sin licencia (inseguro)"
          checked={!form.online_mode}
          onChange={(v) => setValue("online_mode", !v)}
          danger
        />
      </PropertyGroup>

      {/* World */}
      <PropertyGroup label="Mundo">
        <NumberSetting
          icon={Shield}
          label="Protección de spawn"
          meta="spawn-protection"
          value={Number(form.spawn_protection ?? 0)}
          min={0}
          max={100}
          onChange={(v) => setValue("spawn_protection", v)}
        />
      </PropertyGroup>

      {/* Identity */}
      <PropertyGroup label="Identidad">
        <div className="col-span-full">
          <Field label="MOTD" hint="motd — mensaje del servidor en la lista">
            <input
              value={String(form.motd ?? "")}
              onChange={(e) => setValue("motd", e.target.value)}
              placeholder="A Minecraft Server"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/15 transition-shadow"
            />
          </Field>
        </div>
        <div className="col-span-full">
          <Field label="Paquete de recursos" hint="resource-pack (URL pública)">
            <input
              value={String(form.resource_pack ?? "")}
              onChange={(e) => setValue("resource_pack", e.target.value)}
              placeholder="https://example.com/pack.zip"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/15 transition-shadow"
            />
          </Field>
        </div>
      </PropertyGroup>

      <ActionBar
        disabled={updateProperties.isPending}
        isPending={updateProperties.isPending}
        onSave={save}
        text="Guardar propiedades"
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ active, icon: Icon, children, onClick }: {
  active: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
      )}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function PropertyGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function NumberSetting({ icon: Icon, label, meta, value, min, max, onChange }: {
  icon: React.ElementType;
  label: string;
  meta: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{meta}</p>
        </div>
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 shrink-0 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-right text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-foreground/15 transition-shadow"
      />
    </div>
  );
}

function SelectSetting({ label, meta, value, options, onChange }: {
  label: string;
  meta: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{meta}</p>
      </div>
      <div className="relative shrink-0 w-36">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-muted/40 pl-2.5 pr-7 py-1.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-foreground/15 cursor-pointer transition-shadow"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function ToggleSetting({ label, meta, description, checked, onChange, danger = false }: {
  label: string;
  meta: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="min-w-0">
        <p className={cn("text-sm font-medium leading-tight", danger && checked ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground font-mono">{meta}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{description}</p>
        )}
      </div>
      {/* Pill toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground/30",
          checked
            ? danger
              ? "bg-rose-500"
              : "bg-emerald-500"
            : "bg-muted",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function ActionBar({ disabled, isPending, onSave, text }: {
  disabled: boolean;
  isPending: boolean;
  onSave: () => void;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Los cambios se aplican después de reiniciar el servidor.
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
          "bg-foreground text-background",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "hover:opacity-90 active:scale-[0.98]",
        )}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {text}
      </button>
    </div>
  );
}
