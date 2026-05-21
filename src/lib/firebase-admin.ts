import admin from 'firebase-admin'

// Already initialized কিনা check করো
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
}

// FCM token এ notification পাঠাও
export async function sendPushNotification({
    token,
    title,
    body,
    data,
}: {
    token: string
    title: string
    body: string
    data?: Record<string, string>
}) {
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            token,
        }

        const response = await admin.messaging().send(message)
        return { success: true, messageId: response }
    } catch (error) {
        console.error('Push notification error:', error)
        return { success: false, error }
    }
}

// Multiple tokens এ notification পাঠাও
export async function sendPushToMultiple({
    tokens,
    title,
    body,
    data,
}: {
    tokens: string[]
    title: string
    body: string
    data?: Record<string, string>
}) {
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            tokens,
        }

        const response = await admin.messaging().sendEachForMulticast(message)
        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        }
    } catch (error) {
        console.error('Push multicast error:', error)
        return { success: false, error }
    }
}

export default admin