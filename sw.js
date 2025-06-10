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
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          // Only cache valid same-origin responses
          if (fetchResponse && 
              fetchResponse.status === 200 && 
              event.request.url.startsWith(self.location.origin)) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Return cached homepage for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});