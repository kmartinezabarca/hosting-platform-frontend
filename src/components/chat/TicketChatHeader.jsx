// /components/chat/TicketChatHeader.jsx
import React from "react";
import { X, Minus } from "lucide-react";
import { getStatusBadge } from "../../lib/chatUtils";

export const TicketChatHeader = ({ ticket, onMinimize, onClose }) => {
  const headerBadge = getStatusBadge(ticket?.status);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate text-foreground">
            #{ticket?.id} {ticket?.subject}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${headerBadge.cls}`}>
            {headerBadge.text}
          </span>
        </div>
        {ticket?.priority && (
          <div className="text-xs text-muted-foreground mt-0.5 capitalize">
            Prioridad: {ticket.priority.replace("_", " ")}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          onClick={onMinimize}
          title="Minimizar"
          aria-label="Minimizar chat"
        >
          <Minus className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
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
