import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ParentClient from './ParentClient'

export default async function ParentDashboard() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/login')
    if (profile.role !== 'parent') redirect('/dashboard/student')

    // parent_children table থেকে সন্তানদের তথ্য আনো
    const { data: childRelations } = await supabase
        .from('parent_children')
        .select('*, profiles!child_id(*), student_profiles!child_id(*)')
        .eq('parent_id', user.id)

    return (
        <ParentClient
            profile={profile}
            childrenData={childRelations || []}
        />
    )
}