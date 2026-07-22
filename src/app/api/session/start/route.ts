import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service Role client — RLS bypass করবে
const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {

        const body = await req.json()
        const { user_id, device_info } = body

        if (!user_id) {
            return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }

        // Session insert — service role দিয়ে RLS bypass
        const { data, error } = await adminSupabase
            .from('user_sessions')
            .insert({
                user_id,
                device_info: device_info || 'Unknown',
                login_at: new Date().toISOString(),
            })
            .select('id')
            .single()


        if (error) {
        
            console.log('SESSION INSERT ERROR:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Parent/Teacher notification
        const { data: parentData } = await adminSupabase
            .from('parent_children')
            .select('parent_id')
            .eq('child_id', user_id)

        const { data: teacherData } = await adminSupabase
            .from('teacher_students')
            .select('teacher_id')
            .eq('student_id', user_id)

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', user_id)
            .single()

        const studentName = profile?.full_name || 'Student'
        const recipients = [
            ...(parentData || []).map(p => p.parent_id),
            ...(teacherData || []).map(t => t.teacher_id),
        ]

        
        if (recipients.length > 0) {
            await adminSupabase.from('notifications').insert(
                recipients.map(recipient_id => ({
                    user_id: recipient_id,
                    type: 'student_login',
                    title: '🔔 Student Login',
                    message: `${studentName} এইমাত্র login করেছে`,
                    is_read: false,
                }))
            )
        }

        return NextResponse.json({ session_id: data.id }, { status: 200 })
    } catch (error) {
        console.error('SESSION START ERROR:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}