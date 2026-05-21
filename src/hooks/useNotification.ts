'use client'

import { useEffect, useState } from 'react'
import { getFCMToken, onForegroundMessage } from '@/lib/firebase'

function getInitialPermission(): NotificationPermission {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission
    }
    return 'default'
}

export function useNotification() {
    const [token, setToken] = useState<string | null>(null)
    const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Foreground message listener
        onForegroundMessage((payload: unknown) => {
            const p = payload as {
                notification?: { title?: string; body?: string }
            }
            if (p?.notification?.title) {
                new Notification(p.notification.title, {
                    body: p.notification.body || '',
                    icon: '/favicon.ico',
                })
            }
        })
    }, [])

    async function requestPermission() {
        setLoading(true)
        try {
            const result = await Notification.requestPermission()
            setPermission(result)

            if (result !== 'granted') {
                return null
            }

            const fcmToken = await getFCMToken()
            if (!fcmToken) return null

            setToken(fcmToken)

            await fetch('/api/notification/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: fcmToken,
                    deviceType: 'web',
                }),
            })

            return fcmToken

        } catch (error) {
            console.error('Notification permission error:', error)
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        token,
        permission,
        loading,
        requestPermission,
        isGranted: permission === 'granted',
        isDenied: permission === 'denied',
    }
}