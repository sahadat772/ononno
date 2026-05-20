import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AuthRedirect() {
    const supabase = await createServerSupabaseClient()
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    console.log('USER ID:', user.id)
    console.log('USER EMAIL:', user.email)

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    console.log('PROFILE:', profile)
    console.log('ERROR:', error)

    // Session start করো
    if (profile) {
        const headersList = await headers()
        const deviceInfo = headersList.get('user-agent') || 'Unknown'

        // Session insert
        const { data: sessionData } = await adminSupabase
            .from('user_sessions')
            .insert({
                user_id: user.id,
                device_info: deviceInfo,
                login_at: new Date().toISOString(),
            })
            .select('id')
            .single()

        // Student হলে Parent/Teacher কে notification পাঠাও
        if (profile.role === 'student' && sessionData) {
            // Parent খোঁজো
            const { data: parentData } = await adminSupabase
                .from('parent_children')
                .select('parent_id')
                .eq('child_id', user.id)

            // Teacher খোঁজো
            const { data: teacherData } = await adminSupabase
                .from('teacher_students')
                .select('teacher_id')
                .eq('student_id', user.id)

            const recipients = [
                ...(parentData || []).map((p) => p.parent_id),
                ...(teacherData || []).map((t) => t.teacher_id),
            ]

            if (recipients.length > 0) {
                await adminSupabase.from('notifications').insert(
                    recipients.map((recipient_id) => ({
                        user_id: recipient_id,
                        title: 'Student Login 🔔',
                        message: `${profile.full_name} এইমাত্র login করেছে`,
                        type: 'student_login',
                        is_read: false,
                    }))
                )
            }
        }
    }

    if (profile?.role === 'admin') {
        redirect('/dashboard/admin')
    } else if (profile?.role === 'teacher') {
        redirect('/dashboard/teacher')
    } else if (profile?.role === 'parent') {
        redirect('/dashboard/parent')
    } else {
        redirect('/dashboard/student')
    }
}