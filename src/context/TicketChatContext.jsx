// TicketChatContext.jsx

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import TicketChatDock from "../components/tickets/TicketChatDock";
import ticketsService from "../services/tickets"; // Este servicio lo vamos a revisar en el Paso 2

const TicketChatContext = createContext(null);

export const TicketChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [onSentCb, setOnSentCb] = useState(null);

  const openChat = useCallback((ticketData, initialMessages = [], opts) => {
    setTicket(ticketData || null);
    setMessages(initialMessages || []);
    setOnSentCb(() => (opts && typeof opts.onSent === "function" ? opts.onSent : null));
    setMinimized(false);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setOpen(false);
    // No reseteamos el ticket ni los mensajes para que al reabrir siga el contexto
  }, []);

  const send = useCallback(async ({ text, files }) => {
    const messageText = (text || "").trim();
    const fileList = files || [];

    if ((!messageText && fileList.length === 0) || !ticket || sending) {
      return;
    }

    const uuid = ticket.uuid;
    if (!uuid) {
      console.error("TicketChat: No se puede enviar el mensaje, falta el UUID del ticket.");
      return;
    }

    setSending(true);

    // --- Mensaje Optimista MEJORADO ---
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      message: messageText,
      created_at: new Date().toISOString(),
      user: { id: user?.id, name: user?.first_name || "Tú", role: "client" },
      attachments: fileList.map(f => ({
        url: URL.createObjectURL(f), // URL local para la vista previa
        name: f.name,
        size: f.size,
        mime: f.type,
      })),
      __optimistic: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // --- Preparación de datos para la API ---
      const formData = new FormData();
      formData.append("message", messageText);
      fileList.forEach((file) => {
        // El backend debe esperar un array llamado 'attachments'
        formData.append("attachments[]", file);
      });

      // --- Llamada al servicio (que ahora debe manejar FormData) ---
      const res = await ticketsService.addReply(uuid, formData);
      const newReplyFromServer = res.data; // Asumimos que la API devuelve el nuevo mensaje creado

      // Reemplazar el mensaje optimista con la respuesta real del servidor
      setMessages(prev =>
        prev.map(msg => (msg.id === optimisticId ? newReplyFromServer : msg))
      );

      // Limpiar las URLs de los objetos locales para liberar memoria
      optimisticMessage.attachments.forEach(att => URL.revokeObjectURL(att.url));

      // Ejecutar callback si existe
      if (onSentCb) onSentCb(newReplyFromServer);

    } catch (error) {
      console.error("Error al enviar la respuesta:", error);
      // Si falla, eliminamos el mensaje optimista
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
      // Limpiar las URLs de los objetos locales
      optimisticMessage.attachments.forEach(att => URL.revokeObjectURL(att.url));
      // Aquí podrías mostrar una notificación de error al usuario (Toast)
    } finally {
      setSending(false);
    }
  }, [ticket, user, sending, onSentCb]);

  const value = useMemo(
    () => ({ open, minimized, setMinimized, ticket, messages, setMessages, sending, openChat, closeChat, send }),
    [open, minimized, ticket, messages, sending, openChat, closeChat, send]
  );

  return (
    <TicketChatContext.Provider value={value}>
      {children}
      <TicketChatDock
        open={open}
        onClose={closeChat}
        minimized={minimized}
        onMinimizeChange={setMinimized}
        ticket={ticket}
        messages={messages}
        onSend={send}
        sending={sending}
      />
    </TicketChatContext.Provider>
  );
};

export const useTicketChat = () => {
  const ctx = useContext(TicketChatContext);
  if (!ctx) throw new Error("useTicketChat debe usarse dentro de un TicketChatProvider");
  return ctx;
};
