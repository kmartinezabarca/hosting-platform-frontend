import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import { cn } from "@shared/utils/utils";

interface Egg {
  id: number;
  uuid?: string;
  name: string;
  description: string;
  [key: string]: unknown;
}

interface GameNest {
  id: number;
  name: string;
  eggs: Egg[];
  [key: string]: unknown;
}

interface GameSelectorProps {
  gameNests: GameNest[];
  selectedEggId?: string | number | null;
  onSelectEgg: (eggId: string | number, eggName: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const NEST_COLORS: Record<string, string> = {
  minecraft:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  steam:
    "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  source:
    "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  rust:
    "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  voice:
    "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  gta:
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  grand:
    "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
};

function getNestColor(name: string) {
  const key = Object.keys(NEST_COLORS).find((k) =>
    name.toLowerCase().includes(k)
  );

  return (
    key
      ? NEST_COLORS[key]
      : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20"
  );
}

function getShortDescription(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("paper")) {
    return "Máximo rendimiento vanilla";
  }

  if (lower.includes("purpur")) {
    return "Más personalización y features";
  }

  if (lower.includes("forge")) {
    return "Ideal para mods pesados";
  }

  if (lower.includes("fabric")) {
    return "Ligero y moderno";
  }

  if (lower.includes("neoforge")) {
    return "Nueva generación de Forge";
  }

  if (lower.includes("spigot")) {
    return "Compatible con plugins";
  }

  return "Configuración optimizada";
}

function isRecommended(name: string) {
  const lower = name.toLowerCase();

  return (
    lower.includes("paper") ||
    lower.includes("purpur") ||
    lower.includes("fabric")
  );
}

function NestInitial({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold tracking-wide",
        getNestColor(name)
      )}
    >
      {initials}
    </div>
  );
}

export default function GameSelector({
  gameNests,
  selectedEggId,
  onSelectEgg,
  isLoading = false,
  error = null,
}: GameSelectorProps) {
  const [activeNestId, setActiveNestId] = React.useState<number | null>(null);

  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    if (gameNests.length > 0 && activeNestId === null) {
      setActiveNestId(gameNests[0].id);
    }
  }, [gameNests.length, activeNestId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-32 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const validNests = gameNests.filter((n) => n.eggs?.length > 0);

  const activeNest = validNests.find((n) => n.id === activeNestId);

  const recommendedEggs =
    activeNest?.eggs.filter((egg) => isRecommended(egg.name)) ?? [];

  const otherEggs =
    activeNest?.eggs.filter((egg) => !isRecommended(egg.name)) ?? [];

  const displayedEggs = showAll
    ? [...recommendedEggs, ...otherEggs]
    : [...recommendedEggs, ...otherEggs.slice(0, 3)];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            Selección de plataforma
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Elige tu experiencia de juego
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configuraciones optimizadas para rendimiento, mods y estabilidad.
          </p>
        </div>
      </div>

      {/* PLATFORM SELECTOR */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {validNests.map((nest) => {
          const isActive = activeNestId === nest.id;

          return (
            <button
              key={nest.id}
              type="button"
              onClick={() => {
                setActiveNestId(nest.id);
                setShowAll(false);
              }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
                isActive
                  ? "border-foreground/15 bg-foreground/[0.03] shadow-sm"
                  : "border-border/60 bg-background hover:border-foreground/10 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start gap-3">
                <NestInitial name={nest.name} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {nest.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {nest.eggs.length} opciones disponibles
                  </p>
                </div>
              </div>

              {isActive && (
                <motion.div
                  layoutId="activePlatform"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-foreground"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* GAMES */}
      <AnimatePresence mode="wait">
        {activeNest && (
          <motion.div
            key={activeNest.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >

            {/* SECTION HEADER */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Opciones recomendadas
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Selecciones optimizadas para la mayoría de servidores.
                </p>
              </div>

              <div className="hidden rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground md:block">
                {activeNest.eggs.length} variantes
              </div>
            </div>

            {/* CARDS */}
            <div className="grid gap-3 md:grid-cols-2">
              {displayedEggs.map((egg) => {
                const isSelected =
                  selectedEggId === egg.id ||
                  selectedEggId === egg.uuid;

                const recommended = isRecommended(egg.name);

                return (
                  <button
                    key={egg.id}
                    type="button"
                    onClick={() => onSelectEgg(egg.id, egg.name)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200",
                      isSelected
                        ? "border-foreground/20 bg-foreground/[0.04] shadow-sm"
                        : "border-border/60 bg-background hover:border-foreground/10 hover:bg-muted/20"
                    )}
                  >

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-4">

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">

                          <h4 className="text-base font-semibold">
                            {egg.name}
                          </h4>

                          {recommended && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                              <Sparkles className="h-3 w-3" />
                              Recomendado
                            </div>
                          )}
                        </div>

                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                          {getShortDescription(egg.name)}
                        </p>
                      </div>

                      {/* CHECK */}
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                          isSelected
                            ? "border-foreground bg-foreground"
                            : "border-border bg-background group-hover:border-foreground/30"
                        )}
                      >
                        {isSelected && (
                          <Check
                            className="h-3.5 w-3.5 text-background"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>

                    {/* SELECTED */}
                    {isSelected && (
                      <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />

                        <span className="text-xs font-medium text-muted-foreground">
                          Configuración seleccionada
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SHOW MORE */}
            {otherEggs.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showAll && "rotate-180"
                  )}
                />

                {showAll
                  ? "Mostrar menos opciones"
                  : `Ver ${otherEggs.length - 3} opciones adicionales`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}