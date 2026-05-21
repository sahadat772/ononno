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

// Firebase app initialize করো
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// FCM token নাও
export async function getFCMToken(): Promise<string | null> {
    try {
        const supported = await isSupported()
        if (!supported) {
            console.log('FCM not supported in this browser')
            return null
        }

        const messaging = getMessaging(app)
        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })

        return token || null
    } catch (error) {
        console.error('FCM token error:', error)
        return null
    }
}

// Foreground message listener
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