'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams, useSearchParams } from 'next/navigation'
import StudySessionTimer from '@/components/student/StudySessionTimer'
import AiTeacherPanel from '@/components/student/AiTeacherPanel'
import { fallbackLessons, isFallbackId } from '@/lib/academic-fallback'
import {
  scoreToBand,
  bandLabelBn,
  bandColor,
  type PerformanceBand,
} from '@/lib/quiz-performance'
import {
  CURRICULUM_UNLOCK_THRESHOLD_PCT,
  isLessonExamPassed,
  resolveNextTarget,
  type NextTarget,
} from '@/lib/curriculum-unlock'
import { notifyParentOnLessonPass } from '@/lib/notify-parent-pass'

interface LessonContent {
  overview?: string | null
  main_content?: string | null
  summary?: string | null
  examples?: string[] | null
  extra_notes?: string | null
  quiz_questions?: Question[] | null
}

interface Lesson {
  id: string
  title: string
  title_bn?: string
  duration_minutes: number
  xp_reward: number
}

interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

function cleanText(raw?: string | null): string {
  if (!raw) return ''
  return raw.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function Paragraphs({ text }: { text: string }) {
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

function normalizeQuestions(raw: unknown): Question[] {
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

function extractVocabulary(content: LessonContent | null): string[] {
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

function buildQuizSummary(opts: {
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

async function saveLessonProgress(opts: {
  lessonId: string
  subjectId: string
  chapterId: string
  scorePercent: number
  xp: number
  status?: string
}) {
  if (isFallbackId(opts.lessonId)) return { ok: true as const, skipped: true }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
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

async function loadNextTargetAndProgress(opts: {
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
  const { data: { user } } = await supabase.auth.getUser()
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

export default function LessonContentPage() {
  const params = useParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string
  const searchParams = useSearchParams()
  const sessionFromUrl = searchParams.get('session')

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<LessonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [quizDone, setQuizDone] = useState(false)
  const [scorePercent, setScorePercent] = useState(0)
  const [band, setBand] = useState<PerformanceBand>('unknown')
  const [quizSummary, setQuizSummary] = useState('')
  const [savingProgress, setSavingProgress] = useState(false)
  const [progressMsg, setProgressMsg] = useState<string | null>(null)
  const [quizPhase, setQuizPhase] = useState<'base' | 'ai'>('base')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [nextUnlocked, setNextUnlocked] = useState(false)
  const [nextTarget, setNextTarget] = useState<NextTarget | null>(null)
  const [chapterProg, setChapterProg] = useState<{ done: number; total: number; pct: number } | null>(null)

  useEffect(() => {
    const fetchLesson = async () => {
      if (isFallbackId(lessonId) || isFallbackId(chapterId)) {
        const list = fallbackLessons(chapterId)
        const fb = list.find((l) => l.id === lessonId) || list[0]
        if (fb) {
          setLesson({
            id: fb.id,
            title: fb.title,
            title_bn: fb.title_bn,
            duration_minutes: fb.duration_minutes,
            xp_reward: fb.xp_reward,
          })
          setContent({
            overview: fb.overview || null,
            main_content: fb.main_content || null,
            summary: fb.summary || null,
          })
          setQuestions([
            {
              question: 'এই পাঠের মূল লক্ষ্য কী?',
              options: ['শেখা ও অনুশীলন', 'শুধু পড়া', 'খেলা', 'ঘুমানো'],
              correct: 0,
              explanation: 'পাঠ পড়ে অনুশীলন করলে শেখা মজবুত হয়।',
            },
          ])
        }
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('curriculum_lessons')
        .select(
          `id, title, title_bn, duration_minutes, xp_reward,
           lesson_contents (
             overview, main_content, summary, examples, extra_notes, quiz_questions
           )`,
        )
        .eq('id', lessonId)
        .eq('is_published', true)
        .maybeSingle()

      if (data) {
        setLesson({
          id: data.id,
          title: data.title,
          title_bn: data.title_bn,
          duration_minutes: data.duration_minutes ?? 30,
          xp_reward: data.xp_reward ?? 10,
        })
        const raw = data.lesson_contents as LessonContent | LessonContent[] | null
        const stored = Array.isArray(raw) ? raw[0] : raw
        setContent(stored ?? null)
        const storedQuiz = normalizeQuestions(stored?.quiz_questions)
        if (storedQuiz.length > 0) setQuestions(storedQuiz)
      }
      setLoading(false)
    }
    void fetchLesson()
  }, [lessonId, chapterId])

  const displayTitle = lesson?.title_bn || lesson?.title || 'পাঠ'

  const runGenerateAiQuiz = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 4 }),
      })
      const json = (await res.json()) as { questions?: Question[]; message?: string; error?: string }
      if (!res.ok || !json.questions?.length) {
        setAiError(json.message || json.error || 'পরীক্ষা তৈরি হয়নি')
        return
      }
      setQuestions(json.questions)
      setAnswers({})
      setQuizDone(false)
      setScore(0)
      setScorePercent(0)
      setBand('unknown')
      setQuizSummary('')
      setXpEarned(0)
      setProgressMsg(null)
      setNextUnlocked(false)
      setNextTarget(null)
      setQuizPhase('ai')
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'নেটওয়ার্ক এরর')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">⚙️</motion.div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] p-6 text-white">
        <p className="mb-3 text-4xl">📭</p>
        <p className="font-semibold">পাঠ পাওয়া যায়নি বা এখনো প্রকাশ হয়নি</p>
        <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`} className="mt-4 text-blue-400">← ফিরে যাও</Link>
      </div>
    )
  }

  const vocab = extractVocabulary(content)

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <StudySessionTimer sessionId={sessionFromUrl} />
      <AiTeacherPanel lessonId={lessonId} lessonTitle={displayTitle} />
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`} className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">←</Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-bold">{displayTitle}</p>
            <p className="text-[10px] text-violet-300">পাঠ · শব্দার্থ · পরীক্ষা ≥৬০%</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <h1 className="text-2xl font-black">{displayTitle}</h1>
        <p className="text-sm text-slate-400">পাঠ লোড হয়েছে। পূর্ণ UI restore চলছে — refresh করুন যদি দেখতে না পান।</p>
        <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`} className="text-sky-400">← অধ্যায়ে ফিরে</Link>
      </div>
    </div>
  )
}
