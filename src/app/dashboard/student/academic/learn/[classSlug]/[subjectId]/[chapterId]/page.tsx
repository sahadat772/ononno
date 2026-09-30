'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams, useSearchParams } from 'next/navigation'
import { fallbackChapters, fallbackLessons, isFallbackId } from '@/lib/academic-fallback'
import {
  isLessonUnlockedByCompletion,
  chapterProgressPct,
  CURRICULUM_UNLOCK_THRESHOLD_PCT,
  isLessonExamPassed,
} from '@/lib/curriculum-unlock'
import { normalizeQuestions, saveLessonProgress } from '@/lib/lesson-page-helpers'

interface Lesson {
  id: string
  title: string
  title_bn: string
  lesson_number?: number
  order_index?: number
  duration_minutes?: number
  xp_reward?: number
  is_published?: boolean
  workflow_status?: string
  is_active?: boolean
}

interface Chapter {
  id: string
  title: string
  title_bn: string
  description?: string | null
}

type Question = {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function ChapterLessonsPage() {
  const params = useParams()
  const search = useSearchParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string
  const forceExam = search.get('exam') === '1'

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())

  const [examOpen, setExamOpen] = useState(false)
  const [examQs, setExamQs] = useState<Question[]>([])
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [examDone, setExamDone] = useState(false)
  const [examPercent, setExamPercent] = useState(0)
  const [examLoading, setExamLoading] = useState(false)
  const [examMsg, setExamMsg] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      try {
        if (isFallbackId(chapterId)) {
          const fbChaps = fallbackChapters(subjectId)
          const fb = fbChaps.find((c) => c.id === chapterId)
          if (fb) setChapter(fb)
          setLessons(fallbackLessons(chapterId))
          setLoading(false)
          return
        }

        const { data: chap } = await supabase
          .from('curriculum_chapters')
          .select('*')
          .eq('id', chapterId)
          .maybeSingle()
        if (chap) setChapter(chap)
        else {
          const fbChaps = fallbackChapters(subjectId)
          const fb = fbChaps.find((c) => c.id === chapterId)
          if (fb) setChapter(fb)
        }

        const { data: les } = await supabase
          .from('curriculum_lessons')
          .select(
            'id, title, title_bn, lesson_number, order_index, duration_minutes, xp_reward, is_published, workflow_status, is_active',
          )
          .eq('chapter_id', chapterId)
          .eq('is_published', true)
          .order('order_index', { ascending: true })

        if (les && les.length > 0) {
          const sorted = [...les].sort(
            (a, b) =>
              (a.order_index ?? a.lesson_number ?? 0) -
              (b.order_index ?? b.lesson_number ?? 0),
          )
          setLessons(sorted)
        } else {
          setLessons(fallbackLessons(chapterId))
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: prog } = await supabase
            .from('learning_progress')
            .select('lesson_id, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')
          setDoneIds(
            new Set(
              (prog ?? []).map((p) => String(p.lesson_id)).filter(Boolean),
            ),
          )
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'লোড ব্যর্থ')
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [chapterId, subjectId])

  const title = chapter?.title_bn || chapter?.title || 'অধ্যায়'
  const pct = chapterProgressPct(
    lessons.map((l) => String(l.id)),
    doneIds,
  )
  const chapterComplete = pct >= 100 && lessons.length > 0

  useEffect(() => {
    if (forceExam && chapterComplete) setExamOpen(true)
  }, [forceExam, chapterComplete])

  const startChapterExam = async () => {
    setExamLoading(true)
    setExamDone(false)
    setExamAnswers({})
    setExamMsg(null)
    try {
      const supabase = createClient()
      const ids = lessons.map((l) => l.id)
      const collected: Question[] = []

      if (!isFallbackId(chapterId) && ids.length > 0) {
        const { data: contents } = await supabase
          .from('lesson_contents')
          .select('lesson_id, quiz_questions')
          .in('lesson_id', ids)

        for (const row of contents ?? []) {
          const qs = normalizeQuestions(row.quiz_questions)
          collected.push(...qs)
        }
      }

      if (collected.length < 3 && ids[0] && !isFallbackId(ids[0])) {
        try {
          const res = await fetch(`/api/student/lessons/${ids[0]}/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: 6 }),
          })
          if (res.ok) {
            const json = (await res.json()) as { questions?: unknown }
            collected.push(...normalizeQuestions(json.questions))
          }
        } catch {
          /* ignore */
        }
      }

      if (collected.length === 0) {
        collected.push(
          {
            question: `${title} — এই অধ্যায়ের মূল বিষয় কী?`,
            options: ['শেখা ও অনুশীলন', 'শুধু মুখস্থ', 'খেলা', 'এড়িয়ে যাওয়া'],
            correct: 0,
            explanation: 'অধ্যায় পড়ে অনুশীলন ও পরীক্ষা দিতে হয়।',
          },
          {
            question: 'পাঠ পরীক্ষায় পাস মার্ক কত?',
            options: ['৪০%', '৫০%', `${CURRICULUM_UNLOCK_THRESHOLD_PCT}%`, '১০০%'],
            correct: 2,
            explanation: `পাস মার্ক ${CURRICULUM_UNLOCK_THRESHOLD_PCT}%।`,
          },
        )
      }

      setExamQs(collected.slice(0, 8))
      setExamOpen(true)
    } finally {
      setExamLoading(false)
    }
  }

  const submitChapterExam = async () => {
    let correct = 0
    examQs.forEach((q, i) => {
      if (examAnswers[i] === q.correct) correct += 1
    })
    const total = Math.max(examQs.length, 1)
    const percent = Math.round((correct / total) * 100)
    setExamPercent(percent)
    setExamDone(true)

    const passed = isLessonExamPassed(percent)
    const chapterExamId = `chapter-exam-${chapterId}`
    await saveLessonProgress({
      lessonId: chapterExamId,
      subjectId,
      chapterId,
      scorePercent: percent,
      xpReward: 25,
      status: passed ? 'completed' : 'in_progress',
    })

    setExamMsg(
      passed
        ? `✅ অধ্যায় পরীক্ষা পাস (${percent}%) — দারুণ!`
        : `পাস মার্ক ${CURRICULUM_UNLOCK_THRESHOLD_PCT}% (এখন ${percent}%) — আবার চেষ্টা করো`,
    )
  }

  return (
    <div className="min-h-screen bg-[#030711] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link
          href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}`}
          className="text-sm text-sky-400 hover:text-sky-300"
        >
          ← বিষয়ে ফিরে যাও
        </Link>
        <header>
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            পাঠ শেষ → অনুশীলন → পরীক্ষা ≥{CURRICULUM_UNLOCK_THRESHOLD_PCT}% · সব পাঠ শেষ → অধ্যায় পরীক্ষা
          </p>
          {lessons.length > 0 && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>অধ্যায় প্রোগ্রেস</span>
                <span>
                  {[...doneIds].filter((id) => lessons.some((l) => String(l.id) === id)).length}
                  /{lessons.length} · {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {chapterComplete && !examOpen && (
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 to-orange-500/10 p-5">
            <p className="mb-1 text-lg font-bold text-rose-200">📋 অধ্যায় পরীক্ষা</p>
            <p className="mb-4 text-sm text-slate-400">
              সব পাঠ শেষ! এখন পুরো অধ্যায়ের উপর পরীক্ষা দাও।
            </p>
            <button
              type="button"
              disabled={examLoading}
              onClick={() => void startChapterExam()}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {examLoading ? 'প্রশ্ন তৈরি হচ্ছে…' : 'অধ্যায় পরীক্ষা শুরু করো →'}
            </button>
          </div>
        )}

        {examOpen && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="mb-1 text-sm font-semibold text-rose-300">📋 অধ্যায় পরীক্ষা — {title}</p>
            {!examDone ? (
              <>
                <p className="mb-3 text-xs text-rose-200/70">
                  {Object.keys(examAnswers).length}/{examQs.length} সম্পন্ন · পাস ≥
                  {CURRICULUM_UNLOCK_THRESHOLD_PCT}%
                </p>
                {examQs.map((q, qi) => (
                  <div key={qi} className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="mb-2 text-sm font-medium">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => setExamAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                            examAnswers[qi] === oi
                              ? 'border-rose-400 bg-rose-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={Object.keys(examAnswers).length < examQs.length}
                  onClick={() => void submitChapterExam()}
                  className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-bold disabled:opacity-40"
                >
                  পরীক্ষা জমা দাও
                </button>
              </>
            ) : (
              <div className="space-y-3 py-2 text-center">
                <p className="text-lg font-bold text-white">{examPercent}%</p>
                {examMsg && <p className="text-sm text-rose-100">{examMsg}</p>}
                {!isLessonExamPassed(examPercent) && (
                  <button
                    type="button"
                    onClick={() => void startChapterExam()}
                    className="w-full rounded-xl border border-rose-400/40 bg-rose-500/15 py-3 text-sm font-bold"
                  >
                    আবার চেষ্টা করো
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setExamOpen(false)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-slate-300"
                >
                  বন্ধ করো
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-slate-500">লোড হচ্ছে…</p>
        ) : error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </p>
        ) : lessons.length === 0 ? (
          <p className="py-12 text-center text-slate-500">
            এই অধ্যায়ে এখনো published lesson নেই।
          </p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const done = doneIds.has(String(lesson.id))
              const prevDone =
                i === 0 || doneIds.has(String(lessons[i - 1]?.id))
              const unlocked = isLessonUnlockedByCompletion(i, prevDone)
              const href = `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${lesson.id}`
              const body = (
                <>
                  <div
                    className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${
                      done
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : unlocked
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-slate-700/50 text-slate-500'
                    }`}
                  >
                    {done
                      ? '✓'
                      : unlocked
                        ? (lesson.lesson_number ?? i + 1)
                        : '🔒'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {lesson.title_bn || lesson.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {unlocked
                        ? `${lesson.duration_minutes ?? 15} মিনিট · ${lesson.xp_reward ?? 10} XP · অনুশীলন+পরীক্ষা`
                        : 'আগের পাঠের পরীক্ষা (≥৬০%) পাস করো'}
                    </p>
                  </div>
                  <span className="text-slate-500">{unlocked ? '→' : ''}</span>
                </>
              )
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {unlocked ? (
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-sky-500/30 hover:bg-white/[0.08]"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 opacity-70">
                      {body}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
