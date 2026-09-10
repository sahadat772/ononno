import { canAccess, isStaffAdmin } from '@/lib/admin-access'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LearningAnalyticsClient from './LearningAnalyticsClient'

export default async function LearningAnalyticsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, admin_permissions')
    .eq('id', user.id)
    .single()

  if (!isStaffAdmin(profile) || !canAccess(profile, 'analytics')) redirect('/dashboard/admin')

  return <LearningAnalyticsClient />
}
