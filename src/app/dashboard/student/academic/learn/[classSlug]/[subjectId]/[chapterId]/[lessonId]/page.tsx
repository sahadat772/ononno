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
import { CURRICULUM_UNLOCK_THRESHOLD_PCT } from '@/lib/curriculum-unlock'

interface LessonContent {
  overview?: string | null
  objectives?: string[] | null
  main_content?: string | null
  ai_explanation?: string | null
  examples?: string[] | null
  summary?: string | null
  extra_notes?: string | null
  quiz_questions?: Question[] | null
  cover_image_url?: string | null
  cover_image_path?: string | null
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

function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  const parts = cleanText(text).split(/\n+/).map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return (
    <div className={`space-y-3 ${className}`}>
      {parts.map((p, i) => (
        <p key={i} className="text-gray-300 leading-relaxed text-base">{p}</p>
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
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : []
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

function buildQuizSummary(opts: {
  correct: number
  total: number
  percent: number
  band: PerformanceBand
  wrongTopics: string[]
}): string {
  const { correct, total, percent, band, wrongTopics } = opts
  const lines: string[] = []
  lines.push(`কুইজ ফলাফল: ${correct}/${total} সঠিক (${percent}%) — ${bandLabelBn(band)}।`)
  if (band === 'strong') lines.push('দারুণ! এই পাঠের মূল ধারণা তুমি ভালোভাবে ধরেছো।')
  else if (band === 'medium') lines.push('ভালো চেষ্টা। আর একটু অনুশীলন করলে শক্তিশালী হবে।')
  else if (band === 'weak') lines.push('চিন্তা কোরো না — আবার পড়ে কুইজ দিলে স্কোর উন্নত হবে।')
  if (wrongTopics.length > 0) lines.push('মনোযোগ দাও: ' + wrongTopics.slice(0, 3).join(' · '))
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
            {
              question: 'পরের ধাপে কী করবে?',
              options: ['কুইজ দেবে', 'বন্ধ করবে', 'মুছে ফেলবে', 'কিছু না'],
              correct: 0,
              explanation: 'শেখার পর কুইজ দিয়ে নিজেকে যাচাই করো।',
            },
          ])
        }
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select(
          `id, title, title_bn, duration_minutes, xp_reward,
           lesson_contents (
             overview, objectives, main_content, ai_explanation,
             examples, summary, extra_notes, quiz_questions,
             cover_image_url, cover_image_path
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
      const json = (await res.json()) as {
        questions?: Question[]
        message?: string
        error?: string
      }
      if (!res.ok || !json.questions?.length) {
        setAiError(json.message || json.error || 'AI কুইজ তৈরি হয়নি')
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
      setQuizPhase('ai')
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'নেটওয়ার্ক এরর')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">⚙️</motion.div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-semibold">পাঠ পাওয়া যায়নি বা এখনো প্রকাশ হয়নি</p>
        <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`} className="mt-4 text-blue-400">← ফিরে যাও</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <StudySessionTimer sessionId={sessionFromUrl} />
      <AiTeacherPanel lessonId={lessonId} lessonTitle={displayTitle} />

      <div className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`} className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg">←</Link>
          <div className="flex-1 text-center">
            <p className="text-sm font-bold truncate">{displayTitle}</p>
            <p className="text-[10px] text-violet-300">পাঠ</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <h1 className="text-2xl font-black">{displayTitle}</h1>
        {content?.overview && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-violet-300 mb-2">সংক্ষেপ</p>
            <Paragraphs text={content.overview} />
          </div>
        )}
        {content?.main_content && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-sky-300 mb-2">মূল পাঠ</p>
            <Paragraphs text={content.main_content} />
          </div>
        )}
        {content?.summary && !quizDone && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-300 mb-2">সারাংশ</p>
            <Paragraphs text={content.summary} />
          </div>
        )}

        {questions.length > 0 && !quizDone && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-300 mb-1">
              {quizPhase === 'ai' ? '✨ AI অনুশীলন কুইজ' : 'দ্রুত কুইজ'}
            </p>
            <p className="text-xs text-amber-200/70 mb-3">
              {quizPhase === 'ai' ? 'পাঠ অনুযায়ী নতুন AI প্রশ্ন · ' : 'পাঠের সাথে থাকা প্রশ্ন · '}
              {Object.keys(answers).length}/{questions.length} সম্পন্ন
            </p>
            {questions.map((q, qi) => {
              const picked = answers[qi]
              return (
                <div key={qi} className="mb-5">
                  <p className="font-bold text-white mb-2">{qi + 1}. {q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                        className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                          picked === oi
                            ? 'border-amber-400/60 bg-amber-500/25 text-amber-50 ring-1 ring-amber-400/40'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:border-amber-400/30'
                        }`}
                      >
                        <span className="mr-2 inline-flex size-5 items-center justify-center rounded-md bg-white/10 text-[10px] font-bold text-slate-400">
                          {['ক', 'খ', 'গ', 'ঘ'][oi] ?? oi + 1}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            <button
              type="button"
              disabled={Object.keys(answers).length < questions.length}
              onClick={() => {
                void (async () => {
                  let correct = 0
                  const wrongTopics: string[] = []
                  questions.forEach((q, i) => {
                    if (answers[i] === q.correct) correct += 1
                    else wrongTopics.push(q.question.slice(0, 60))
                  })
                  const total = Math.max(questions.length, 1)
                  const percent = Math.round((correct / total) * 100)
                  const nextBand = scoreToBand(percent)
                  const xp = Math.round(((lesson?.xp_reward ?? 10) * correct) / total)
                  const summaryText = buildQuizSummary({
                    correct,
                    total: questions.length,
                    percent,
                    band: nextBand,
                    wrongTopics,
                  })
                  setScore(correct)
                  setScorePercent(percent)
                  setBand(nextBand)
                  setQuizSummary(summaryText)
                  setXpEarned(xp)
                  setQuizDone(true)
                  setProgressMsg(null)
                  const isFinal =
                    quizPhase === 'ai' && percent >= CURRICULUM_UNLOCK_THRESHOLD_PCT
                  if (isFinal) setNextUnlocked(true)
                  setSavingProgress(true)
                  try {
                    const res = await saveLessonProgress({
                      lessonId,
                      subjectId,
                      chapterId,
                      scorePercent: percent,
                      xp,
                      status: isFinal ? 'completed' : 'in_progress',
                    })
                    if (!res.ok) setProgressMsg(`প্রোগ্রেস সেভ হয়নি: ${res.error}`)
                    else if (!res.skipped) setProgressMsg(isFinal ? 'পাঠ সম্পন্ন · unlock ✓' : 'প্রোগ্রেস সেভ ✓')
                  } catch (e) {
                    setProgressMsg(e instanceof Error ? e.message : 'সেভ ব্যর্থ')
                  } finally {
                    setSavingProgress(false)
                  }
                })()
              }}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {Object.keys(answers).length < questions.length
                ? `সব প্রশ্নের উত্তর দাও (${Object.keys(answers).length}/${questions.length})`
                : '✅ উত্তর জমা দাও'}
            </button>
          </div>
        )}

        {quizDone && questions.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-center">
              <p className="text-3xl mb-2">{scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '🎉' : '💪'}</p>
              <p className="text-lg font-black text-emerald-200">
                {quizPhase === 'ai' ? 'AI কুইজ সম্পন্ন!' : 'পাঠের কুইজ সম্পন্ন!'}
              </p>
              <p className="mt-2 text-sm text-emerald-100/90">
                স্কোর: <span className="font-bold">{score}</span> / {questions.length} · {scorePercent}%
              </p>
              <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${bandColor(band)}`}>
                {bandLabelBn(band)}
              </p>
              {xpEarned > 0 && <p className="mt-2 text-xs text-amber-300">+{xpEarned} XP</p>}
              {savingProgress && <p className="mt-2 text-xs text-slate-400">সেভ হচ্ছে…</p>}
              {progressMsg && <p className="mt-1 text-xs text-slate-400">{progressMsg}</p>}
            </div>

            <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4">
              <p className="text-sm font-semibold text-violet-300 mb-2">কুইজ সারাংশ</p>
              <Paragraphs text={quizSummary || 'কুইজ সম্পন্ন হয়েছে।'} />
            </div>

            {content?.summary && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-sky-300 mb-2">পাঠের সারাংশ</p>
                <Paragraphs text={content.summary} />
              </div>
            )}

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-semibold text-amber-300 mb-3">উত্তর পর্যালোচনা</p>
              {questions.map((q, qi) => {
                const picked = answers[qi]
                const ok = picked === q.correct
                return (
                  <div key={qi} className="mb-3 border-b border-white/5 pb-3 last:border-0">
                    <p className="text-sm font-bold text-white">{ok ? '✅' : '❌'} {qi + 1}. {q.question}</p>
                    <p className="mt-1 text-xs text-slate-400">তোমার উত্তর: {picked != null ? q.options[picked] : '—'}</p>
                    {!ok && <p className="text-xs text-emerald-300">সঠিক: {q.options[q.correct]}</p>}
                    {q.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}
                  </div>
                )
              })}
            </div>

            {quizPhase === 'base' && (
              <div className="space-y-3">
                <p className="text-center text-xs text-slate-400">
                  প্ল্যান: পাঠের কুইজ → AI অতিরিক্ত প্রশ্ন → {CURRICULUM_UNLOCK_THRESHOLD_PCT}%+ এ পরের পাঠ unlock
                </p>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => void runGenerateAiQuiz()}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {aiLoading ? '⏳ AI প্রশ্ন তৈরি হচ্ছে…' : '✨ AI দিয়ে আরও প্রশ্ন তৈরি করো'}
                </button>
                {aiError && <p className="text-center text-xs text-rose-300">{aiError}</p>}
              </div>
            )}

            {quizPhase === 'ai' && (
              <div className="space-y-3">
                {nextUnlocked || scorePercent >= CURRICULUM_UNLOCK_THRESHOLD_PCT ? (
                  <>
                    <p className="text-center text-sm font-semibold text-emerald-300">
                      ✅ {scorePercent}% · পরের পাঠ unlock!
                    </p>
                    <Link
                      href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
                      className="block w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-center text-sm font-bold"
                    >
                      পরের পাঠে যাও / অধ্যায় →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-center text-sm text-amber-200">
                      Unlock-এর জন্য কমপক্ষে {CURRICULUM_UNLOCK_THRESHOLD_PCT}% লাগবে (এখন {scorePercent}%)
                    </p>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => void runGenerateAiQuiz()}
                      className="w-full rounded-xl border border-violet-400/40 bg-violet-500/15 py-3 text-sm font-bold text-violet-100"
                    >
                      {aiLoading ? '⏳…' : '✨ নতুন AI প্রশ্ন নাও'}
                    </button>
                  </>
                )}
              </div>
            )}

            <Link
              href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
              className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-slate-300"
            >
              অধ্যায়ে ফিরে যাও
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 pt-4">অনন্য · শিক্ষার্থী পাঠ</p>
      </div>
    </div>
  )
}
