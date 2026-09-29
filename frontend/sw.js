// Service Worker optimizado v3 - Cache First + API precargada
const CACHE_NAME = 'bimonetary-v3';
const API_CACHE = 'bimonetary-api-v3';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/app.min.js',
    '/manifest.json',
    '/icon.svg',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png'
];

// Instalación: precachear assets + tasa BCV
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS).catch(err => {
                console.warn('Precache parcial falló:', err);
            }))
            .then(() => self.skipWaiting())
            .then(() => {
                // 🚀 Precargar tasa BCV en background
                return fetch('/api/bcv-rate')
                    .then(res => {
                        if (res && res.ok) {
                            return caches.open(API_CACHE).then(cache => cache.put('/api/bcv-rate', res));
                        }
                    })
                    .catch(() => {});
            })
    );
});

// Activación: limpiar cachés viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => Promise.all(
            names.filter(n => n !== CACHE_NAME && n !== API_CACHE)
                 .map(n => caches.delete(n))
        )).then(() => self.clients.claim())
    );
});

// Fetch: Cache First para assets, Network First para API
self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // API: Network First con timeout 3s + fallback caché
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            Promise.race([
                fetch(request).then(res => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(API_CACHE).then(c => c.put(request, clone));
                    }
                    return res;
                }),
                new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
            ]).catch(() =>
                caches.match(request).then(cached => cached || new Response(
                    JSON.stringify({ error: 'offline' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                ))
            )
        );
        return;
    }

    // Assets: Cache First + revalidación en background
    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request).then(res => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(request, clone));
                }
                return res;
            }).catch(() => cached);
            return cached || network;
        })
    );
});
