'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Today = {
  title: string
  title_bn: string | null
  status: string
  score: number | null
  href: string
  updated_at: string | null
}

type ChildInsight = {
  child_id: string
  full_name: string
  avatar_url: string | null
  class_level: string | null
  class_slug: string | null
  today: Today | null
  week: {
    completed: number
    in_progress: number
    avg_score: number | null
    minutes_est: number
    weak_subjects: { id: string; name: string; avg: number }[]
  }
  quiz_alerts: {
    lesson_id: string
    title: string
    score: number
    subject_name: string
    updated_at: string | null
  }[]
  streak_days: number
}

type SubjectOpt = { id: string; name: string }

const CLASS_BN: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'ক্লাস ১',
  class_2: 'ক্লাস ২',
  class_3: 'ক্লাস ৩',
  class_4: 'ক্লাস ৪',
  class_5: 'ক্লাস ৫',
  class_6: 'ক্লাস ৬',
  class_7: 'ক্লাস ৭',
  class_8: 'ক্লাস ৮',
  class_9: 'ক্লাস ৯',
  class_10: 'ক্লাস ১০',
  class_11: 'ক্লাস ১১',
  class_12: 'ক্লাস ১২',
}

function formatClass(level: string | null) {
  if (!level) return 'ক্লাস সেট নেই'
  return CLASS_BN[level] || level.replace(/_/g, ' ')
}

export default function ParentPriorityPanel() {
  const [children, setChildren] = useState<ChildInsight[]>([])
  const [subjects, setSubjects] = useState<SubjectOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = new URLSearchParams()
      if (selectedChild !== 'all') q.set('child_id', selectedChild)
      if (selectedSubject !== 'all') q.set('subject_id', selectedSubject)
      const res = await fetch(`/api/parent/insights?${q}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'লোড ব্যর্থ')
        setChildren([])
        return
      }
      setChildren(data.children || [])
      setSubjects(data.subjects || [])
    } catch {
      setError('নেটওয়ার্ক সমস্যা')
    } finally {
      setLoading(false)
    }
  }, [selectedChild, selectedSubject])

  useEffect(() => {
    void load()
  }, [load])

  const active = useMemo(() => {
    if (selectedChild === 'all') return children
    return children.filter((c) => c.child_id === selectedChild)
  }, [children, selectedChild])

  const allAlerts = useMemo(
    () =>
      active.flatMap((c) =>
        c.quiz_alerts.map((a) => ({
          ...a,
          child_name: c.full_name,
          child_id: c.child_id,
        })),
      ),
    [active],
  )

  if (loading && children.length === 0) {
    return (
      <div className="mb-5 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-5 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </div>
    )
  }

  if (!children.length && selectedChild === 'all') return null

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-[#141428] px-3 text-xs font-semibold text-white outline-none focus:border-violet-500/40"
        >
          <option value="all">সব সন্তান</option>
          {children.map((c) => (
            <option key={c.child_id} value={c.child_id}>
              {c.full_name.split(' ')[0]} · {formatClass(c.class_level)}
            </option>
          ))}
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-[#141428] px-3 text-xs font-semibold text-white outline-none focus:border-violet-500/40"
        >
          <option value="all">সব বিষয়</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10"
        >
          রিফ্রেশ
        </button>
      </div>

      {allAlerts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-[#12122a] to-amber-500/10 p-4"
        >
          <h3 className="text-sm font-bold text-rose-200">কুইজ অ্যালার্ট · ৬০% এর নিচে</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            পাস না হলে পরের পাঠ আনলক হয় না — সাহায্য করুন
          </p>
          <ul className="mt-3 space-y-2">
            {allAlerts.slice(0, 6).map((a) => (
              <li
                key={`${a.child_id}-${a.lesson_id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-black/20 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{a.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {a.child_name.split(' ')[0]} · {a.subject_name}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-black text-rose-300">
                  {a.score}%
                </span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {active.map((c) => (
          <motion.div
            key={c.child_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-[#12122a]/80 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{c.full_name}</p>
                <p className="text-[11px] text-slate-500">
                  {formatClass(c.class_level)}
                  {c.streak_days > 0 ? ` · 🔥 ${c.streak_days} দিন` : ''}
                </p>
              </div>
              <Link
                href={`/dashboard/parent/child/${c.child_id}`}
                className="text-[11px] font-semibold text-violet-300 hover:underline"
              >
                বিস্তারিত →
              </Link>
            </div>

            <div className="mb-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300">
                আজকের পড়া
              </p>
              {c.today ? (
                <>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {c.today.title_bn || c.today.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {c.today.status === 'completed' ? 'সম্পন্ন' : 'চলমান'}
                    {c.today.score != null ? ` · স্কোর ${c.today.score}%` : ''}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500">আজও কোনো পাঠ শুরু হয়নি</p>
              )}
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                সাপ্তাহিক রিপোর্ট
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-black text-emerald-400">{c.week.completed}</p>
                  <p className="text-[10px] text-slate-500">পাঠ</p>
                </div>
                <div>
                  <p className="text-lg font-black text-sky-400">
                    {c.week.avg_score != null ? `${c.week.avg_score}%` : '—'}
                  </p>
                  <p className="text-[10px] text-slate-500">গড় স্কোর</p>
                </div>
                <div>
                  <p className="text-lg font-black text-amber-300">~{c.week.minutes_est}</p>
                  <p className="text-[10px] text-slate-500">মিনিট</p>
                </div>
              </div>
              {c.week.weak_subjects.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.week.weak_subjects.map((w) => (
                    <span
                      key={w.id}
                      className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200"
                    >
                      {w.name} · {w.avg}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
