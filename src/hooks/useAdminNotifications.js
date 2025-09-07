import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeToChannel } from '../services/pusherService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Fetch admin notifications
const fetchAdminNotifications = async () => {
  const { data } = await axios.get(`${API_URL}/admin/notifications`);
  return data;
};

// Fetch notification stats
const fetchNotificationStats = async () => {
  const { data } = await axios.get(`${API_URL}/admin/notifications/stats`);
  return data;
};

// Broadcast notification to users
const broadcastNotification = async (payload) => {
  const { data } = await axios.post(`${API_URL}/admin/notifications/broadcast`, payload);
  return data;
};

// Send notification to a specific user
const sendNotificationToUser = async ({ userId, payload }) => {
  const { data } = await axios.post(`${API_URL}/admin/notifications/send-to-user/${userId}`, payload);
  return data;
};

// Mark notification as read (admin)
const markAdminNotificationAsRead = async (notificationId) => {
  const { data } = await axios.put(`${API_URL}/admin/notifications/${notificationId}/read`);
  return data;
};

// Mark all notifications as read (admin)
const markAllAdminNotificationsAsRead = async () => {
  const { data } = await axios.put(`${API_URL}/admin/notifications/mark-all-read`);
  return data;
};

// Delete notification (admin)
const deleteAdminNotification = async (notificationId) => {
  const { data } = await axios.delete(`${API_URL}/admin/notifications/${notificationId}`);
  return data;
};

export const useAdminNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: fetchAdminNotifications,
  });

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ["notificationStats"],
    queryFn: fetchNotificationStats,
  });

  const broadcastMutation = useMutation({
    mutationFn: broadcastNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminNotifications"]);
      queryClient.invalidateQueries(["notificationStats"]);
    },
  });

  const sendToUserMutation = useMutation({
    mutationFn: sendNotificationToUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminNotifications"]);
      queryClient.invalidateQueries(["notificationStats"]);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAdminNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminNotifications"]);
      queryClient.invalidateQueries(["notificationStats"]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAdminNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminNotifications"]);
      queryClient.invalidateQueries(["notificationStats"]);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteAdminNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminNotifications"]);
      queryClient.invalidateQueries(["notificationStats"]);
    },
  });

  useEffect(() => {
    // Admin notifications might be broadcast to a specific admin channel or all users
    // For simplicity, assuming a general admin channel or polling for now.
    // If specific admin channels are used, subscribe here.
    const channel = subscribeToChannel(
      `private-admin-notifications`,
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      () => {
        queryClient.invalidateQueries(["adminNotifications"]);
        queryClient.invalidateQueries(["notificationStats"]);
      }
    );

    return () => {
      // Cleanup
    };
  }, [queryClient]);

  return {
    notifications,
    isLoading,
    error,
    stats,
    isLoadingStats,
    statsError,
    broadcastNotification: broadcastMutation.mutate,
    sendNotificationToUser: sendToUserMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
};

