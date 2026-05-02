import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminDashboard() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Debug — temporary
    console.log('Profile role:', profile?.role)

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard/student')
    }

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

    const { count: freeRequests } = await supabase
        .from('free_access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: totalSubjects } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })

    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <AdminClient
            profile={profile}
            stats={{
                totalUsers: totalUsers || 0,
                totalStudents: totalStudents || 0,
                freeRequests: freeRequests || 0,
                totalSubjects: totalSubjects || 0,
            }}
            recentUsers={recentUsers || []}
        />
    )
}