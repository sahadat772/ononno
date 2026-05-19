import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LearningPathClient from './LearningPathClient'

export default async function LearningPathPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, id, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'student') redirect('/dashboard')

    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', user.id)
        .single()

    return (
        <LearningPathClient
            studentId={profile.id}
            studentName={profile.full_name}
            classLevel={studentProfile?.class_level || 'Unknown'}
        />
    )
}