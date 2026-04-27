import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Server, Globe, CreditCard, MessageSquare, Activity,
  TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw,
  Plus, ArrowRight, Gamepad2, Database, Clock, CheckCircle,
  XCircle, Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats, useDashboardServices, useDashboardActivity } from '@/hooks/useDashboard';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtRelative = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return fmtDate(d);
};

// ─── Stat card ───────────────────────────────────────────────────────────────

const STAT_ICONS = {
  services: Server,
  domains: Globe,
  spend: CreditCard,
  tickets: MessageSquare,
};

const STAT_COLORS = {
  services: 'text-blue-500',
  domains:  'text-emerald-500',
  spend:    'text-violet-500',
  tickets:  'text-amber-500',
};

function TrendBadge({ current, previous }) {
  if (previous == null || current == null) return null;
  const delta = current - previous;
  if (delta === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  return delta > 0
    ? <TrendingUp  className="h-3 w-3 text-emerald-500" />
    : <TrendingDown className="h-3 w-3 text-rose-500" />;
}

function StatCard({ type, label, value, subtitle, current, previous, loading }) {
  const Icon = STAT_ICONS[type] ?? Activity;
  const color = STAT_COLORS[type] ?? 'text-muted-foreground';

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-36" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value ?? '—'}</p>
      {subtitle && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <TrendBadge current={current} previous={previous} />
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Service status ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:      { label: 'Activo',      dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  pending:     { label: 'Pendiente',   dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400' },
  suspended:   { label: 'Suspendido',  dot: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400' },
  maintenance: { label: 'Mantenimiento', dot: 'bg-blue-400',  text: 'text-blue-600 dark:text-blue-400' },
  failed:      { label: 'Error',       dot: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400' },
  terminated:  { label: 'Terminado',   dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
};

const TYPE_ICONS = {
  shared_hosting: Globe,
  vps:            Server,
  game_server:    Gamepad2,
  database:       Database,
};

function ServiceRow({ service }) {
  const cfg = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.terminated;
  const Icon = service.is_game_server ? Gamepad2 : (TYPE_ICONS[service.type] ?? Server);

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0 hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 rounded-lg bg-muted shrink-0">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{service.type?.replace('_', ' ')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <Link
          to={`/client/services/${service.uuid}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Gestionar
        </Link>
      </div>
    </div>
  );
}

// ─── Activity item ────────────────────────────────────────────────────────────

const ACTIVITY_ICONS = {
  payment:         { Icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10' },
  ticket:          { Icon: MessageSquare, color: 'text-blue-500 bg-blue-500/10' },
  service_created: { Icon: Server, color: 'text-violet-500 bg-violet-500/10' },
  service_renewal: { Icon: RefreshCw, color: 'text-amber-500 bg-amber-500/10' },
  invoice:         { Icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
  alert:           { Icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
};

function ActivityItem({ item }) {
  const key = item.type ?? 'alert';
  const { Icon, color } = ACTIVITY_ICONS[key] ?? ACTIVITY_ICONS.alert;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/60 last:border-0">
      <div className={`p-1.5 rounded-lg shrink-0 ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{item.description}</p>
        {item.meta && <p className="text-xs text-muted-foreground mt-0.5">{item.meta}</p>}
      </div>
      <p className="text-xs text-muted-foreground shrink-0 mt-0.5">{fmtRelative(item.created_at)}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ClientDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? (user as any)?.name ?? 'Usuario';

  const { data: stats,    isLoading: loadingStats,    error: statsError    } = useDashboardStats();
  const { data: services, isLoading: loadingServices, error: servicesError } = useDashboardServices();
  const { data: activity, isLoading: loadingActivity                        } = useDashboardActivity();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' :
    hour < 18 ? 'Buenas tardes' :
               'Buenas noches';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí está el resumen de tu cuenta.
          </p>
        </div>
        <Link
          to="/client/contract-service"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-foreground text-background hover:opacity-90 active:translate-y-px transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Contratar Servicio
        </Link>
      </motion.div>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          type="services"
          label="Servicios Activos"
          value={stats?.active_services ?? (loadingStats ? null : '0')}
          subtitle={stats?.services_change != null ? `${stats.services_change > 0 ? '+' : ''}${stats.services_change} este mes` : 'Sin cambios recientes'}
          current={stats?.active_services}
          previous={stats?.active_services != null ? stats.active_services - (stats.services_change ?? 0) : null}
          loading={loadingStats}
        />
        <StatCard
          type="domains"
          label="Dominios"
          value={stats?.total_domains ?? (loadingStats ? null : '0')}
          subtitle="Dominios registrados"
          current={undefined}
          previous={undefined}
          loading={loadingStats}
        />
        <StatCard
          type="spend"
          label="Gasto Mensual"
          value={stats?.monthly_spend != null ? fmt(stats.monthly_spend) : (loadingStats ? null : fmt(0))}
          subtitle={stats?.spend_vs_last_month != null
            ? `${stats.spend_vs_last_month > 0 ? '+' : ''}${fmt(stats.spend_vs_last_month)} vs mes anterior`
            : 'Ciclo de facturación actual'}
          current={stats?.monthly_spend}
          previous={stats?.monthly_spend != null ? stats.monthly_spend - (stats.spend_vs_last_month ?? 0) : null}
          loading={loadingStats}
        />
        <StatCard
          type="tickets"
          label="Tickets de Soporte"
          value={stats?.open_tickets ?? (loadingStats ? null : '0')}
          subtitle={stats?.open_tickets === 0
            ? '¡Todo resuelto!'
            : `${stats?.open_tickets ?? 0} abierto${stats?.open_tickets !== 1 ? 's' : ''}`}
          current={undefined}
          previous={undefined}
          loading={loadingStats}
        />
      </div>

      {/* ─── Error de stats ──────────────────────────────────────── */}
      {statsError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          No se pudieron cargar las estadísticas. Intenta recargar la página.
        </div>
      )}

      {/* ─── Servicios + Actividad ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Servicios recientes */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              Tus Servicios
            </h2>
            <Link
              to="/client/services"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingServices ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          ) : servicesError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <XCircle className="h-8 w-8 text-rose-400 mb-2" />
              <p className="text-sm text-muted-foreground">No se pudieron cargar los servicios.</p>
            </div>
          ) : !services?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Server className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No tienes servicios aún</p>
              <p className="text-xs text-muted-foreground mb-4">Contrata tu primer servicio y empieza hoy.</p>
              <Link
                to="/client/contract-service"
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90 transition"
              >
                Contratar ahora
              </Link>
            </div>
          ) : (
            <div>
              {services.slice(0, 5).map((svc) => (
                <ServiceRow key={svc.uuid} service={svc} />
              ))}
              {services.length > 5 && (
                <Link
                  to="/client/services"
                  className="block text-center text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
                >
                  +{services.length - 5} servicios más
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Actividad reciente */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
        >
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Actividad Reciente
          </h2>

          {loadingActivity ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5">
                  <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !activity?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
            </div>
          ) : (
            <div>
              {activity.slice(0, 8).map((item, i) => (
                <ActivityItem key={item.id ?? i} item={item} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Quick actions ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { to: '/client/services',         Icon: Server,       label: 'Mis Servicios'  },
          { to: '/client/invoices',          Icon: CreditCard,   label: 'Facturas'       },
          { to: '/client/tickets',           Icon: MessageSquare,label: 'Soporte'        },
          { to: '/client/contract-service',  Icon: Plus,         label: 'Nuevo Servicio' },
        ].map(({ to, Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-foreground/20 transition-all duration-150 group"
          >
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </motion.div>

    </div>
  );
}

export default ClientDashboardPage;
