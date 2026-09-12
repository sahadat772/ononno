import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminProfileHub from '@/components/profile/AdminProfileHub'
import { isStaffAdmin } from '@/lib/admin-access'

export default async function AdminProfile() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!isStaffAdmin(profile)) {
    redirect('/dashboard/student')
  }

  return <AdminProfileHub profile={profile} />
}
