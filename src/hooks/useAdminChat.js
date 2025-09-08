import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
// Importa las funciones refactorizadas de tu servicio de Pusher
import { subscribeToChannel, unsubscribeFromChannel } from "@/services/pusherService";

// Claves de query para React Query, tu estructura es perfecta.
const qk = {
    active: ["admin", "chat", "active-rooms"],
    all: ["admin", "chat", "all-rooms"],
    stats: ["admin", "chat", "stats"],
    unread: ["admin", "chat", "unread-count"],
    msgs: (roomId) => ["admin", "chat", "messages", roomId],
};

export function useAdminChat({ enabled = true } = {}) {
    const qc = useQueryClient();
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);

    // --- QUERIES (sin cambios, tu lógica es sólida) ---
    const { data: activeResp } = useQuery({
        queryKey: qk.active,
        queryFn: async () => (await apiClient.get("/admin/chat/active-rooms")).data,
        enabled,
        refetchOnWindowFocus: false,
    });

    useQuery({
        queryKey: qk.all,
        queryFn: async () => (await apiClient.get("/admin/chat/all-rooms")).data,
        enabled,
        refetchOnWindowFocus: false,
    });

    useQuery({
        queryKey: qk.stats,
        queryFn: async () => (await apiClient.get("/admin/chat/stats")).data,
        enabled,
        refetchOnWindowFocus: false,
    });

    const { data: unreadCount } = useQuery({
        queryKey: qk.unread,
        queryFn: async () => (await apiClient.get("/admin/chat/unread-count")).data?.unread_count ?? 0,
        enabled,
        refetchOnWindowFocus: false,
    });

    const { data: messages, isLoading: isLoadingMessages } = useQuery({
        queryKey: qk.msgs(selectedChatRoom?.id),
        queryFn: async () => (await apiClient.get(`/admin/chat/${selectedChatRoom.id}/messages`)).data?.data ?? [],
        enabled: enabled && Boolean(selectedChatRoom?.id),
        refetchOnWindowFocus: false,
    });

    // --- MUTATIONS (sin cambios) ---
    const sendMessageMut = useMutation({
        mutationFn: async ({ chatRoomId, text }) => (await apiClient.post(`/admin/chat/${chatRoomId}/messages`, { message: text })).data,
        onSuccess: (_d, v) => {
            qc.invalidateQueries({ queryKey: qk.msgs(v.chatRoomId) });
            qc.invalidateQueries({ queryKey: qk.active });
            qc.invalidateQueries({ queryKey: qk.unread });
        },
    });

    const closeRoomMut = useMutation({
        mutationFn: async (chatRoomId) => (await apiClient.put(`/admin/chat/${chatRoomId}/close`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.active });
            qc.invalidateQueries({ queryKey: qk.all });
        },
    });

    useEffect(() => {
       
        if (!enabled) return;

        const setupPusherSubscriptions = async () => {
            try {
                const msgChannel = await subscribeToChannel("private-admin-chat");
                msgChannel.bind(
                    "Illuminate\\Broadcasting\\Channel\\MessageSent",
                    () => {
                        console.log("Pusher: Nuevo mensaje recibido. Invalidando queries...");
                        qc.invalidateQueries({ queryKey: qk.active });
                        qc.invalidateQueries({ queryKey: qk.unread });
                        if (selectedChatRoom?.id) {
                            qc.invalidateQueries({ queryKey: qk.msgs(selectedChatRoom.id) });
                        }
                    }
                );
            } catch (error) {
                console.error("Error al suscribirse al canal de mensajes de Pusher:", error);
            }

            try {
                const statusChannel = await subscribeToChannel("private-admin-chat-status");

                statusChannel.bind(
                    "Illuminate\\Broadcasting\\Channel\\ChatRoomStatusUpdated",
                    () => {
                        console.log("Pusher: Estado de sala actualizado. Invalidando queries...");
                        qc.invalidateQueries({ queryKey: qk.active });
                        qc.invalidateQueries({ queryKey: qk.all });
                        qc.invalidateQueries({ queryKey: qk.stats });
                        qc.invalidateQueries({ queryKey: qk.unread });
                    }
                );
            } catch (error) {
                console.error("Error al suscribirse al canal de estado de Pusher:", error);
            }
        };

        setupPusherSubscriptions();

        return () => {
            console.log("Limpiando y cancelando suscripciones de Pusher...");
            unsubscribeFromChannel("private-admin-chat");
            unsubscribeFromChannel("private-admin-chat-status");
        };
    }, [enabled, qc, selectedChatRoom?.id]);

    const activeRooms = activeResp?.data ?? [];

    return {
        activeRooms,
        unreadCount: unreadCount ?? 0,
        selectedChatRoom,
        setSelectedChatRoom,
        messages: messages ?? [],
        isLoadingMessages: !!isLoadingMessages,
        sendMessage: (p) => sendMessageMut.mutate(p),
        closeChatRoom: (id) => closeRoomMut.mutate(id),
    };
}
