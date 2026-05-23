import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPlanById } from '@/lib/plans'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // User authenticated কিনা check করো
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { planId, paymentMethod, trxId, amount } = await req.json()

        // Validation
        if (!planId || !paymentMethod || !trxId) {
            return NextResponse.json(
                { error: 'সব তথ্য দাও' },
                { status: 400 }
            )
        }

        // Plan valid কিনা check করো
        const plan = getPlanById(planId)
        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            )
        }

        if (!['bkash', 'nagad'].includes(paymentMethod)) {
            return NextResponse.json(
                { error: 'Invalid payment method' },
                { status: 400 }
            )
        }

        // Same TrxID আগে use হয়েছে কিনা check করো
        const { data: existing } = await supabase
            .from('payment_transactions')
            .select('id')
            .eq('metadata->>user_trx_id', trxId)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'এই Transaction ID আগে ব্যবহার হয়েছে' },
                { status: 400 }
            )
        }

        const transactionId = `${paymentMethod.toUpperCase()}-${uuidv4()}`

        // Payment transaction save করো
        const { error: dbError } = await supabase
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                plan_id: planId,
                amount: plan.price,
                payment_method: paymentMethod,
                transaction_id: transactionId,
                status: 'pending',
                metadata: {
                    user_trx_id: trxId,
                    submitted_amount: amount,
                    plan_name: plan.name,
                    duration: plan.durationName,
                    duration_days: plan.durationDays,
                    max_users: plan.maxUsers,
                },
            })

        if (dbError) {
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'পেমেন্ট জমা হয়েছে, Admin verify করলে activate হবে',
            transactionId,
        })

    } catch (error) {
        console.error('Manual payment submit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}