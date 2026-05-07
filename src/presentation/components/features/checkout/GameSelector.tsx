import React from "react";
import { Gamepad2, ChevronDown } from "lucide-react";
import { cn } from "@shared/utils/utils";

interface Egg {
  id: number;
  uuid?: string;
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

export default function GameSelector({
  gameNests,
  selectedEggId,
  onSelectEgg,
  isLoading = false,
  error = null,
}: GameSelectorProps) {
  const [expandedNest, setExpandedNest] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (gameNests.length > 0 && expandedNest === null) {
      setExpandedNest(gameNests[0].id);
    }
  }, [gameNests.length]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-muted/30 animate-pulse">
        <div className="h-10 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/10">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!gameNests || gameNests.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-muted/30">
        <p className="text-sm text-muted-foreground">Cargando juegos disponibles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
        Selecciona el Juego <span className="text-primary">*</span>
      </label>

      <div className="space-y-2">
        {gameNests.map((nest) => (
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
            {expandedNest === nest.id && (
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
