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
  week_active?: boolean[]
}

function WeekDots({ active }: { active?: boolean[] }) {
  const labels = ['স', 'ম', 'ব', 'ব', 'ব', 'শ', 'শ']
  const today = new Date().getDay() // 0 Sun
  // Map Sun-first to Mon-first visual: Mon=1 ... Sun=0
  const order = [1, 2, 3, 4, 5, 6, 0]
  const flags =
    active && active.length === 7
      ? active
      : order.map((d) => {
          // fallback: light up days from today backward by streak later in parent
          return false
        })

  return (
    <div className="flex justify-between gap-1">
      {order.map((dow, i) => {
        const isToday = dow === today
        const on = flags[i]
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`grid size-7 place-items-center rounded-full text-[10px] font-black transition ${
                on
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/40'
                  : isToday
                    ? 'border-2 border-orange-400/50 bg-orange-500/10 text-orange-200'
                    : 'border border-white/10 bg-white/5 text-slate-500'
              }`}
            >
              {on ? '✓' : labels[i]}
            </div>
          </div>
        )
      })}
    </div>
  )
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
      <div className="mb-5 h-48 animate-pulse rounded-3xl border border-orange-500/15 bg-gradient-to-br from-orange-500/10 to-transparent" />
    )
  }

  if (!data) return null

  const goal = Math.max(1, data.daily_goal || 1)
  const done = data.lessons_completed_today || 0
  const pct = Math.min(100, Math.round((done / goal) * 100))
  const complete = data.goal_done_today || done >= goal
  const streak = data.streak_days || 0

  // Approximate week dots from streak when API has no week_active
  const weekActive = (() => {
    if (data.week_active?.length === 7) return data.week_active
    const today = new Date().getDay()
    const order = [1, 2, 3, 4, 5, 6, 0]
    const flags = order.map(() => false)
    let left = Math.min(streak, 7)
    // mark today if complete or streak>0, then walk back
    let cursor = today
    for (let step = 0; step < 7 && left > 0; step++) {
      const idx = order.indexOf(cursor)
      if (idx >= 0) {
        if (step === 0 && !complete && streak === 0) {
          // leave today empty
        } else {
          flags[idx] = true
          left--
        }
      }
      cursor = (cursor + 6) % 7 // previous day
    }
    if (complete) {
      const idx = order.indexOf(today)
      if (idx >= 0) flags[idx] = true
    }
    return flags
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mb-5 overflow-hidden rounded-3xl border border-orange-400/25 bg-[#120a14] p-4 shadow-[0_0_40px_-12px_rgba(249,115,22,0.35)] sm:p-5"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 size-32 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300/70">
              Daily Path · অভ্যাস
            </p>
            <h3 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
              {complete ? 'আজকের লক্ষ্য পূরণ!' : 'আজকের একটা পাঠ'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Level{' '}
              <span className="font-bold text-violet-300">{data.level}</span>
              {' · '}
              <span className="font-bold text-amber-300">{data.total_xp} XP</span>
            </p>
          </div>

          {/* Streak hero — Duolingo-style loss aversion */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative flex shrink-0 flex-col items-center"
          >
            <div className="relative grid size-16 place-items-center rounded-2xl border border-orange-400/40 bg-gradient-to-br from-orange-500/30 via-amber-600/20 to-rose-600/20 shadow-lg shadow-orange-500/20 sm:size-[4.5rem]">
              <span className="text-3xl sm:text-4xl" aria-hidden>
                🔥
              </span>
              {streak > 0 && (
                <span className="absolute -bottom-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-black text-white shadow-md">
                  {streak}
                </span>
              )}
            </div>
            <p className="mt-2 text-[10px] font-bold text-orange-200/80">
              {streak > 0 ? 'দিন streak' : 'শুরু করো'}
            </p>
          </motion.div>
        </div>

        {/* Week rhythm dots */}
        <div className="mb-4 rounded-2xl border border-white/8 bg-black/25 px-3 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-white/35">
            এই সপ্তাহের ছন্দ
          </p>
          <WeekDots active={weekActive} />
        </div>

        {/* Goal progress */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
            <span className="text-white/70">
              দৈনিক লক্ষ্য · {done}/{goal} লেসন
            </span>
            <span className={complete ? 'text-emerald-300' : 'text-orange-300'}>
              {pct}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                complete
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                  : 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={data.next_href || '/dashboard/student/kids-zone'}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 px-4 text-sm font-black text-white shadow-[0_8px_24px_-6px_rgba(249,115,22,0.55)] transition active:scale-[0.98]"
          >
            {complete ? 'আরও শিখো →' : 'লেসন শুরু করো →'}
          </Link>
          <Link
            href="/dashboard/student/performance"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-3.5 text-xs font-bold text-slate-300 backdrop-blur"
          >
            📈 রিপোর্ট
          </Link>
        </div>

        <p className="mt-2.5 truncate text-[11px] text-slate-500">
          পরের ধাপ · {data.next_label_bn || data.next_label}
        </p>
      </div>
    </motion.div>
  )
}
