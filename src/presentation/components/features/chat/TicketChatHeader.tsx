// /components/chat/TicketChatHeader.jsx
import React from "react";
import { X, Minus, Headphones, SquarePen } from "lucide-react";
import { getStatusBadge } from "../../lib/chatUtils";

export const TicketChatHeader = ({
  ticket,
  onMinimize,
  onClose,
  onNewChat,
  headerTitle,
  headerSubtitle,
}) => {
  const headerBadge = getStatusBadge(ticket?.status);

  // Permite sobreescribir título/subtítulo desde el padre (ej: vista "Nuevo ticket")
  const title = headerTitle ?? (ticket
    ? `#${ticket.ticket_number ?? ticket.id} ${ticket.subject ?? ''}`
    : 'Soporte ROKE');

  const subtitle = headerSubtitle ?? (
    ticket?.priority
      ? `Prioridad: ${ticket.priority.replace('_', ' ')}`
      : (!ticket ? '¿En qué podemos ayudarte?' : null)
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Ícono de soporte cuando no hay ticket específico */}
        {!ticket && (
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate text-foreground">
              {title}
            </span>
            {ticket?.status && !headerTitle && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${headerBadge.cls}`}>
                {headerBadge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-0.5 capitalize">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onNewChat && (
          <button
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={onNewChat}
            title="Nuevo ticket de soporte"
            aria-label="Abrir nuevo ticket"
          >
            <SquarePen className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <button
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          onClick={onMinimize}
          title="Minimizar"
          aria-label="Minimizar chat"
        >
          <Minus className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar chat"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
