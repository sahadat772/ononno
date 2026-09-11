/* ONONNO service worker — offline cache + FCM background push */
const CACHE_NAME = 'ononno-v2'
const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/icons/android/launchericon-192x192.png',
  '/icons/android/launchericon-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}),
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
  if (event.request.url.includes('/api/')) return
  if (event.request.url.includes('supabase.co')) return
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(event.request).then((c) => c || caches.match('/'))),
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
