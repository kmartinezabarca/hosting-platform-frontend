import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeToChannel } from '../services/pusherService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Fetch support room
const fetchSupportRoom = async () => {
  const { data } = await axios.get(`${API_URL}/chat/support-room`);
  return data;
};

// Fetch chat messages for a room
const fetchChatMessages = async (chatRoomId) => {
  const { data } = await axios.get(`${API_URL}/chat/${chatRoomId}/messages`);
  return data;
};

// Send message
const sendMessage = async ({ chatRoomId, message }) => {
  const { data } = await axios.post(`${API_URL}/chat/${chatRoomId}/messages`, { message });
  return data;
};

// Mark chat as read
const markChatAsRead = async (chatRoomId) => {
  const { data } = await axios.put(`${API_URL}/chat/${chatRoomId}/read`);
  return data;
};

// Close chat room
const closeChatRoom = async (chatRoomId) => {
  const { data } = await axios.put(`${API_URL}/chat/${chatRoomId}/close`);
  return data;
};

export const useSupportChat = () => {
  const queryClient = useQueryClient();

  const { data: supportRoom, isLoading: isLoadingRoom, error: roomError } = useQuery({
    queryKey: ["supportRoom"],
    queryFn: fetchSupportRoom,
  });

  const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useQuery({
    queryKey: ["chatMessages", supportRoom?.id],
    queryFn: () => fetchChatMessages(supportRoom.id),
    enabled: !!supportRoom?.id,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(["chatMessages", supportRoom?.id]);
      queryClient.invalidateQueries(["unreadChatCount"]);
    },
  });

  const markChatAsReadMutation = useMutation({
    mutationFn: markChatAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["unreadChatCount"]);
    },
  });

  const closeChatRoomMutation = useMutation({
    mutationFn: closeChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["supportRoom"]);
    },
  });

  useEffect(() => {
    if (supportRoom?.id) {
      const channel = subscribeToChannel(
        `private-chat.${supportRoom.id}`,
        "Illuminate\\Broadcasting\\Channel\\MessageSent",
        (message) => {
          queryClient.invalidateQueries(["chatMessages", supportRoom.id]);
          queryClient.invalidateQueries(["unreadChatCount"]);
        }
      );

      return () => {
        // Cleanup
      };
    }
  }, [supportRoom, queryClient]);

  return {
    supportRoom,
    messages,
    isLoadingRoom,
    isLoadingMessages,
    roomError,
    messagesError,
    sendMessage: sendMessageMutation.mutate,
    markChatAsRead: markChatAsReadMutation.mutate,
    closeChatRoom: closeChatRoomMutation.mutate,
  };
};

// Fetch unread chat count
const fetchUnreadChatCount = async () => {
  const { data } = await axios.get(`${API_URL}/chat/unread-count`);
  return data.count;
};

export const useUnreadChatCount = () => {
  const queryClient = useQueryClient();

  const { data: unreadCount, isLoading, error } = useQuery({
    queryKey: ["unreadChatCount"],
    queryFn: fetchUnreadChatCount,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  useEffect(() => {
    // This assumes a user-specific channel for general chat updates
    // You might need a more specific channel for unread counts if not tied to a room
    const channel = subscribeToChannel(
      `private-users.${localStorage.getItem("userId")}`,
      "Illuminate\\Broadcasting\\Channel\\ChatUpdated", // Example event for chat updates
      () => {
        queryClient.invalidateQueries(["unreadChatCount"]);
      }
    );

    return () => {
      // Cleanup
    };
  }, [queryClient]);

  return { unreadCount, isLoading, error };
};

