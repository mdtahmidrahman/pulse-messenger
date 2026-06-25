import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

const broadcaster = import.meta.env.VITE_BROADCAST_CONNECTION || 'reverb';

if (broadcaster === 'pusher') {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
        forceTLS: true,
        authEndpoint: '/broadcasting/auth',
    });
} else {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: window.ReverbConfig?.key ?? import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: window.ReverbConfig?.host ?? import.meta.env.VITE_REVERB_HOST,
        wsPort: window.ReverbConfig?.port ?? import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: window.ReverbConfig?.port ?? import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (window.ReverbConfig?.scheme ?? import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
    });
}

