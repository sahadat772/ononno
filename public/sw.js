const CACHE_NAME = 'ononno-v1'
const STATIC_ASSETS = [
    '/',
    '/login',
    '/register',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
]

// Install — static assets cache করো
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate — পুরনো cache delete করো
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    )
    self.clients.claim()
})

// Fetch — Network first, cache fallback
self.addEventListener('fetch', (event) => {
    // API calls cache করবো না
    if (event.request.url.includes('/api/')) return

    // Supabase calls cache করবো না
    if (event.request.url.includes('supabase.co')) return

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Successful response cache করো
                if (response && response.status === 200) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone)
                    })
                }
                return response
            })
            .catch(() => {
                // Offline হলে cache থেকে দাও
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached
                    // Offline fallback page
                    return caches.match('/')
                })
            })
    )
})