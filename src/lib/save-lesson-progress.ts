import { createClient } from '@/lib/supabase'
import { isFallbackId } from '@/lib/academic-fallback'
import { isLessonExamPassed } from '@/lib/curriculum-unlock'
import { notifyParentOnLessonPass } from '@/lib/notify-parent-pass'
import { resolveXpForProgress, DEFAULT_LESSON_XP_REWARD } from '@/lib/xp'

export async function saveLessonProgress(opts: {
  lessonId: string
  subjectId: string
  chapterId: string
  scorePercent: number
  /** @deprecated Prefer xpReward — XP is computed from score × reward */
  xp?: number
  xpReward?: number
  status?: string
  lessonTitle?: string
  /** Set false to force raw `xp` (e.g. kids engine accumulated XP) */
  useFormula?: boolean
}) {
  if (isFallbackId(opts.lessonId)) return { ok: true as const, skipped: true }
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'লগইন নেই' }

  const status = opts.status ?? 'completed'
  const xpEarned = resolveXpForProgress({
    scorePercent: opts.scorePercent,
    xpReward: opts.xpReward ?? DEFAULT_LESSON_XP_REWARD,
    xp: opts.xp,
    useFormula: opts.useFormula,
  })

  const payload: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: opts.lessonId,
    subject_id: opts.subjectId,
    chapter_id: opts.chapterId,
    score: opts.scorePercent,
    xp_earned: xpEarned,
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

  if (status === 'completed' && isLessonExamPassed(opts.scorePercent)) {
    notifyParentOnLessonPass({
      scorePercent: opts.scorePercent,
      lessonTitle: opts.lessonTitle || 'পাঠ',
      lessonId: opts.lessonId,
    })

    void fetch('/api/student/subject-completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: opts.subjectId,
        tryUnlock: true,
      }),
    }).catch(() => {})
  }

  return { ok: true as const, skipped: false, xp_earned: xpEarned }
}
