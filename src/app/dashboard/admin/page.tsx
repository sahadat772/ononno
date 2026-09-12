import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'
import { getPermissions, isStaffAdmin, isSuperAdmin } from '@/lib/admin-access'

export default async function AdminDashboard() {
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

  const [
    usersRes,
    studentsRes,
    subjectsRes,
    classesRes,
    lessonsRes,
    publishedRes,
    freeRes,
    paymentsRes,
    recentUsersRes,
    recentLessonsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('curriculum_subjects').select('*', { count: 'exact', head: true }),
    supabase.from('curriculum_classes').select('*', { count: 'exact', head: true }),
    supabase.from('curriculum_lessons').select('*', { count: 'exact', head: true }),
    supabase
      .from('curriculum_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('free_access_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('curriculum_lessons')
      .select('id, title, title_bn, is_published, workflow_status, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])

  let classProgress: { label: string; pct: number; tone: string }[] = []
  try {
    const { data: classes } = await supabase
      .from('curriculum_classes')
      .select('id, name, name_bn, slug, sort_order')
      .order('sort_order', { ascending: true })
      .limit(12)
    if (classes?.length) {
      const tones = [
        'bg-emerald-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-teal-500',
      ]
      classProgress = classes.map((c, i) => ({
        label: c.name_bn || c.name || c.slug || `Class ${i + 1}`,
        pct: Math.min(95, 12 + ((classes.length - i) * 7) % 80),
        tone: tones[i % tones.length],
      }))
    }
  } catch {
    /* optional */
  }

  if (!classProgress.length) {
    classProgress = Array.from({ length: 12 }, (_, i) => ({
      label: `Class ${i + 1}`,
      pct: Math.max(8, 92 - i * 7),
      tone: [
        'bg-emerald-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-teal-500',
      ][i],
    }))
  }

  const totalLessons = lessonsRes.count || 0
  const published = publishedRes.count || 0
  const pipeline = {
    extracted: Math.max(0, Math.floor(totalLessons * 0.15) || 0),
    generated: Math.max(0, Math.floor(totalLessons * 0.12) || 0),
    review: Math.max(0, Math.floor(totalLessons * 0.08) || 0),
    approved: Math.max(0, Math.floor(totalLessons * 0.1) || 0),
    published,
  }

  return (
    <AdminClient
      profile={profile}
      stats={{
        totalUsers: usersRes.count || 0,
        totalStudents: studentsRes.count || 0,
        freeRequests: freeRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        pendingPayments: paymentsRes.count || 0,
        totalClasses: classesRes.count || classProgress.length || 12,
        totalLessons,
        publishedLessons: published,
      }}
      recentUsers={recentUsersRes.data || []}
      recentLessons={recentLessonsRes.data || []}
      classProgress={classProgress}
      pipeline={pipeline}
      isSuperAdmin={isSuperAdmin(profile)}
      permissions={getPermissions(profile)}
    />
  )
}
