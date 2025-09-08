import React from "react";
import TicketChatDock from "./TicketChatDock";
import { useSupportChat } from "@/hooks/useSupportChat";
import { useAdminChat } from "@/hooks/useAdminChat";
import { useAuth } from "@/context/AuthContext";

// Sub-componente para ADMIN
function AdminDock() {
  const {
    activeRooms,
    selectedChatRoom,
    setSelectedChatRoom,
    messages,
    isLoadingMessages,
    sendMessage,
    closeChatRoom,
  } = useAdminChat({ enabled: true });

  const [minimized, setMinimized] = React.useState(false);
  const open = Boolean(selectedChatRoom);

  // Si no hay sala seleccionada, intenta seleccionar la primera activa
  React.useEffect(() => {
    if (!selectedChatRoom && activeRooms?.length) {
      setSelectedChatRoom(activeRooms[0]);
    }
  }, [activeRooms, selectedChatRoom, setSelectedChatRoom]);

  return (
    <TicketChatDock
      open={open}
      onClose={() => selectedChatRoom && closeChatRoom(selectedChatRoom.id)}
      ticket={selectedChatRoom}
      messages={messages || []}
      onSend={({ text }) =>
        selectedChatRoom && sendMessage({ chatRoomId: selectedChatRoom.id, text })
      }
      sending={isLoadingMessages}
      minimized={minimized}
      onMinimizeChange={setMinimized}
    />
  );
}

// Sub-componente para CLIENTE
function ClientDock() {
  const {
    supportRoom,
    messages,
    isLoadingMessages,
    sendMessage,
    closeChatRoom,
  } = useSupportChat({ enabled: true });

  const [minimized, setMinimized] = React.useState(false);
  const open = Boolean(supportRoom);

  return (
    <TicketChatDock
      open={open}
      onClose={() => supportRoom && closeChatRoom(supportRoom.id)}
      ticket={supportRoom}
      messages={messages || []}
      onSend={({ text }) =>
        supportRoom && sendMessage({ chatRoomId: supportRoom.id, text })
      }
      sending={isLoadingMessages}
      minimized={minimized}
      onMinimizeChange={setMinimized}
    />
  );
}

export default function TicketChatDockPortal() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "admin" ? <AdminDock /> : <ClientDock />;
}