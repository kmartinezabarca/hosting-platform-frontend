// /components/chat/TicketChatDock.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";

import { TicketChatHeader } from "../chat/TicketChatHeader";
import { MessageList } from "../chat/MessageList";
import { ChatComposer } from "../chat/ChatComposer";
import { Lightbox } from "../chat/Lightbox";
import { NewTicketForm } from "../chat/NewTicketForm";
import { useFileHandling } from "../../hooks/useFileHandling";
import { useChatInteractions } from "../../hooks/useChatInteractions";
import { useAuth } from "../../context/AuthContext";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILES_PER_MESSAGE, isImageMime } from "../../lib/chatUtils";

/**
 * props:
 * - open            : boolean — si es true renderiza (burbuja o panel)
 * - onClose         : fn — llamado al cerrar (en modo soporte solo minimiza)
 * - ticket          : objeto ticket/sala | null (null mientras carga)
 * - messages        : array
 * - messagesError   : Error | null
 * - isLoading       : boolean — true mientras se obtiene la sala de soporte
 * - onSend          : async ({ text, files: File[] }) => void
 * - sending         : boolean
 * - minimized       : boolean
 * - onMinimizeChange: fn(boolean)
 * - showNewTicketBtn: boolean — muestra el botón SquarePen para abrir el formulario
 */
const TicketChatDock = ({
  open,
  onClose,
  ticket,
  messages = [],
  messagesError = null,
  isLoading = false,
  onSend,
  sending = false,
  minimized = false,
  onMinimizeChange = () => {},
  showNewTicketBtn = false,
}: any) => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  // Vista actual: "chat" | "new-ticket"
  const [view, setView] = useState("chat");

  const { lightbox, openLightbox, closeLightbox, navigateLightbox } =
    useChatInteractions(open, minimized, onClose);

  const {
    files,
    fileErrors,
    isDragging,
    handleIncomingFiles,
    removeFile,
    clearFiles,
    dropRef,
    fileInputRef,
  } = useFileHandling({
    allowedTypes: ALLOWED_MIME_TYPES,
    maxSizeMB: MAX_FILE_SIZE_MB,
    fileLimit: MAX_FILES_PER_MESSAGE,
    disabled: sending || ticket?.status === "closed",
  });

  const handleSubmit = async ({ text }) => {
    if (!text && files.length === 0) return;
    await onSend?.({ text, files: files.map((f) => f.file) });
    clearFiles();
  };

  const body = typeof window !== "undefined" ? document.body : null;
  if (!body || !open) return null;

  const allImageAttachments = messages
    .flatMap((m) => (m.attachments || []).filter((a) => isImageMime(a.mime)))
    .map((a) => a.url || a.path);

  const handleImageClick = (imgUrl) => {
    const index = allImageAttachments.findIndex((url) => url === imgUrl);
    if (index !== -1) openLightbox(allImageAttachments, index);
  };

  /* ── Contenido del panel según estado ─────────────────────────── */
  const renderPanelBody = () => {
    // Formulario de nuevo ticket
    if (view === "new-ticket") {
      return (
        <NewTicketForm
          onCancel={() => setView("chat")}
          onCreated={() => {
            // Regresa al chat tras crear exitosamente (el form muestra su propio estado de éxito)
          }}
        />
      );
    }

    // Cargando sala de soporte
    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Loader2 className="w-7 h-7 text-muted-foreground/50 animate-spin" />
          <p className="text-sm text-muted-foreground">Conectando con soporte...</p>
        </div>
      );
    }

    // Error al cargar mensajes
    if (messagesError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-destructive opacity-70" />
          <p className="text-sm font-medium text-foreground">
            No se pudieron cargar los mensajes
          </p>
          <p className="text-xs text-muted-foreground">
            {messagesError?.response?.status === 403
              ? "Sin permisos para acceder a este chat."
              : "Error de conexión. Intenta recargar la página."}
          </p>
        </div>
      );
    }

    // Sin sala de soporte disponible (no error, solo sin datos)
    if (!ticket && !isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Soporte no disponible</p>
          <p className="text-xs text-muted-foreground">
            No se encontró una sala de soporte activa.
          </p>
        </div>
      );
    }

    // Chat normal
    return (
      <MessageList
        messages={messages}
        onImageClick={handleImageClick}
        currentUserId={currentUserId}
      />
    );
  };

  return createPortal(
    <>
      {/* ── Burbuja flotante (minimizado) ──────────────────────────── */}
      <AnimatePresence>
        {minimized && (
          <motion.button
            key="dock-bubble"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => onMinimizeChange(false)}
            className="pointer-events-auto fixed bottom-5 right-5 z-[120] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl grid place-items-center"
            title="Abrir chat de soporte"
            aria-label="Abrir chat de soporte"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Panel expandido ────────────────────────────────────────── */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            key="dock-panel"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="pointer-events-auto fixed bottom-5 right-5 z-[120] flex flex-col w-[min(440px,94vw)] h-[min(72vh,660px)] rounded-2xl overflow-hidden border border-border bg-card dark:bg-[#0f1115] shadow-2xl"
          >
            <TicketChatHeader
              ticket={view === "new-ticket" ? null : ticket}
              headerTitle={view === "new-ticket" ? "Nuevo ticket" : undefined}
              headerSubtitle={view === "new-ticket" ? "Cuéntanos en qué podemos ayudarte" : undefined}
              onMinimize={() => onMinimizeChange(true)}
              onClose={onClose}
              onNewChat={showNewTicketBtn && view === "chat" ? () => setView("new-ticket") : undefined}
            />

            {renderPanelBody()}

            {/* Solo mostrar composer si hay sala, no hay error y estamos en vista de chat */}
            {view === "chat" && !isLoading && ticket && !messagesError && (
              <ChatComposer
                onSubmit={handleSubmit}
                sending={sending}
                canReply={ticket?.status !== "closed"}
                dropRef={dropRef}
                fileInputRef={fileInputRef}
                isDragging={isDragging}
                files={files}
                fileErrors={fileErrors}
                removeFile={removeFile}
                handleIncomingFiles={handleIncomingFiles}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Lightbox
        isOpen={lightbox.open}
        items={lightbox.items}
        startIndex={lightbox.index}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
      />
    </>,
    body
  );
};

export default TicketChatDock;
