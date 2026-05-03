import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Code2,
  Loader2,
  RotateCcw,
  Save,
  Server,
  Settings2,
  Shield,
  SlidersHorizontal,
  Users,
  Info,
  ShieldCheck,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGameServerConfiguration,
  useUpdateGameServerProperties,
  useUpdateGameServerSoftware,
  useNestEggs
} from "@/hooks/useGameServer";
import type {
  GameServerProperties,
} from "@/services/serviceService";

type TabId = "software" | "properties";

interface Props {
  serviceUuid: string;
  enabled?: boolean;
  currentSoftware?: string;
  currentVersion?: string;
  restartRequired?: boolean;
  pendingChangesCount?: number;
}

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
  { value: "survival", label: "Supervivencia" },
  { value: "creative", label: "Creativo" },
  { value: "adventure", label: "Aventura" },
  { value: "spectator", label: "Espectador" },
];

const DIFFICULTIES = [
  { value: "peaceful", label: "Pacífico" },
  { value: "easy", label: "Fácil" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Difícil" },
];

export default function GameServerSettings({
  serviceUuid,
  enabled = true,
  currentSoftware,
  currentVersion,
  restartRequired,
  pendingChangesCount,
}: Props) {
  const [tab, setTab] = useState<TabId>("software");
  const configQuery = useGameServerConfiguration(serviceUuid, enabled);
  const optionsQuery = useNestEggs(
  configQuery.data?.runtime?.nest_id,
  !!configQuery.data?.runtime?.nest_id // 👈 clave
);

  const options = optionsQuery.data;
  const config = configQuery.data;
  const runtime = config?.runtime ?? {
    software: currentSoftware || "paper",
    version: currentVersion || "1.21.4",
  };

  const effectiveRestartRequired = config?.restart_required ?? restartRequired;
  const effectivePendingCount = config?.pending_changes_count ?? pendingChangesCount ?? 0;

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Settings2 className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Configuración del juego</h2>
            <p className="text-xs text-muted-foreground truncate">Software, versión y server.properties</p>
          </div>
        </div>
        {effectiveRestartRequired && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <RotateCcw className="w-3 h-3" />
            {effectivePendingCount || 1} cambio{(effectivePendingCount || 1) !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="border-b border-border px-5 pt-3">
        <div className="flex gap-1.5 overflow-x-auto">
          <TabButton active={tab === "software"} icon={Server} onClick={() => setTab("software")}>
            Software
          </TabButton>
          <TabButton active={tab === "properties"} icon={SlidersHorizontal} onClick={() => setTab("properties")}>
            server.properties
          </TabButton>
        </div>
      </div>

      {configQuery.isError && (
        <div className="mx-5 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Endpoints de configuración pendientes. La pantalla queda lista con valores base mientras conectas el backend.
        </div>
      )}

      <div className="p-5">
        {tab === "software" ? (
          <SoftwarePanel serviceUuid={serviceUuid} options={options} runtime={runtime} />
        ) : (
          <ServerPropertiesPanel
            serviceUuid={serviceUuid}
            properties={{ ...DEFAULT_PROPERTIES, ...(config?.server_properties ?? {}) }}
          />
        )}
      </div>
    </section>
  );
}

export function SoftwarePanel({
  serviceUuid,
  options = [],
  runtime,
}: {
  serviceUuid: string;
  options: any[]; // GameServerSoftwareOption[]
  runtime: any;   // GameServerRuntimeConfig
}) {
  const updateSoftware = useUpdateGameServerSoftware(serviceUuid);
  const [software, setSoftware] = useState(runtime.egg_id);
  const [version, setVersion] = useState(runtime.version);
console.log("SoftwarePanel render", { software, version, runtime });
  // Sincronizar estado cuando el runtime cambie (ej: carga inicial)
  useEffect(() => {
    setSoftware(runtime.egg_id);
    setVersion(runtime.version);
  }, [runtime.egg_id, runtime.version]);

  const selectedOption = useMemo(
    () => options.find(opt => opt.id === software) ?? options[0],
    [options, software],
  );

  const versions = selectedOption?.versions || [];
  const isDirty = software !== runtime.egg_id || version !== runtime.version;

  useEffect(() => {
    if (selectedOption && !versions.includes(version)) {
      setVersion(versions[0] ?? "");
    }
  }, [selectedOption, versions]);

  const save = () => {
    updateSoftware.mutate({ software, version }, {
      onSuccess: () => toast.success("Software actualizado. Reinicia para aplicar."),
      onError: (err: any) => toast.error(err?.response?.data?.message || "Error al actualizar"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Grid de Opciones de Software */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const isActive = software === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSoftware(option.id);
                if (!option.versions.includes(version)) {
                  setVersion(option.versions[0] || "");
                }
              }}
              className={cn(
                "relative text-left flex flex-col p-4 rounded-2xl border transition-all duration-200 group",
                isActive
                  ? "border-emerald-500 bg-emerald-500/[0.03] ring-4 ring-emerald-500/10"
                  : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground group-hover:bg-accent"
                )}>
                  {/* Aquí podrías mapear iconos por ID de software (Paper, Forge, etc) */}
                  <ShieldCheck className="w-5 h-5" />
                </div>
                
                {isActive && (
                  <div className="bg-emerald-500 rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm uppercase tracking-tight">
                    {option.name}
                  </span>
                  {option.recommended && (
                    <span className="flex items-center gap-0.5 text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      Pro
                    </span>
                  )}
                </div>
                
                {/* LINE CLAMP: Aquí evitas que la tarjeta crezca infinito */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]" title={option.description}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selector de Versión (Aparece solo si hay software seleccionado) */}
      <div className="bg-muted/30 p-5 rounded-2xl border border-dashed border-border animate-in fade-in slide-in-from-top-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              Configuración de Versión
            </h4>
            <p className="text-xs text-muted-foreground">
              Seleccionaste <span className="font-bold text-foreground">{selectedOption?.name}</span>. Elige la build preferida.
            </p>
          </div>

          <div className="w-full md:w-64">
             <select 
               value={version} 
               onChange={(e) => setVersion(e.target.value)}
               className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
             >
               {versions.map((v: string) => (
                 <option key={v} value={v}>Build {v}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      <ActionBar
        disabled={!isDirty || updateSoftware.isPending}
        isPending={updateSoftware.isPending}
        onSave={save}
        text="Aplicar cambios de software"
      />
    </div>
  );
}

function ServerPropertiesPanel({
  serviceUuid,
  properties,
}: {
  serviceUuid: string;
  properties: GameServerProperties;
}) {
  const updateProperties = useUpdateGameServerProperties(serviceUuid);
  const [form, setForm] = useState<GameServerProperties>(properties);

  useEffect(() => {
    setForm(properties);
  }, [properties]);

  const setValue = <K extends keyof GameServerProperties>(key: K, value: GameServerProperties[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const save = () => {
    updateProperties.mutate(form, {
      onSuccess: () => toast.success("server.properties actualizado. Reinicia el servidor para aplicar cambios."),
      onError: (err: any) => toast.error(err?.response?.data?.message || "No se pudo guardar server.properties"),
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberSetting
          icon={Users}
          label="Espacios"
          meta="max-players"
          value={Number(form.max_players ?? 20)}
          min={1}
          max={500}
          onChange={(value) => setValue("max_players", value)}
        />
        <SelectSetting
          label="Modo de juego"
          meta="gamemode"
          value={String(form.gamemode)}
          options={GAME_MODES}
          onChange={(value) => setValue("gamemode", value)}
        />
        <SelectSetting
          label="Dificultad"
          meta="difficulty"
          value={String(form.difficulty)}
          options={DIFFICULTIES}
          onChange={(value) => setValue("difficulty", value)}
        />
        <ToggleSetting label="Lista blanca" meta="white-list" checked={!!form.white_list} onChange={(value) => setValue("white_list", value)} />
        <ToggleSetting label="Crackeado" meta="online-mode" checked={!form.online_mode} onChange={(value) => setValue("online_mode", !value)} />
        <ToggleSetting label="Volar" meta="allow-flight" checked={!!form.allow_flight} onChange={(value) => setValue("allow_flight", value)} />
        <ToggleSetting label="PvP" meta="pvp" checked={!!form.pvp} onChange={(value) => setValue("pvp", value)} />
        <NumberSetting
          icon={Shield}
          label="Protección de spawn"
          meta="spawn-protection"
          value={Number(form.spawn_protection ?? 0)}
          min={0}
          max={100}
          onChange={(value) => setValue("spawn_protection", value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Field label="MOTD" hint="motd">
          <input
            value={String(form.motd ?? "")}
            onChange={event => setValue("motd", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/15"
          />
        </Field>
        <Field label="Paquete de recursos" hint="resource-pack">
          <input
            value={String(form.resource_pack ?? "")}
            onChange={event => setValue("resource_pack", event.target.value)}
            placeholder="https://example.com/resource-pack.zip"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/15"
          />
        </Field>
      </div>

      <ActionBar
        disabled={updateProperties.isPending}
        isPending={updateProperties.isPending}
        onSave={save}
        text="Guardar propiedades"
      />
    </div>
  );
}

function TabButton({ active, icon: Icon, children, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {hint && <span className="ml-2 text-[11px] text-muted-foreground">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 pr-9 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-foreground/15"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function NumberSetting({ icon: Icon, label, meta, value, min, max, onChange }: any) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{meta}={value}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={event => onChange(Number(event.target.value))}
            className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-right text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-foreground/15"
          />
        </div>
      </div>
    </div>
  );
}

function SelectSetting({ label, meta, value, options, onChange }: any) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{meta}={value}</p>
        </div>
        <div className="w-44 shrink-0">
          <Select value={value} onChange={onChange}>
            {options.map((option: any) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, meta, checked, onChange }: any) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{meta}={checked}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={cn(
            "w-11 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
            checked ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
          )}
        >
          {checked ? <Check className="w-4 h-4" /> : <Code2 className="w-4 h-4 rotate-45" />}
        </button>
      </div>
    </div>
  );
}

function ActionBar({ disabled, isPending, onSave, text }: any) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">Los cambios se aplican después de reiniciar el servidor.</p>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity disabled:opacity-45"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {text}
      </button>
    </div>
  );
}
