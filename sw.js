const CACHE_NAME = 'stylehub-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/pic.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(fetchResponse => {
                    // Cache successful responses
                    if (fetchResponse && fetchResponse.status === 200) {
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return fetchResponse;
                });
            }).catch(() => {
                // Return cached homepage for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            })
    );
});