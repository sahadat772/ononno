import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ParentClient from './ParentClient'

export default async function ParentDashboard() {
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

  if (!profile) redirect('/login')
  if (profile.role !== 'parent') redirect('/dashboard/student')

  const { data: childRelations } = await supabase
    .from('parent_children')
    .select('id, child_id')
    .eq('parent_id', user.id)

  if (!childRelations || childRelations.length === 0) {
    return <ParentClient profile={profile} childrenData={[]} />
  }

  const childIds = childRelations.map((r) => r.child_id)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    { data: profiles },
    { data: studentProfiles },
    { data: allSessions },
    { data: allProgress },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', childIds),
    supabase
      .from('student_profiles')
      .select('user_id, class_level')
      .in('user_id', childIds),
    supabase
      .from('user_sessions')
      .select('user_id, login_at, logout_at, duration_minutes')
      .in('user_id', childIds)
      .order('login_at', { ascending: false }),
    supabase
      .from('learning_progress')
      .select('user_id, status, updated_at, completed_at')
      .in('user_id', childIds),
  ])

  const childrenWithData = childRelations.map((relation) => {
    const childId = relation.child_id
    const childProfile = profiles?.find((p) => p.id === childId)
    const studentProfile = studentProfiles?.find((sp) => sp.user_id === childId)
    const lastSession =
      allSessions?.find((s) => s.user_id === childId) || null
    const childProgress =
      allProgress?.filter((p) => p.user_id === childId) || []
    const completedLessons = childProgress.filter(
      (p) => p.status === 'completed',
    ).length
    const totalLessons = childProgress.length
    const weekCompleted = childProgress.filter((p) => {
      if (p.status !== 'completed') return false
      const t = p.completed_at || p.updated_at
      return t && new Date(t) >= weekAgo
    }).length

    return {
      id: relation.id,
      child_id: childId,
      profiles: {
        id: childProfile?.id || '',
        full_name: childProfile?.full_name || '',
        email: childProfile?.email || '',
        avatar_url: childProfile?.avatar_url || null,
      },
      class_level: studentProfile?.class_level || 'Unknown',
      lastSession,
      completedLessons,
      totalLessons,
      weekCompleted,
    }
  })

  return <ParentClient profile={profile} childrenData={childrenWithData} />
}
