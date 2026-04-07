import { useEffect, useState, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { getEcho } from '@/services/echoService';
import { useAuth } from "@/context/AuthContext";

// Claves de query para React Query
const qk = {
  active: ["admin", "chat", "active-rooms"],
  all: ["admin", "chat", "all-rooms"],
  stats: ["admin", "chat", "stats"],
  unread: ["admin", "chat", "unread-count"],
  msgs: (roomId) => ["admin", "chat", "messages", String(roomId ?? "none")],
};

export function useAdminChat({ enabled = true } = {}) {
  const { user, isAuthReady, isAuthenticated, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);

  const shouldFetch = Boolean(isAuthReady && isAuthenticated && isAdmin && user?.uuid && enabled);

  // --- QUERIES ---
  const { data: activeResp } = useQuery({
    queryKey: qk.active,
    queryFn: async () => (await apiClient.get("/admin/chat/active-rooms")).data,
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useQuery({
    queryKey: qk.all,
    queryFn: async () => (await apiClient.get("/admin/chat/all-rooms")).data,
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useQuery({
    queryKey: qk.stats,
    queryFn: async () => (await apiClient.get("/admin/chat/stats")).data,
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: unreadCount } = useQuery({
    queryKey: qk.unread,
    queryFn: async () => (await apiClient.get("/admin/chat/unread-count")).data?.unread_count ?? 0,
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: qk.msgs(selectedChatRoom?.id),
    queryFn: async () => (await apiClient.get(`/admin/chat/${selectedChatRoom.id}/messages`)).data?.data ?? [],
    enabled: shouldFetch && Boolean(selectedChatRoom?.id),
    refetchOnWindowFocus: false,
    retry: false,
  });

  // --- MUTATIONS ---
  const sendMessageMut = useMutation({
    mutationFn: async ({ chatRoomId, text }) =>
      (await apiClient.post(`/admin/chat/${chatRoomId}/messages`, { message: text })).data,
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.msgs(v.chatRoomId) });
      qc.invalidateQueries({ queryKey: qk.active });
      qc.invalidateQueries({ queryKey: qk.unread });
    },
  });

  const closeRoomMut = useMutation({
    mutationFn: async (chatRoomId) =>
      (await apiClient.put(`/admin/chat/${chatRoomId}/close`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.active });
      qc.invalidateQueries({ queryKey: qk.all });
      qc.invalidateQueries({ queryKey: qk.stats });
    },
  });

  // Auto-seleccionar primera sala activa si no hay una
  const activeRooms = useMemo(() => activeResp?.data ?? [], [activeResp]);
  useEffect(() => {
    if (!selectedChatRoom && activeRooms?.length) {
      setSelectedChatRoom(activeRooms[0]);
    }
  }, [activeRooms, selectedChatRoom]);

  // --- REVERB SUBSCRIPTIONS ---
  useEffect(() => {
    if (!shouldFetch) return;

    const echo = getEcho();

    // Debounce de invalidaciones
    let t;
    const bump = (...keys) => {
      clearTimeout(t);
      t = setTimeout(() => {
        for (const key of keys) qc.invalidateQueries({ queryKey: key });
      }, 100);
    };

    // admin.chat — mensajes nuevos, replies, etc.
    const chatChannel = echo
      .private("admin.chat")
      .subscribed(() => console.log("✅ admin.chat subscribed"))
      .error((e) => console.error("❌ admin.chat error", e));

    // Si NO usas broadcastAs en backend:
    const chatEventsDefault = ["MessageSent"];
    // Si SÍ usas broadcastAs('admin.chat.message'):
    const chatEventsAliased = [".admin.chat.message"];

    const onChatEvent = () => {
      console.log("Reverb: evento de chat (admin)");
      bump(qk.active, qk.unread);
      if (selectedChatRoom?.id) bump(qk.msgs(selectedChatRoom.id));
    };

    [...chatEventsDefault, ...chatEventsAliased].forEach((name) =>
      chatChannel.listen(name, onChatEvent)
    );

    // admin.chat.status — cambios de estado de salas
    const statusChannel = echo
      .private("admin.chat.status")
      .subscribed(() => console.log("✅ admin.chat.status subscribed"))
      .error((e) => console.error("❌ admin.chat.status error", e));

    const statusEventsDefault = ["ChatRoomStatusUpdated"];
    const statusEventsAliased = [".admin.chat.status.updated"];

    const onStatusEvent = () => {
      console.log("Reverb: estado de sala actualizado");
      bump(qk.active, qk.all, qk.stats, qk.unread);
      if (selectedChatRoom?.id) bump(qk.msgs(selectedChatRoom.id));
    };

    [...statusEventsDefault, ...statusEventsAliased].forEach((name) =>
      statusChannel.listen(name, onStatusEvent)
    );

    // Re-suscribir tras reconexión
    const conn = echo.connector?.pusher?.connection;
    const onReconnected = () => {
      console.log("🔁 Reconnected (admin chat), refrescando datos…");
      bump(qk.active, qk.all, qk.stats, qk.unread);
      if (selectedChatRoom?.id) bump(qk.msgs(selectedChatRoom.id));
    };
    conn?.bind?.("connected", onReconnected);

    return () => {
      try {
        [...chatEventsDefault, ...chatEventsAliased].forEach((n) => chatChannel.stopListening(n));
        [...statusEventsDefault, ...statusEventsAliased].forEach((n) => statusChannel.stopListening(n));
        conn?.unbind?.("connected", onReconnected);
        // Si estos canales se usan solo aquí, puedes descomentar para liberar:
        // echo.leave("admin.chat");
        // echo.leave("admin.chat.status");
      } catch (error) {
        console.warn("cleanup warn (admin chat):", error);
      }
      clearTimeout(t);
    };
  }, [shouldFetch, qc, selectedChatRoom?.id]);

  return {
    activeRooms,
    unreadCount: unreadCount ?? 0,
    selectedChatRoom,
    setSelectedChatRoom,
    messages: messages ?? [],
    isLoadingMessages: Boolean(isLoadingMessages && shouldFetch),
    sending: sendMessageMut.isPending,
    closing: closeRoomMut.isPending,
    sendMessage: (p) => sendMessageMut.mutate(p),
    closeChatRoom: (id) => closeRoomMut.mutate(id),
    isReady: shouldFetch,
  };
}
