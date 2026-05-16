import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SessionsPageClient from '@/app/dashboard/teacher/sessions/SessionsPageClient'

export default async function ParentChildSessionsPage({
    params,
}: {
    params: Promise<{ childId: string }>
}) {
    const supabase = await createServerSupabaseClient()
    const { childId } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Parent role check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'parent') redirect('/dashboard')

    // Parent এর child কিনা check
    const { data: relation } = await supabase
        .from('parent_children')
        .select('id')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .single()

    if (!relation) redirect('/dashboard/parent')

    // Child profile fetch
    const { data: child } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', childId)
        .single()

    if (!child) redirect('/dashboard/parent')

    // Child class level fetch
    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', childId)
        .single()

    const selectedStudent = {
        ...child,
        class_level: studentProfile?.class_level || 'Unknown',
    }

    return (
        <SessionsPageClient
            teacherId={user.id}
            students={[selectedStudent]}
            selectedStudent={selectedStudent}
        />
    )
}