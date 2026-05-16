import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ProgressPageClient from '@/app/dashboard/teacher/progress/[studentId]/ProgressPageClient'

export default async function ParentChildProgressPage({
    params,
}: {
    params: { childId: string }
}) {
    const supabase = await createServerSupabaseClient()

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
        .eq('child_id', params.childId)
        .single()

    if (!relation) redirect('/dashboard/parent')

    // Child profile fetch
    const { data: child } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', params.childId)
        .single()

    if (!child) redirect('/dashboard/parent')

    // Child class level fetch
    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', params.childId)
        .single()

    return (
        <ProgressPageClient
            student={{
                ...child,
                class_level: studentProfile?.class_level || 'Unknown',
            }}
            teacherId={user.id}
        />
    )
}