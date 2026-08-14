import { createServerSupabaseClient } from '@/lib/supabase-server'
import SubjectsClient from './SubjectsClient'

export default async function SubjectsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: subjects, error } = await supabase
    .from('curriculum_subjects')
    .select(`
            *,
            curriculum_classes(id, name, class_number)
        `)
    .order('order_index', { ascending: true })

  const { data: classes } = await supabase
    .from('curriculum_classes')
    .select('id, name, class_number')
    .eq('is_active', true)
    .order('class_number', { ascending: true })

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="text-xl font-bold text-red-400">
          Failed to load subjects
        </h2>
        <p className="text-red-300 mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <SubjectsClient
      subjects={subjects ?? []}
      classes={classes ?? []}
    />
  )
}