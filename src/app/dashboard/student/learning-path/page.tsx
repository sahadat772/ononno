import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getSubscriptionStatus } from '@/lib/subscription'
import LearningPathClient from './LearningPathClient'
import UpgradePrompt from '@/components/shared/UpgradePrompt'

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

    const subscription = await getSubscriptionStatus(profile.id)

    if (!subscription.isPaid) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-4">
                    <div className="text-center">
                        <h1 className="text-white font-bold text-xl mb-2">
                            🤖 AI Learning Path
                        </h1>
                        <p className="text-white/40 text-sm">
                            Personalized daily study plan powered by AI
                        </p>
                    </div>
                    <UpgradePrompt feature="AI Learning Path" />
                </div>
            </div>
        )
    }

    return (
        <LearningPathClient
            studentId={profile.id}
            studentName={profile.full_name}
            classLevel={studentProfile?.class_level || 'Unknown'}
        />
    )
}