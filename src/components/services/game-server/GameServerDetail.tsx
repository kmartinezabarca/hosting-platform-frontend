import React from "react";
import {
  ArrowLeft,
  Gamepad2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import ConnectionCard from "./ConnectionCard";
import PowerControlCard from "./PowerControlCard";
import MetricsCard from "./MetricsCard";
import ModsManager from "./ModsManager";
import GameServerSettings from "./GameServerSettings";
import { GameServerConsole } from "@/components/services/GameServerConsole";
import { useGameServerUsage } from "@/hooks/useGameServer";

export default function GameServerDetail({ service }) {
  const { data: usage } = useGameServerUsage(
    service.uuid,
    service.status === "active",
  );
  const isSuspended = usage?.is_suspended ?? service.status === "suspended";
  const eggName =
    service.egg_name ??
    service.game_server?.egg_name ??
    service.game_server?.software ??
    service.software ??
    "Paper";
  const currentVersion =
    service.game_version ??
    service.game_server?.version ??
    service.version;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* ── Back + Header ── */}
      <div>
        <Link
          to="/client/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis Servicios
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-foreground truncate">
                {service.name}
              </h1>
              <StatusBadge status={service.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {service.plan?.name}
            </p>
          </div>
        </div>
      </div>

      {/* ── Pending / Failed banner ── */}
      {(service.status === "pending" || service.status === "failed") && (
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 ${service.status === "failed"
              ? "border-red-500/30 bg-red-500/[0.04]"
              : "border-amber-500/30 bg-amber-500/[0.04]"
            }`}
        >
          {service.status === "failed" ? (
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <Loader2 className="w-5 h-5 text-amber-500 shrink-0 animate-spin" />
          )}
          <p
            className={`text-sm font-medium ${service.status === "failed"
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
              }`}
          >
            {service.status === "failed"
              ? "Error al crear tu servidor. El equipo de soporte fue notificado."
              : "Tu servidor está siendo aprovisionado. Estará listo en unos minutos…"}
          </p>
        </div>
      )}

      {/* ── Main layout: Console hero + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* ── LEFT: Console (hero) ── */}
        <div className="lg:col-span-3">
          <GameServerConsole
            serviceUuid={service.uuid}
            enabled={service.status === "active"}
            className="h-[560px]"
          />
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Power Control */}
          {service.status === "active" && (
            <PowerControlCard
              serviceUuid={service.uuid}
              isSuspended={isSuspended}
            />
          )}

          {/* Connection info */}
          <ConnectionCard
            connection={service.connection}
            status={service.status}
          />

          {/* Real-time metrics */}
          {service.status === "active" && (
            <MetricsCard
              serviceUuid={service.uuid}
              planLimits={service.plan?.limits}
            />
          )}

          {/* Plan resources */}
          {service.plan?.limits && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Recursos del Plan
              </h3>
              <div className="space-y-2.5">
                <PlanRow
                  label="RAM"
                  value={
                    service.plan.limits.memory >= 1024
                      ? `${service.plan.limits.memory / 1024} GB`
                      : `${service.plan.limits.memory} MB`
                  }
                />
                <PlanRow
                  label="CPU"
                  value={`${service.plan.limits.cpu / 100} núcleo(s)`}
                />
                <PlanRow
                  label="Disco"
                  value={
                    service.plan.limits.disk >= 1024
                      ? `${(service.plan.limits.disk / 1024).toFixed(0)} GB`
                      : `${service.plan.limits.disk} MB`
                  }
                />
                {service.plan?.feature_limits && (
                  <>
                    <PlanRow
                      label="Bases de datos"
                      value={String(service.plan.feature_limits.databases)}
                    />
                    <PlanRow
                      label="Backups"
                      value={String(service.plan.feature_limits.backups)}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Management workspace ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <GameServerSettings
          serviceUuid={service.uuid}
          enabled={service.status === "active"}
          currentSoftware={String(eggName).toLowerCase()}
          currentVersion={currentVersion}
          restartRequired={service.restart_required}
          pendingChangesCount={service.pending_changes_count}
        />

        <ModsManager
          serviceUuid={service.uuid}
          eggName={eggName}
          restartServerRequired={service.restart_required}
          pendingChangesCount={service.pending_changes_count}
        />
      </div>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: {
      label: "Creando…",
      cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    active: {
      label: "En línea",
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    suspended: {
      label: "Suspendido",
      cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
    terminated: {
      label: "Terminado",
      cls: "bg-muted text-muted-foreground border-border",
    },
    failed: {
      label: "Error",
      cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
  };
  const info = map[status] ?? map.active;
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-medium ${info.cls}`}
    >
      {info.label}
    </span>
  );
}
