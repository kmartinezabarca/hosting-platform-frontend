import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeToChannel } from '../services/pusherService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Fetch client notifications
const fetchClientNotifications = async () => {
  const { data } = await axios.get(`${API_URL}/notifications`);
  return data;
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  const { data } = await axios.put(`${API_URL}/notifications/${notificationId}/read`);
  return data;
};

// Mark all notifications as read
const markAllNotificationsAsRead = async () => {
  const { data } = await axios.put(`${API_URL}/notifications/mark-all-read`);
  return data;
};

// Delete notification
const deleteNotification = async (notificationId) => {
  const { data } = await axios.delete(`${API_URL}/notifications/${notificationId}`);
  return data;
};

export const useClientNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["clientNotifications"],
    queryFn: fetchClientNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["clientNotifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["clientNotifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["clientNotifications"]);
      queryClient.invalidateQueries(["unreadNotificationCount"]);
    },
  });

  useEffect(() => {
    const channel = subscribeToChannel(
      `private-users.${localStorage.getItem("userId")}`,
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      (notification) => {
        queryClient.invalidateQueries(["clientNotifications"]);
        queryClient.invalidateQueries(["unreadNotificationCount"]);
      }
    );

    return () => {
      // Pusher channel will be unsubscribed when component unmounts
      // or when the channel name changes.
      // For now, we rely on the global disconnect on app unmount.
    };
  }, [queryClient]);

  return {
    notifications,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
};

// Fetch unread notification count
const fetchUnreadNotificationCount = async () => {
  const { data } = await axios.get(`${API_URL}/notifications/unread-count`);
  return data.count;
};

export const useUnreadNotificationCount = () => {
  const queryClient = useQueryClient();

  const { data: unreadCount, isLoading, error } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: fetchUnreadNotificationCount,
  });

  useEffect(() => {
    const channel = subscribeToChannel(
      `private-users.${localStorage.getItem("userId")}`,
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      (notification) => {
        queryClient.invalidateQueries(["unreadNotificationCount"]);
      }
    );

    return () => {
      // Cleanup if necessary
    };
  }, [queryClient]);

  return { unreadCount, isLoading, error };
};

