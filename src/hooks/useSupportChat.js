import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import echoInstance from "@/services/echoService";
import { useAuth } from "@/context/AuthContext";

const qk = {
  room: ["chat", "support-room"],
  msgs: (roomId) => ["chat", "messages", roomId],
  unread: ["chat", "unread-count"],
};

export function useSupportChat({ enabled = true } = {}) {
  const qc = useQueryClient();
  const { user, isAuthenticated, isAuthReady } = useAuth();

  // Solo ejecutar queries cuando la autenticación esté lista Y el usuario esté autenticado
  const shouldFetch = enabled && isAuthReady && isAuthenticated && user?.uuid;

  // Tu backend (getSupportRoom) responde con { success, data: { room, channel } }
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: qk.room,
    queryFn: async () => {
      try {
        const response = await apiClient.get("/chat/support-room");
        return response.data?.data?.room ?? null;
      } catch (error) {
        console.error('Error al obtener sala de soporte:', error);
        throw error;
      }
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: qk.msgs(room?.id),
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/chat/${room.id}/messages`);
        return response.data?.data ?? [];
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
        throw error;
      }
    },
    enabled: shouldFetch && Boolean(room?.id),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const sendMessageMut = useMutation({
    mutationFn: async ({ chatRoomId, text }) => {
      try {
        const response = await apiClient.post(`/chat/${chatRoomId}/messages`, { message: text });
        return response.data;
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        throw error;
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: qk.msgs(v.chatRoomId) });
      qc.invalidateQueries({ queryKey: qk.unread });
    },
  });

  const closeRoomMut = useMutation({
    mutationFn: async (chatRoomId) => {
      try {
        const response = await apiClient.put(`/chat/${chatRoomId}/close`);
        return response.data;
      } catch (error) {
        console.error('Error al cerrar sala:', error);
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.room });
    },
  });

  // Suscripción por sala (usa UUID en tu evento/broadcast)
  useEffect(() => {
    if (!shouldFetch || !room?.uuid) return;

    try {
      const channelName = `ticket.${room.uuid}`;
      const channel = echoInstance.private(channelName);

      const handler = (e) => {
        console.log("Reverb: Nueva respuesta en ticket de soporte:", e);
        qc.invalidateQueries({ queryKey: qk.msgs(room.id) });
        qc.invalidateQueries({ queryKey: qk.unread });
      };

      channel.listen("ticket.replied", handler);

      return () => {
        try {
          channel.stopListening("ticket.replied", handler);
        } catch (error) {
          console.warn('Error al detener listener de chat:', error);
        }
        try {
          echoInstance.leave(channelName);
        } catch (error) {
          console.warn('Error al salir del canal de chat:', error);
        }
      };
    } catch (error) {
      console.error('Error al configurar canal de chat:', error);
    }
  }, [shouldFetch, room?.uuid, room?.id, qc]);

  return {
    supportRoom: room,
    messages: messages ?? [],
    isLoadingRoom: isLoadingRoom && shouldFetch,
    isLoadingMessages: isLoadingMessages && shouldFetch,
    sendMessage: (p) => sendMessageMut.mutate(p),
    closeChatRoom: (id) => closeRoomMut.mutate(id),
    isReady: shouldFetch, // Nuevo: indica si el hook está listo para usar
  };
}

// Opcional: contador de no leídos (sin polling)
export function useUnreadChatCount({ enabled = true } = {}) {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  // Solo ejecutar query cuando la autenticación esté lista Y el usuario esté autenticado
  const shouldFetch = enabled && isAuthReady && isAuthenticated && user?.uuid;

  const { data: unreadCount, isLoading } = useQuery({
    queryKey: qk.unread,
    queryFn: async () => {
      try {
        const response = await apiClient.get("/chat/unread-count");
        return response.data?.unread_count ?? 0;
      } catch (error) {
        console.error('Error al obtener contador de chat:', error);
        return 0;
      }
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: shouldFetch ? 30000 : false, // Refetch cada 30 segundos si está habilitado
  });

  return { 
    unreadCount: unreadCount ?? 0, 
    isLoading: isLoading && shouldFetch,
    isReady: shouldFetch // Nuevo: indica si el hook está listo para usar
  };
}

