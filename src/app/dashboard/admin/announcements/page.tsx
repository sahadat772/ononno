import { canAccess, isStaffAdmin } from '@/lib/admin-access'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AnnouncementsClient from './AnnouncementsClient'

export default async function AdminAnnouncementsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!isStaffAdmin(profile) || !canAccess(profile, 'announcements')) redirect('/dashboard/admin')

    return <AnnouncementsClient />
}
