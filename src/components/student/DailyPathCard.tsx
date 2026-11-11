'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type DailyPathData = {
  streak_days: number
  goal_done_today: boolean
  lessons_completed_today: number
  daily_goal: number
  total_xp: number
  level: number
  next_href: string
  next_label: string
  next_label_bn: string
}

export default function DailyPathCard() {
  const [data, setData] = useState<DailyPathData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/student/daily-path', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || d?.error) return
        setData(d as DailyPathData)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="mb-4 h-36 animate-pulse rounded-2xl border border-orange-500/20 bg-orange-500/5" />
    )
  }

  if (!data) return null

  const goal = Math.max(1, data.daily_goal || 1)
  const done = data.lessons_completed_today || 0
  const pct = Math.min(100, Math.round((done / goal) * 100))
  const complete = data.goal_done_today || done >= goal

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/20 via-[#1a1020] to-violet-600/20 p-4 shadow-lg shadow-orange-900/20 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-orange-200/80">
            আজকের Path
          </p>
          <h3 className="text-lg font-black text-white sm:text-xl">
            {complete ? 'লক্ষ্য পূরণ! 🎉' : 'একটা লেসন শেষ করো'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Daily habit · Level {data.level} · {data.total_xp} XP
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-orange-400/40 bg-orange-500/15 px-3 py-2">
          <span className="text-2xl" aria-hidden>
            🔥
          </span>
          <div>
            <p className="text-lg font-black leading-none text-orange-200">
              {data.streak_days}
            </p>
            <p className="text-[10px] font-semibold text-orange-200/70">দিন streak</p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[11px] font-semibold">
          <span className="text-white/70">
            দৈনিক লক্ষ্য · {done}/{goal} লেসন
          </span>
          <span className={complete ? 'text-emerald-300' : 'text-orange-300'}>
            {pct}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-all ${
              complete
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                : 'bg-gradient-to-r from-orange-400 to-amber-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={data.next_href || '/dashboard/student/kids-zone'}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 text-sm font-black text-white shadow-md shadow-orange-500/25 active:scale-[0.98]"
        >
          {complete ? 'আরও শিখো →' : 'লেসন শুরু →'}
        </Link>
        <Link
          href="/dashboard/student/performance"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-slate-300"
        >
          📈
        </Link>
      </div>
      <p className="mt-2 truncate text-[11px] text-slate-500">
        পরের ধাপ: {data.next_label_bn || data.next_label}
      </p>
    </motion.div>
  )
}
