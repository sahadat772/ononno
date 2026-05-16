import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { executeBkashPayment, queryBkashPayment } from '@/lib/bkash'
import { plans, PlanId } from '@/lib/sslcommerz'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const searchParams = req.nextUrl.searchParams

        const paymentID = searchParams.get('paymentID')
        const status = searchParams.get('status')

        // Payment cancel বা failure হলে
        if (status === 'cancel' || status === 'failure') {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=${status}`
            )
        }

        if (!paymentID) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=invalid_payment`
            )
        }

        // bKash payment execute করো
        const executeResponse = await executeBkashPayment(paymentID)

        if (executeResponse?.statusCode !== '0000') {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=execution_failed`
            )
        }

        // Payment verify করো
        const queryResponse = await queryBkashPayment(paymentID)

        if (queryResponse?.transactionStatus !== 'Completed') {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=not_completed`
            )
        }

        const transactionId = executeResponse.merchantInvoiceNumber

        // Transaction থেকে user ও plan info নাও
        const { data: transaction } = await supabase
            .from('payment_transactions')
            .select('user_id, plan_id')
            .eq('transaction_id', transactionId)
            .single()

        if (!transaction) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=transaction_not_found`
            )
        }

        const plan = plans[transaction.plan_id as PlanId]
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

        // Transaction status update করো
        await supabase
            .from('payment_transactions')
            .update({
                status: 'success',
                metadata: {
                    paymentID,
                    executeResponse,
                    queryResponse,
                },
            })
            .eq('transaction_id', transactionId)

        // Subscription update করো
        await supabase
            .from('subscriptions')
            .upsert({
                user_id: transaction.user_id,
                plan_id: transaction.plan_id,
                status: 'active',
                expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id'
            })

        // Success page এ redirect করো
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/success?plan=${transaction.plan_id}`
        )

    } catch (error) {
        console.error('bKash callback error:', error)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/subscription/fail?reason=server_error`
        )
    }
}