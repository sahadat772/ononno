import { createClient } from '@/lib/supabase'
import { isFallbackId } from '@/lib/academic-fallback'
import { isLessonExamPassed } from '@/lib/curriculum-unlock'
import { notifyParentOnLessonPass } from '@/lib/notify-parent-pass'

export async function saveLessonProgress(opts: {
  lessonId: string
  subjectId: string
  chapterId: string
  scorePercent: number
  xp: number
  status?: string
  lessonTitle?: string
}) {
  if (isFallbackId(opts.lessonId)) return { ok: true as const, skipped: true }
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'লগইন নেই' }
  const status = opts.status ?? 'completed'
  const payload: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: opts.lessonId,
    subject_id: opts.subjectId,
    chapter_id: opts.chapterId,
    score: opts.scorePercent,
    xp_earned: opts.xp,
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  }
  const { error } = await supabase.from('learning_progress').upsert(payload, {
    onConflict: 'user_id,lesson_id',
  })
  if (error) {
    const ins = await supabase.from('learning_progress').insert(payload)
    if (ins.error) return { ok: false as const, error: ins.error.message }
  }

  // Phase 2: parent push on exam pass
  if (status === 'completed' && isLessonExamPassed(opts.scorePercent)) {
    notifyParentOnLessonPass({
      scorePercent: opts.scorePercent,
      lessonTitle: opts.lessonTitle || 'পাঠ',
      lessonId: opts.lessonId,
    })
  }

  return { ok: true as const, skipped: false }
}
