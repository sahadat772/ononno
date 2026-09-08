import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPlanById } from '@/lib/plans'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 })
        }

        const { transactionId, userId, planId, amount } = await req.json()

        if (!transactionId || !userId || !planId) {
            return NextResponse.json({ error: 'সব তথ্য দাও' }, { status: 400 })
        }

        const plan = getPlanById(planId)
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Load existing row so we can merge metadata (don't wipe user_trx_id etc.)
        const { data: existingTx, error: fetchErr } = await supabase
            .from('payment_transactions')
            .select('id, status, metadata')
            .eq('transaction_id', transactionId)
            .maybeSingle()

        if (fetchErr || !existingTx) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        if (existingTx.status === 'success') {
            return NextResponse.json({ error: 'Already approved' }, { status: 400 })
        }

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.durationDays)

        const prevMeta =
            existingTx.metadata && typeof existingTx.metadata === 'object'
                ? (existingTx.metadata as Record<string, unknown>)
                : {}

        const { error: txError } = await supabase
            .from('payment_transactions')
            .update({
                status: 'success',
                metadata: {
                    ...prevMeta,
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                },
            })
            .eq('transaction_id', transactionId)

        if (txError) {
            return NextResponse.json({ error: 'Transaction update failed' }, { status: 500 })
        }

        const { error: subError } = await supabase.from('subscriptions').upsert(
            {
                user_id: userId,
                plan_type: planId,
                amount: amount || plan.price,
                currency: 'BDT',
                status: 'active',
                payment_method: 'manual',
                starts_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
            },
            { onConflict: 'user_id' },
        )

        if (subError) {
            return NextResponse.json({ error: 'Subscription update failed' }, { status: 500 })
        }

        await supabase.from('notifications').insert({
            recipient_id: userId,
            title: 'সাবস্ক্রিপশন Activate হয়েছে! 🎉',
            body: `তোমার ${plan.name} (${plan.durationName}) প্ল্যান সফলভাবে activate হয়েছে। ${expiresAt.toLocaleDateString('bn-BD')} পর্যন্ত valid।`,
            type: 'payment_success',
            is_read: false,
        })

        return NextResponse.json({
            success: true,
            message: 'Payment approved এবং subscription activate হয়েছে',
            expiresAt: expiresAt.toISOString(),
        })
    } catch (error) {
        console.error('Approve error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
