import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import WeaknessReportClient from './WeaknessReportClient'

export default async function WeaknessReportPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, id')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'teacher') redirect('/dashboard')

    // Teacher এর students fetch
    const { data: teacherStudents } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', user.id)

    const studentIds = (teacherStudents || []).map((ts) => ts.student_id)

    // Students profiles fetch
    const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])

    return (
        <WeaknessReportClient
            students={students || []}
        />
    )
}