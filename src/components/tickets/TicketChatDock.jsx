// /components/chat/TicketChatDock.jsx
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

import { TicketChatHeader } from "../chat/TicketChatHeader";
import { MessageList } from "../chat/MessageList";
import { ChatComposer } from "../chat/ChatComposer";
import { Lightbox } from "../chat/Lightbox";
import { useFileHandling } from "../../hooks/useFileHandling";
import { useChatInteractions } from "../../hooks/useChatInteractions";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILES_PER_MESSAGE, isImageMime } from "../../lib/chatUtils";

/**
 * props:
 * - open, onClose
 * - ticket: { ticket_number, subject, status, priority }
 * - messages: [{ id, message, created_at, user:{name, role}, attachments?: [{url,name,mime,size}] }]
 * - onSend: async ({ text, files: File[] }) => void
 * - sending: boolean
 * - minimized, onMinimizeChange
 */
const TicketChatDock = ({
  open,
  onClose,
  ticket,
  messages = [],
  onSend,
  sending = false,
  minimized = false,
  onMinimizeChange = () => {},
}) => {
  const { lightbox, openLightbox, closeLightbox, navigateLightbox } = useChatInteractions(open, minimized, onClose);
  
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
    
    // onSend es una promesa, esperamos a que se resuelva
    await onSend?.({
      text,
      files: files.map((f) => f.file),
    });
    
    // Limpiamos los archivos solo después de un envío exitoso
    clearFiles();
  };

  const body = typeof window !== "undefined" ? document.body : null;
  if (!body || !open) return null;

  const allImageAttachments = messages.flatMap(m => 
    (m.attachments || []).filter(a => isImageMime(a.mime))
  ).map(a => a.url || a.path);

  const handleImageClick = (imgUrl) => {
    const index = allImageAttachments.findIndex(url => url === imgUrl);
    if (index !== -1) openLightbox(allImageAttachments, index);
  };

  return createPortal(
    <>
      <AnimatePresence>
        {minimized && (
          <motion.button
            key="dock-bubble"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => onMinimizeChange(false)}
            className="pointer-events-auto fixed bottom-5 right-5 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl grid place-items-center"
            title={`Abrir chat #${ticket?.ticket_number}`}
            aria-label="Abrir chat"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!minimized && (
          <motion.div
            key="dock-panel"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="pointer-events-auto fixed bottom-5 right-5 flex flex-col w-[min(440px,94vw)] h-[min(72vh,660px)] rounded-2xl overflow-hidden border border-border bg-card dark:bg-[#0f1115] shadow-2xl"
          >
            <TicketChatHeader
              ticket={ticket}
              onMinimize={() => onMinimizeChange(true)}
              onClose={onClose}
            />
            <MessageList
              messages={messages}
              onImageClick={handleImageClick}
            />
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
