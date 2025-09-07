import Pusher from 'pusher-js';

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_APP_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER;
const PUSHER_HOST = import.meta.env.VITE_PUSHER_HOST;
const PUSHER_PORT = import.meta.env.VITE_PUSHER_PORT;
const PUSHER_SCHEME = import.meta.env.VITE_PUSHER_SCHEME;

let pusherInstance = null;

export const getPusherInstance = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      wsHost: PUSHER_HOST,
      wsPort: PUSHER_PORT,
      wssPort: PUSHER_PORT,
      forceTLS: PUSHER_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      // Add auth endpoint if private channels are used
      // authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
      // auth: {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      //   },
      // },
    });
  }
  return pusherInstance;
};

export const subscribeToChannel = (channelName, eventName, callback) => {
  const pusher = getPusherInstance();
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, callback);
  return channel;
};

export const unsubscribeFromChannel = (channelName) => {
  const pusher = getPusherInstance();
  pusher.unsubscribe(channelName);
};

export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};


