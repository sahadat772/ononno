import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import IslamicDashboardClient from './IslamicDashboardClient'

export default async function IslamicPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Student profile fetch
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    // Islamic progress summary fetch
    const { data: progressData } = await supabase
        .from('islamic_progress')
        .select('content_type, status')
        .eq('student_id', user.id)

    // Daily tracker fetch
    const today = new Date().toISOString().split('T')[0]
    const { data: todayTracker } = await supabase
        .from('daily_islamic_tracker')
        .select('*')
        .eq('student_id', user.id)
        .eq('date', today)
        .single()

    // Due revisions count
    const { data: dueRevisions } = await supabase
        .from('quran_memorization')
        .select('id')
        .eq('student_id', user.id)
        .lte('next_revision_at', new Date().toISOString())

    return (
        <IslamicDashboardClient
            profile={profile}
            progressData={progressData || []}
            todayTracker={todayTracker}
            dueRevisionsCount={dueRevisions?.length || 0}
        />
    )
}