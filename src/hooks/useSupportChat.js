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

// Prefiere UUID (más seguro con las policies de Laravel), fallback a ID numérico
const roomRouteKey = (room) => room?.uuid || room?.id;

export function useSupportChat({ enabled = true } = {}) {
  const qc = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  const shouldFetch = Boolean(enabled && isAuthReady && isAuthenticated && user?.uuid);

  // 1) Obtener/crear la sala del cliente
  const {
    data: room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useQuery({
    queryKey: qk.room,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get("/chat/support-room", {
        signal,
        _skipAuthRedirect: true,
      });
      return data?.data?.room ?? null;
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 60_000,
  });

  // 2) Traer mensajes de la sala usando UUID (o ID como fallback)
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: qk.msgs(room?.id),
    queryFn: async ({ signal }) => {
      const key = roomRouteKey(room);
      const { data } = await apiClient.get(`/chat/${key}/messages`, {
        signal,
        _skipAuthRedirect: true,
      });
      // Backend returns a paginated response: { success, data: { data: [...], current_page, ... } }
      return data?.data?.data ?? [];
    },
    enabled: shouldFetch && Boolean(room?.id),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  });

  // 3) Enviar mensaje
  const sendMessageMut = useMutation({
    mutationFn: async ({ chatRoomId, text }) => {
      const { data } = await apiClient.post(`/chat/${chatRoomId}/messages`, {
        message: text,
      });
      return data;
    },
    onSuccess: (_res, v) => {
      qc.invalidateQueries({ queryKey: qk.msgs(v.chatRoomId) });
      qc.invalidateQueries({ queryKey: qk.unread });
    },
  });

  // 4) Cerrar sala
  const closeRoomMut = useMutation({
    mutationFn: async (chatRoomId) => {
      const { data } = await apiClient.put(`/chat/${chatRoomId}/close`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.room });
    },
  });

  // 5) Realtime — solo conectar cuando Reverb esté disponible
  useEffect(() => {
    if (!shouldFetch || !room?.uuid) return;

    let echo;
    try {
      echo = getEcho();
    } catch {
      return;
    }

    const channelName = `ticket.${room.uuid}`;
    let ch;
    try {
      ch = echo.private(channelName);
      ch.subscribed(() => console.log("✅ Subscribed:", `private-${channelName}`));
      ch.error((e) => console.warn("⚠️ Channel error (support chat):", e));
    } catch (err) {
      console.warn("Echo subscribe error:", err);
      return;
    }

    let t;
    const bump = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        qc.invalidateQueries({ queryKey: qk.msgs(room.id) });
        qc.invalidateQueries({ queryKey: qk.unread });
      }, 100);
    };

    ch.listen(".ticket.replied", (e) => {
      console.log("📩 ticket.replied", e);
      bump();
    });

    ch.listen(".ticket.closed", () => {
      qc.invalidateQueries({ queryKey: qk.room });
    });

    const conn = echo.connector?.pusher?.connection;
    const onReconnected = () => bump();
    conn?.bind?.("connected", onReconnected);

    return () => {
      try {
        ch.stopListening(".ticket.replied");
        ch.stopListening(".ticket.closed");
        conn?.unbind?.("connected", onReconnected);
      } catch {}
      clearTimeout(t);
    };
  }, [shouldFetch, room?.uuid, room?.id, qc]);

  return {
    supportRoom: room ?? null,
    messages: messages ?? [],
    isLoadingRoom: isLoadingRoom && shouldFetch,
    isLoadingMessages: isLoadingMessages && shouldFetch,
    roomError,
    messagesError,
    sending: sendMessageMut.isPending,
    closing: closeRoomMut.isPending,
    sendMessage: (p) => sendMessageMut.mutateAsync(p),
    closeChatRoom: (id) => closeRoomMut.mutate(id),
    isReady: shouldFetch,
  };
}

export function useUnreadChatCount({ enabled = true } = {}) {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const shouldFetch = Boolean(enabled && isAuthReady && isAuthenticated && user?.uuid);

  const { data: unreadCount, isLoading, error } = useQuery({
    queryKey: qk.unread,
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get("/chat/unread-count", {
        signal,
        _skipAuthRedirect: true,
      });
      return data?.unread_count ?? 0;
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: shouldFetch ? 30_000 : false,
    staleTime: 15_000,
  });

  return {
    unreadCount: unreadCount ?? 0,
    isLoading: isLoading && shouldFetch,
    error,
    isReady: shouldFetch,
  };
}
