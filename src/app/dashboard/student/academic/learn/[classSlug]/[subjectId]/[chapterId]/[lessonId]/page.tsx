'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import StudySessionTimer from '@/components/student/StudySessionTimer'
import AiTeacherPanel from '@/components/student/AiTeacherPanel'

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
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  const parts = cleanText(text)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
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

export default function LessonContentPage() {
  const params = useParams()
  const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
  const router = useRouter()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string
  const searchParams = useSearchParams()
  const sessionFromUrl = searchParams.get('session')

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState<LessonContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'intro' | 'learn' | 'quiz' | 'result'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [showExplanation, setShowExplanation] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [progressSaved, setProgressSaved] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLesson = async () => {
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

      if (error) {
        const fallback = await supabase
          .from('curriculum_lessons')
          .select(
            `id, title, title_bn, duration_minutes, xp_reward,
             lesson_contents (
               overview, objectives, main_content, ai_explanation,
               examples, summary, extra_notes,
               cover_image_url, cover_image_path
             )`,
          )
          .eq('id', lessonId)
          .eq('is_published', true)
          .maybeSingle()
        if (fallback.data) {
          setLesson({
            id: fallback.data.id,
            title: fallback.data.title,
            title_bn: fallback.data.title_bn,
            duration_minutes: fallback.data.duration_minutes ?? 30,
            xp_reward: fallback.data.xp_reward ?? 10,
          })
          const raw = fallback.data.lesson_contents as LessonContent | LessonContent[] | null
          const stored = Array.isArray(raw) ? raw[0] : raw
          setContent(stored ?? null)
        }
      } else if (data) {
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
  }, [lessonId])

  const displayTitle = lesson?.title_bn || lesson?.title || 'Lesson'

  const hasStudyBody = useMemo(() => {
    if (!content) return false
    return Boolean(
      cleanText(content.overview) ||
        cleanText(content.main_content) ||
        cleanText(content.ai_explanation) ||
        cleanText(content.summary) ||
        (content.objectives && content.objectives.length > 0) ||
        (content.examples && content.examples.length > 0),
    )
  }, [content])

  const ensureQuiz = async (): Promise<Question[]> => {
    if (questions.length > 0) return questions
    setLoadingQuiz(true)
    try {
      const studyBlob = [
        cleanText(content?.overview),
        cleanText(content?.main_content),
        cleanText(content?.ai_explanation),
        cleanText(content?.summary),
        ...(content?.objectives ?? []),
        ...(content?.examples ?? []),
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, 3500)

      const res = await fetch('/api/lesson-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: displayTitle,
          lessonContent: studyBlob || displayTitle,
          lessonType: 'text',
        }),
      })
      const data = await res.json()
      const qs = normalizeQuestions(data.questions)
      if (qs.length > 0) {
        setQuestions(qs)
        return qs
      }
    } catch {
      // optional
    } finally {
      setLoadingQuiz(false)
    }
    return []
  }

  const startQuiz = async () => {
    const qs = await ensureQuiz()
    if (qs.length > 0) {
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowExplanation(false)
      setScore(0)
      setHearts(3)
      setPhase('quiz')
    } else {
      const earned = lesson?.xp_reward || 10
      setXpEarned(earned)
      setPhase('result')
      void saveProgress(earned, 100)
    }
  }

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(optionIndex)
    const correct = optionIndex === questions[currentQuestion]?.correct
    setIsCorrect(correct)
    setShowExplanation(true)
    if (correct) setScore((s) => s + 1)
    else setHearts((h) => Math.max(0, h - 1))
  }

  const saveProgress = async (xp: number, finalScore: number) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !lesson) return

    setProgressError(null)
    const row = {
      user_id: user.id,
      lesson_id: String(lessonId),
      chapter_id: String(chapterId),
      subject_id: String(subjectId),
      status: 'completed' as const,
      score: finalScore,
      xp_earned: xp,
      completed_at: new Date().toISOString(),
    }

    let saved = false
    const attempts = [{ onConflict: 'user_id,lesson_id' }]

    for (const opt of attempts) {
      const { error } = await supabase.from('learning_progress').upsert(row, opt)
      if (!error) {
        saved = true
        break
      }
    }

    if (!saved) {
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', String(lessonId))

      const { error: insErr } = await supabase.from('learning_progress').insert(row)
      if (insErr) {
        setProgressError(insErr.message)
        const { error: minErr } = await supabase.from('learning_progress').insert({
          user_id: user.id,
          lesson_id: String(lessonId),
          status: 'completed',
          score: finalScore,
          xp_earned: xp,
        })
        if (minErr) setProgressError(minErr.message)
        else {
          saved = true
          setProgressError(null)
        }
      } else saved = true
    }

    setProgressSaved(saved)

    try {
      await supabase.rpc('increment_xp', { user_id_input: user.id, xp_amount: xp })
    } catch {
      try {
        await supabase.rpc('increment_student_xp', {
          p_user_id: user.id,
          p_xp: xp,
          p_lessons: 1,
        })
      } catch {
        await supabase.from('student_stats').upsert(
          {
            user_id: user.id,
            total_xp: xp,
            current_streak: 1,
            last_activity_date: new Date().toISOString().split('T')[0],
          },
          { onConflict: 'user_id' },
        )
      }
    }
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowExplanation(false)

    if (hearts <= 0) {
      setPhase('result')
      const fs = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
      const earned = Math.round((score / Math.max(questions.length, 1)) * (lesson?.xp_reward || 10))
      setXpEarned(earned)
      void saveProgress(earned, Math.max(fs, 1))
      return
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1)
    } else {
      setPhase('result')
      const fs =
        questions.length > 0 ? Math.round((score / questions.length) * 100) : 100
      const earned =
        questions.length > 0
          ? Math.round((score / questions.length) * (lesson?.xp_reward || 10))
          : lesson?.xp_reward || 10
      setXpEarned(earned)
      void saveProgress(earned, fs)
    }
  }

  const finalScore =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 100

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">
          ⚙️
        </motion.div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center justify-center p-6">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-semibold">Lesson পাওয়া যায়নি বা এখনো publish হয়নি</p>
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
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <StudySessionTimer sessionId={sessionFromUrl} />
      <AiTeacherPanel lessonId={lessonId} lessonTitle={displayTitle} />

      {!accessLoading && !isPaid && !canDoLesson && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <LockOverlay type="daily_limit" />
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2 md:gap-4">
          <Link
            href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </Link>

          {phase === 'quiz' && questions.length > 0 && (
            <>
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-3">
                  <motion.div
                    animate={{
                      width: `${((currentQuestion + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100}%`,
                    }}
                    className="bg-linear-to-r from-violet-500 to-purple-500 h-3 rounded-full"
                  />
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < hearts ? 'opacity-100' : 'opacity-20'}`}>
                    ❤️
                  </span>
                ))}
              </div>
              <span className="text-amber-400 text-xs font-bold">⚡{score * 2}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center"
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl mb-6">
                📖
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-3">{displayTitle}</h1>
              {content?.cover_image_url && (
                <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 mx-auto max-w-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.cover_image_url}
                    alt={displayTitle}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-center gap-4 mb-8 text-sm text-gray-400">
                <span>⏱️ {lesson.duration_minutes} মিনিট</span>
                <span>⚡ +{lesson.xp_reward} XP</span>
                {questions.length > 0 && <span>🎯 {questions.length} প্রশ্ন</span>}
              </div>

              {content?.objectives && content.objectives.length > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-left">
                  <p className="text-gray-300 mb-3 font-medium">এই পাঠে তুমি শিখবে:</p>
                  <div className="space-y-2">
                    {content.objectives.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-left">
                  <p className="text-gray-300 leading-relaxed">
                    পাঠ পড়ো, বুঝো, তারপর ধাপে ধাপে quiz দিয়ে নিজেকে যাচাই করো — XP জিতো!
                  </p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPhase('learn')}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold text-xl shadow-lg shadow-violet-500/30"
              >
                শুরু করি! 🚀
              </motion.button>
            </motion.div>
          )}

          {phase === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <h2 className="text-2xl font-bold text-white">📖 {displayTitle}</h2>

              {content?.cover_image_url && (
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.cover_image_url}
                    alt={displayTitle}
                    className="w-full aspect-video object-cover"
                  />
                  <p className="text-[11px] text-white/40 px-3 py-2">🎨 পাঠের ছবি (AI illustration)</p>
                </div>
              )}

              {!hasStudyBody ? (
                <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                  <p className="text-amber-200 font-semibold">Study content এখনো নেই</p>
                </div>
              ) : (
                <>
                  {cleanText(content?.overview) && (
                    <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
                      <p className="text-violet-300 font-bold mb-3">📌 পরিচিতি</p>
                      <Paragraphs text={content!.overview!} />
                    </section>
                  )}
                  {content?.objectives && content.objectives.length > 0 && (
                    <section className="rounded-3xl bg-blue-500/10 border border-blue-500/20 p-6">
                      <p className="text-blue-300 font-bold mb-3">🎯 শেখার লক্ষ্য</p>
                      <ul className="space-y-2">
                        {content.objectives.map((o, i) => (
                          <li key={i} className="flex gap-2 text-gray-300 text-sm">
                            <span className="text-blue-400">•</span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {cleanText(content?.main_content) && (
                    <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
                      <p className="text-emerald-300 font-bold mb-3">📚 মূল পাঠ</p>
                      <Paragraphs text={content!.main_content!} />
                    </section>
                  )}
                  {cleanText(content?.ai_explanation) && (
                    <section className="rounded-3xl bg-cyan-500/10 border border-cyan-500/20 p-6">
                      <p className="text-cyan-300 font-bold mb-3">💡 সহজ ব্যাখ্যা</p>
                      <Paragraphs text={content!.ai_explanation!} />
                    </section>
                  )}
                  {content?.examples && content.examples.length > 0 && (
                    <section className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-6">
                      <p className="text-amber-300 font-bold mb-3">✏️ উদাহরণ</p>
                      <ul className="space-y-3">
                        {content.examples.map((ex, i) => (
                          <li key={i} className="text-gray-300 text-sm leading-relaxed">
                            <span className="text-amber-400 font-semibold mr-1">{i + 1}.</span>
                            {cleanText(ex)}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {cleanText(content?.summary) && (
                    <section className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6">
                      <p className="text-emerald-300 font-bold mb-3">✅ সারসংক্ষেপ</p>
                      <Paragraphs text={content!.summary!} />
                    </section>
                  )}
                  {cleanText(content?.extra_notes) && (
                    <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
                      <p className="text-gray-400 font-bold mb-3">📝 অতিরিক্ত নোট</p>
                      <Paragraphs text={content!.extra_notes!} />
                    </section>
                  )}
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loadingQuiz}
                onClick={() => void startQuiz()}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-violet-500/30 disabled:opacity-60"
              >
                {loadingQuiz
                  ? 'প্রশ্ন তৈরি হচ্ছে...'
                  : questions.length > 0
                    ? `প্রশ্ন শুরু করো! 🎯 (${questions.length}টি)`
                    : 'সম্পন্ন করো — প্রশ্ন শুরু 🎯'}
              </motion.button>
            </motion.div>
          )}

          {phase === 'quiz' && questions.length > 0 && (
            <motion.div
              key={`quiz-${currentQuestion}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <p className="text-gray-400 text-sm mb-2 text-center">
                প্রশ্ন {currentQuestion + 1} / {questions.length}
              </p>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 mb-6">
                <p className="text-white text-xl font-bold leading-relaxed">
                  {questions[currentQuestion]?.question}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {questions[currentQuestion]?.options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(i)}
                    className={`w-full p-4 rounded-2xl border text-left font-semibold transition-all ${
                      selectedAnswer === null
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                        : selectedAnswer === i
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                            : 'border-red-500 bg-red-500/20 text-red-300'
                          : i === questions[currentQuestion]?.correct
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/5 bg-white/[0.02] text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-sm">
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      {option}
                    </div>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-4 mb-4 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}
                  >
                    <p className={`font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? '🎉 সঠিক! +2 XP' : '😔 ভুল!'}
                    </p>
                    <p className="text-gray-300 text-sm">{questions[currentQuestion]?.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedAnswer !== null && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-500 font-bold text-lg text-white"
                >
                  {currentQuestion < questions.length - 1 ? 'পরের প্রশ্ন →' : 'ফলাফল দেখো 🏆'}
                </motion.button>
              )}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">
                {hearts <= 0 ? '💔' : finalScore >= 80 ? '🏆' : finalScore >= 60 ? '⭐' : questions.length === 0 ? '✅' : '😔'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {hearts <= 0
                  ? 'আবার চেষ্টা করো!'
                  : finalScore >= 80
                    ? 'অসাধারণ!'
                    : finalScore >= 60
                      ? 'ভালো করেছো!'
                      : questions.length === 0
                        ? 'পাঠ সম্পন্ন!'
                        : 'আরো পড়তে হবে!'}
              </h2>
              <p className="text-emerald-400/90 text-sm mb-4">
                {progressSaved
                  ? '✅ Progress save হয়েছে — পরের পাঠ এখন unlock'
                  : progressError
                    ? `⚠️ Progress save সমস্যা: ${progressError}`
                    : 'Progress save হচ্ছে...'}
              </p>

              <div className="grid grid-cols-3 gap-3 my-8">
                {[
                  {
                    label: 'স্কোর',
                    value: questions.length ? `${finalScore}%` : '—',
                    icon: '🎯',
                  },
                  {
                    label: 'সঠিক',
                    value: questions.length ? `${score}/${questions.length}` : '—',
                    icon: '✅',
                  },
                  { label: 'XP', value: `+${xpEarned}`, icon: '⚡' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`,
                    )
                  }
                  className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold"
                >
                  অধ্যায়ে ফিরে যাও →
                </button>
                {questions.length > 0 && (
                  <button
                    onClick={() => {
                      setPhase('intro')
                      setCurrentQuestion(0)
                      setSelectedAnswer(null)
                      setIsCorrect(null)
                      setScore(0)
                      setHearts(3)
                      setShowExplanation(false)
                      setProgressSaved(false)
                    }}
                    className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-300"
                  >
                    🔄 আবার চেষ্টা করো
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
