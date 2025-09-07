import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeToChannel } from '../services/pusherService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Fetch active chat rooms
const fetchActiveChatRooms = async () => {
  const { data } = await axios.get(`${API_URL}/admin/chat/active-rooms`);
  return data;
};

// Fetch all chat rooms
const fetchAllChatRooms = async () => {
  const { data } = await axios.get(`${API_URL}/admin/chat/all-rooms`);
  return data;
};

// Fetch chat stats
const fetchChatStats = async () => {
  const { data } = await axios.get(`${API_URL}/admin/chat/stats`);
  return data;
};

// Fetch chat messages for a room (admin)
const fetchAdminChatMessages = async (chatRoomId) => {
  const { data } = await axios.get(`${API_URL}/admin/chat/${chatRoomId}/messages`);
  return data;
};

// Send message (admin)
const sendAdminMessage = async ({ chatRoomId, message }) => {
  const { data } = await axios.post(`${API_URL}/admin/chat/${chatRoomId}/messages`, { message });
  return data;
};

// Assign chat room to agent
const assignChatRoom = async ({ chatRoomId, agentId }) => {
  const { data } = await axios.put(`${API_URL}/admin/chat/${chatRoomId}/assign`, { agent_id: agentId });
  return data;
};

// Close chat room (admin)
const closeAdminChatRoom = async (chatRoomId) => {
  const { data } = await axios.put(`${API_URL}/admin/chat/${chatRoomId}/close`);
  return data;
};

// Reopen chat room (admin)
const reopenAdminChatRoom = async (chatRoomId) => {
  const { data } = await axios.put(`${API_URL}/admin/chat/${chatRoomId}/reopen`);
  return data;
};

export const useAdminChat = () => {
  const queryClient = useQueryClient();

  const { data: activeRooms, isLoading: isLoadingActiveRooms, error: activeRoomsError } = useQuery({
    queryKey: ["activeChatRooms"],
    queryFn: fetchActiveChatRooms,
    refetchInterval: 10000, // Poll every 10 seconds for active rooms
  });

  const { data: allRooms, isLoading: isLoadingAllRooms, error: allRoomsError } = useQuery({
    queryKey: ["allChatRooms"],
    queryFn: fetchAllChatRooms,
  });

  const { data: chatStats, isLoading: isLoadingChatStats, error: chatStatsError } = useQuery({
    queryKey: ["chatStats"],
    queryFn: fetchChatStats,
    refetchInterval: 30000, // Poll every 30 seconds for stats
  });

  const { data: unreadCount, isLoading: isLoadingUnreadCount, error: unreadCountError } = useQuery({
    queryKey: ["adminUnreadChatCount"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/admin/chat/unread-count`);
      return data.count;
    },
    refetchInterval: 5000, // Poll every 5 seconds for unread count
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendAdminMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(["chatMessages"]);
      queryClient.invalidateQueries(["activeChatRooms"]);
      queryClient.invalidateQueries(["adminUnreadChatCount"]);
    },
  });

  const assignRoomMutation = useMutation({
    mutationFn: assignChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["activeChatRooms"]);
      queryClient.invalidateQueries(["allChatRooms"]);
    },
  });

  const closeRoomMutation = useMutation({
    mutationFn: closeAdminChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["activeChatRooms"]);
      queryClient.invalidateQueries(["allChatRooms"]);
    },
  });

  const reopenRoomMutation = useMutation({
    mutationFn: reopenAdminChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["activeChatRooms"]);
      queryClient.invalidateQueries(["allChatRooms"]);
    },
  });

  useEffect(() => {
    // Listen for new messages in any chat room for admin
    const channel = subscribeToChannel(
      `private-admin-chat`,
      "Illuminate\\Broadcasting\\Channel\\MessageSent",
      () => {
        queryClient.invalidateQueries(["activeChatRooms"]);
        queryClient.invalidateQueries(["adminUnreadChatCount"]);
      }
    );

    // Listen for new chat room creation or status changes
    const statusChannel = subscribeToChannel(
      `private-admin-chat-status`,
      "Illuminate\\Broadcasting\\Channel\\ChatRoomStatusUpdated",
      () => {
        queryClient.invalidateQueries(["activeChatRooms"]);
        queryClient.invalidateQueries(["allChatRooms"]);
        queryClient.invalidateQueries(["chatStats"]);
        queryClient.invalidateQueries(["adminUnreadChatCount"]);
      }
    );

    return () => {
      // Cleanup
    };
  }, [queryClient]);

  return {
    activeRooms,
    allRooms,
    chatStats,
    unreadCount,
    isLoadingActiveRooms,
    isLoadingAllRooms,
    isLoadingChatStats,
    isLoadingUnreadCount,
    activeRoomsError,
    allRoomsError,
    chatStatsError,
    unreadCountError,
    fetchAdminChatMessages,
    sendAdminMessage: sendMessageMutation.mutate,
    assignChatRoom: assignRoomMutation.mutate,
    closeAdminChatRoom: closeRoomMutation.mutate,
    reopenAdminChatRoom: reopenRoomMutation.mutate,
  };
};

