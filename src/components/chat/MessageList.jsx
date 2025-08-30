// /components/chat/MessageList.jsx
import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

export const MessageList = ({ messages, onImageClick }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="h-full grid place-items-center text-sm text-muted-foreground">
          No hay mensajes aún.
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onImageClick={onImageClick} />
        ))
      )}
    </div>
  );
};
