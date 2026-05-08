import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import { cn } from "@shared/utils/utils";

interface Game {
  id: number;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  [key: string]: unknown;
}

interface GameNest {
  id: number;
  uuid?: string;
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
    if (gameNests.length > 0 && expandedNest === null) {
      setExpandedNest(gameNests[0].id);
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
        {gameNests.filter((nest) => nest.eggs && nest.eggs.length > 0).map((nest) => (
          <div key={nest.id} className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
            {/* Nest Header */}
            <button
              type="button"
              onClick={() =>
                setExpandedNest(expandedNest === nest.id ? null : nest.id)
              }
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {nest.name}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedNest === nest.id && "rotate-180"
                )}
              />
            </button>

            {/* Nest Content - Eggs */}
            {expandedNest === nest.id && nest.eggs && nest.eggs.length > 0 && (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {nest.eggs.map((egg) => {
                  const isSelected = selectedEggId === egg.id || selectedEggId === egg.uuid;
                  return (
                    <button
                      key={egg.id}
                      type="button"
                      onClick={() => onSelectEgg(egg.id, egg.name)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 dark:bg-primary/15"
                          : "hover:bg-muted/30"
                      )}
                    >
                      {/* Radio Button */}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-black/20 dark:border-white/20"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Egg Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {egg.name}
                        </p>
                        {egg.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {egg.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}