import React from "react";
import { Gamepad2, ChevronDown } from "lucide-react";
import { cn } from "@shared/utils/utils";

interface Game {
  id: number;
  name: string;
  description: string;
  nest: string;
  nest_id: number;
  icon_url?: string | null;
  [key: string]: unknown;
}

interface GameNest {
  nest_id: number;
  nest: string;
  games: Game[];
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
      setExpandedNest(gameNests[0].nest_id);
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
        {gameNests
          .filter((nest) => nest.games && nest.games.length > 0)
          .map((nest) => (
            <div key={nest.nest_id} className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
              {/* Nest Header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedNest(expandedNest === nest.nest_id ? null : nest.nest_id)
                }
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {nest.nest}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    expandedNest === nest.nest_id && "rotate-180"
                  )}
                />
              </button>

              {/* Nest Content - Games */}
              {expandedNest === nest.nest_id && nest.games && nest.games.length > 0 && (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {nest.games.map((game) => {
                    const isSelected = selectedEggId === game.id;
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => onSelectEgg(game.id, game.name)}
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

                        {/* Game Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {game.name}
                          </p>
                          {game.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {game.description}
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
