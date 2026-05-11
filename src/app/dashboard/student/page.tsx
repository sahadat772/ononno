import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function StudentDashboard() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/login')

    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <DashboardClient
            profile={profile}
            studentProfile={studentProfile}
        />
    )
}