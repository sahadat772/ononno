import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TeacherProfileClient from './TeacherProfileClient'

export default async function TeacherProfilePage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'teacher') redirect('/dashboard')

    // Total students count
    const { count: totalStudents } = await supabase
        .from('teacher_students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)

    return (
        <TeacherProfileClient
            teacher={profile}
            totalStudents={totalStudents || 0}
        />
    )
}