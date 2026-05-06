// /components/chat/MessageBubble.jsx
import React from "react";
import { Paperclip, Download } from "lucide-react";
import { fmtDate, fmtBytes, isImageMime } from "../../lib/chatUtils";

export const MessageBubble = ({ message, onImageClick, currentUserId }) => {
  // Determinar si el mensaje es del usuario actual comparando por ID
  const isCurrentUser =
    currentUserId != null
      ? message.user?.id === currentUserId
      : message.user?.role === "client"; // fallback si no se pasa currentUserId

  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const imageAttachments = attachments.filter((a) => isImageMime(a.mime));
  const fileAttachments = attachments.filter((a) => !isImageMime(a.mime));

  // El backend puede devolver `name`, `first_name`/`last_name`, o nada
  const senderName =
    message.user?.name ||
    [message.user?.first_name, message.user?.last_name].filter(Boolean).join(" ") ||
    (isCurrentUser ? "Tú" : "Soporte");

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isCurrentUser ? "bg-foreground text-background" : "bg-muted/20 text-foreground"
        }`}
      >
        <div className="text-xs opacity-80 mb-1">
          {senderName}
        </div>

        {message.message && <div className="whitespace-pre-wrap">{message.message}</div>}

        {attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {imageAttachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageAttachments.map((att, idx) => (
                  <img
                    key={att.url || att.path || idx}
                    src={att.url || att.path}
                    alt={att.name || "adjunto"}
                    className="w-28 h-28 object-cover rounded-lg cursor-zoom-in"
                    onClick={() => onImageClick(att.url || att.path)}
                  />
                ))}
              </div>
            )}

            {fileAttachments.map((att, idx) => (
              <a
                key={`f-${idx}`}
                href={att.url || att.path}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 text-xs rounded-lg px-2 py-1 ${
                  isCurrentUser ? "bg-black/20 text-background" : "bg-black/5 dark:bg-white/10 text-foreground"
                }`}
                download
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{att.name || "archivo"}</span>
                {att.size ? <span className="opacity-70">{fmtBytes(att.size)}</span> : null}
                <Download className="w-3.5 h-3.5 opacity-70" />
              </a>
            ))}
          </div>
        )}

        <div className="text-[11px] opacity-70 mt-1 text-right">{fmtDate(message.created_at)}</div>
      </div>
    </div>
  );
};
