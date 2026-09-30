'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { fallbackLessons, isFallbackId } from '@/lib/academic-fallback'
import { scoreToBand, type PerformanceBand } from '@/lib/quiz-performance'
import {
  CURRICULUM_UNLOCK_THRESHOLD_PCT,
  isLessonExamPassed,
  resolveNextTarget,
  type NextTarget,
} from '@/lib/curriculum-unlock'
import {
  Paragraphs,
  normalizeQuestions,
  extractVocabulary,
  buildQuizSummary,
  saveLessonProgress,
} from '@/lib/lesson-page-helpers'

type Lesson = {
  id: string
  title: string
  title_bn?: string
  duration_minutes: number
  xp_reward: number
}

type LessonContent = {
  overview?: string | null
  main_content?: string | null
  summary?: string | null
  examples?: string[] | null
  extra_notes?: string | null
  quiz_questions?: {
    question: string
    options: string[]
    correct: number
    explanation: string
  }[] | null
}

type Question = {
  question: string
  options: string[]
  correct: number
  explanation: string
}

type Phase = 'study' | 'practice' | 'exam' | 'done'

const FALLBACK_Q: Question = {
  question: 'এই পাঠের মূল লক্ষ্য কী?',
  options: ['শেখা ও অনুশীলন', 'শুধু পড়া', 'খেলা', 'ঘুমানো'],
  correct: 0,
  explanation: 'পাঠ পড়ে অনুশীলন করলে শেখা মজবুত হয়।',
}

export default function LessonContentPage() {
  const params = useParams()
  const search = useSearchParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string
  const preview = search.get('preview') === '1'

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<LessonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('study')
  const [questions, setQuestions] = useState<Question[]>([])
  const [practiceQs, setPracticeQs] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState(0)
  const [scorePercent, setScorePercent] = useState(0)
  const [band, setBand] = useState<PerformanceBand>('unknown')
  const [quizSummary, setQuizSummary] = useState('')
  const [xpEarned, setXpEarned] = useState(0)
  const [aiLoading, setAiLoading] = useState(false)
  const [progressMsg, setProgressMsg] = useState<string | null>(null)
  const [nextTarget, setNextTarget] = useState<NextTarget | null>(null)
  const [practiceDone, setPracticeDone] = useState(false)
  const [practiceScore, setPracticeScore] = useState(0)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setErr(null)
      try {
        if (isFallbackId(lessonId)) {
          const fb = fallbackLessons(chapterId).find((l) => l.id === lessonId)
          setLesson({
            id: lessonId,
            title: fb?.title || 'পাঠ',
            title_bn: fb?.title_bn,
            duration_minutes: 15,
            xp_reward: 10,
          })
          setContent({
            overview: 'এটি ডেমো পাঠ।',
            main_content: 'মূল বিষয়বস্তু পড়ো, তারপর অনুশীলন ও পরীক্ষা দাও।',
            summary: 'শেখা + অনুশীলন = সাফল্য।',
            quiz_questions: [FALLBACK_Q],
          })
          setPracticeQs([FALLBACK_Q])
          setLoading(false)
          return
        }

        const supabase = createClient()
        let allowUnpublished = false
        if (preview) {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle()
            allowUnpublished = prof?.role === 'admin' || prof?.role === 'teacher'
          }
        }

        let q = supabase
          .from('curriculum_lessons')
          .select(
            'id, title, title_bn, duration_minutes, xp_reward, is_published, lesson_contents(overview, main_content, summary, examples, extra_notes, quiz_questions)',
          )
          .eq('id', lessonId)
        if (!allowUnpublished) q = q.eq('is_published', true)

        const { data, error } = await q.maybeSingle()
        if (error) {
          setErr(error.message)
          return
        }
        if (!data) {
          setErr(
            allowUnpublished
              ? 'পাঠ পাওয়া যায়নি'
              : 'পাঠ publish করা নেই — Admin থেকে Publish করুন',
          )
          return
        }

        setLesson({
          id: data.id,
          title: data.title,
          title_bn: data.title_bn,
          duration_minutes: data.duration_minutes ?? 15,
          xp_reward: data.xp_reward ?? 10,
        })
        const raw = data.lesson_contents as LessonContent | LessonContent[] | null
        const stored = Array.isArray(raw) ? raw[0] ?? null : raw
        setContent(stored)
        const storedQuiz = normalizeQuestions(stored?.quiz_questions)
        setPracticeQs(storedQuiz.length > 0 ? storedQuiz : [FALLBACK_Q])
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'লোড ব্যর্থ')
      } finally {
        setLoading(false)
      }
    })()
  }, [lessonId, chapterId, preview])

  const loadNext = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: les } = await supabase
        .from('curriculum_lessons')
        .select('id, title, title_bn, order_index, lesson_number')
        .eq('chapter_id', chapterId)
        .eq('is_published', true)
        .order('order_index', { ascending: true })
      const lessonsInChapter = (les ?? []).map((l) => ({
        id: String(l.id),
        title: l.title_bn || l.title || 'পাঠ',
      }))
      const { data: chaps } = await supabase
        .from('curriculum_chapters')
        .select('id, title, title_bn, order_index')
        .eq('subject_id', subjectId)
        .order('order_index', { ascending: true })
      const chaptersInSubject = (chaps ?? []).map((c) => ({
        id: String(c.id),
        title: c.title_bn || c.title || 'অধ্যায়',
      }))
      setNextTarget(
        resolveNextTarget({
          currentChapterId: chapterId,
          currentLessonId: lessonId,
          lessonsInChapter,
          chaptersInSubject,
        }),
      )
    } catch {
      /* ignore */
    }
  }, [chapterId, lessonId, subjectId])

  const startPractice = () => {
    setAnswers({})
    setQuestions(practiceQs)
    setPhase('practice')
    setPracticeDone(false)
  }

  const submitPractice = () => {
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct += 1
    })
    const total = Math.max(questions.length, 1)
    const pct = Math.round((correct / total) * 100)
    setPracticeScore(pct)
    setPracticeDone(true)
    setProgressMsg(`অনুশীলন: ${correct}/${total} সঠিক (${pct}%)`)
  }

  const startExam = async () => {
    setAnswers({})
    setAiLoading(true)
    setProgressMsg(null)
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      })
      if (res.ok) {
        const json = (await res.json()) as { questions?: unknown }
        const aiQs = normalizeQuestions(json.questions)
        if (aiQs.length >= 2) {
          setQuestions(aiQs)
          setPhase('exam')
          return
        }
      }
      setQuestions(practiceQs.length > 0 ? practiceQs : [FALLBACK_Q])
      setPhase('exam')
    } catch {
      setQuestions(practiceQs.length > 0 ? practiceQs : [FALLBACK_Q])
      setPhase('exam')
    } finally {
      setAiLoading(false)
    }
  }

  const submitExam = async () => {
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
    setScore(correct)
    setScorePercent(percent)
    setBand(nextBand)
    setXpEarned(xp)
    setQuizSummary(
      buildQuizSummary({
        correct,
        total,
        percent,
        band: nextBand,
        wrongTopics,
      }),
    )

    const passed = isLessonExamPassed(percent)
    const result = await saveLessonProgress({
      lessonId,
      subjectId,
      chapterId,
      scorePercent: percent,
      xpReward: lesson?.xp_reward ?? 10,
      status: passed ? 'completed' : 'in_progress',
    })
    if (result.ok && 'xp_earned' in result && result.xp_earned != null) {
      setXpEarned(result.xp_earned)
    }
    if (passed) {
      setProgressMsg('✅ পাঠ পরীক্ষা পাস — পরের ধাপ আনলক')
      await loadNext()
    } else {
      setProgressMsg(
        `পাস মার্ক ${CURRICULUM_UNLOCK_THRESHOLD_PCT}% (এখন ${percent}%) — আবার চেষ্টা করো`,
      )
    }
    setPhase('done')
  }

  const displayTitle = lesson?.title_bn || lesson?.title || 'পাঠ'
  const vocab = extractVocabulary(content)

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a1a]/95 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-bold">{displayTitle}</p>
            <p className="text-[10px] text-violet-300">
              পড়া → অনুশীলন → পরীক্ষা (≥{CURRICULUM_UNLOCK_THRESHOLD_PCT}%)
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        {loading && <p className="text-slate-400">লোড হচ্ছে…</p>}
        {err && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {err}
          </div>
        )}

        {!loading && !err && phase === 'study' && (
          <>
            <h1 className="text-2xl font-black">{displayTitle}</h1>
            {content?.overview && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-sm font-semibold text-violet-300">সংক্ষেপ</p>
                <Paragraphs text={content.overview} />
              </div>
            )}
            {content?.main_content && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-sm font-semibold text-sky-300">মূল পাঠ</p>
                <Paragraphs text={content.main_content} />
              </div>
            )}
            {!content?.main_content && !content?.overview && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                কনটেন্ট এখনো generate হয়নি। Admin থেকে Generate করুন।
              </div>
            )}
            {content?.examples && content.examples.length > 0 && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                <p className="mb-2 text-xs font-bold text-violet-300">উদাহরণ</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {content.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
            {vocab.length > 0 && (
              <div className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-4">
                <p className="mb-2 text-sm font-semibold text-fuchsia-300">📚 শব্দার্থ</p>
                <ul className="space-y-2">
                  {vocab.map((v, i) => (
                    <li key={i} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      {i + 1}. {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {content?.summary && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="mb-2 text-sm font-semibold text-emerald-300">সারাংশ</p>
                <Paragraphs text={content.summary} />
              </div>
            )}

            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-5">
              <p className="mb-1 text-lg font-bold text-amber-200">✏️ অনুশীলন (Practice)</p>
              <p className="mb-4 text-sm text-slate-400">
                পাঠ শেষ — এখন এই পাঠের উপর অনুশীলন করো। তারপর পাঠ পরীক্ষা।
              </p>
              <button
                type="button"
                onClick={startPractice}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg"
              >
                অনুশীলন শুরু করো →
              </button>
            </div>
          </>
        )}

        {!loading && !err && phase === 'practice' && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
            <p className="mb-1 text-sm font-semibold text-amber-300">✏️ অনুশীলন</p>
            <p className="mb-3 text-xs text-amber-200/70">
              {Object.keys(answers).length}/{questions.length} সম্পন্ন
            </p>
            {!practiceDone ? (
              <>
                {questions.map((q, qi) => (
                  <div key={qi} className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="mb-2 text-sm font-medium text-white">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                            answers[qi] === oi
                              ? 'border-amber-400 bg-amber-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
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
                  disabled={Object.keys(answers).length < questions.length}
                  onClick={submitPractice}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  অনুশীলন জমা দাও
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-amber-100">অনুশীলন স্কোর: {practiceScore}%</p>
                <p className="text-center text-xs text-slate-400">
                  এখন পাঠ পরীক্ষা দাও — ≥{CURRICULUM_UNLOCK_THRESHOLD_PCT}% পাস করতে হবে
                </p>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => void startExam()}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {aiLoading ? 'প্রশ্ন তৈরি হচ্ছে…' : '📝 পাঠ পরীক্ষা শুরু করো →'}
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !err && phase === 'exam' && (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="mb-1 text-sm font-semibold text-violet-300">📝 পাঠ পরীক্ষা</p>
            <p className="mb-3 text-xs text-violet-200/70">
              পাস মার্ক {CURRICULUM_UNLOCK_THRESHOLD_PCT}% · {Object.keys(answers).length}/
              {questions.length} সম্পন্ন
            </p>
            {questions.map((q, qi) => (
              <div key={qi} className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="mb-2 text-sm font-medium text-white">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        answers[qi] === oi
                          ? 'border-violet-400 bg-violet-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
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
              disabled={Object.keys(answers).length < questions.length}
              onClick={() => void submitExam()}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              পরীক্ষা জমা দাও
            </button>
          </div>
        )}

        {!loading && !err && phase === 'done' && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="whitespace-pre-line text-center text-sm text-slate-300">{quizSummary}</p>
            <p className="text-center text-xs text-slate-500">
              {score}/{questions.length} · {scorePercent}% · ⚡ {xpEarned} XP
            </p>
            {progressMsg && (
              <p className="text-center text-sm font-semibold text-emerald-300">{progressMsg}</p>
            )}
            {isLessonExamPassed(scorePercent) ? (
              <>
                {nextTarget?.kind === 'lesson' && (
                  <Link
                    href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${nextTarget.chapterId}/${nextTarget.lessonId}`}
                    className="block w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-center text-sm font-bold"
                  >
                    পরের পাঠ: {nextTarget.label} →
                  </Link>
                )}
                {nextTarget?.kind === 'chapter' && (
                  <Link
                    href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${nextTarget.chapterId}`}
                    className="block w-full rounded-xl bg-gradient-to-r from-sky-600 to-violet-600 py-3 text-center text-sm font-bold"
                  >
                    পরের অধ্যায়: {nextTarget.label} →
                  </Link>
                )}
                {nextTarget?.kind === 'subject_complete' && (
                  <p className="text-center text-sm text-emerald-200">{nextTarget.label}</p>
                )}
                {(nextTarget?.kind === 'chapter' || nextTarget?.kind === 'subject_complete') && (
                  <Link
                    href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}?exam=1`}
                    className="block w-full rounded-xl border border-rose-400/40 bg-rose-500/15 py-3 text-center text-sm font-bold text-rose-200"
                  >
                    📋 অধ্যায় পরীক্ষা দাও →
                  </Link>
                )}
              </>
            ) : (
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => void startExam()}
                className="w-full rounded-xl border border-violet-400/40 bg-violet-500/15 py-3 text-sm font-bold"
              >
                ✨ আবার পরীক্ষা দাও
              </button>
            )}
            <Link
              href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
              className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-slate-300"
            >
              অধ্যায়ে ফিরে যাও
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
