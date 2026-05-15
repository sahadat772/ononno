import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TeacherClient from './TeacherClient'

export default async function TeacherDashboardPage() {
    const supabase =await createServerSupabaseClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Profile fetch
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        redirect('/login')
    }

    // Role check
    if (profile.role !== 'teacher') {
        redirect('/dashboard')
    }

    return <TeacherClient teacher={profile} />
}