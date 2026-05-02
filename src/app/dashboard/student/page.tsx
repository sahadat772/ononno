import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
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

    const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student" className="text-lg font-bold text-gradient-primary">
                        Ononno
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 hidden md:block">
                            👋 {profile?.full_name}
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
                <DashboardClient
                    profile={profile}
                    studentProfile={studentProfile}
                />
            </div>
        </main>
    )
}