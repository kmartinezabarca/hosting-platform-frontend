// src/services/pusherService.js
import Pusher from "pusher-js";

const API_URL = "http://localhost:8000"; // ej: http://localhost:8000
const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_APP_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER;

let pusherInstance = null;

export const getPusherInstance = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      forceTLS: true,

      // 👇 MUY IMPORTANTE: autoriza private/presence contra tu API Laravel
      channelAuthorization: {
        endpoint: `${API_URL}/broadcasting/auth`,
        transport: "ajax",
        withCredentials: true,
      },

      // si quieres ver logs en dev:
      // logToConsole: import.meta.env.DEV,
    });
  }
  return pusherInstance;
};

export const subscribeToChannel = (channelName) => {
  return new Promise((resolve, reject) => {
    const pusher = getPusherInstance();
    const channel = pusher.subscribe(channelName);
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Suscripción exitosa a " + channelName);
      resolve(channel);
    });
    channel.bind("pusher:subscription_error", (status) => {
      console.error("Error de suscripción a " + channelName);
      reject(status);
    });
  });
};

export const unsubscribeFromChannel = (channelName) => {
  const p = getPusherInstance();
  p.unsubscribe(channelName);
};

export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};
