const CACHE_NAME = 'finanzas-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', '/index.html', '/app.js', '/icon.svg', '/manifest.json'])));
});
self.addEventListener('fetch', (e) => {
  if (!e.request.url.includes('/api/')) {
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
  }
});
