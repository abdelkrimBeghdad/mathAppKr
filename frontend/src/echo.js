import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api/axios';

window.Pusher = Pusher;

// Connect to Laravel Reverb via Echo
const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                console.log(`[Echo] Authenticating for channel: ${channel.name} with socketId: ${socketId}`);
                api.post('/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                    .then(response => {
                        console.log(`[Echo] Auth successful for ${channel.name}`);
                        callback(false, response.data);
                    })
                    .catch(error => {
                        console.error(`[Echo] Auth failed for ${channel.name}:`, error.response?.data || error.message);
                        callback(true, error);
                    });
            }
        };
    },
});

echo.connector.pusher.connection.bind('connected', () => {
    console.log('[Echo] Connected to Reverb!');
});

echo.connector.pusher.connection.bind('error', (err) => {
    console.error('[Echo] Connection error:', err);
});

export default echo;
