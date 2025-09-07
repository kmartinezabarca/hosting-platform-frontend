import React from 'react';
import { useClientNotifications, useUnreadNotificationCount } from '../hooks/useClientNotifications';
import { useSupportChat, useUnreadChatCount } from '../hooks/useClientChat';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { useAdminChat } from '../hooks/useAdminChat';

// This component serves as an example of how to integrate the Pusher hooks
// into your React application. You would typically use these hooks within
// your actual UI components (e.g., a NotificationBell component, a ChatWindow component).

const PusherIntegrationExample = ({ userRole }) => {
  // Client-side hooks
  const { notifications, isLoading: loadingNotifications, error: notificationsError, markAsRead, markAllAsRead, deleteNotification } = useClientNotifications();
  const { unreadCount: unreadNotificationCount, isLoading: loadingUnreadNotifications, error: unreadNotificationsError } = useUnreadNotificationCount();

  const { supportRoom, messages, isLoadingRoom, isLoadingMessages, roomError, messagesError, sendMessage, markChatAsRead, closeChatRoom } = useSupportChat();
  const { unreadCount: unreadChatCount, isLoading: loadingUnreadChat, error: unreadChatError } = useUnreadChatCount();

  // Admin-side hooks
  const { notifications: adminNotifications, isLoading: loadingAdminNotifications, error: adminNotificationsError, stats: adminNotificationStats, broadcastNotification, sendNotificationToUser, markAsRead: markAdminAsRead, markAllAsRead: markAllAdminAsRead, deleteNotification: deleteAdminNotification } = useAdminNotifications();
  const { activeRooms, allRooms, chatStats, unreadCount: adminUnreadChatCount, isLoadingActiveRooms, isLoadingAllRooms, isLoadingChatStats, isLoadingUnreadCount: loadingAdminUnreadChat, activeRoomsError, allRoomsError, chatStatsError, unreadChatCountError, fetchAdminChatMessages, sendAdminMessage, assignChatRoom, closeAdminChatRoom, reopenAdminChatRoom } = useAdminChat();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Pusher Integration Example</h1>

      {userRole === 'client' && (
        <section style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
          <h2>Client Dashboard</h2>
          <h3>Notifications ({unreadNotificationCount} unread)</h3>
          {loadingUnreadNotifications && <p>Loading unread count...</p>}
          {unreadNotificationsError && <p>Error loading unread count: {unreadNotificationsError.message}</p>}
          {loadingNotifications && <p>Loading notifications...</p>}
          {notificationsError && <p>Error loading notifications: {notificationsError.message}</p>}
          <ul>
            {notifications?.map(notification => (
              <li key={notification.id} style={{ background: notification.read_at ? '#f0f0f0' : '#e0f7fa', padding: '10px', marginBottom: '5px', borderRadius: '4px' }}>
                {notification.data.message} - {new Date(notification.created_at).toLocaleString()}
                {!notification.read_at && (
                  <button onClick={() => markAsRead(notification.id)} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>Mark as Read</button>
                )}
                <button onClick={() => deleteNotification(notification.id)} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer', background: '#f44336', color: 'white' }}>Delete</button>
              </li>
            ))}
          </ul>
          <button onClick={() => markAllAsRead()} style={{ padding: '10px 15px', cursor: 'pointer', marginTop: '10px' }}>Mark All as Read</button>

          <h3 style={{ marginTop: '20px' }}>Support Chat</h3>
          {isLoadingRoom && <p>Loading support room...</p>}
          {roomError && <p>Error loading room: {roomError.message}</p>}
          {supportRoom && (
            <div>
              <p>Room ID: {supportRoom.id}</p>
              <p>Status: {supportRoom.status}</p>
              {isLoadingMessages && <p>Loading messages...</p>}
              {messagesError && <p>Error loading messages: {messagesError.message}</p>}
              <div style={{ border: '1px solid #ccc', height: '200px', overflowY: 'scroll', padding: '10px', marginBottom: '10px' }}>
                {messages?.map(msg => (
                  <div key={msg.id} style={{ marginBottom: '5px', textAlign: msg.sender_id === supportRoom.user_id ? 'right' : 'left' }}>
                    <span style={{ background: msg.sender_id === supportRoom.user_id ? '#dcf8c6' : '#e0e0e0', padding: '5px 10px', borderRadius: '10px' }}>
                      {msg.message}
                    </span>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    sendMessage({ chatRoomId: supportRoom.id, message: e.target.value.trim() });
                    e.target.value = '';
                  }
                }}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button onClick={() => markChatAsRead(supportRoom.id)} style={{ padding: '10px 15px', cursor: 'pointer', marginTop: '10px' }}>Mark Chat as Read</button>
              <button onClick={() => closeChatRoom(supportRoom.id)} style={{ padding: '10px 15px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px', background: '#f44336', color: 'white' }}>Close Chat</button>
            </div>
          )}
        </section>
      )}

      {userRole === 'admin' && (
        <section style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
          <h2>Admin Dashboard</h2>
          <h3>Notifications</h3>
          {loadingAdminNotifications && <p>Loading admin notifications...</p>}
          {adminNotificationsError && <p>Error loading admin notifications: {adminNotificationsError.message}</p>}
          <ul>
            {adminNotifications?.map(notification => (
              <li key={notification.id} style={{ background: notification.read_at ? '#f0f0f0' : '#e0f7fa', padding: '10px', marginBottom: '5px', borderRadius: '4px' }}>
                {notification.data.message} - {new Date(notification.created_at).toLocaleString()}
                {!notification.read_at && (
                  <button onClick={() => markAdminAsRead(notification.id)} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>Mark as Read</button>
                )}
                <button onClick={() => deleteAdminNotification(notification.id)} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer', background: '#f44336', color: 'white' }}>Delete</button>
              </li>
            ))}
          </ul>
          <button onClick={() => markAllAdminAsRead()} style={{ padding: '10px 15px', cursor: 'pointer', marginTop: '10px' }}>Mark All as Read</button>
          <button onClick={() => broadcastNotification({ message: 'New admin broadcast!' })} style={{ padding: '10px 15px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px', background: '#4CAF50', color: 'white' }}>Broadcast Notification</button>

          <h3 style={{ marginTop: '20px' }}>Admin Chat Rooms</h3>
          {isLoadingActiveRooms && <p>Loading active chat rooms...</p>}
          {activeRoomsError && <p>Error loading active rooms: {activeRoomsError.message}</p>}
          <ul>
            {activeRooms?.map(room => (
              <li key={room.id} style={{ background: '#e6e6fa', padding: '10px', marginBottom: '5px', borderRadius: '4px' }}>
                Room ID: {room.id} - User: {room.user_name} - Status: {room.status}
                <button onClick={() => closeAdminChatRoom(room.id)} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer', background: '#f44336', color: 'white' }}>Close</button>
                <button onClick={() => reopenAdminChatRoom(room.id)} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer', background: '#2196F3', color: 'white' }}>Reopen</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default PusherIntegrationExample;


