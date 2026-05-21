import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getSubscriptionStatus } from '@/lib/subscription'
import TeacherAIClient from './TeacherAIClient'
import UpgradePrompt from '@/components/shared/UpgradePrompt'

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

    const subscription = await getSubscriptionStatus(profile.id)

    if (!subscription.isPaid) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <UpgradePrompt feature="Teacher AI Assistant" />
                </div>
            </div>
        )
    }

    return (
        <TeacherAIClient
            teacherId={profile.id}
            teacherName={profile.full_name}
            studentsCount={studentsCount || 0}
        />
    )
}