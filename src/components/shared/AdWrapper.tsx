'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AdBanner from './AdBanner'

interface AdWrapperProps {
    position?: 'top' | 'bottom' | 'sidebar'
    className?: string
}

export default function AdWrapper({
    position = 'bottom',
    className = '',
}: AdWrapperProps) {
    const [showAd, setShowAd] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const supabase = createClient()

                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setShowAd(true)
                    setIsLoading(false)
                    return
                }

                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('status, expires_at')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (!subscription) {
                    setShowAd(true)
                    setIsLoading(false)
                    return
                }

                const isExpired = subscription.expires_at
                    ? new Date(subscription.expires_at) < new Date()
                    : false

                // Free user বা expired user কে ad দেখাও
                setShowAd(isExpired)
                setIsLoading(false)
            } catch {
                setShowAd(false)
                setIsLoading(false)
            }
        }

        void checkSubscription()
    }, [])

    if (isLoading || !showAd) return null

    return <AdBanner position={position} className={className} />
}