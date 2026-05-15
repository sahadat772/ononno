import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { validateSSLCommerz, plans, PlanId } from '@/lib/sslcommerz'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const formData = await req.formData()

        const valId = formData.get('val_id') as string
        const tranId = formData.get('tran_id') as string
        const userId = formData.get('value_a') as string
        const planId = formData.get('value_b') as string
        const status = formData.get('status') as string

        // Payment failed বা cancelled হলে update করো
        if (status === 'FAILED' || status === 'CANCELLED') {
            await supabase
                .from('payment_transactions')
                .update({ status: 'failed' })
                .eq('transaction_id', tranId)

            return NextResponse.json({ received: true })
        }

        // SSLCommerz এ validate করো
        const validation = await validateSSLCommerz(valId)

        if (validation?.status !== 'VALID' && validation?.status !== 'VALIDATED') {
            return NextResponse.json(
                { error: 'Invalid payment' },
                { status: 400 }
            )
        }

        // Already success হয়েছে কিনা check করো
        const { data: existing } = await supabase
            .from('payment_transactions')
            .select('status')
            .eq('transaction_id', tranId)
            .single()

        if (existing?.status === 'success') {
            return NextResponse.json({ received: true })
        }

        const plan = plans[planId as PlanId]
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

        // Transaction update করো
        await supabase
            .from('payment_transactions')
            .update({
                status: 'success',
                metadata: validation,
            })
            .eq('transaction_id', tranId)

        // Subscription update করো
        await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan_id: planId,
                status: 'active',
                expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            })

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('SSLCommerz IPN error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}