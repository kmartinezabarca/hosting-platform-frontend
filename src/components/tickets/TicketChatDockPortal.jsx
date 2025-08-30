import React from "react";
import TicketChatDock from "./TicketChatDock";
import { useTicketChat } from "../../context/TicketChatContext";

const TicketChatDockPortal = () => {
  const {
    open,
    closeChat,
    ticket,
    messages,
    send,
    sending,
    minimized,
    setMinimized,
  } = useTicketChat();

  return (
    <TicketChatDock
      open={open}
      onClose={closeChat}
      ticket={ticket}
      messages={messages}
      onSend={send}
      sending={sending}
      minimized={minimized}
      onMinimizeChange={setMinimized}
    />
  );
};

export default TicketChatDockPortal;
