'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Subject {
  id: string
  name: string
  name_bn: string
  icon: string
  color: string
  is_mandatory: boolean
  order_index: number
}

interface ClassInfo {
  id: string
  name: string
  slug: string
  class_number: number
}

function slugCandidates(raw: string): string[] {
  const s = decodeURIComponent(raw || '').trim().toLowerCase()
  const underscored = s.replace(/-/g, '_')
  const dashed = s.replace(/_/g, '-')
  const compact = s.replace(/[-_\s]/g, '')
  return [...new Set([s, underscored, dashed, compact].filter(Boolean))]
}

function parseClassNumber(raw: string): number | null {
  const m = decodeURIComponent(raw || '').match(/(\d{1,2})/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return n >= 1 && n <= 12 ? n : null
}

const ICON_FALLBACK: Record<string, string> = {
  bangla: '📗',
  'বাংলা': '📗',
  english: '📘',
  'ইংরেজি': '📘',
  math: '🔢',
  mathematics: '🔢',
  'গণিত': '🔢',
  science: '🔬',
  'বিজ্ঞান': '🔬',
  islam: '🕌',
  islamic: '🕌',
  'ইসলাম': '🕌',
  'ইসলাম শিক্ষা': '🕌',
}

function subjectIcon(subject: Subject): string {
  if (subject.icon && subject.icon.length <= 4) return subject.icon
  const key = (subject.name_bn || subject.name || '').toLowerCase()
  for (const [k, v] of Object.entries(ICON_FALLBACK)) {
    if (key.includes(k.toLowerCase())) return v
  }
  return '📖'
}

function subjectColor(subject: Subject, index: number): string {
  if (subject.color && subject.color.includes('from-')) return subject.color
  const palette = [
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
  ]
  return palette[index % palette.length]
}

export default function ClassSubjectsPage() {
  const params = useParams()
  const classSlug = params.classSlug as string

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [counts, setCounts] = useState<Record<string, { done: number; total: number }>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        const candidates = slugCandidates(classSlug)
        let cls: ClassInfo | null = null

        for (const slug of candidates) {
          const { data } = await supabase
            .from('curriculum_classes')
            .select('id, name, slug, class_number')
            .eq('slug', slug)
            .eq('is_active', true)
            .maybeSingle()
          if (data) {
            cls = data
            break
          }
        }

        if (!cls) {
          const num = parseClassNumber(classSlug)
          if (num != null) {
            const { data } = await supabase
              .from('curriculum_classes')
              .select('id, name, slug, class_number')
              .eq('class_number', num)
              .eq('is_active', true)
              .maybeSingle()
            if (data) cls = data
          }
        }

        if (!cls) {
          setClassInfo(null)
          setSubjects([])
          setError(`ক্লাস "${classSlug}" পাওয়া যায়নি।`)
          return
        }

        setClassInfo(cls)

        const { data: subs, error: subErr } = await supabase
          .from('curriculum_subjects')
          .select('id, name, name_bn, icon, color, is_mandatory, order_index')
          .eq('class_id', cls.id)
          .eq('is_active', true)
          .order('order_index')

        if (subErr) {
          setError('বিষয় লোড করা যায়নি।')
          setSubjects([])
          return
        }

        const subjectList = subs ?? []
        setSubjects(subjectList)

        let published =
          (
            await supabase
              .from('curriculum_lessons')
              .select('id, subject_id')
              .eq('class_id', cls.id)
              .eq('is_active', true)
              .eq('is_published', true)
          ).data ?? []

        if (published.length === 0 && subjectList.length > 0) {
          const ids = subjectList.map((s) => s.id)
          const { data } = await supabase
            .from('curriculum_lessons')
            .select('id, subject_id')
            .in('subject_id', ids)
            .eq('is_active', true)
            .eq('is_published', true)
          published = data ?? []
        }

        const totalBySubject: Record<string, number> = {}
        const publishedIds = new Set<string>()
        const lessonToSubject = new Map<string, string>()
        for (const l of published) {
          if (!l.subject_id) continue
          const lid = String(l.id)
          totalBySubject[l.subject_id] = (totalBySubject[l.subject_id] || 0) + 1
          publishedIds.add(lid)
          lessonToSubject.set(lid, String(l.subject_id))
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()
        const doneBySubject: Record<string, number> = {}

        if (user && publishedIds.size > 0) {
          const { data: prog } = await supabase
            .from('learning_progress')
            .select('lesson_id, subject_id, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')

          const seen = new Set<string>()
          for (const row of prog ?? []) {
            if (!row.lesson_id) continue
            const lid = String(row.lesson_id)
            if (!publishedIds.has(lid) || seen.has(lid)) continue
            seen.add(lid)
            const sid =
              (row.subject_id ? String(row.subject_id) : null) || lessonToSubject.get(lid)
            if (!sid) continue
            doneBySubject[sid] = (doneBySubject[sid] || 0) + 1
          }
        }

        const nextProgress: Record<string, number> = {}
        const nextCounts: Record<string, { done: number; total: number }> = {}
        for (const s of subjectList) {
          const total = totalBySubject[s.id] || 0
          const done = Math.min(doneBySubject[s.id] || 0, total)
          nextCounts[s.id] = { done, total }
          nextProgress[s.id] = total > 0 ? Math.round((done / total) * 100) : 0
        }
        setProgress(nextProgress)
        setCounts(nextCounts)
      } catch (e) {
        console.error(e)
        setError('ডেটা লোড করতে সমস্যা হয়েছে।')
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [classSlug])

  const overall = useMemo(() => {
    let done = 0
    let total = 0
    for (const c of Object.values(counts)) {
      done += c.done
      total += c.total
    }
    return {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    }
  }, [counts])

  const sectorColor = 'from-sky-400 to-blue-600'

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard/student/academic"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 hover:text-white"
          >
            ←
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-bold">{classInfo?.name || 'একাডেমিক'}</p>
            <p className="text-[10px] text-sky-400">বিষয় বেছে নাও</p>
          </div>
          <Link
            href="/dashboard/student/ai-tutor"
            className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-300"
          >
            🤖
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-5 pb-12 md:px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          {classInfo && (
            <div className={`rounded-3xl bg-gradient-to-r ${sectorColor} p-px`}>
              <div className="rounded-[23px] bg-[#0a1220] p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-sky-300/80">এনসিটিবি পাঠ্যক্রম</p>
                    <h1 className="mt-1 text-2xl font-black text-white md:text-3xl">{classInfo.name}</h1>
                    <p className="mt-1 text-sm text-slate-400">
                      {subjects.length}টি বিষয় · {overall.done}/{overall.total} পাঠ সম্পন্ন
                    </p>
                  </div>
                  <div className="text-5xl md:text-6xl">📚</div>
                </div>

                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                    <span>সামগ্রিক অগ্রগতি</span>
                    <span className="font-bold text-sky-300">{overall.pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overall.pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-2.5 rounded-full bg-gradient-to-r ${sectorColor}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {!loading && !error && subjects.length > 0 && (
          <div className="mb-5 grid grid-cols-3 gap-2">
            {[
              { icon: '📖', label: 'পাঠ পড়ো' },
              { icon: '✅', label: 'কুইজ দাও' },
              { icon: '⭐', label: 'অগ্রগতি বাড়াও' },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center"
              >
                <div className="text-base">{t.icon}</div>
                <div className="text-[10px] font-semibold text-slate-400">{t.label}</div>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-3 text-lg font-black text-white">বিষয়সমূহ</h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
            <p className="text-3xl">😕</p>
            <p className="mt-2 font-semibold text-amber-200">{error}</p>
            <Link
              href="/dashboard/student/academic"
              className="mt-4 inline-block rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white"
            >
              একাডেমিক হাবে ফিরে যাও
            </Link>
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-3xl">📭</p>
            <p className="mt-2 font-semibold text-white">এই ক্লাসে এখনো বিষয় নেই</p>
            <p className="mt-1 text-sm text-slate-400">অ্যাডমিন পাঠ্যক্রম যোগ করলে এখানে দেখাবে</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                classSlug={classSlug}
                index={i}
                progress={progress[subject.id] || 0}
                done={counts[subject.id]?.done ?? 0}
                total={counts[subject.id]?.total ?? 0}
              />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য · একাডেমিক · এনসিটিবি</p>
      </div>
    </div>
  )
}

function SubjectCard({
  subject,
  classSlug,
  index,
  progress,
  done,
  total,
}: {
  subject: Subject
  classSlug: string
  index: number
  progress: number
  done: number
  total: number
}) {
  const color = subjectColor(subject, index)
  const icon = subjectIcon(subject)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3 }}
    >
      <Link href={`/dashboard/student/academic/learn/${classSlug}/${subject.id}`}>
        <div className="group h-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-sky-500/30 hover:bg-white/[0.08]">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${color}`}
            >
              {icon}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">অগ্রগতি</p>
              <p className={`text-lg font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {progress}%
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {done}/{total} পাঠ
              </p>
            </div>
          </div>

          <h3 className="mb-0.5 text-lg font-bold text-white transition group-hover:text-sky-300">
            {subject.name_bn || subject.name}
          </h3>
          {subject.name_bn && subject.name && subject.name_bn !== subject.name && (
            <p className="mb-3 text-sm text-slate-500">{subject.name}</p>
          )}
          {!(subject.name_bn && subject.name && subject.name_bn !== subject.name) && (
            <div className="mb-3" />
          )}

          {subject.is_mandatory && (
            <span className="mb-3 inline-block rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
              বাধ্যতামূলক
            </span>
          )}

          <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
              className={`h-2 rounded-full bg-gradient-to-r ${color}`}
            />
          </div>

          <div
            className={`flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
          >
            {progress >= 100 ? 'সম্পন্ন ✨' : progress > 0 ? 'চালিয়ে যাও' : 'শুরু করো'}{' '}
            <span>→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
