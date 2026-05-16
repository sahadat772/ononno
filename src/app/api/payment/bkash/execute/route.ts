import { NextRequest, NextResponse } from 'next/server'
import {  createServerSupabaseClient } from '@/lib/supabase-server'
import { executeBkashPayment } from '@/lib/bkash'

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

        const { paymentID } = await req.json()

        if (!paymentID) {
            return NextResponse.json(
                { error: 'Payment ID required' },
                { status: 400 }
            )
        }

        // bKash payment execute করো
        const executeResponse = await executeBkashPayment(paymentID)

        if (executeResponse?.statusCode !== '0000') {
            return NextResponse.json(
                { error: executeResponse?.statusMessage || 'Execution failed' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: executeResponse,
        })

    } catch (error) {
        console.error('bKash execute error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}