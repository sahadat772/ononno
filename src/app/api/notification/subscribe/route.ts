import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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

        const { token, deviceType } = await req.json()

        if (!token) {
            return NextResponse.json(
                { error: 'Token required' },
                { status: 400 }
            )
        }

        // Token save করো বা update করো
        const { error } = await supabase
            .from('fcm_tokens')
            .upsert({
                user_id: user.id,
                token,
                device_type: deviceType || 'web',
                is_active: true,
            }, {
                onConflict: 'user_id,token'
            })

        if (error) {
            return NextResponse.json(
                { error: 'Token save failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('FCM subscribe error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}