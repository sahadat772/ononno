import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function StudentDashboard() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/login')

  // maybeSingle — নতুন ইউজারের student_profiles row না থাকলেও পেজ ক্র্যাশ করবে না
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return <DashboardClient profile={profile} studentProfile={studentProfile} />
}
