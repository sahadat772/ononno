import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ProgressPageClient from './ProgressPageClient'

export default async function StudentProgressPage({
    params,
}: {
    params: Promise<{ studentId: string }>
}) {
    const { studentId } = await params
    const supabase = await createServerSupabaseClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Teacher role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'teacher') redirect('/dashboard')

    // Teacher এর student কিনা check করো
    const { data: relation } = await supabase
        .from('teacher_students')
        .select('id')
        .eq('teacher_id', user.id)
        .eq('student_id', studentId)
        .single()

    if (!relation) redirect('/dashboard/teacher')

    // Student profile fetch
    const { data: student } = await supabase
        .from('profiles')
        .select(`id, full_name, email, avatar_url`)
        .eq('id', studentId)
        .single()

    if (!student) redirect('/dashboard/teacher')

    // Student class level fetch
    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', studentId)
        .single()

    return (
        <ProgressPageClient
            student={{
                ...student,
                class_level: studentProfile?.class_level || 'Unknown',
            }}
            teacherId={user.id}
        />
    )
}