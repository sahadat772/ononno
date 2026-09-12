import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import StudentProfileHub from '@/components/profile/StudentProfileHub'

export default async function StudentProfile() {
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

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('class_level, gender')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <StudentProfileHub profile={profile} studentExtra={studentProfile} />
  )
}
