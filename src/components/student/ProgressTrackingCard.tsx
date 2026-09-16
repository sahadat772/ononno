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
      <div className="mb-4 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/50 via-[#12122a] to-fuchsia-950/30 p-4 shadow-lg shadow-violet-900/20 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-white">📊 আমার অগ্রগতি</h3>
          <p className="text-[11px] text-violet-200/70">
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
          className="rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[11px] font-bold text-violet-200"
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
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
          >
            <div className="text-lg">{k.icon}</div>
            <p className="text-lg font-black text-white">{k.value}</p>
            <p className="text-[10px] font-semibold text-white/50">{k.label}</p>
            <p className="text-[10px] text-violet-300/80">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-[11px] font-semibold">
          <span className="text-white/60">Level {overall.level} XP</span>
          <span className="text-violet-300">
            {overall.xp_in_level} / 500 · পরের level-এ {overall.xp_to_next} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {class_completion && class_completion.classResolved && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <div className="mb-1 flex justify-between text-xs font-bold">
            <span className="text-emerald-200">ক্লাস অগ্রগতি</span>
            <span className="text-emerald-300">{class_completion.percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-emerald-400"
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
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">
            বিষয়ভিত্তিক
          </p>
          {subjects.slice(0, 4).map((s) => (
            <div key={s.subject_id}>
              <div className="mb-0.5 flex justify-between text-[11px]">
                <span className="truncate font-semibold text-white/80">{s.name}</span>
                <span className="shrink-0 text-violet-300">
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
    </motion.div>
  )
}
