import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import ticketsService from '../services/ticketService';
import type { Ticket, TicketMessage, Attachment } from '@/types/models';

// ─── Tipos ────────────────────────────────────────────────────────────────

interface SendPayload {
  text: string;
  files?: File[];
}

interface OpenChatOptions {
  onSent?: (reply: TicketMessage) => void;
}

interface TicketChatContextValue {
  open: boolean;
  minimized: boolean;
  setMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  ticket: Ticket | null;
  messages: TicketMessage[];
  setMessages: React.Dispatch<React.SetStateAction<TicketMessage[]>>;
  sending: boolean;
  openChat: (ticket: Ticket, initialMessages?: TicketMessage[], opts?: OpenChatOptions) => void;
  closeChat: () => void;
  send: (payload: SendPayload) => Promise<void>;
}

// ─── Contexto ─────────────────────────────────────────────────────────────

const TicketChatContext = createContext<TicketChatContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

interface TicketChatProviderProps {
  children: React.ReactNode;
}

export const TicketChatProvider = ({ children }: TicketChatProviderProps) => {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [onSentCb, setOnSentCb] = useState<((reply: TicketMessage) => void) | null>(null);

  const openChat = useCallback(
    (ticketData: Ticket, initialMessages: TicketMessage[] = [], opts?: OpenChatOptions) => {
      setTicket(ticketData ?? null);
      setMessages(initialMessages ?? []);
      setOnSentCb(() => (opts?.onSent ? opts.onSent : null));
      setMinimized(false);
      setOpen(true);
    },
    [],
  );

  const closeChat = useCallback(() => {
    setOpen(false);
  }, []);

  const send = useCallback(
    async ({ text, files = [] }: SendPayload): Promise<void> => {
      const messageText = text.trim();

      if ((!messageText && files.length === 0) || !ticket || sending) return;

      const uuid = ticket.uuid;
      if (!uuid) {
        console.error('TicketChat: No se puede enviar el mensaje, falta el UUID del ticket.');
        return;
      }

      setSending(true);

      // Mensaje optimista
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticAttachments: Attachment[] = files.map((f) => ({
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        mime: f.type,
      }));
      const optimisticMessage: TicketMessage = {
        id: optimisticId,
        message: messageText,
        created_at: new Date().toISOString(),
        user: { id: user?.id, name: user?.first_name ?? 'Tú', role: 'client' },
        attachments: optimisticAttachments,
        __optimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const formData = new FormData();
        formData.append('message', messageText);
        files.forEach((file) => formData.append('attachments[]', file));

        const res = await ticketsService.addReply(uuid, formData);
        const newReplyFromServer = res.data as TicketMessage;

        setMessages((prev) =>
          prev.map((msg) => (msg.id === optimisticId ? newReplyFromServer : msg)),
        );

        // Liberar URLs de objeto local
        optimisticAttachments.forEach((att) => URL.revokeObjectURL(att.url));

        if (onSentCb) onSentCb(newReplyFromServer);
      } catch (error) {
        console.error('Error al enviar la respuesta:', error);
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        optimisticAttachments.forEach((att) => URL.revokeObjectURL(att.url));
      } finally {
        setSending(false);
      }
    },
    [ticket, user, sending, onSentCb],
  );

  const value = useMemo<TicketChatContextValue>(
    () => ({
      open,
      minimized,
      setMinimized,
      ticket,
      messages,
      setMessages,
      sending,
      openChat,
      closeChat,
      send,
    }),
    [open, minimized, ticket, messages, sending, openChat, closeChat, send],
  );

  return (
    <TicketChatContext.Provider value={value}>
      {children}
    </TicketChatContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────

export const useTicketChat = (): TicketChatContextValue => {
  const ctx = useContext(TicketChatContext);
  if (!ctx) throw new Error('useTicketChat debe usarse dentro de un TicketChatProvider');
  return ctx;
};
