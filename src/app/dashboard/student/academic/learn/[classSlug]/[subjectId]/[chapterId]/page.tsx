'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  title_bn?: string
  lesson_type?: string
  duration_minutes: number
  xp_reward: number
  order_index: number
  lesson_number?: number
}

interface Chapter {
  id: string
  title: string
  title_bn?: string
  chapter_number: number
}

interface LessonProgress {
  lesson_id: string
  status: string
  score: number
  xp_earned: number
}

const lessonTypeIcons: Record<string, string> = {
  text: '📖',
  video: '🎥',
  quiz: '🧪',
  exercise: '✏️',
  revision: '🔄',
  game: '🎮',
}

const lessonTypeLabels: Record<string, string> = {
  text: 'পাঠ',
  video: 'ভিডিও',
  quiz: 'কুইজ',
  exercise: 'অনুশীলন',
  revision: 'রিভিশন',
  game: 'গেম',
}

export default function LessonListPage() {
  const params = useParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data: chap } = await supabase
          .from('curriculum_chapters')
          .select('*')
          .eq('id', chapterId)
          .maybeSingle()
        if (chap) setChapter(chap)

        const { data: lsns } = await supabase
          .from('curriculum_lessons')
          .select('*')
          .eq('chapter_id', chapterId)
          .eq('is_active', true)
          .eq('is_published', true)
          .order('order_index', { ascending: true })

        if (lsns) {
          const sorted = [...lsns].sort(
            (a, b) =>
              (a.order_index ?? 0) - (b.order_index ?? 0) ||
              (a.lesson_number ?? 0) - (b.lesson_number ?? 0),
          )
          setLessons(sorted)
        }

        if (user) {
          const { data: prog } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('user_id', user.id)

          if (prog) {
            setProgress(
              prog.map((p) => ({
                ...p,
                lesson_id: String(p.lesson_id),
              })),
            )
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [chapterId])

  const getLessonProgress = (lessonId: string) => {
    const id = String(lessonId)
    return progress.find((p) => String(p.lesson_id) === id)
  }

  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true
    const prevLesson = lessons[index - 1]
    if (!prevLesson) return false
    const prevProgress = getLessonProgress(prevLesson.id)
    return prevProgress?.status === 'completed'
  }

  const completedCount = lessons.filter(
    (l) => getLessonProgress(l.id)?.status === 'completed',
  ).length
  const totalXPEarned = progress
    .filter((p) => lessons.some((l) => String(l.id) === String(p.lesson_id)))
    .reduce((sum, p) => sum + (p.xp_earned || 0), 0)
  const overallPct =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link
            href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}`}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 hover:text-white"
          >
            ←
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-bold">
              {chapter?.title_bn || chapter?.title || 'অধ্যায়'}
            </p>
            <p className="text-[10px] text-violet-300">পাঠ বেছে নাও</p>
          </div>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-300">
            ⚡ {totalXPEarned}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-5 pb-12">
        {chapter && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 to-purple-500/5 p-5"
          >
            <p className="text-xs font-semibold text-violet-300">
              অধ্যায় {chapter.chapter_number || ''}
            </p>
            <h1 className="mt-1 text-2xl font-black text-white">
              {chapter.title_bn || chapter.title}
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              প্রথম পাঠ খোলা · একটা শেষ করলে পরেরটা আনলক হবে
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'মোট পাঠ', value: lessons.length, icon: '📚' },
                { label: 'সম্পন্ন', value: completedCount, icon: '✅' },
                { label: 'XP', value: totalXPEarned, icon: '⚡' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 py-2.5 text-center">
                  <div className="text-lg">{stat.icon}</div>
                  <div className="font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>অগ্রগতি</span>
                <span className="font-bold text-violet-300">{overallPct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        <h2 className="mb-3 text-lg font-black text-white">পাঠসমূহ</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-5xl">📝</p>
            <h3 className="mt-3 text-lg font-bold text-white">পাঠ শীঘ্রই আসছে</h3>
            <p className="mt-1 text-sm text-slate-400">
              এই অধ্যায়ে এখনো কোনো পাবলিশ করা পাঠ নেই
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const lessonProg = getLessonProgress(lesson.id)
              const unlocked = isLessonUnlocked(index)
              const completed = lessonProg?.status === 'completed'
              const inProgress = lessonProg?.status === 'in_progress'
              const typeKey = lesson.lesson_type || 'text'

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  {unlocked ? (
                    <Link
                      href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${lesson.id}`}
                    >
                      <div
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition active:scale-[0.99] ${
                          completed
                            ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
                            : inProgress
                              ? 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15'
                              : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div
                          className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl ${
                            completed
                              ? 'bg-emerald-500/20'
                              : inProgress
                                ? 'bg-sky-500/20'
                                : 'bg-white/10'
                          }`}
                        >
                          {completed ? '⭐' : lessonTypeIcons[typeKey] || '📖'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-500">
                              পাঠ {lesson.lesson_number ?? index + 1}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                completed
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/10 text-slate-400'
                              }`}
                            >
                              {lessonTypeLabels[typeKey] || 'পাঠ'}
                            </span>
                            {inProgress && (
                              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                                চলছে
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-white">
                            {lesson.title_bn || lesson.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              ⏱️ {lesson.duration_minutes || 5} মিনিট
                            </span>
                            <span className="text-xs text-violet-300">
                              ⚡ +{lesson.xp_reward || 10} XP
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-xl">
                          {completed ? '✅' : '→'}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 opacity-55">
                      <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/5 text-2xl">
                        🔒
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-amber-400/80">
                          আগের পাঠ শেষ করলে আনলক হবে
                        </p>
                        <h3 className="font-bold text-slate-500">
                          {lesson.title_bn || lesson.title}
                        </h3>
                        <span className="text-xs text-slate-600">
                          পাঠ {lesson.lesson_number ?? index + 1} · ⚡ +{lesson.xp_reward || 10} XP
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য · পাঠ লিস্ট</p>
      </div>
    </div>
  )
}
