import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ReadinessClient from './ReadinessClient'
import { canAccess, isStaffAdmin } from '@/lib/admin-access'

export default async function AdminReadinessPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, admin_permissions')
    .eq('id', user.id)
    .single()

  if (!isStaffAdmin(profile) || !canAccess(profile, 'readiness')) {
    redirect('/dashboard/admin')
  }

  return <ReadinessClient adminName={profile.full_name?.split(' ')[0] || 'Admin'} />
}
