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

        // SSLCommerz এ validate করো — সবচেয়ে গুরুত্বপূর্ণ step
        const validation = await validateSSLCommerz(valId)

        if (validation?.status !== 'VALID' && validation?.status !== 'VALIDATED') {
            // Fail page এ redirect করো
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=validation_failed`
            )
        }

        const plan = plans[planId as PlanId]
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

        // Transaction status update করো
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

        // Success page এ redirect করো
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/success?plan=${planId}`
        )

    } catch (error) {
        console.error('SSLCommerz success error:', error)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=server_error`
        )
    }
}