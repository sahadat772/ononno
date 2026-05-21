'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import UpgradePrompt from './UpgradePrompt'

interface SubscriptionGateProps {
  children: React.ReactNode
  feature?: string
  fallback?: React.ReactNode
}

export default function SubscriptionGate({
  children,
  feature = 'এই feature',
  fallback,
}: SubscriptionGateProps) {
  const [isPaid, setIsPaid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsPaid(false)
        setIsLoading(false)
        return
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!subscription) {
        setIsPaid(false)
        setIsLoading(false)
        return
      }

      const isExpired = subscription.expires_at
        ? new Date(subscription.expires_at) < new Date()
        : false

      setIsPaid(!isExpired)
      setIsLoading(false)
    }

    void checkSubscription()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mx-auto mb-3" />
        <div className="h-4 bg-white/10 rounded w-1/3 mx-auto" />
      </div>
    )
  }

  if (!isPaid) {
    return fallback ? <>{fallback}</> : <UpgradePrompt feature={feature} />
  }

  return <>{children}</>
}