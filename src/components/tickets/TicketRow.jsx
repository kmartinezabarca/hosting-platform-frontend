import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ChevronRight, MessageSquare, User } from "lucide-react";
import { priorityText, categoryText, fmtDate } from "../../lib/tickets-ui";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const StatusIndicator = ({ status, className }) => {
  // Configuración centralizada para cada estado.
  // Incluye el texto, el color del punto/texto y el color de fondo de la píldora.
  const statusConfig = {
    open: {
      text: "Abierto",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/15", // Fondo con opacidad
    },
    in_progress: {
      text: "En Progreso",
      textColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/15",
    },
    closed: {
      text: "Cerrado",
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/15",
    },
    default: {
      text: "Desconocido",
      textColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-500/15",
    },
  };

  // Selecciona la configuración correcta o la predeterminada.
  const cfg = statusConfig[status] || statusConfig.default;

  return (
    <div
      className={cx(
        // Clases base para la píldora
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        "ring-1 ring-inset ring-black/10 dark:ring-white/10", // Borde sutil
        
        // Clases dinámicas de color
        cfg.bgColor,
        cfg.textColor,

        // Permite pasar clases personalizadas desde fuera
        className
      )}
    >
      {/* El punto ahora hereda el color del texto del contenedor padre */}
      <span className="h-2 w-2 rounded-full bg-current" />
      
      {/* El texto ya tiene el color correcto gracias a las clases del div principal */}
      <span>{cfg.text}</span>
    </div>
  );
};

const priorityPillClass = (p) => ({
  urgent: "bg-destructive/10 text-destructive ring-destructive/20",
  high: "bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-amber-500/25",
  medium: "bg-primary/10 text-primary ring-primary/20",
  low: "bg-black/5 dark:bg-white/10 text-muted-foreground ring-black/10 dark:ring-white/10",
}[p] || "bg-black/5 dark:bg-white/10 text-muted-foreground ring-black/10 dark:ring-white/10");

const priorityDotClass = (p) => ({
  urgent: "bg-destructive",
  high: "bg-amber-500",
  medium: "bg-primary",
  low: "bg-muted-foreground",
}[p] || "bg-muted-foreground");

export const TicketRow = ({ ticket, onOpenChat }) => {
  const t = ticket;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Abrir ticket #${t.ticket_number} - ${t.subject}`}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenChat?.(t)}
      onClick={() => onOpenChat?.(t)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={clsx(
        "group/ticket-row grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 md:gap-y-0",
        "cursor-pointer border-b last:border-b-0 border-border/60",
        "px-3 sm:px-4 py-4 sm:py-6 bg-background/20",
        "hover:bg-primary/5 transition-colors",
        "focus-within:bg-primary/5"
      )}
    >
      {/* Col 1: Asunto + Descripción */}
      <div className="md:col-span-6 flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
        <span
          className="
            shrink-0 inline-flex items-center justify-center rounded-lg p-2.5
            bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10
          "
        >
          <User className="h-5 w-5 text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            <span className="mr-2 text-muted-foreground">
              #{t.ticket_number}
            </span>
            {t.subject}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {t.description ?? t.last_message?.message}
          </p>

          {/* Meta sólo visible en móvil */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden text-xs">
            <StatusIndicator status={t.status} />
            <span className="text-muted-foreground">
              • {priorityText(t.priority)}
            </span>
            <span className="text-muted-foreground">
              • {categoryText(t.category)}
            </span>
            <span className="ml-auto text-muted-foreground">
              {fmtDate(t.last_reply_at || t.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Col 2: Estado (md+) */}
      <div className="md:col-span-2 hidden md:flex items-center">
        <StatusIndicator status={t.status} />
      </div>

      {/* Col 3: Prioridad + Categoría (lg+) */}
      <div className="md:col-span-2 hidden lg:flex flex-col items-center justify-center space-y-1.5">

        {/* Píldora de Prioridad */}
        <span
          className={`
      inline-flex items-center gap-1.5
      px-2.5 py-1 rounded-full text-xs font-medium
      ring-1 ${priorityPillClass(t.priority)}
    `}
        >
          <span
            className={`size-2 rounded-full ${priorityDotClass(t.priority)}`}
          />
          {priorityText(t.priority)}
        </span>

        {/* Texto de la Categoría */}
        <div className="text-sm text-muted-foreground">
          {categoryText(t.department)}
        </div>
      </div>

      {/* Col 4: Fecha + Respuestas */}
      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
        <div className="hidden xl:block text-right">
          <div className="text-sm font-medium text-foreground">
            {fmtDate(t.last_reply_at || t.created_at)}
          </div>
          <div className="text-xs text-muted-foreground">Última actividad</div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{t.replies_count ?? t.replies_total ?? 0}</span>
        </div>

        {/* Chevron aparece en hover/focus */}
        <span
          className="
            inline-flex items-center justify-center
            rounded-md p-1 text-muted-foreground/70
            opacity-0 group-hover/ticket-row:opacity-100 group-focus/ticket-row:opacity-100
            transition-opacity
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
          "
        >
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
};

export default TicketRow;