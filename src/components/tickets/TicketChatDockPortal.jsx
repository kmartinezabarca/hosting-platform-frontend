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
// Maneja dos modos:
//   A) Ticket específico abierto via useTicketChat() (desde una página de ticket)
//   B) Sala de soporte persistente via useSupportChat()
// Solo muestra un dock a la vez. Prioriza el ticket si está abierto.
// ──────────────────────────────────────────────
function ClientDock() {
  // --- Modo A: ticket específico (desde página de ticket) ---
  const ticketCtx = useTicketChat();
  const ticketOpen = ticketCtx?.open ?? false;

  // --- Modo B: sala de soporte persistente ---
  const {
    supportRoom,
    messages: roomMessages,
    isLoadingMessages,
    messagesError,
    roomError,
    sending: roomSending,
    sendMessage,
    closeChatRoom,
  } = useSupportChat({ enabled: true });

  // El dock de la sala de soporte empieza minimizado (burbuja flotante)
  const [roomMinimized, setRoomMinimized] = useState(true);
  const [roomDismissed, setRoomDismissed] = useState(false);

  // Si aparece una sala nueva, resetear dismissed
  useEffect(() => {
    if (supportRoom) setRoomDismissed(false);
  }, [supportRoom?.id]);

  const roomOpen = Boolean(supportRoom) && !roomDismissed && !ticketOpen;

  // ── Modo A activo: mostrar dock de ticket ──
  if (ticketOpen && ticketCtx) {
    return (
      <TicketChatDock
        open={ticketCtx.open}
        onClose={ticketCtx.closeChat}
        ticket={ticketCtx.ticket}
        messages={ticketCtx.messages ?? []}
        onSend={ticketCtx.send}
        sending={ticketCtx.sending}
        minimized={ticketCtx.minimized}
        onMinimizeChange={ticketCtx.setMinimized}
      />
    );
  }

  // ── Modo B: dock de sala de soporte ──
  if (!roomOpen) return null;

  return (
    <TicketChatDock
      open={roomOpen}
      onClose={() => setRoomDismissed(true)}
      ticket={supportRoom}
      messages={roomMessages ?? []}
      messagesError={messagesError || roomError}
      onSend={({ text, files }) =>
        supportRoom &&
        sendMessage({ chatRoomId: roomRouteKey(supportRoom), text, files })
      }
      sending={roomSending || isLoadingMessages}
      minimized={roomMinimized}
      onMinimizeChange={setRoomMinimized}
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
