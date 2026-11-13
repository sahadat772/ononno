'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type ReportData = {
  period: string
  summary: {
    lessons_completed: number
    average_score: number | null
    grade: string | null
    xp_earned: number
    total_xp: number
    level: number
    streak_days: number
    strong: number
    medium: number
    weak: number
    active_days: number
  }
  daily: { date: string; lessons: number }[]
  subjects: {
    subject_id: string
    name: string
    completed: number
    average_score: number | null
  }[]
  narrative: { headline: string; tip: string }
}

export default function ReportCardCard() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/student/report-card?period=${period}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || d?.error) return
        setData(d as ReportData)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [period])

  if (loading) {
    return (
      <div className="mb-4 h-44 animate-pulse rounded-2xl border border-sky-500/20 bg-sky-500/5" />
    )
  }

  if (!data) return null

  const s = data.summary
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.lessons))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-500/15 via-[#101828] to-indigo-600/20 p-4 shadow-lg shadow-sky-900/20 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-sky-200/80">
            📋 Report Card
          </p>
          <h3 className="text-lg font-black text-white sm:text-xl">
            {period === 'week' ? 'সাপ্তাহিক রিপোর্ট' : 'মাসিক রিপোর্ট'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Level {s.level} · {s.total_xp} XP · Grade{' '}
            <span className="font-bold text-sky-200">{s.grade || '—'}</span>
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
              period === 'week'
                ? 'bg-sky-500/30 text-sky-100'
                : 'text-slate-400'
            }`}
          >
            সপ্তাহ
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
              period === 'month'
                ? 'bg-sky-500/30 text-sky-100'
                : 'text-slate-400'
            }`}
          >
            মাস
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm font-semibold leading-snug text-sky-50/90">
        {data.narrative.headline}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'পাঠ', value: String(s.lessons_completed), icon: '✅' },
          {
            label: 'গড় স্কোর',
            value: s.average_score != null ? `${s.average_score}%` : '—',
            icon: '🎯',
          },
          { label: 'Streak', value: `${s.streak_days}`, icon: '🔥' },
          { label: 'XP (period)', value: String(s.xp_earned), icon: '⚡' },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center"
          >
            <div className="text-sm">{k.icon}</div>
            <p className="text-base font-black text-white">{k.value}</p>
            <p className="text-[10px] text-slate-400">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-white/40">
          দৈনিক অ্যাক্টিভিটি
        </p>
        <div className="flex h-12 items-end gap-0.5 sm:gap-1">
          {data.daily.map((d) => {
            const h = Math.max(8, Math.round((d.lessons / maxDaily) * 100))
            return (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center justify-end"
                title={`${d.date}: ${d.lessons}`}
              >
                <div
                  className={`w-full rounded-t-sm ${
                    d.lessons > 0
                      ? 'bg-gradient-to-t from-sky-500 to-cyan-300'
                      : 'bg-white/10'
                  }`}
                  style={{ height: `${d.lessons > 0 ? h : 12}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-slate-500">
          <span>{data.daily[0]?.date?.slice(5) || ''}</span>
          <span>
            {s.active_days}/{data.daily.length} দিন সক্রিয়
          </span>
          <span>{data.daily[data.daily.length - 1]?.date?.slice(5) || ''}</span>
        </div>
      </div>

      {(s.strong > 0 || s.weak > 0) && (
        <p className="mb-2 text-[11px] text-slate-400">
          শক্তিশালী {s.strong} · মাঝারি {s.medium} · দুর্বল {s.weak}
        </p>
      )}

      {data.subjects.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {data.subjects.slice(0, 3).map((sub) => (
            <div
              key={sub.subject_id}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5 text-[11px]"
            >
              <span className="truncate font-semibold text-white/80">
                {sub.name}
              </span>
              <span className="shrink-0 text-sky-300">
                {sub.completed} পাঠ
                {sub.average_score != null ? ` · ${sub.average_score}%` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
        💡 {data.narrative.tip}
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/student/performance"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3 text-xs font-black text-white"
        >
          পূর্ণ Report →
        </Link>
        <Link
          href="/dashboard/student"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-slate-300"
        >
          Path
        </Link>
      </div>
    </motion.div>
  )
}
