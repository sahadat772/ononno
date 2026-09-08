'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { fallbackChapters, fallbackLessons, isFallbackId } from '@/lib/academic-fallback'

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
  description?: string
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (isFallbackId(chapterId) || isFallbackId(subjectId)) {
          const chaps = fallbackChapters(subjectId)
          const chap = chaps.find((c) => c.id === chapterId) || {
            id: chapterId,
            title: 'Chapter',
            title_bn: 'অধ্যায়',
            chapter_number: 1,
            description: 'ডেমো অধ্যায়',
          }
          setChapter(chap)
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
          else setError('অধ্যায় পাওয়া যায়নি।')
        }

        const { data: lsns } = await supabase
          .from('curriculum_lessons')
          .select('*')
          .eq('chapter_id', chapterId)
          .eq('is_active', true)
          .eq('is_published', true)
          .order('order_index', { ascending: true })

        if (lsns && lsns.length > 0) {
          const sorted = [...lsns].sort(
            (a, b) =>
              (a.order_index ?? 0) - (b.order_index ?? 0) ||
              (a.lesson_number ?? 0) - (b.lesson_number ?? 0),
          )
          setLessons(sorted)
        } else {
          setLessons(fallbackLessons(chapterId))
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
                score: Number(p.score) || 0,
                xp_earned: Number(p.xp_earned) || 0,
              })),
            )
          }
        }
      } catch (e) {
        console.error(e)
        setError('ডেটা লোড করতে সমস্যা হয়েছে।')
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [chapterId, subjectId])

  const getLessonProgress = (lessonId: string) => {
    const id = String(lessonId)
    return progress.find((p) => String(p.lesson_id) === id)
  }

  const isLessonUnlocked = (index: number) => {
    if (index === 0) return true
    const prevLesson = lessons[index - 1]
    if (!prevLesson) return false
    return getLessonProgress(prevLesson.id)?.status === 'completed'
  }

  const completedCount = lessons.filter(
    (l) => getLessonProgress(l.id)?.status === 'completed',
  ).length

  const totalXPEarned = useMemo(() => {
    return progress
      .filter((p) => lessons.some((l) => String(l.id) === String(p.lesson_id)))
      .reduce((sum, p) => sum + (p.xp_earned || 0), 0)
  }, [progress, lessons])

  const overallPct =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const totalMinutes = lessons.reduce(
    (s, l) => s + (Number(l.duration_minutes) || 5),
    0,
  )

  const remainingMinutes = lessons
    .filter((l) => getLessonProgress(l.id)?.status !== 'completed')
    .reduce((s, l) => s + (Number(l.duration_minutes) || 5), 0)

  const continueLesson = useMemo(() => {
    for (let i = 0; i < lessons.length; i++) {
      if (!isLessonUnlocked(i)) break
      const st = getLessonProgress(lessons[i].id)?.status
      if (st !== 'completed') return { lesson: lessons[i], index: i }
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, progress])

  const allDone = lessons.length > 0 && completedCount === lessons.length

  const lessonHref = (lessonId: string) =>
    `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${lessonId}`

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.06),transparent_40%)]" />

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
            <p className="text-[10px] text-violet-300">
              {loading ? 'লোড হচ্ছে…' : `${completedCount}/${lessons.length} সম্পন্ন`}
            </p>
          </div>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-xs font-bold text-violet-300">
            ⚡ {totalXPEarned}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-5 pb-28">
        {error && !chapter && (
          <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <p className="font-semibold text-amber-200">{error}</p>
            <Link
              href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}`}
              className="mt-3 inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold"
            >
              ফিরে যাও
            </Link>
          </div>
        )}

        {chapter && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-sky-500/5 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-violet-300">
                  অধ্যায় {chapter.chapter_number || '—'}
                </p>
                <h1 className="mt-1 text-2xl font-black text-white">
                  {chapter.title_bn || chapter.title}
                </h1>
                {chapter.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{chapter.description}</p>
                )}
              </div>
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl shadow-lg">
                📖
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: 'পাঠ', value: lessons.length, icon: '📚' },
                { label: 'সম্পন্ন', value: completedCount, icon: '✅' },
                { label: 'XP', value: totalXPEarned, icon: '⚡' },
                { label: 'মিনিট', value: totalMinutes, icon: '⏱️' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 py-2 text-center">
                  <div className="text-base">{stat.icon}</div>
                  <div className="text-sm font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                <span>অধ্যায়ের অগ্রগতি</span>
                <span className="font-bold text-violet-300">{overallPct}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 0.85 }}
                  className="h-3 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-sky-400"
                />
              </div>
              {!allDone && remainingMinutes > 0 && (
                <p className="mt-2 text-center text-[11px] text-slate-500">
                  বাকি প্রায় {remainingMinutes} মিনিট
                </p>
              )}
            </div>
          </motion.div>
        )}

        {allDone && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 p-4 text-center"
          >
            <p className="text-3xl">🎉</p>
            <p className="mt-1 font-black text-emerald-300">অধ্যায় সম্পন্ন!</p>
            <p className="text-xs text-slate-400">সব পাঠ শেষ করেছো — শাবাশ</p>
          </motion.div>
        )}

        {continueLesson && !allDone && (
          <Link href={lessonHref(continueLesson.lesson.id)} className="mb-5 block">
            <div className="flex items-center gap-3 rounded-2xl border border-sky-500/35 bg-gradient-to-r from-sky-500/20 to-violet-500/15 p-4 transition hover:border-sky-400/50">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-xl">
                ▶️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-sky-300">এখন পড়ো</p>
                <p className="truncate font-bold text-white">
                  {continueLesson.lesson.title_bn || continueLesson.lesson.title}
                </p>
              </div>
              <span className="text-sky-300">→</span>
            </div>
          </Link>
        )}

        <h2 className="mb-3 text-lg font-black text-white">পাঠের পথ</h2>

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
          <div className="relative space-y-0">
            {lessons.map((lesson, index) => {
              const lessonProg = getLessonProgress(lesson.id)
              const unlocked = isLessonUnlocked(index)
              const completed = lessonProg?.status === 'completed'
              const inProgress = lessonProg?.status === 'in_progress'
              const typeKey = lesson.lesson_type || 'text'
              const isContinue = continueLesson?.lesson.id === lesson.id
              const score = lessonProg?.score

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative flex gap-3 pb-3"
                >
                  <div className="flex w-10 shrink-0 flex-col items-center">
                    <div
                      className={`z-10 grid size-10 place-items-center rounded-full border-2 text-sm font-black ${
                        completed
                          ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
                          : isContinue
                            ? 'border-sky-400 bg-sky-500/25 text-sky-200 ring-4 ring-sky-500/20'
                            : unlocked
                              ? 'border-violet-400/50 bg-violet-500/20 text-violet-200'
                              : 'border-white/15 bg-white/5 text-slate-500'
                      }`}
                    >
                      {completed ? '✓' : unlocked ? index + 1 : '🔒'}
                    </div>
                    {index < lessons.length - 1 && (
                      <div
                        className={`mt-1 w-0.5 flex-1 min-h-[28px] ${
                          completed ? 'bg-emerald-500/50' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-2">
                    {unlocked ? (
                      <Link href={lessonHref(lesson.id)}>
                        <div
                          className={`rounded-2xl border p-4 transition active:scale-[0.99] ${
                            completed
                              ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
                              : isContinue
                                ? 'border-sky-500/40 bg-sky-500/15 shadow-lg shadow-sky-500/10 hover:bg-sky-500/20'
                                : inProgress
                                  ? 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15'
                                  : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`grid size-12 shrink-0 place-items-center rounded-xl text-xl ${
                                completed
                                  ? 'bg-emerald-500/20'
                                  : isContinue
                                    ? 'bg-sky-500/25'
                                    : 'bg-white/10'
                              }`}
                            >
                              {completed ? '⭐' : lessonTypeIcons[typeKey] || '📖'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-slate-500">
                                  পাঠ {lesson.lesson_number ?? index + 1}
                                </span>
                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                                  {lessonTypeLabels[typeKey] || 'পাঠ'}
                                </span>
                                {isContinue && (
                                  <span className="rounded-full bg-sky-500/25 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                                    এখন
                                  </span>
                                )}
                                {inProgress && !isContinue && (
                                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                                    চলছে
                                  </span>
                                )}
                                {completed && score != null && score > 0 && (
                                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                    স্কোর {score}%
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-white">
                                {lesson.title_bn || lesson.title}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                                <span className="text-slate-500">
                                  ⏱️ {lesson.duration_minutes || 5} মিনিট
                                </span>
                                <span className="text-violet-300">
                                  ⚡ +{lesson.xp_reward || 10} XP
                                </span>
                                {completed && (lessonProg?.xp_earned || 0) > 0 && (
                                  <span className="text-emerald-400">
                                    পেয়েছো +{lessonProg?.xp_earned} XP
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 self-center text-lg text-slate-400">
                              {completed ? '✅' : '→'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 opacity-55">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">
                            🔒
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-amber-400/80">
                              আগের পাঠ শেষ করলে আনলক হবে
                            </p>
                            <h3 className="font-bold text-slate-500">
                              {lesson.title_bn || lesson.title}
                            </h3>
                            <span className="text-xs text-slate-600">
                              পাঠ {lesson.lesson_number ?? index + 1} · ⚡ +
                              {lesson.xp_reward || 10} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-600">অনন্য · অধ্যায়ের পাঠ</p>
      </div>

      {continueLesson && !allDone && !loading && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070b14]/95 p-3 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl">
            <Link
              href={lessonHref(continueLesson.lesson.id)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 text-base font-black text-white shadow-lg shadow-violet-500/25"
            >
              চালিয়ে যাও →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
