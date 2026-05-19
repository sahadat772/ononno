import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerSupabaseClient()
        const { id: studentId } = await params

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID required' },
                { status: 400 }
            )
        }

        // URL params থেকে filter নাও
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const page = parseInt(searchParams.get('page') || '1')
        const offset = (page - 1) * limit

        // Sessions fetch
        const { data: sessions, error: sessionsError, count } = await supabase
            .from('user_sessions')
            .select('*', { count: 'exact' })
            .eq('user_id', studentId)
            .order('login_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (sessionsError) {
            return NextResponse.json(
                { error: sessionsError.message },
                { status: 500 }
            )
        }

        // Today এর sessions
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const { data: todaySessions } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', studentId)
            .gte('login_at', todayStart.toISOString())
            .order('login_at', { ascending: false })

        // Total duration calculate
        const totalDuration = sessions?.reduce(
            (acc, session) => acc + (session.duration_minutes || 0),
            0
        )

        // Today duration calculate
        const todayDuration = todaySessions?.reduce(
            (acc, session) => acc + (session.duration_minutes || 0),
            0
        )

        return NextResponse.json({
            sessions: sessions || [],
            todaySessions: todaySessions || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            },
            summary: {
                totalDuration,
                todayDuration,
                totalSessions: count || 0,
                todaySessionCount: todaySessions?.length || 0,
            },
        }, { status: 200 })

    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}