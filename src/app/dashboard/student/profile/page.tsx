import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import StudentProfileHub from '@/components/profile/StudentProfileHub'

export default async function StudentProfile() {
  try {
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

    // Prefer full student row; fall back if optional columns missing in DB
    let studentProfile: {
      class_level?: string | null
      gender?: string | null
      school_name?: string | null
    } | null = null

    const full = await supabase
      .from('student_profiles')
      .select('class_level, gender, school_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (full.error) {
      const basic = await supabase
        .from('student_profiles')
        .select('class_level, gender')
        .eq('user_id', user.id)
        .maybeSingle()
      studentProfile = basic.data
    } else {
      studentProfile = full.data
    }

    return (
      <StudentProfileHub
        profile={(profile as Record<string, string> | null) ?? null}
        studentExtra={studentProfile}
      />
    )
  } catch (e) {
    console.error('[student/profile]', e)
    // Soft fallback UI instead of hard crash
    return (
      <StudentProfileHub profile={null} studentExtra={null} />
    )
  }
}
