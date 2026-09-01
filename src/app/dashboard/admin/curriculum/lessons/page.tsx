import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase-admin'
import LessonsClient from './LessonsClient'

export const dynamic = 'force-dynamic'

export default async function LessonsPage() {
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
    // fallback to user session
  }

  const { data: lessons, error } = await db
    .from('curriculum_lessons')
    .select(
      `
      *,
      curriculum_chapters(id, title, title_bn),
      curriculum_subjects(id, name, name_bn),
      curriculum_classes(id, name, class_number)
    `,
    )
    .order('order_index', { ascending: true })

  const { data: chapters } = await db
    .from('curriculum_chapters')
    .select('id, title, title_bn, subject_id, class_id')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const { data: subjects } = await db
    .from('curriculum_subjects')
    .select('id, name, name_bn, class_id')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const { data: classes } = await db
    .from('curriculum_classes')
    .select('id, name, class_number')
    .eq('is_active', true)
    .order('class_number', { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-[#030711] p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-red-400">Failed to load lessons</h2>
          <p className="text-red-300 mt-2">{error.message}</p>
          <p className="text-slate-400 text-sm mt-3">
            RLS বা relation error হতে পারে। SUPABASE_SERVICE_ROLE_KEY Vercel-এ আছে কিনা চেক করো।
          </p>
        </div>
      </div>
    )
  }

  return (
    <LessonsClient
      lessons={lessons ?? []}
      chapters={chapters ?? []}
      subjects={subjects ?? []}
      classes={classes ?? []}
    />
  )
}
