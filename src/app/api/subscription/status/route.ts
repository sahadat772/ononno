import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { isPaid: false, planType: null },
                { status: 200 }
            )
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_type, status, expires_at, starts_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (!subscription) {
            return NextResponse.json(
                {
                    isPaid: false,
                    planType: null,
                    expiresAt: null,
                    isExpired: false,
                },
                { status: 200 }
            )
        }

        const isExpired = subscription.expires_at
            ? new Date(subscription.expires_at) < new Date()
            : false

        return NextResponse.json({
            isPaid: !isExpired,
            planType: subscription.plan_type,
            expiresAt: subscription.expires_at,
            startsAt: subscription.starts_at,
            isExpired,
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { isPaid: false, planType: null },
            { status: 200 }
        )
    }
}