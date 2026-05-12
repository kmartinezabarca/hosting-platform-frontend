import Echo from "laravel-echo";
import Pusher from "pusher-js";
import apiClient from "@infrastructure/api/apiClient";

(window as any).Pusher = Pusher;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echo: Echo<any> | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEcho(): Echo<any> {
  if (echo) return echo;

  const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);

  echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort:  port,
    wssPort: port,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,

    // /broadcasting/auth usa InjectTokenFromCookie + auth:sanctum en el backend.
    // El middleware del backend lee la cookie HttpOnly `auth_token` e inyecta
    // el header Authorization automáticamente — el frontend solo manda las cookies.
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        apiClient
          .postRoot("/broadcasting/auth", {
            socket_id:    socketId,
            channel_name: channel.name,
          })
          .then((res)  => callback(null, res.data as any))
          .catch((err) => callback(err instanceof Error ? err : new Error(String(err)), null));
      },
    }),
  });

  return echo;
}

export function disconnectEcho(): void {
  if (!echo) return;
  try { echo.disconnect(); } finally { echo = undefined; }
}
