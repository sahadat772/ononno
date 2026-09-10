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

export default function ChapterLessonsPage() {
  const params = useParams()
  const classSlug = params.classSlug as string
  const subjectId = params.subjectId as string
  const chapterId = params.chapterId as string

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())

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
          else setError('অধ্যায় পাওয়া যায়নি।')
        }

        const { data: lsnsRaw } = await supabase
          .from('curriculum_lessons')
          .select('*')
          .eq('chapter_id', chapterId)
          .or('is_active.eq.true,is_active.is.null')
          .order('order_index', { ascending: true })

        const lsns = (lsnsRaw ?? []).filter(
          (l) =>
            l.is_published === true ||
            l.workflow_status === 'published' ||
            l.workflow_status === 'approved',
        )

        if (lsns.length > 0) {
          const sorted = [...lsns].sort(
            (a, b) =>
              (a.order_index ?? 0) - (b.order_index ?? 0) ||
              (a.lesson_number ?? 0) - (b.lesson_number ?? 0),
          )
          setLessons(sorted)
        } else {
          setLessons(fallbackLessons(chapterId))
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: prog } = await supabase
            .from('learning_progress')
            .select('lesson_id, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')
          setDoneIds(new Set((prog ?? []).map((p) => String(p.lesson_id)).filter(Boolean)))
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
          <p className="mt-1 text-sm text-slate-400">Published lessons · student view</p>
        </header>

        {loading ? (
          <p className="py-12 text-center text-slate-500">লোড হচ্ছে…</p>
        ) : error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p>
        ) : lessons.length === 0 ? (
          <p className="py-12 text-center text-slate-500">এই অধ্যায়ে এখনো published lesson নেই।</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const done = doneIds.has(String(lesson.id))
              const href = `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${lesson.id}`
              return (
                <motion.div key={lesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-sky-500/30 hover:bg-white/[0.08]"
                  >
                    <div className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${
                      done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {done ? '✓' : lesson.lesson_number ?? i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{lesson.title_bn || lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.duration_minutes ?? 15} মিনিট · {lesson.xp_reward ?? 10} XP
                        {lesson.workflow_status ? ` · ${lesson.workflow_status}` : ''}
                      </p>
                    </div>
                    <span className="text-slate-500">→</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
