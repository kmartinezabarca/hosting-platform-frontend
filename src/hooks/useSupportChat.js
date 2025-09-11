import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { getEcho } from "@/services/echoService";
import { useAuth } from "@/context/AuthContext";

const qk = {
  room: ["chat", "support-room"],
  msgs: (roomId) => ["chat", "messages", String(roomId ?? "none")],
  unread: ["chat", "unread-count"],
};

export function useSupportChat({ enabled = true } = {}) {
  const qc = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  // Solo ejecutar cuando la auth está lista y el user existe
  const shouldFetch = Boolean(enabled && isAuthReady && isAuthenticated && user?.uuid);

  // 1) Obtener/crear la sala del cliente
  const {
    data: room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useQuery({
    queryKey: qk.room,
    queryFn: async () => {
      const { data } = await apiClient.get("/chat/support-room");
      return data?.data?.room ?? null;
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // 2) Traer mensajes de la sala
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: qk.msgs(room?.id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/chat/${room.id}/messages`);
      return data?.data ?? [];
    },
    enabled: shouldFetch && Boolean(room?.id),
    refetchOnWindowFocus: false,
    retry: false,
  });

  // 3) Mutaciones
  const sendMessageMut = useMutation({
    mutationFn: async ({ chatRoomId, text }) => {
      const { data } = await apiClient.post(`/chat/${chatRoomId}/messages`, { message: text });
      return data;
    },
    onSuccess: (_res, v) => {
      // invalidación suave
      qc.invalidateQueries({ queryKey: qk.msgs(v.chatRoomId) });
      qc.invalidateQueries({ queryKey: qk.unread });
    },
  });

  const closeRoomMut = useMutation({
    mutationFn: async (chatRoomId) => {
      const { data } = await apiClient.put(`/chat/${chatRoomId}/close`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.room });
    },
  });

  // 4) Realtime (solo cuando hay sala)
  useEffect(() => {
    if (!shouldFetch || !room?.uuid) return;

    const echo = getEcho();
    const channelName = `ticket.${room.uuid}`;
    const ch = echo
      .private(channelName)
      .subscribed(() => console.log("✅ Subscribed:", `private-${channelName}`))
      .error((e) => console.error("❌ Channel error:", e));

    // Debounce de invalidaciones para evitar rafagas
    let t;
    const bump = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        qc.invalidateQueries({ queryKey: qk.msgs(room.id) });
        qc.invalidateQueries({ queryKey: qk.unread });
      }, 100);
    };

    // Si el backend usa broadcastAs('ticket.replied'), escucha con '.ticket.replied'
    ch.listen(".ticket.replied", (e) => {
      console.log("📩 ticket.replied", e);
      bump();
    });

    // (opcional) otros eventos útiles del chat:
    ch.listen(".ticket.closed", (e) => {
      console.log("📩 ticket.closed", e);
      qc.invalidateQueries({ queryKey: qk.room });
    });

    // Re-suscribir tras reconexión (por si el socket se cae)
    const conn = echo.connector?.pusher?.connection;
    const onReconnected = () => {
      console.log("🔁 Reconnected, re-bumping data");
      bump();
    };
    conn?.bind?.("connected", onReconnected);

    return () => {
      try {
        ch.stopListening(".ticket.replied");
        ch.stopListening(".ticket.closed");
        conn?.unbind?.("connected", onReconnected);
        // Nota: evitamos echo.leave(channelName) para no interferir si otro hook/comp
        // usa el mismo canal. Si sabes que sólo tú lo usas, puedes dejarlo:
        // echo.leave(channelName);
      } catch (err) {
        console.warn("cleanup warn (support chat):", err);
      }
      clearTimeout(t);
    };
  }, [shouldFetch, room?.uuid, room?.id, qc]);

  return {
    supportRoom: room,
    messages: messages ?? [],
    isLoadingRoom: isLoadingRoom && shouldFetch,
    isLoadingMessages: isLoadingMessages && shouldFetch,
    roomError,
    messagesError,
    sending: sendMessageMut.isPending,
    closing: closeRoomMut.isPending,
    sendMessage: (p) => sendMessageMut.mutate(p),
    closeChatRoom: (id) => closeRoomMut.mutate(id),
    isReady: shouldFetch,
  };
}

// Contador de no leídos (con polling + listo para realtime si quieres)
export function useUnreadChatCount({ enabled = true } = {}) {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const qc = useQueryClient();
  const shouldFetch = Boolean(enabled && isAuthReady && isAuthenticated && user?.uuid);

  const { data: unreadCount, isLoading, error } = useQuery({
    queryKey: qk.unread,
    queryFn: async () => {
      const { data } = await apiClient.get("/chat/unread-count");
      return data?.unread_count ?? 0;
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: shouldFetch ? 30_000 : false,
    staleTime: 15_000,
  });

  // (Opcional) también puedes escuchar notifs globales del user para “bump”
  // useEffect(() => {
  //   if (!shouldFetch) return;
  //   const echo = getEcho();
  //   const ch = echo.private(`user.${user.uuid}`);
  //   const bump = () => qc.invalidateQueries({ queryKey: qk.unread });
  //   ch.notification(bump);
  //   ch.listen(".ticket.replied", bump);
  //   return () => {
  //     try { ch.stopListening(".ticket.replied"); } catch {}
  //   };
  // }, [shouldFetch, user?.uuid, qc]);

  return {
    unreadCount: unreadCount ?? 0,
    isLoading: isLoading && shouldFetch,
    error,
    isReady: shouldFetch,
  };
}