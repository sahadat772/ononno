import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/login')

    switch (profile.role) {
        case 'admin':
            redirect('/dashboard/admin')
        case 'teacher':
            redirect('/dashboard/teacher')
        case 'parent':
            redirect('/dashboard/parent')
        case 'student':
            redirect('/dashboard/student')
        default:
            redirect('/login')
    }
}