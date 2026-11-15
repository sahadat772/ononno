'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type ProgressData = {
  overall: {
    lessons_completed: number
    lessons_tracked: number
    total_xp: number
    level: number
    xp_in_level: number
    xp_to_next: number
    average_score: number | null
    streak_days: number
    strong: number
    medium: number
    weak: number
  }
  subjects: {
    subject_id: string
    name: string
    completed: number
    tracked: number
    percent: number
    xp: number
    average_score: number | null
  }[]
  class_completion: {
    class_level: string
    isComplete: boolean
    percent: number
    completedSubjects: number
    totalSubjects: number
    classResolved: boolean
  } | null
  profile: {
    class_level: string | null
    unlocked_class_level: string | null
  }
}

export default function ProgressTrackingCard() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/student/progress-tracking', {
          cache: 'no-store',
        })
        const json = await res.json()
        if (res.ok) setData(json)
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="mb-5 h-44 animate-pulse rounded-3xl border border-violet-500/15 bg-gradient-to-br from-violet-500/10 to-transparent" />
    )
  }

  if (!data) return null

  const { overall, subjects, class_completion, profile } = data
  const xpPct = Math.min(100, Math.round((overall.xp_in_level / 500) * 100))
  const classLabel = (profile.unlocked_class_level || profile.class_level || '').replace(
    /_/g,
    ' ',
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mb-5 overflow-hidden rounded-3xl border border-violet-400/20 bg-[#100a1a] p-4 shadow-[0_0_40px_-14px_rgba(139,92,246,0.35)] sm:p-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 size-28 rounded-full bg-fuchsia-600/15 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300/70">
              Progress · অগ্রগতি
            </p>
            <h3 className="mt-0.5 text-lg font-black text-white sm:text-xl">আমার অগ্রগতি</h3>
            <p className="mt-0.5 text-[11px] text-violet-200/60">
              {classLabel ? `ক্লাস: ${classLabel}` : 'Progress tracking'}
              {class_completion?.classResolved && (
                <>
                  {' '}
                  · বিষয় {class_completion.completedSubjects}/
                  {class_completion.totalSubjects}
                </>
              )}
            </p>
          </div>
          <Link
            href="/dashboard/student/performance"
            className="rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[11px] font-bold text-violet-100 transition hover:bg-violet-500/25"
          >
            বিস্তারিত →
          </Link>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: 'Level',
              value: String(overall.level),
              icon: '🏆',
              sub: `${overall.total_xp} XP`,
            },
            {
              label: 'সম্পন্ন পাঠ',
              value: String(overall.lessons_completed),
              icon: '✅',
              sub: `${overall.lessons_tracked} tracked`,
            },
            {
              label: 'গড় স্কোর',
              value:
                overall.average_score != null ? `${overall.average_score}%` : '—',
              icon: '🎯',
              sub: '≥60% pass',
            },
            {
              label: 'Streak',
              value: `${overall.streak_days}`,
              icon: '🔥',
              sub: 'দিন',
            },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center backdrop-blur-sm"
            >
              <div className="text-lg">{k.icon}</div>
              <p className="text-lg font-black text-white">{k.value}</p>
              <p className="text-[10px] font-semibold text-white/45">{k.label}</p>
              <p className="text-[10px] text-violet-300/80">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
            <span className="text-white/60">Level {overall.level} XP</span>
            <span className="text-violet-300">
              {overall.xp_in_level} / 500 · পরের level-এ {overall.xp_to_next} XP
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400"
            />
          </div>
        </div>

        {class_completion && class_completion.classResolved && (
          <div className="mb-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5">
            <div className="mb-1.5 flex justify-between text-xs font-bold">
              <span className="text-emerald-200">ক্লাস অগ্রগতি</span>
              <span className="text-emerald-300">{class_completion.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                style={{ width: `${class_completion.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-emerald-100/70">
              {class_completion.isComplete
                ? 'ক্লাস সম্পন্ন — পরের ক্লাস আনলক হতে পারে!'
                : `${class_completion.completedSubjects}/${class_completion.totalSubjects} বিষয় সম্পন্ন`}
            </p>
          </div>
        )}

        {subjects.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/35">
              বিষয়ভিত্তিক
            </p>
            {subjects.slice(0, 4).map((s) => (
              <div key={s.subject_id}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="truncate font-semibold text-white/85">{s.name}</span>
                  <span className="shrink-0 font-bold text-violet-300">
                    {s.percent}% · {s.completed}/{s.tracked}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      s.percent >= 100
                        ? 'bg-emerald-400'
                        : s.percent >= 50
                          ? 'bg-violet-400'
                          : 'bg-slate-500'
                    }`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {subjects.length === 0 && overall.lessons_completed === 0 && (
          <p className="text-center text-xs text-white/40">
            এখনো কোনো পাঠ সম্পন্ন হয়নি — Academic থেকে শুরু করো!
          </p>
        )}
      </div>
    </motion.div>
  )
}
