// Service Worker optimizado - Cache First para assets, Network First para API
const CACHE_NAME = 'bimonetary-v2';
const API_CACHE = 'bimonetary-api-v2';

// Assets que se cachean en la instalación
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icon.svg',
    '/icon-192.png',
    '/icon-512.png'
];

// Instalación: precachear assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS).catch(err => {
                console.warn('Precache falló para algún recurso:', err);
            }))
            .then(() => self.skipWaiting())
    );
});

// Activación: limpiar cachés viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== API_CACHE)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: estrategia según el tipo de recurso
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo manejar GET
    if (request.method !== 'GET') return;

    // API: Network First con fallback a caché (timeout 3s)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            Promise.race([
                fetch(request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(API_CACHE).then(cache => cache.put(request, clone));
                    }
                    return response;
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 3000)
                )
            ]).catch(() =>
                caches.match(request).then(cached => cached || new Response(
                    JSON.stringify({ error: 'offline', cached: false }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                ))
            )
        );
        return;
    }

    // Assets: Cache First con actualización en background
    event.respondWith(
        caches.match(request).then(cached => {
            const fetchPromise = fetch(request).then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
