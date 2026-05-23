'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Subscription {
    plan_type: string
    status: string
    expires_at: string
    amount: number
}

export function useSubscription() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [loading, setLoading] = useState(true)
    const [now, setNow] = useState(() => new Date())

    useEffect(() => {
        async function fetchSubscription() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('subscriptions')
                    .select('plan_type, status, expires_at, amount')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .gte('expires_at', new Date().toISOString())
                    .single()

                setSubscription(data)
            } catch {
                setSubscription(null)
            } finally {
                setLoading(false)
            }
        }

        fetchSubscription()

        // প্রতি ১ মিনিটে now update করো
        const interval = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(interval)
    }, [])

    const isSubscribed = !!subscription

    const isExpiringSoon = subscription
        ? new Date(subscription.expires_at) <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        : false

    const daysLeft = subscription
        ? Math.ceil((new Date(subscription.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0

    return {
        subscription,
        loading,
        isSubscribed,
        isExpiringSoon,
        daysLeft,
        planType: subscription?.plan_type || null,
    }
}