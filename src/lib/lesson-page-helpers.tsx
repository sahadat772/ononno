'use client'

import { createClient } from '@/lib/supabase'
import { isFallbackId } from '@/lib/academic-fallback'
import { bandLabelBn, type PerformanceBand } from '@/lib/quiz-performance'
import { resolveNextTarget, type NextTarget } from '@/lib/curriculum-unlock'

interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface LessonContent {
  overview?: string | null
  main_content?: string | null
  summary?: string | null
  examples?: string[] | null
  extra_notes?: string | null
  quiz_questions?: Question[] | null
}

export function cleanText(raw?: string | null): string {
  if (!raw) return ''
  return raw.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function Paragraphs({ text }: { text: string }) {
  const parts = cleanText(text).split(/\n+/).map((p) => p.trim()).filter(Boolean)
  if (!parts.length) return null
  return (
    <div className="space-y-3">
      {parts.map((p, i) => (
        <p key={i} className="text-base leading-relaxed text-gray-300">{p}</p>
      ))}
    </div>
  )
}

export function normalizeQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw)) return []
  const out: Question[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const q = item as Record<string, unknown>
    const question = String(q.question ?? '').trim()
    const options = Array.isArray(q.options)
      ? q.options.map((o) => String(o).trim()).filter(Boolean)
      : []
    let correct = Number(q.correct)
    if (!Number.isFinite(correct) || correct < 0) correct = 0
    const explanation = String(q.explanation ?? '').trim() || 'সঠিক উত্তরটি বেছে নাও।'
    if (question && options.length >= 2) {
      out.push({
        question,
        options: options.slice(0, 4),
        correct: Math.min(correct, options.length - 1),
        explanation,
      })
    }
  }
  return out
}

export function extractVocabulary(content: LessonContent | null): string[] {
  if (!content) return []
  const fromNotes: string[] = []
  const notes = content.extra_notes || ''
  if (notes.includes('শব্দার্থ') || /vocabulary/i.test(notes)) {
    for (const line of notes.split(/\n+/)) {
      const s = line.trim()
      if (!s) continue
      if (/^📚/.test(s) || /শব্দার্থ|vocabulary/i.test(s)) continue
      const cleaned = s.replace(/^\d+[.)]\s*/, '').trim()
      if (cleaned.includes('—') || cleaned.includes('-') || cleaned.includes(':')) {
        fromNotes.push(cleaned)
      }
    }
  }
  const fromExamples = (content.examples || [])
    .map((e) => String(e).trim())
    .filter((e) => /^শব্দ\s*:/i.test(e) || e.includes('—'))
    .map((e) => e.replace(/^শব্দ\s*:\s*/i, '').trim())
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of [...fromNotes, ...fromExamples]) {
    const k = v.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v)
  }
  return out.slice(0, 24)
}

export function buildQuizSummary(opts: {
  correct: number
  total: number
  percent: number
  band: PerformanceBand
  wrongTopics: string[]
}): string {
  const { correct, total, percent, band, wrongTopics } = opts
  const lines = [`কুইজ ফলাফল: ${correct}/${total} সঠিক (${percent}%) — ${bandLabelBn(band)}।`]
  if (band === 'strong') lines.push('দারুণ! মূল ধারণা ভালোভাবে ধরেছো।')
  else if (band === 'medium') lines.push('ভালো চেষ্টা। আর একটু অনুশীলন করো।')
  else if (band === 'weak') lines.push('আবার পড়ে পরীক্ষা দিলে স্কোর বাড়বে।')
  if (wrongTopics.length) lines.push('মনোযোগ দাও: ' + wrongTopics.slice(0, 3).join(' · '))
  return lines.join('\n')
}

export async function saveLessonProgress(opts: {
  lessonId: string
  subjectId: string
  chapterId: string
  scorePercent: number
  xp: number
  status?: string
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
  return { ok: true as const, skipped: false }
}

export async function loadNextTargetAndProgress(opts: {
  subjectId: string
  chapterId: string
  lessonId: string
}): Promise<{ target: NextTarget; chapterProg: { done: number; total: number; pct: number } }> {
  const supabase = createClient()
  const { data: lessons } = await supabase
    .from('curriculum_lessons')
    .select('id, title, title_bn, order_index, lesson_number')
    .eq('chapter_id', opts.chapterId)
    .eq('is_published', true)
    .order('order_index', { ascending: true })
  const orderedLessons = [...(lessons ?? [])].sort(
    (a, b) => (a.order_index ?? a.lesson_number ?? 0) - (b.order_index ?? b.lesson_number ?? 0),
  )
  const { data: chapters } = await supabase
    .from('curriculum_chapters')
    .select('id, title, title_bn, order_index, chapter_number')
    .eq('subject_id', opts.subjectId)
    .order('order_index', { ascending: true })
  const orderedChapters = [...(chapters ?? [])].sort(
    (a, b) => (a.order_index ?? a.chapter_number ?? 0) - (b.order_index ?? b.chapter_number ?? 0),
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let done = 0
  if (user) {
    const ids = orderedLessons.map((l) => String(l.id))
    if (ids.length) {
      const { data: prog } = await supabase
        .from('learning_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('lesson_id', ids)
      const set = new Set((prog ?? []).map((p) => String(p.lesson_id)))
      set.add(opts.lessonId)
      done = set.size
    }
  } else done = 1
  const total = Math.max(orderedLessons.length, 1)
  const pct = Math.round((done / total) * 100)
  const target = resolveNextTarget({
    currentChapterId: opts.chapterId,
    currentLessonId: opts.lessonId,
    lessonsInChapter: orderedLessons.map((l) => ({
      id: String(l.id),
      title: (l.title_bn as string) || (l.title as string),
    })),
    chaptersInSubject: orderedChapters.map((c) => ({
      id: String(c.id),
      title: (c.title_bn as string) || (c.title as string),
    })),
  })
  return { target, chapterProg: { done, total, pct } }
}
