const CACHE_NAME = 'stylehub-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/manifest.json',
                    '/offline.html',
                    // Add your CSS and JS files
                    // Add your icons
                ]);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).catch(() => {
                    return caches.match(OFFLINE_URL);
                });
            })
    );
});