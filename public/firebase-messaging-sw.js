/* Fallback FCM SW — primary messaging also in /sw.js */
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
  self.registration.showNotification(n.title || data.title || 'অনন্য', {
    body: n.body || data.body || '',
    icon: '/icons/android/launchericon-192x192.png',
    badge: '/icons/android/launchericon-96x96.png',
    tag: data.tag || 'ononno-notification',
    data: { url: data.url || '/' },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(clients.openWindow(url))
})
