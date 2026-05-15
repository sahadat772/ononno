import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { initSSLCommerz, plans, PlanId } from '@/lib/sslcommerz'
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

        // Request body থেকে planId নাও
        const { planId } = await req.json()

        // Plan valid কিনা check করো
        if (!plans[planId as PlanId]) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            )
        }

        // User profile নাও
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single()

        // Unique transaction id বানাও
        const transactionId = `SSL-${uuidv4()}`

        // Database এ pending transaction save করো
        const { error: dbError } = await supabase
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                plan_id: planId,
                amount: plans[planId as PlanId].price,
                payment_method: 'sslcommerz',
                transaction_id: transactionId,
                status: 'pending',
            })

        if (dbError) {
            return NextResponse.json(
                { error: 'Database error' },
                { status: 500 }
            )
        }

        // SSLCommerz init করো
        const response = await initSSLCommerz({
            userId: user.id,
            userEmail: profile?.email || user.email || '',
            userName: profile?.full_name || 'Student',
            planId: planId as PlanId,
            transactionId,
        })

        if (!response?.GatewayPageURL) {
            return NextResponse.json(
                { error: 'Payment gateway error' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            url: response.GatewayPageURL,
            transactionId,
        })

    } catch (error) {
        console.error('SSLCommerz init error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}