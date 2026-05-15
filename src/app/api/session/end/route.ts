import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await req.json()
        const { session_id, user_id } = body

        if (!session_id || !user_id) {
            return NextResponse.json(
                { error: 'session_id and user_id required' },
                { status: 400 }
            )
        }

        // Session খোঁজো
        const { data: session, error: fetchError } = await supabase
            .from('user_sessions')
            .select('login_at')
            .eq('id', session_id)
            .eq('user_id', user_id)
            .single()

        if (fetchError || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        // Duration calculate করো
        const loginTime = new Date(session.login_at).getTime()
        const logoutTime = new Date().getTime()
        const durationMinutes = Math.round((logoutTime - loginTime) / 60000)

        // Session update করো
        const { error: updateError } = await supabase
            .from('user_sessions')
            .update({
                logout_at: new Date().toISOString(),
                duration_minutes: durationMinutes,
            })
            .eq('id', session_id)

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            )
        }

        // Activity log insert
        await supabase.from('activity_logs').insert({
            user_id,
            action: 'session_end',
            metadata: {
                session_id,
                duration_minutes: durationMinutes,
            },
        })

        return NextResponse.json(
            { message: 'Session ended', duration_minutes: durationMinutes },
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}