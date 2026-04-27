import React, { useState, useEffect } from "react";
import TicketChatDock from "./TicketChatDock";
import { useSupportChat } from "@/hooks/useSupportChat";
import { useAdminChat } from "@/hooks/useAdminChat";
import { useAuth } from "@/context/AuthContext";
import { useTicketChat } from "@/context/TicketChatContext";

// Prefiere UUID para las rutas del backend (policy-safe en Laravel)
function roomRouteKey(room) {
  return room?.uuid || room?.id;
}

// ──────────────────────────────────────────────
// ADMIN
// ──────────────────────────────────────────────
function AdminDock() {
  const {
    selectedChatRoom,
    messages,
    isLoadingMessages,
    sending,
    sendMessage,
    closeChatRoom,
  } = useAdminChat({ enabled: true });

  const [minimized, setMinimized] = useState(true);

  const open = Boolean(selectedChatRoom);

  const handleClose = () => {
    if (selectedChatRoom) closeChatRoom(selectedChatRoom.id);
  };

  if (!open) return null;

  return (
    <TicketChatDock
      open={open}
      onClose={handleClose}
      ticket={selectedChatRoom}
      messages={messages ?? []}
      onSend={({ text, files }) =>
        selectedChatRoom &&
        sendMessage({ chatRoomId: selectedChatRoom.id, text, files })
      }
      sending={sending || isLoadingMessages}
      minimized={minimized}
      onMinimizeChange={setMinimized}
    />
  );
}

// ──────────────────────────────────────────────
// CLIENTE
// La burbuja flotante es SIEMPRE visible en toda la app.
// Maneja dos modos de contenido:
//   A) Ticket específico — cuando el usuario abre un ticket desde /tickets
//   B) Sala de soporte   — chat de soporte general (siempre disponible)
// ──────────────────────────────────────────────
function ClientDock() {
  // Modo A: ticket específico (contexto global)
  const ticketCtx = useTicketChat();
  const ticketOpen = ticketCtx?.open ?? false;

  // Modo B: sala de soporte persistente
  const {
    supportRoom,
    messages: roomMessages,
    isLoadingMessages,
    isLoadingRoom,
    messagesError,
    roomError,
    sending: roomSending,
    sendMessage,
  } = useSupportChat({ enabled: true });

  // Un único estado de minimizado para ambos modos
  const [minimized, setMinimized] = useState(true);

  // Cuando abre un ticket específico → expandir automáticamente
  useEffect(() => {
    if (ticketOpen) setMinimized(false);
  }, [ticketOpen]);

  // ── Modo A: ticket específico abierto ──
  if (ticketOpen && ticketCtx?.ticket) {
    return (
      <TicketChatDock
        open={true}
        onClose={() => { ticketCtx.closeChat(); setMinimized(true); }}
        ticket={ticketCtx.ticket}
        messages={ticketCtx.messages ?? []}
        onSend={ticketCtx.send}
        sending={ticketCtx.sending}
        minimized={minimized}
        onMinimizeChange={setMinimized}
        showNewTicketBtn
      />
    );
  }

  // ── Modo B: burbuja de soporte siempre visible ──
  // open={true} siempre → la burbuja nunca desaparece
  return (
    <TicketChatDock
      open={true}
      onClose={() => setMinimized(true)}
      ticket={supportRoom}
      messages={roomMessages ?? []}
      messagesError={messagesError || roomError}
      isLoading={isLoadingRoom}
      onSend={({ text, files }) =>
        supportRoom &&
        sendMessage({ chatRoomId: roomRouteKey(supportRoom), text, files })
      }
      sending={roomSending || isLoadingMessages}
      minimized={minimized}
      onMinimizeChange={setMinimized}
      showNewTicketBtn
    />
  );
}

// ──────────────────────────────────────────────
// PORTAL (raíz)
// ──────────────────────────────────────────────
export default function TicketChatDockPortal() {
  const { user, isAuthReady } = useAuth();
  if (!isAuthReady || !user) return null;
  return user.role === "admin" ? <AdminDock /> : <ClientDock />;
}
