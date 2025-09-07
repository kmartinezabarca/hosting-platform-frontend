import React from "react";
import TicketChatDock from "./TicketChatDock";
import { useSupportChat } from "../../hooks/useClientChat";
import { useAdminChat } from "../../hooks/useAdminChat";
import { useAuth } from "../../context/AuthContext";

const TicketChatDockPortal = () => {
  const { user } = useAuth();

  const clientChat = useSupportChat();
  const adminChat = useAdminChat();

  const chatProps = user?.role === "admin" ? {
    ticket: adminChat.selectedChatRoom,
    messages: adminChat.messages,
    onSend: adminChat.sendMessage,
    sending: adminChat.isLoadingMessages,
    onClose: adminChat.closeChatRoom,
  } : {
    ticket: clientChat.supportRoom,
    messages: clientChat.messages,
    onSend: clientChat.sendMessage,
    sending: clientChat.isLoadingMessages,
    onClose: clientChat.closeChatRoom,
  };

  const [minimized, setMinimized] = React.useState(false);
  const open = !!chatProps.ticket;

  return (
    <TicketChatDock
      open={open}
      onClose={chatProps.onClose}
      ticket={chatProps.ticket}
      messages={chatProps.messages}
      onSend={chatProps.onSend}
      sending={chatProps.sending}
      minimized={minimized}
      onMinimizeChange={setMinimized}
    />
  );
};

export default TicketChatDockPortal;


