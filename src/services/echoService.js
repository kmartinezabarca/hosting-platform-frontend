import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const ECHO_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY;
const ECHO_HOST = import.meta.env.VITE_REVERB_HOST;
const ECHO_PORT = import.meta.env.VITE_REVERB_PORT;
const ECHO_SCHEME = import.meta.env.VITE_REVERB_SCHEME;

const echoInstance = new Echo({
    broadcaster: 'reverb',
    key: ECHO_APP_KEY,
    wsHost: ECHO_HOST,
    wsPort: ECHO_PORT,
    wssPort: ECHO_PORT,
    forceTLS: ECHO_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1', // Reverb no usa clusters de Pusher, pero Echo lo requiere
    channelAuthorization: {
        endpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    },
});

export default echoInstance;


