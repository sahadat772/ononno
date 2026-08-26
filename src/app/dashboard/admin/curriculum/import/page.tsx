import { createServerSupabaseClient } from '@/lib/supabase-server'
import ImportClient from './ImportClient'
import PdfPipelineClient from './PdfPipelineClient'

export default async function ImportPage() {
    const supabase = await createServerSupabaseClient()
    const { data: subjects } = await supabase.from('curriculum_subjects').select('id, name, name_bn, class_id').eq('is_active', true).order('order_index', { ascending: true })
    const { data: classes } = await supabase.from('curriculum_classes').select('id, name, class_number').eq('is_active', true).order('class_number', { ascending: true })
    const { data: sources } = await supabase.from('curriculum_sources').select('id, title, file_name, status, extracted_structure').order('created_at', { ascending: false }).limit(12)
    return <main className="space-y-6"><PdfPipelineClient classes={classes ?? []} subjects={subjects ?? []} initialSources={sources ?? []} /><details className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-slate-300"><summary className="cursor-pointer text-sm font-semibold">Legacy syllabus-image import</summary><div className="mt-4"><ImportClient subjects={subjects ?? []} classes={classes ?? []} /></div></details></main>
}
