import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await req.json()
        const { user_id, device_info } = body

        if (!user_id) {
            return NextResponse.json(
                { error: 'user_id required' },
                { status: 400 }
            )
        }

        // Session insert
        const { data, error } = await supabase
            .from('user_sessions')
            .insert({
                user_id,
                device_info: device_info || 'Unknown',
                login_at: new Date().toISOString(),
            })
            .select('id')
            .single()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Parent/Teacher কে notification পাঠাও
        // Parent খোঁজো
        const { data: parentData } = await supabase
            .from('parent_children')
            .select('parent_id')
            .eq('child_id', user_id)

        // Teacher খোঁজো
        const { data: teacherData } = await supabase
            .from('teacher_students')
            .select('teacher_id')
            .eq('student_id', user_id)

        // Student name খোঁজো
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user_id)
            .single()

        const studentName = profile?.full_name || 'Student'
        const recipients = [
            ...(parentData || []).map((p) => p.parent_id),
            ...(teacherData || []).map((t) => t.teacher_id),
        ]

        // Notification insert
        if (recipients.length > 0) {
            await supabase.from('notifications').insert(
                recipients.map((recipient_id) => ({
                    recipient_id,
                    sender_id: user_id,
                    type: 'student_login',
                    title: 'Student Login',
                    body: `${studentName} এইমাত্র login করেছে`,
                    is_read: false,
                }))
            )
        }

        return NextResponse.json({ session_id: data.id }, { status: 200 })
    } catch  {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}