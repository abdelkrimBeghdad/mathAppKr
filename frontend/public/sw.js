const CACHE_NAME = 'najah-4am-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // API requests: network-first
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets: cache-first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                // Update cache in background
                fetch(request).then((response) => {
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
                }).catch(() => { });
                return cached;
            }
            return fetch(request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                return response;
            }).catch(() => caches.match(request));
        })
    );
});

// Background Sync for offline quiz submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-quiz') {
        event.waitUntil(syncQuizData());
    }
});

async function syncQuizData() {
    try {
        const cache = await caches.open('offline-data');
        const requests = await cache.keys();
        for (const request of requests) {
            const response = await cache.match(request);
            const data = await response.json();
            await fetch(request.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            await cache.delete(request);
        }
    } catch (e) {
        console.error('Sync failed:', e);
    }
}
