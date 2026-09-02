'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Insights = {
  today: {
    planned_goal_minutes: number
    actual_minutes: number
    sessions: number
    progress_pct: number
  }
  streak_days: number
  weekly: {
    total_minutes: number
    by_subject: { subject_id: string; name: string; minutes: number }[]
  }
  quiz_average: number | null
}

export default function LearningInsightsCard() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/student/learning-insights')
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
        Insights লোড হচ্ছে...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
        Insights পাওয়া যায়নি — study session শুরু করো।
      </div>
    )
  }

  const { today, streak_days, weekly, quiz_average } = data
  const maxBar = Math.max(...weekly.by_subject.map((s) => s.minutes), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-sky-500/30 bg-linear-to-br from-sky-950/40 to-[#0a0a1a] p-4 md:p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-white text-base">📈 শেখার অগ্রগতি</h3>
        <Link
          href="/dashboard/student/learning-path"
          className="text-xs text-sky-300 hover:text-sky-200"
        >
          Plan →
        </Link>
      </div>

      {/* Today goal */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/70">আজকের লক্ষ্য</span>
          <span className="font-bold text-sky-300">
            {today.actual_minutes} / {today.planned_goal_minutes} মিনিট
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-sky-400 to-violet-400 transition-all"
            style={{ width: `${today.progress_pct}%` }}
          />
        </div>
        <p className="text-[11px] text-white/40 mt-1.5">
          {today.sessions} session · {today.progress_pct}%
        </p>
      </div>

      {/* Streak + quiz */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl">🔥</p>
          <p className="text-xl font-black text-amber-300">{streak_days}</p>
          <p className="text-[11px] text-white/50">দিনের streak</p>
        </div>
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-center">
          <p className="text-2xl">🎯</p>
          <p className="text-xl font-black text-violet-300">
            {quiz_average != null ? `${quiz_average}%` : '—'}
          </p>
          <p className="text-[11px] text-white/50">Quiz গড়</p>
        </div>
      </div>

      {/* Weekly by subject */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-white/60 font-semibold">এই সপ্তাহ</span>
          <span className="text-white/40">{weekly.total_minutes} মিনিট</span>
        </div>
        {weekly.by_subject.length === 0 ? (
          <p className="text-xs text-white/40">এই সপ্তাহে এখনো study session নেই।</p>
        ) : (
          <div className="space-y-2">
            {weekly.by_subject.slice(0, 5).map((s) => (
              <div key={s.subject_id}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-white/70 truncate">{s.name}</span>
                  <span className="text-white/40">{s.minutes}ম</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sky-400"
                    style={{
                      width: `${Math.round((s.minutes / maxBar) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
