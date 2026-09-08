import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPlanById } from '@/lib/plans'
import { v4 as uuidv4 } from 'uuid'

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

        const body = await req.json()
        const { planId, paymentMethod, trxId, amount, senderNumber } = body as {
            planId?: string
            paymentMethod?: string
            trxId?: string
            amount?: number
            senderNumber?: string
        }

        if (!planId || !paymentMethod || !trxId) {
            return NextResponse.json({ error: 'সব তথ্য দাও' }, { status: 400 })
        }

        const cleanTrx = String(trxId).trim().toUpperCase().replace(/\s+/g, '')
        if (cleanTrx.length < 6 || cleanTrx.length > 20) {
            return NextResponse.json(
                { error: 'সঠিক Transaction ID দাও (৬–২০ অক্ষর)' },
                { status: 400 },
            )
        }

        const plan = getPlanById(planId)
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        if (!['bkash', 'nagad'].includes(paymentMethod)) {
            return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
        }

        // Same TrxID already used?
        const { data: existing } = await supabase
            .from('payment_transactions')
            .select('id')
            .eq('metadata->>user_trx_id', cleanTrx)
            .maybeSingle()

        if (existing) {
            return NextResponse.json(
                { error: 'এই Transaction ID আগে ব্যবহার হয়েছে' },
                { status: 400 },
            )
        }

        // Avoid spam: already have a pending payment for same plan in last 24h
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: recentPending } = await supabase
            .from('payment_transactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('plan_id', planId)
            .eq('status', 'pending')
            .gte('created_at', since)
            .maybeSingle()

        if (recentPending) {
            return NextResponse.json(
                {
                    error:
                        'এই প্ল্যানের জন্য ইতিমধ্যে একটি পেমেন্ট যাচাইয়ের অপেক্ষায় আছে। নতুন জমা দেওয়ার আগে অপেক্ষা করো অথবা সাপোর্টে যোগাযোগ করো।',
                },
                { status: 400 },
            )
        }

        const transactionId = `${paymentMethod.toUpperCase()}-${uuidv4()}`

        const cleanSender =
            typeof senderNumber === 'string'
                ? senderNumber.replace(/\D/g, '').slice(0, 14) || null
                : null

        const { error: dbError } = await supabase.from('payment_transactions').insert({
            user_id: user.id,
            plan_id: planId,
            amount: plan.price,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            status: 'pending',
            metadata: {
                user_trx_id: cleanTrx,
                submitted_amount: amount ?? plan.price,
                sender_number: cleanSender,
                plan_name: plan.name,
                duration: plan.durationName,
                duration_days: plan.durationDays,
                max_users: plan.maxUsers,
                class_level: plan.classLevel,
                submitted_at: new Date().toISOString(),
            },
        })

        if (dbError) {
            console.error('Manual payment insert error:', dbError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Best-effort: notify admins (ignore failure)
        try {
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .limit(20)

            if (admins && admins.length > 0) {
                await supabase.from('notifications').insert(
                    admins.map((a) => ({
                        recipient_id: a.id,
                        title: 'নতুন ম্যানুয়াল পেমেন্ট 💳',
                        body: `${plan.name} (${plan.durationName}) · ৳${plan.price} · ${paymentMethod.toUpperCase()} · Trx: ${cleanTrx}`,
                        type: 'payment_pending',
                        is_read: false,
                    })),
                )
            }
        } catch (e) {
            console.error('Admin notify failed:', e)
        }

        return NextResponse.json({
            success: true,
            message: 'পেমেন্ট জমা হয়েছে, Admin verify করলে activate হবে',
            transactionId,
        })
    } catch (error) {
        console.error('Manual payment submit error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
