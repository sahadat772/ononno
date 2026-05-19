import { createServerSupabaseClient } from '@/lib/supabase-server'

export interface SubscriptionStatus {
    isPaid: boolean
    planType: string | null
    expiresAt: string | null
    isExpired: boolean
}

export async function getSubscriptionStatus(
    userId: string
): Promise<SubscriptionStatus> {
    const supabase = await createServerSupabaseClient()

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!subscription) {
        return {
            isPaid: false,
            planType: null,
            expiresAt: null,
            isExpired: false,
        }
    }

    const isExpired = subscription.expires_at
        ? new Date(subscription.expires_at) < new Date()
        : false

    return {
        isPaid: !isExpired,
        planType: subscription.plan_type,
        expiresAt: subscription.expires_at,
        isExpired,
    }
}

export function isPaidPlan(planType: string | null): boolean {
    if (!planType) return false
    const freePlans = ['free']
    return !freePlans.includes(planType)
}