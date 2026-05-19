import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TeacherAIClient from './TeacherAIClient'

export default async function TeacherAIAssistantPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'teacher') redirect('/dashboard')

    // Teacher এর students count
    const { count: studentsCount } = await supabase
        .from('teacher_students')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id)

    return (
        <TeacherAIClient
            teacherId={profile.id}
            teacherName={profile.full_name}
            studentsCount={studentsCount || 0}
        />
    )
}