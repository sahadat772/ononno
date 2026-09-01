import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import CurriculumDashboardClient from './components/CurriculumDashboardClient'

export const dynamic = 'force-dynamic'

export default async function CurriculumDashboard() {
  const auth = await createServerSupabaseClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await auth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  let db = auth
  try {
    db = createServiceRoleClient() as typeof auth
  } catch {
    // session fallback
  }

  const [
    classesRes,
    subjectsRes,
    chaptersRes,
    lessonsRes,
    publishedRes,
    generatedRes,
    reviewedRes,
    sourcesRes,
    versionsRes,
  ] = await Promise.all([
    db.from('curriculum_classes').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('curriculum_subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('curriculum_chapters').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('curriculum_lessons').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('curriculum_lessons').select('id', { count: 'exact', head: true }).eq('is_published', true),
    db.from('curriculum_lessons').select('id', { count: 'exact', head: true }).eq('workflow_status', 'generated'),
    db.from('curriculum_lessons').select('id', { count: 'exact', head: true }).eq('workflow_status', 'reviewed'),
    db.from('curriculum_sources').select('id, title, source_status, workflow_status, total_chapters, total_lessons, class_id, subject_id').order('created_at', { ascending: false }).limit(8),
    db.from('curriculum_versions').select('id, name, is_active, status').order('year', { ascending: false }).limit(5),
  ])

  const { data: classRows } = await db
    .from('curriculum_classes')
    .select('id, name, class_number, slug')
    .eq('is_active', true)
    .order('class_number', { ascending: true })
    .limit(20)

  const { data: subjectRows } = await db
    .from('curriculum_subjects')
    .select('id, name, name_bn, class_id')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .limit(100)

  const activeVersion =
    (versionsRes.data ?? []).find((v) => v.is_active)?.name ??
    (versionsRes.data ?? [])[0]?.name ??
    'NCTB Curriculum'

  return (
    <CurriculumDashboardClient
      stats={{
        classes: classesRes.count ?? 0,
        subjects: subjectsRes.count ?? 0,
        chapters: chaptersRes.count ?? 0,
        lessons: lessonsRes.count ?? 0,
        published: publishedRes.count ?? 0,
        generated: generatedRes.count ?? 0,
        reviewed: reviewedRes.count ?? 0,
        versions: versionsRes.data?.length ?? 0,
      }}
      activeVersion={activeVersion}
      classes={classRows ?? []}
      subjects={subjectRows ?? []}
      sources={(sourcesRes.data ?? []).map((s) => ({
        id: s.id,
        title: s.title ?? 'PDF',
        source_status: s.source_status ?? 'uploaded',
        workflow_status: s.workflow_status ?? 'draft',
        total_chapters: s.total_chapters ?? 0,
        total_lessons: s.total_lessons ?? 0,
      }))}
    />
  )
}
