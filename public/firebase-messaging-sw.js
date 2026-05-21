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

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('Background message:', payload)

    const { title, body } = payload.notification

    self.registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ononno-notification',
        requireInteraction: false,
    })
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        clients.openWindow('/')
    )
})