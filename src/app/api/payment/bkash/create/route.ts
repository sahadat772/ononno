import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createBkashPayment, } from '@/lib/bkash'
import { plans, PlanId } from '@/lib/sslcommerz'
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

        const { planId } = await req.json()

        // Plan valid কিনা check করো
        if (!plans[planId as PlanId]) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            )
        }

        const plan = plans[planId as PlanId]
        const transactionId = `BKash-${uuidv4()}`

        // Database এ pending transaction save করো
        const { error: dbError } = await supabase
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                plan_id: planId,
                amount: plan.price,
                payment_method: 'bkash',
                transaction_id: transactionId,
                status: 'pending',
                metadata: { planId },
            })

        if (dbError) {
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            )
        }

        // bKash payment create করো
        const bkashResponse = await createBkashPayment({
            amount: plan.price,
            transactionId,
            planId,
        })

        if (bkashResponse?.statusCode !== '0000') {
            return NextResponse.json(
                { error: bkashResponse?.statusMessage || 'bKash error' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            bkashURL: bkashResponse.bkashURL,
            paymentID: bkashResponse.paymentID,
            transactionId,
        })

    } catch (error) {
        console.error('bKash create error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}