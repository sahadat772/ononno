import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

async function getOrRegisterSw(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return undefined
  try {
    const existing = await navigator.serviceWorker.getRegistration('/')
    if (existing) return existing
    return await navigator.serviceWorker.register('/sw.js')
  } catch {
    try {
      return await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    } catch {
      return undefined
    }
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const supported = await isSupported()
    if (!supported) {
      console.log('FCM not supported in this browser')
      return null
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error('NEXT_PUBLIC_FIREBASE_VAPID_KEY missing')
      return null
    }

    const messaging = getMessaging(app)
    const registration = await getOrRegisterSw()
    await navigator.serviceWorker.ready

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    return token || null
  } catch (error) {
    console.error('FCM token error:', error)
    return null
  }
}

export async function onForegroundMessage(callback: (payload: unknown) => void) {
  try {
    const supported = await isSupported()
    if (!supported) return
    const messaging = getMessaging(app)
    onMessage(messaging, callback)
  } catch (error) {
    console.error('FCM message listener error:', error)
  }
}

export default app
