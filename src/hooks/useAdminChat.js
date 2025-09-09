import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import echoInstance from "@/services/echoService";
import { useAuth } from "@/context/AuthContext";

// Claves de query para React Query
const qk = {
    active: ["admin", "chat", "active-rooms"],
    all: ["admin", "chat", "all-rooms"],
    stats: ["admin", "chat", "stats"],
    unread: ["admin", "chat", "unread-count"],
    msgs: (roomId) => ["admin", "chat", "messages", roomId],
};

export function useAdminChat({ enabled = true } = {}) {
    const { user, isAuthReady, isAuthenticated, isAdmin } = useAuth();
    const qc = useQueryClient();
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);

    // Solo ejecutar si está autenticado como admin
    const shouldFetch = isAuthReady && isAuthenticated && isAdmin && user?.uuid && enabled;

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

    // --- REVERB SUBSCRIPTIONS ---
    useEffect(() => {
        if (!shouldFetch) return;

        try {
            const setupReverbSubscriptions = () => {
                const chatChannel = echoInstance.private("admin.chat");
                const statusChannel = echoInstance.private("admin.chat.status");

                chatChannel.listen("MessageSent", () => {
                    console.log("Reverb: Nuevo mensaje recibido. Invalidando queries...");
                    qc.invalidateQueries({ queryKey: qk.active });
                    qc.invalidateQueries({ queryKey: qk.unread });
                    if (selectedChatRoom?.id) {
                        qc.invalidateQueries({ queryKey: qk.msgs(selectedChatRoom.id) });
                    }
                });

                statusChannel.listen("ChatRoomStatusUpdated", () => {
                    console.log("Reverb: Estado de sala actualizado. Invalidando queries...");
                    qc.invalidateQueries({ queryKey: qk.active });
                    qc.invalidateQueries({ queryKey: qk.all });
                    qc.invalidateQueries({ queryKey: qk.stats });
                    qc.invalidateQueries({ queryKey: qk.unread });
                });

                console.log("Reverb: Conectado a canales de admin chat");
            };

            setupReverbSubscriptions();

            return () => {
                try {
                    console.log("Limpiando y cancelando suscripciones de Reverb...");
                    echoInstance.leave("admin.chat");
                    echoInstance.leave("admin.chat.status");
                } catch (error) {
                    console.warn("Error al desconectar canales de admin chat:", error);
                }
            };
        } catch (error) {
            console.error("Error al configurar canales de admin chat:", error);
        }
    }, [shouldFetch, qc, selectedChatRoom?.id]);

    const activeRooms = activeResp?.data ?? [];

    return {
        activeRooms,
        unreadCount: unreadCount ?? 0,
        selectedChatRoom,
        setSelectedChatRoom,
        messages: messages ?? [],
        isLoadingMessages: !!isLoadingMessages && shouldFetch,
        sendMessage: (p) => sendMessageMut.mutate(p),
        closeChatRoom: (id) => closeRoomMut.mutate(id),
        isReady: shouldFetch,
    };
}

