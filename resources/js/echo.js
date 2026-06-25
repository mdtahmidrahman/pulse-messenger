import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

const config = window.BroadcastConfig || { connection: 'reverb' };
const connection = config.connection;

if (connection === 'pusher') {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: config.pusher?.key || import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: config.pusher?.cluster || import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: true,
        authEndpoint: '/broadcasting/auth',
    });
} else {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: config.reverb?.key ?? import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: config.reverb?.host ?? import.meta.env.VITE_REVERB_HOST,
        wsPort: config.reverb?.port ?? import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: config.reverb?.port ?? import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (config.reverb?.scheme ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
    });
}

