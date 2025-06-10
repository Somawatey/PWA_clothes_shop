const CACHE_NAME = 'stylehub-v2'; // Changed version to force update
const OFFLINE_URL = '/offline.html'; // Add an offline fallback page
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/pic.jpg',
  OFFLINE_URL // Cache offline fallback
];

self.addEventListener('install', event => {
  // Skip waiting to activate the new SW immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Cache installation failed:', err))
  );
});

// Clean up old caches during activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Always fetch from network in background to update cache
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Clone the response to store in cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return networkResponse;
          })
          .catch(err => {
            console.error('Fetch failed; returning cached version', err);
            return cachedResponse;
          });

        // Return cached version immediately if available, then update
        return cachedResponse || fetchPromise;
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});