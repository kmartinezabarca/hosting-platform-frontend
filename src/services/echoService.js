import Echo from "laravel-echo";
import Pusher from "pusher-js";
import apiClient from "./apiClient";

window.Pusher = Pusher;

let echo;

export function getEcho() {
  if (echo) return echo;

  echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    cluster: import.meta.env.VITE_REVERB_CLUSTER || "mt1",

    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          apiClient
            .postRoot("/broadcasting/auth", {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) => {
              callback(false, response.data);
            })
            .catch((error) => {
              console.error("Channel Authorization Failed:", error);
              callback(true, error);
            });
        },
      };
    },
  });

  return echo;
}

export function disconnectEcho() {
  if (!echo) return;
  try { echo.disconnect(); } finally { echo = undefined; }
}
