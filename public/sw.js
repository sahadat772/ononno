/* ONONNO service worker — light offline + FCM. Never hijack auth/dashboard routes. */
const CACHE_NAME = 'ononno-v4'

const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/android/launchericon-192x192.png',
  '/icons/android/launchericon-512x512.png',
]

/** Paths that must always hit the network (no HTML cache fallback to /) */
function isSensitivePath(pathname) {
  return (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/')
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Never intercept API / Supabase / non-GET
  if (url.pathname.startsWith('/api/')) return
  if (url.hostname.includes('supabase.co')) return
  if (event.request.method !== 'GET') return

  const isNavigate =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html')

  // Auth + dashboard: network-only (no stale home shell)
  if (isNavigate && isSensitivePath(url.pathname)) {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            '<!doctype html><html lang="bn"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>অনন্য</title></head><body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#0a0a1a;color:#fff;text-align:center;padding:24px"><div><p style="font-size:40px">📡</p><h1>নেটওয়ার্ক নেই</h1><p style="color:#94a3b8">ইন্টারনেট চালু করে আবার চেষ্টা করো।</p><p><a href="/" style="color:#34d399">হোমে যান</a> · <a href="' +
              url.pathname +
              '" style="color:#38bdf8">আবার চেষ্টা</a></p></div></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          ),
      ),
    )
    return
  }

  // Other navigations: network-first, only same-URL cache fallback (never force /)
  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {})
          }
          return response
        })
        .catch(() =>
          caches.match(event.request).then(
            (c) =>
              c ||
              new Response(
                '<!doctype html><html lang="bn"><body style="font-family:system-ui;text-align:center;padding:40px"><h1>অফলাইন</h1><a href="/">হোম</a></body></html>',
                { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
              ),
          ),
        ),
    )
    return
  }

  // Static assets: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})

try {
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
  importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

  firebase.initializeApp({
    apiKey: 'AIzaSyCFBSXvPChBB0tckWHtN1jY7zUpeTViNGE',
    authDomain: 'ononno-496412.firebaseapp.com',
    projectId: 'ononno-496412',
    storageBucket: 'ononno-496412.firebasestorage.app',
    messagingSenderId: '1069335677660',
    appId: '1:1069335677660:web:15e3f5bc88bf6afe5c8219',
  })

  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    const n = payload.notification || {}
    const data = payload.data || {}
    const title = n.title || data.title || 'অনন্য'
    const body = n.body || data.body || ''
    const url = data.url || data.click_action || '/'

    self.registration.showNotification(title, {
      body,
      icon: '/icons/android/launchericon-192x192.png',
      badge: '/icons/android/launchericon-96x96.png',
      tag: data.tag || 'ononno-notification',
      data: { url },
      renotify: true,
    })
  })
} catch (e) {
  console.warn('[sw] FCM init skipped', e)
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    }),
  )
})
