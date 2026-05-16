import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NotificationsClient from './NotificationsClient'

export default async function ParentNotificationsPage() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, id, full_name')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'parent') redirect('/dashboard')

    return (
        <NotificationsClient
            userId={profile.id}
            userName={profile.full_name}
        />
    )
}