import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { subscribeToChannel } from "@/services/pusherService";

const qk = {
  room: ["chat", "support-room"],
  msgs: (roomId) => ["chat", "messages", roomId],
  unread: ["chat", "unread-count"],
};

export function useSupportChat({ enabled = true } = {}) {
  const qc = useQueryClient();

  // Tu backend (getSupportRoom) responde con { success, data: { room, channel } }
  const { data: room } = useQuery({
    queryKey: qk.room,
    queryFn: async () => (await apiClient.get("/chat/support-room")).data?.data?.room ?? null,
    enabled,
    refetchOnWindowFocus: false,
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: qk.msgs(room?.id),
    queryFn: async () =>
      (await apiClient.get(`/chat/${room.id}/messages`)).data?.data ?? [],
    enabled: enabled && Boolean(room?.id),
    refetchOnWindowFocus: false,
  });

  const sendMessageMut = useMutation({
    mutationFn: async ({ chatRoomId, text }) =>
      (await apiClient.post(`/chat/${chatRoomId}/messages`, { message: text })).data,
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.msgs(v.chatRoomId) });
      qc.invalidateQueries({ queryKey: qk.unread });
    },
  });

  const closeRoomMut = useMutation({
    mutationFn: async (chatRoomId) =>
      (await apiClient.put(`/chat/${chatRoomId}/close`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.room });
    },
  });

  // Suscripción por sala (usa UUID en tu evento/broadcast)
  useEffect(() => {
    if (!enabled || !room?.uuid) return;

    const ch = subscribeToChannel(
      `private-chat.${room.uuid}`,
      "Illuminate\\Broadcasting\\Channel\\MessageSent",
      () => {
        qc.invalidateQueries({ queryKey: qk.msgs(room.id) });
        qc.invalidateQueries({ queryKey: qk.unread });
      }
    );

    return () => {
      ch?.unbind_all?.(); ch?.unsubscribe?.();
    };
  }, [enabled, room?.uuid, room?.id, qc]);

  return {
    supportRoom: room,
    messages: messages ?? [],
    isLoadingMessages: !!isLoadingMessages,
    sendMessage: (p) => sendMessageMut.mutate(p),
    closeChatRoom: (id) => closeRoomMut.mutate(id),
  };
}

// Opcional: contador de no leídos (sin polling)
export function useUnreadChatCount({ enabled = true } = {}) {
  const { data: unreadCount } = useQuery({
    queryKey: ["chat", "unread-count"],
    queryFn: async () => (await apiClient.get("/chat/unread-count")).data?.unread_count ?? 0,
    enabled,
    refetchOnWindowFocus: false,
  });
  return { unreadCount: unreadCount ?? 0 };
}