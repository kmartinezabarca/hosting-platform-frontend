import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, MessageSquare, User } from "lucide-react";
import { statusText, priorityText, categoryText, fmtDate } from "../../lib/tickets-ui";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    open:         { text: "Abierto",        dot: "bg-blue-500"   },
    in_progress:  { text: "En Progreso",    dot: "bg-yellow-500" },
    closed:       { text: "Cerrado",        dot: "bg-green-500"  },
    default:      { text: "Desconocido",    dot: "bg-gray-400"   },
  };
  const cfg = statusConfig[status] || statusConfig.default;
  return (
    <div className="flex items-center gap-2">
      <span className={cx("h-2 w-2 rounded-full", cfg.dot)} />
      <span className="text-sm font-medium text-foreground">{cfg.text}</span>
    </div>
  );
};

const TicketRow = ({ ticket, onOpenChat }) => {
  const t = ticket;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenChat?.(t)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onOpenChat?.(t)}
      className={cx(
        // grid responsive + espaciado responsive
        "group/ticket-row grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 md:gap-y-0",
        "cursor-pointer border-b border-border/60 bg-transparent px-3 sm:px-4 py-4 sm:py-6",
        "transition-colors duration-200 hover:bg-muted/50"
      )}
    >
      {/* Col 1: Asunto y Descripción (full en móvil, 6 cols en md+) */}
      <div className="md:col-span-6 flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="shrink-0 text-muted-foreground">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            <span className="mr-2 text-muted-foreground">#{t.ticket_number}</span>
            {t.subject}
          </p>
          <p className="truncate text-xs text-muted-foreground">{t.description ?? t.last_message.message}</p>

          {/* Meta SOLO en móvil (cuando las demás columnas se ocultan) */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden text-xs">
            <StatusIndicator status={t.status} />
            <span className="text-muted-foreground">• {priorityText(t.priority)}</span>
            <span className="text-muted-foreground">• {categoryText(t.category)}</span>
            <span className="ml-auto text-muted-foreground">
              {fmtDate(t.last_reply_at || t.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Col 2: Estado (se muestra desde md) */}
      <div className="md:col-span-2 hidden md:block">
        <StatusIndicator status={t.status} />
      </div>

      {/* Col 3: Prioridad y Categoría (se muestra desde lg) */}
      <div className="md:col-span-2 hidden lg:block">
        <div className="text-sm font-medium text-foreground">{priorityText(t.priority)}</div>
        <div className="text-xs text-muted-foreground">{categoryText(t.category)}</div>
      </div>

      {/* Col 4: Fecha y Respuestas (siempre visible; layout se adapta) */}
      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
        <div className="hidden xl:block text-right">
          <div className="text-sm font-medium text-foreground">
            {fmtDate(t.last_reply_at || t.created_at)}
          </div>
          <div className="text-xs text-muted-foreground">Última actividad</div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{t.replies_count ?? t.replies_total}</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover/ticket-row:opacity-100" />
      </div>
    </motion.div>
  );
};

export default TicketRow;