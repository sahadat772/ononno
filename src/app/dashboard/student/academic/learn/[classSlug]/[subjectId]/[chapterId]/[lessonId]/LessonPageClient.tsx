'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams, useSearchParams } from 'next/navigation'
import StudySessionTimer from '@/components/student/StudySessionTimer'
import AiTeacherPanel from '@/components/student/AiTeacherPanel'
import { fallbackLessons, isFallbackId } from '@/lib/academic-fallback'
import { scoreToBand, bandLabelBn, type PerformanceBand } from '@/lib/quiz-performance'
import {
  CURRICULUM_UNLOCK_THRESHOLD_PCT,
  isLessonExamPassed,
} from '@/lib/curriculum-unlock'
import { notifyParentOnLessonPass } from '@/lib/notify-parent-pass'
import {
  Paragraphs,
  normalizeQuestions,
  extractVocabulary,
  buildQuizSummary,
  saveLessonProgress,
  loadNextTargetAndProgress,
} from '@/lib/lesson-page-helpers'

interface Lesson {
  id: string
  title: string
  title_bn?: string
  duration_minutes: number
  xp_reward: number
}
interface LessonContent {
  overview?: string | null
  main_content?: string | null
  summary?: string | null
  examples?: string[] | null
  extra_notes?: string | null
  quiz_questions?: { question: string; options: string[]; correct: number; explanation: string }[] | null
}
interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function LessonContentPage() {
  const params = useParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string
  const sessionFromUrl = useSearchParams().get('session')

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<LessonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [quizDone, setQuizDone] = useState(false)
  const [score, setScore] = useState(0)
  const [scorePercent, setScorePercent] = useState(0)
  const [band, setBand] = useState<PerformanceBand>('unknown')
  const [quizSummary, setQuizSummary] = useState('')
  const [xpEarned, setXpEarned] = useState(0)
  const [quizPhase, setQuizPhase] = useState<'base' | 'ai'>('base')
  const [aiLoading, setAiLoading] = useState(false)
  const [progressMsg, setProgressMsg] = useState<string | null>(null)
  const [nextUnlocked, setNextUnlocked] = useState(false)
  const [nextTarget, setNextTarget] = useState<
    Awaited<ReturnType<typeof loadNextTargetAndProgress>>['target'] | null
  >(null)
  const [chapterProg, setChapterProg] = useState<{
    done: number
    total: number
    pct: number
  } | null>(null)

  useEffect(() => {
    void (async () => {
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
          `id, title, title_bn, duration_minutes, xp_reward, lesson_contents (overview, main_content, summary, examples, extra_notes, quiz_questions)`,
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
    })()
  }, [lessonId, chapterId])

  const displayTitle = lesson?.title_bn || lesson?.title || 'পাঠ'
  const vocab = extractVocabulary(content as Parameters<typeof extractVocabulary>[0])

  const submitQuiz = async () => {
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
    setQuizSummary(
      buildQuizSummary({
        correct,
        total: questions.length,
        percent,
        band: nextBand,
        wrongTopics,
      }),
    )
    setXpEarned(xp)
    setQuizDone(true)
    const isFinal = quizPhase === 'ai' && isLessonExamPassed(percent)
    if (isFinal) setNextUnlocked(true)
    const res = await saveLessonProgress({
      lessonId,
      subjectId,
      chapterId,
      scorePercent: percent,
      xp,
      status: isFinal ? 'completed' : 'in_progress',
    })
    if (!res.ok) setProgressMsg(`সেভ হয়নি: ${res.error}`)
    else if (isFinal) {
      setProgressMsg('পাঠ পরীক্ষা পাস · unlock ✓')
      try {
        const nav = await loadNextTargetAndProgress({ subjectId, chapterId, lessonId })
        setNextTarget(nav.target)
        setChapterProg(nav.chapterProg)
      } catch {
        /* ignore */
      }
      notifyParentOnLessonPass({
        scorePercent: percent,
        lessonTitle: lesson?.title_bn || lesson?.title || 'পাঠ',
        lessonId,
      })
    } else setProgressMsg('প্রোগ্রেস সেভ ✓')
  }

  const runGenerateAiQuiz = async () => {
    setAiLoading(true)
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 4 }),
      })
      const json = await res.json()
      if (!res.ok || !json.questions?.length) return
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
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-5xl"
        >
          ⚙️
        </motion.div>
      </div>
    )
  }
  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] p-6 text-white">
        <p className="mb-3 text-4xl">📭</p>
        <p className="font-semibold">পাঠ পাওয়া যায়নি বা এখনো প্রকাশ হয়নি</p>
        <Link
          href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
          className="mt-4 text-blue-400"
        >
          ← ফিরে যাও
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <StudySessionTimer sessionId={sessionFromUrl} />
      <AiTeacherPanel lessonId={lessonId} lessonTitle={displayTitle} />
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Link
            href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-bold">{displayTitle}</p>
            <p className="text-[10px] text-violet-300">পাঠ · শব্দার্থ · পরীক্ষা ≥৬০%</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
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
        {vocab.length > 0 && (
          <div className="rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-4">
            <p className="mb-2 text-sm font-semibold text-fuchsia-300">📚 শব্দার্থ</p>
            <ul className="space-y-2">
              {vocab.map((v, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                >
                  {i + 1}. {v}
                </li>
              ))}
            </ul>
          </div>
        )}
        {content?.summary && !quizDone && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="mb-2 text-sm font-semibold text-emerald-300">সারাংশ</p>
            <Paragraphs text={content.summary} />
          </div>
        )}
        {questions.length > 0 && !quizDone && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="mb-1 text-sm font-semibold text-amber-300">
              {quizPhase === 'ai' ? '📝 পাঠ পরীক্ষা (AI)' : 'দ্রুত কুইজ'}
            </p>
            <p className="mb-3 text-xs text-amber-200/70">
              {Object.keys(answers).length}/{questions.length} সম্পন্ন
            </p>
            {questions.map((q, qi) => (
              <div key={qi} className="mb-5">
                <p className="mb-2 font-bold">
                  {qi + 1}. {q.question}
                </p>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      className={`rounded-xl border px-3 py-2.5 text-left text-sm ${
                        answers[qi] === oi
                          ? 'border-amber-400/60 bg-amber-500/25'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {['ক', 'খ', 'গ', 'ঘ'][oi] ?? oi + 1}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              disabled={Object.keys(answers).length < questions.length}
              onClick={() => void submitQuiz()}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold disabled:opacity-40"
            >
              ✅ উত্তর জমা দাও
            </button>
          </div>
        )}
        {quizDone && (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-center text-3xl">
              {scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '🎉' : '💪'}
            </p>
            <p className="whitespace-pre-line text-center text-sm text-slate-300">{quizSummary}</p>
            <p className="text-center text-sm">
              স্কোর: <span className="font-bold">{score}</span> / {questions.length} ·{' '}
              {scorePercent}% · XP {xpEarned}
            </p>
            {progressMsg && <p className="text-center text-xs text-emerald-300">{progressMsg}</p>}
            {quizPhase === 'base' && (
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => void runGenerateAiQuiz()}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold"
              >
                {aiLoading ? '⏳…' : '✨ AI পাঠ পরীক্ষা নাও'}
              </button>
            )}
            {quizPhase === 'ai' && (
              <div className="space-y-2">
                {chapterProg && (
                  <div>
                    <p className="mb-1 text-xs text-slate-400">
                      অধ্যায় অগ্রগতি {chapterProg.done}/{chapterProg.total}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${chapterProg.pct}%` }}
                      />
                    </div>
                  </div>
                )}
                {nextUnlocked || isLessonExamPassed(scorePercent) ? (
                  <>
                    <p className="text-center text-sm font-semibold text-emerald-300">
                      ✅ পাঠ পরীক্ষা পাস ({scorePercent}%)
                    </p>
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
                  </>
                ) : (
                  <>
                    <p className="text-center text-sm text-amber-200">
                      পাস মার্ক {CURRICULUM_UNLOCK_THRESHOLD_PCT}% (এখন {scorePercent}%)
                    </p>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => void runGenerateAiQuiz()}
                      className="w-full rounded-xl border border-violet-400/40 bg-violet-500/15 py-3 text-sm font-bold"
                    >
                      ✨ নতুন পরীক্ষার প্রশ্ন
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
        <p className="pt-4 text-center text-xs text-slate-600">অনন্য · শিক্ষার্থী পাঠ</p>
      </div>
    </div>
  )
}
