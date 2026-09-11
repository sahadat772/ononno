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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void onForegroundMessage((payload: unknown) => {
      const p = payload as {
        notification?: { title?: string; body?: string }
        data?: { url?: string }
      }
      if (p?.notification?.title && typeof Notification !== 'undefined') {
        const n = new Notification(p.notification.title, {
          body: p.notification.body || '',
          icon: '/icons/android/launchericon-192x192.png',
        })
        n.onclick = () => {
          window.focus()
          if (p.data?.url) window.location.href = p.data.url
        }
      }
    })
  }, [])

  async function requestPermission() {
    setLoading(true)
    setError(null)
    try {
      if (typeof Notification === 'undefined') {
        setError('এই ব্রাউজারে Notification সাপোর্ট নেই')
        return null
      }

      const result = await Notification.requestPermission()
      setPermission(result)

      if (result !== 'granted') {
        setError('Permission denied')
        return null
      }

      const fcmToken = await getFCMToken()
      if (!fcmToken) {
        setError('FCM token পাওয়া যায়নি')
        return null
      }

      setToken(fcmToken)

      const res = await fetch('/api/notification/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          deviceType: 'web',
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Token save failed')
        return null
      }

      return fcmToken
    } catch (e) {
      console.error('Notification permission error:', e)
      setError(e instanceof Error ? e.message : 'Error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    token,
    permission,
    loading,
    error,
    requestPermission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
  }
}
