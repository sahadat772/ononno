import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()

        // Admin check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
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

        const { requestId, userId, action } = await req.json()

        if (!requestId || !userId || !action) {
            return NextResponse.json({ error: 'সব তথ্য দাও' }, { status: 400 })
        }

        if (!['approved', 'rejected'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Request status update করো
        const { error: reqError } = await supabase
            .from('free_access_requests')
            .update({
                status: action,
                verified_by: user.id,
                verified_at: new Date().toISOString(),
            })
            .eq('id', requestId)

        if (reqError) {
            return NextResponse.json({ error: 'Request update failed' }, { status: 500 })
        }

        if (action === 'approved') {
            // Profile এ is_free_tier = true করো
            await supabase
                .from('profiles')
                .update({ is_free_tier: true })
                .eq('id', userId)

            // Subscription activate করো — 1 বছরের জন্য
            const expiresAt = new Date()
            expiresAt.setFullYear(expiresAt.getFullYear() + 1)

            await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    plan_type: 'free_access',
                    amount: 0,
                    currency: 'BDT',
                    status: 'active',
                    payment_method: 'free',
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                }, { onConflict: 'user_id' })

            // Notification পাঠাও
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: userId,
                    title: 'বিনামূল্যে অ্যাক্সেস অনুমোদিত! 🎉',
                    body: 'আলহামদুলিল্লাহ! তোমার বিনামূল্যে শিক্ষার আবেদন অনুমোদিত হয়েছে। এখন সব content বিনামূল্যে ব্যবহার করতে পারবে।',
                    type: 'free_access_approved',
                    is_read: false,
                })
        } else {
            // Rejected notification
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: userId,
                    title: 'আবেদন প্রত্যাখ্যাত',
                    body: 'দুঃখিত, তোমার বিনামূল্যে শিক্ষার আবেদন এবার গ্রহণ করা সম্ভব হয়নি। আরো তথ্য জানতে যোগাযোগ করো।',
                    type: 'free_access_rejected',
                    is_read: false,
                })
        }

        return NextResponse.json({
            success: true,
            message: action === 'approved' ? 'অনুমোদিত হয়েছে!' : 'প্রত্যাখ্যাত হয়েছে',
        })

    } catch (error) {
        console.error('Free access approve error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}