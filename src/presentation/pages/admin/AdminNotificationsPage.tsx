import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bell, BellOff, Archive, ArchiveRestore, Trash2, CheckCheck,
  RefreshCw, ChevronLeft, ChevronRight, ShoppingCart, FileText,
  CreditCard, Wrench, AlertCircle, Info, CheckCircle, XCircle,
  TicketIcon, Package, Megaphone,
} from 'lucide-react';
import {
  useAdminNotifications,
  useAdminNotificationStats,
  useAdminMarkNotificationAsRead,
  useAdminMarkAllNotificationsAsRead,
  useAdminDeleteNotification,
  useAdminArchiveNotification,
  useAdminUnarchiveNotification,
  useAdminArchiveAllRead,
  useAdminDeleteAllArchived,
} from '@application/hooks/useAdminNotifications';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Tab = 'unread' | 'read' | 'archived';

interface Notification {
  id: string;
  type: string;
  data: {
    title?: string;
    message?: string;
    type?: string;
    target?: string;
    [key: string]: any;
  };
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  service_purchased:          { icon: ShoppingCart,   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  service_ready:              { icon: Package,         color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
  service_status_changed:     { icon: Wrench,          color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  invoice_generated:          { icon: FileText,        color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-100 dark:bg-purple-900/30' },
  payment_processed:          { icon: CreditCard,      color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  payment_failed:             { icon: XCircle,         color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30' },
  ticket_replied:             { icon: TicketIcon,      color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
  admin_broadcast:            { icon: Megaphone,       color: 'text-orange-600 dark:text-orange-400',bg: 'bg-orange-100 dark:bg-orange-900/30' },
  admin_service_purchased:    { icon: ShoppingCart,   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  admin_payment_processed:    { icon: CreditCard,      color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  admin_invoice_generated:    { icon: FileText,        color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-100 dark:bg-purple-900/30' },
  info:                       { icon: Info,            color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
  warning:                    { icon: AlertCircle,     color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  success:                    { icon: CheckCircle,     color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  error:                      { icon: XCircle,         color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30' },
};

function getTypeConfig(type?: string) {
  if (!type) return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
  return TYPE_CONFIG[type] ?? { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
}

function relativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es });
  } catch {
    return dateStr;
  }
}

// ─── Componente de ítem ───────────────────────────────────────────────────────

function NotificationItem({
  notification,
  tab,
  onMarkRead,
  onArchive,
  onUnarchive,
  onDelete,
  isPending,
}: {
  notification: Notification;
  tab: Tab;
  onMarkRead: (id: string) => void;
  onArchive:  (id: string) => void;
  onUnarchive:(id: string) => void;
  onDelete:   (id: string) => void;
  isPending:  boolean;
}) {
  const type   = notification.data?.type ?? '';
  const cfg    = getTypeConfig(type);
  const Icon   = cfg.icon;
  const isRead = !!notification.read_at;

  return (
    <div className={`group flex items-start gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!isRead && tab !== 'archived' ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
      {/* Dot no leído */}
      <div className="mt-1 shrink-0 w-2">
        {!isRead && tab !== 'archived' && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
      </div>

      {/* Icono */}
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-slate-900 dark:text-slate-100 truncate ${!isRead && tab !== 'archived' ? 'font-semibold' : ''}`}>
          {notification.data?.title ?? 'Notificación'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {notification.data?.message ?? ''}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {relativeTime(notification.created_at)}
        </p>
      </div>

      {/* Acciones (visibles en hover) */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {tab === 'unread' && (
          <button
            onClick={() => onMarkRead(notification.id)}
            disabled={isPending}
            title="Marcar como leída"
            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}

        {tab !== 'archived' ? (
          <button
            onClick={() => onArchive(notification.id)}
            disabled={isPending}
            title="Archivar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onUnarchive(notification.id)}
            disabled={isPending}
            title="Restaurar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
          >
            <ArchiveRestore className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onDelete(notification.id)}
          disabled={isPending}
          title="Eliminar"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="mt-1 w-2 shrink-0" />
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/5" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('unread');
  const [page, setPage]           = useState(1);

  const params = {
    page,
    ...(activeTab === 'unread'   ? { unread_only: true } : {}),
    ...(activeTab === 'archived' ? { archived: true }    : {}),
  };

  const { data: resp, isLoading, refetch } = useAdminNotifications(params);
  const { data: statsResp }                = useAdminNotificationStats();

  const stats        = (statsResp as any)?.data;
  const notifications: Notification[] = resp?.list ?? [];
  const pagination   = resp?.pagination;

  const markAsRead      = useAdminMarkNotificationAsRead();
  const markAllAsRead   = useAdminMarkAllNotificationsAsRead();
  const archiveOne      = useAdminArchiveNotification();
  const unarchiveOne    = useAdminUnarchiveNotification();
  const archiveAllRead  = useAdminArchiveAllRead();
  const deleteOne       = useAdminDeleteNotification();
  const deleteAllArch   = useAdminDeleteAllArchived();

  const anyPending = markAsRead.isPending || archiveOne.isPending || unarchiveOne.isPending || deleteOne.isPending;

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const unreadCount    = stats?.unread_notifications ?? 0;
  const archivedCount  = stats?.archived_notifications ?? 0;

  const TABS: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'unread',   label: 'No leídas', icon: BellOff,       count: unreadCount   },
    { key: 'read',     label: 'Leídas',    icon: Bell                                },
    { key: 'archived', label: 'Archivadas',icon: Archive,        count: archivedCount },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notificaciones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestiona tus notificaciones del sistema
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sin leer',   value: stats?.unread_notifications  ?? '—', color: 'text-blue-600 dark:text-blue-400'   },
          { label: 'Hoy',        value: stats?.today_notifications   ?? '—', color: 'text-green-600 dark:text-green-400' },
          { label: 'Total',      value: stats?.total_notifications   ?? '—', color: 'text-slate-700 dark:text-slate-300' },
          { label: 'Archivadas', value: stats?.archived_notifications ?? '—', color: 'text-amber-600 dark:text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Panel principal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
          {TABS.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === key
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}

          {/* Acciones bulk (alineadas a la derecha) */}
          <div className="ml-auto flex items-center gap-2 px-4">
            {activeTab === 'unread' && notifications.length > 0 && (
              <>
                <button
                  onClick={() => markAllAsRead.mutate(undefined as any)}
                  disabled={markAllAsRead.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas leídas
                </button>
                <button
                  onClick={() => { markAllAsRead.mutate(undefined as any, { onSuccess: () => archiveAllRead.mutate() }); }}
                  disabled={archiveAllRead.isPending || markAllAsRead.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archivar leídas
                </button>
              </>
            )}
            {activeTab === 'read' && notifications.length > 0 && (
              <button
                onClick={() => archiveAllRead.mutate()}
                disabled={archiveAllRead.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                Archivar todas
              </button>
            )}
            {activeTab === 'archived' && notifications.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('¿Eliminar todas las notificaciones archivadas? Esta acción no se puede deshacer.')) {
                    deleteAllArch.mutate();
                  }
                }}
                disabled={deleteAllArch.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar archivo
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            {activeTab === 'unread'   && <BellOff  className="w-12 h-12 mb-3 opacity-40" />}
            {activeTab === 'read'     && <Bell     className="w-12 h-12 mb-3 opacity-40" />}
            {activeTab === 'archived' && <Archive  className="w-12 h-12 mb-3 opacity-40" />}
            <p className="text-sm font-medium">
              {activeTab === 'unread'   && 'No tienes notificaciones sin leer'}
              {activeTab === 'read'     && 'No tienes notificaciones leídas'}
              {activeTab === 'archived' && 'El archivo está vacío'}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              tab={activeTab}
              isPending={anyPending}
              onMarkRead={(id) => markAsRead.mutate(id)}
              onArchive={(id)  => archiveOne.mutate(id)}
              onUnarchive={(id)=> unarchiveOne.mutate(id)}
              onDelete={(id)   => {
                if (window.confirm('¿Eliminar esta notificación?')) deleteOne.mutate(id);
              }}
            />
          ))
        )}

        {/* Paginación */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Página {pagination.current_page} de {pagination.last_page}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                const p = pagination.current_page <= 3
                  ? i + 1
                  : Math.min(pagination.current_page - 2 + i, pagination.last_page - 4 + i);
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === pagination.current_page
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
