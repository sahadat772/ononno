import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const PLAN_DURATION: Record<string, number> = {
    monthly: 30,
    yearly: 365,
    family: 365,
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // Admin কিনা check করো
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Admin role check
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin only' },
                { status: 403 }
            )
        }

        // console.log('User role:', profile?.role)
        // console.log('User id:', user.id)

        const { transactionId, userId, planId, amount } = await req.json()

        if (!transactionId || !userId || !planId) {
            return NextResponse.json(
                { error: 'সব তথ্য দাও' },
                { status: 400 }
            )
        }

        // Expire date calculate করো
        const durationDays = PLAN_DURATION[planId] || 30
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + durationDays)

        // Transaction status success করো
        const { error: txError } = await supabase
            .from('payment_transactions')
            .update({
                status: 'success',
                metadata: {
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                },
            })
            .eq('transaction_id', transactionId)

        // console.log('txError:', txError)

        if (txError) {
            return NextResponse.json(
                { error: 'Transaction update failed' },
                { status: 500 }
            )
        }

        // Subscription activate করো
        const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan_type: planId,
                amount: amount,
                currency: 'BDT',
                status: 'active',
                payment_method: 'manual',
                starts_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
            }, {
                onConflict: 'user_id'
            })

        // console.log('subError:', subError)

        if (subError) {
            return NextResponse.json(
                { error: 'Subscription update failed' },
                { status: 500 }
            )
        }

        // Notification
        const { error: notifError } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title: 'সাবস্ক্রিপশন Activate হয়েছে! 🎉',
                message: `তোমার ${planId} প্ল্যান সফলভাবে activate হয়েছে।`,
                type: 'payment_success',
                is_read: false,
            })

        console.log('notifError:', notifError)

        return NextResponse.json({
            success: true,
            message: 'Payment approved এবং subscription activate হয়েছে',
            expiresAt: expiresAt.toISOString(),
        })

    } catch (error) {
        console.error('Approve error full:', JSON.stringify(error, null, 2))
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}