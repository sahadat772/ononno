'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import {
  fallbackChapters,
  fallbackSubjects,
  isFallbackId,
  parseClassNum,
} from '@/lib/academic-fallback'

interface Chapter {
  id: string
  title: string
  title_bn?: string
  chapter_number: number
  description: string
  order_index: number
}

interface Subject {
  id: string
  name: string
  name_bn?: string
  icon: string
  color: string
}

interface LessonProgress {
  chapter_id?: string | null
  lesson_id?: string | null
  status: string
  score?: number
  xp_earned?: number
}

function safeColor(color?: string) {
  if (color && color.includes('from-')) return color
  return 'from-violet-500 to-purple-600'
}

export default function ChapterListPage() {
  const params = useParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [lessonsByChapter, setLessonsByChapter] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [totalXP, setTotalXP] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (isFallbackId(subjectId)) {
          const n = parseClassNum(classSlug) ?? 1
          const all = fallbackSubjects(n)
          const sub = all.find((s) => s.id === subjectId) || {
            id: subjectId,
            name: 'Subject',
            name_bn: 'বিষয়',
            icon: '📚',
            color: 'from-violet-500 to-purple-600',
          }
          setSubject(sub)
          const chaps = fallbackChapters(subjectId)
          setChapters(chaps)
          const byChapFb: Record<string, string[]> = {}
          for (const c of chaps) {
            byChapFb[c.id] = [`${c.id}-l1`, `${c.id}-l2`, `${c.id}-l3`, `${c.id}-l4`]
          }
          setLessonsByChapter(byChapFb)
          setLoading(false)
          return
        }

        const { data: sub } = await supabase
          .from('curriculum_subjects')
          .select('*')
          .eq('id', subjectId)
          .maybeSingle()
        if (sub) setSubject(sub)
        else {
          const n = parseClassNum(classSlug) ?? 1
          const all = fallbackSubjects(n)
          const fb = all.find((s) => s.id === subjectId)
          if (fb) setSubject(fb)
        }

        const { data: publishedLessons } = await supabase
          .from('curriculum_lessons')
          .select('id, chapter_id')
          .eq('subject_id', subjectId)
          .eq('is_active', true)
          .eq('is_published', true)

        const byChap: Record<string, string[]> = {}
        for (const l of publishedLessons ?? []) {
          if (!l.chapter_id) continue
          const id = String(l.id)
          if (!byChap[l.chapter_id]) byChap[l.chapter_id] = []
          byChap[l.chapter_id].push(id)
        }
        setLessonsByChapter(byChap)

        const chapterIds = Object.keys(byChap)

        if (chapterIds.length > 0) {
          const { data: chaps } = await supabase
            .from('curriculum_chapters')
            .select('*')
            .in('id', chapterIds)
            .eq('is_active', true)
            .order('order_index')
          if (chaps) setChapters(chaps)
        } else {
          const { data: allChaps } = await supabase
            .from('curriculum_chapters')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('is_active', true)
            .order('order_index')
          if (allChaps && allChaps.length > 0) {
            setChapters(allChaps)
          } else {
            const fb = fallbackChapters(subjectId)
            setChapters(fb)
            const fbMap: Record<string, string[]> = {}
            for (const c of fb) {
              fbMap[c.id] = [`${c.id}-l1`, `${c.id}-l2`, `${c.id}-l3`, `${c.id}-l4`]
            }
            setLessonsByChapter(fbMap)
          }
        }

        if (user) {
          const { data: prog } = await supabase
            .from('learning_progress')
            .select('chapter_id, lesson_id, status, score, xp_earned')
            .eq('user_id', user.id)

          setProgress(
            (prog ?? []).map((p) => ({
              ...p,
              lesson_id: p.lesson_id != null ? String(p.lesson_id) : null,
              chapter_id: p.chapter_id != null ? String(p.chapter_id) : null,
            })),
          )

          const { data: stats } = await supabase
            .from('student_stats')
            .select('total_xp, current_streak')
            .eq('user_id', user.id)
            .maybeSingle()
          if (stats) {
            setTotalXP(stats.total_xp ?? 0)
            setStreak(stats.current_streak ?? 0)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [subjectId, classSlug])

  const completedLessonIds = new Set(
    progress
      .filter((p) => p.status === 'completed' && p.lesson_id)
      .map((p) => String(p.lesson_id)),
  )

  const getChapterProgress = (chapterId: string) => {
    const lessonIds = lessonsByChapter[chapterId] || []
    if (lessonIds.length === 0) return 0
    const done = lessonIds.filter((id) => completedLessonIds.has(String(id))).length
    return Math.round((done / lessonIds.length) * 100)
  }

  const isChapterUnlocked = (index: number) => {
    if (index === 0) return true
    const prevChapter = chapters[index - 1]
    if (!prevChapter) return false
    return getChapterProgress(prevChapter.id) >= 60
  }

  const allLessonIds = Object.values(lessonsByChapter).flat()
  const overallCompleted = allLessonIds.filter((id) => completedLessonIds.has(String(id))).length
  const overallPct =
    allLessonIds.length > 0 ? Math.round((overallCompleted / allLessonIds.length) * 100) : 0

  const subjectXp = progress
    .filter((p) => p.lesson_id && allLessonIds.includes(String(p.lesson_id)))
    .reduce((s, p) => s + (Number(p.xp_earned) || 0), 0)

  const color = safeColor(subject?.color)

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <Link
            href={`/dashboard/student/academic/learn/${classSlug}`}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 hover:text-white"
          >
            ←
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-bold">{subject?.name_bn || subject?.name || 'বিষয়'}</p>
            <p className="text-[10px] text-violet-300">অধ্যায় বেছে নাও</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-1 text-xs font-bold text-amber-300">
              🔥 {streak}
            </span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-1 text-xs font-bold text-violet-300">
              ⚡ {Math.max(totalXP, subjectXp)}
            </span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-5 pb-12">
        {subject && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 text-center"
          >
            <div
              className={`mx-auto mb-3 grid size-20 place-items-center rounded-3xl bg-gradient-to-br text-4xl shadow-xl ${color}`}
            >
              {subject.icon || '📚'}
            </div>
            <h1 className="text-2xl font-black text-white">{subject.name_bn || subject.name}</h1>
            {subject.name_bn && subject.name && subject.name_bn !== subject.name && (
              <p className="mt-0.5 text-sm text-slate-400">{subject.name}</p>
            )}
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-slate-400">
              <span>{chapters.length}টি অধ্যায়</span>
              <span className="text-slate-600">·</span>
              <span>
                {overallCompleted}/{allLessonIds.length} পাঠ সম্পন্ন
              </span>
            </div>

            <div className="mx-auto mt-4 max-w-sm">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>সামগ্রিক অগ্রগতি</span>
                <span className="font-bold text-violet-300">{overallPct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-2.5 rounded-full bg-gradient-to-r ${color}`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {(() => {
          const idx = chapters.findIndex(
            (_, i) => isChapterUnlocked(i) && getChapterProgress(chapters[i].id) < 100,
          )
          if (idx < 0 || loading) return null
          const ch = chapters[idx]
          return (
            <Link
              href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${ch.id}`}
              className="mb-5 block"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-violet-500/35 bg-gradient-to-r from-violet-500/20 to-purple-500/15 p-4 shadow-lg shadow-violet-500/10 transition active:scale-[0.99]">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl">
                  ▶️
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-violet-300">চালিয়ে যাও</p>
                  <p className="truncate font-bold text-white">{ch.title_bn || ch.title}</p>
                </div>
                <span className="text-violet-300">→</span>
              </div>
            </Link>
          )
        })()}

        <h2 className="mb-3 text-lg font-black text-white">অধ্যায়সমূহ</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-4xl">📭</p>
            <p className="mt-2 font-bold text-white">এখনো কোনো অধ্যায় নেই</p>
            <p className="mt-1 text-sm text-slate-400">পাবলিশ করা পাঠ যোগ হলে এখানে দেখাবে</p>
            <Link
              href={`/dashboard/student/academic/learn/${classSlug}`}
              className="mt-4 inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white"
            >
              বিষয়ে ফিরে যাও
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter, index) => {
              const unlocked = isChapterUnlocked(index)
              const chapterProg = getChapterProgress(chapter.id)
              const completed = chapterProg >= 100
              const inProgress = chapterProg > 0 && chapterProg < 100
              const totalLessons = (lessonsByChapter[chapter.id] || []).length

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {unlocked ? (
                    <Link
                      href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapter.id}`}
                    >
                      <div className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-violet-500/30 hover:bg-white/[0.08]">
                        <div className="flex gap-3">
                          <div
                            className={`grid size-14 shrink-0 place-items-center rounded-2xl text-xl font-black ${
                              completed
                                ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                                : inProgress
                                  ? 'border border-sky-400/40 bg-sky-500/20 text-sky-300'
                                  : `bg-gradient-to-br text-white ${color}`
                            }`}
                          >
                            {completed ? '✅' : inProgress ? '📖' : chapter.chapter_number || index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-white">
                                {chapter.title_bn || chapter.title}
                              </h3>
                              {completed && (
                                <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                  সম্পন্ন
                                </span>
                              )}
                              {inProgress && (
                                <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                                  চলছে
                                </span>
                              )}
                            </div>
                            {chapter.description && (
                              <p className="mt-0.5 truncate text-sm text-slate-400">
                                {chapter.description}
                              </p>
                            )}
                            <div className="mt-2">
                              <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                                <span>
                                  {totalLessons > 0
                                    ? `${totalLessons}টি পাঠ`
                                    : 'পাঠ শীঘ্রই'}
                                </span>
                                <span className="font-semibold">{chapterProg}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${chapterProg}%` }}
                                  transition={{ duration: 0.7, delay: index * 0.08 }}
                                  className={`h-2 rounded-full bg-gradient-to-r ${
                                    completed
                                      ? 'from-emerald-500 to-teal-500'
                                      : 'from-sky-500 to-cyan-500'
                                  }`}
                                />
                              </div>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-violet-300">
                              {completed ? 'আবার দেখো →' : inProgress ? 'চালিয়ে যাও →' : 'শুরু করো →'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 opacity-55">
                      <div className="flex items-center gap-3">
                        <div className="grid size-14 place-items-center rounded-2xl bg-white/5 text-2xl">
                          🔒
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-500">
                            {chapter.title_bn || chapter.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            আগের অধ্যায় ৬০% সম্পন্ন করলে আনলক হবে
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য · অধ্যায় লিস্ট</p>
      </div>
    </div>
  )
}
