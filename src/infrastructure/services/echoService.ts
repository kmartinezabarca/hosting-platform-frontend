import Echo from "laravel-echo";
import Pusher from "pusher-js";
import apiClient from "./apiClient";

(window as any).Pusher = Pusher;

let echo;

export function getEcho() {
  if (echo) return echo;

  const isTLS = import.meta.env.VITE_REVERB_SCHEME === "https";

  echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: isTLS ? undefined : Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: isTLS ? Number(import.meta.env.VITE_REVERB_PORT ?? 443) : undefined,
    forceTLS: isTLS,
    enabledTransports: isTLS ? ["wss"] : ["ws"],
    disableStats: true,

    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          apiClient
            .postRoot("/broadcasting/auth", {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) => {
              callback(null as any, response.data as any);
            })
            .catch((error) => {
              console.error("Channel Authorization Failed:", error);
              callback(error, null);
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
