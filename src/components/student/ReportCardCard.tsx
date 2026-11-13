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

function gradeTone(grade: string | null) {
  if (!grade) return 'from-slate-500/30 to-slate-700/20 border-white/15 text-slate-200'
  const g = grade.toUpperCase()
  if (g.startsWith('A')) return 'from-emerald-500/35 to-teal-600/20 border-emerald-400/40 text-emerald-100'
  if (g.startsWith('B')) return 'from-sky-500/35 to-indigo-600/20 border-sky-400/40 text-sky-100'
  if (g.startsWith('C')) return 'from-amber-500/30 to-orange-600/20 border-amber-400/35 text-amber-100'
  return 'from-rose-500/25 to-fuchsia-700/15 border-rose-400/30 text-rose-100'
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
      <div className="mb-5 h-52 animate-pulse rounded-3xl border border-sky-500/15 bg-gradient-to-br from-sky-500/10 to-transparent" />
    )
  }

  if (!data) return null

  const s = data.summary
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.lessons))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="relative mb-5 overflow-hidden rounded-3xl border border-sky-400/20 bg-[#0a1220] p-4 shadow-[0_0_40px_-14px_rgba(56,189,248,0.3)] sm:p-5"
    >
      <div className="pointer-events-none absolute -left-8 top-0 size-36 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-6 size-28 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300/70">
              Report Card · অগ্রগতি
            </p>
            <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
              {period === 'week' ? 'সাপ্তাহিক রিপোর্ট' : 'মাসিক রিপোর্ট'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Level {s.level} · {s.total_xp} XP মোট
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Grade badge — Shikho-style hero metric */}
            <div
              className={`flex min-w-[3.25rem] flex-col items-center rounded-2xl border bg-gradient-to-br px-3 py-2 ${
                gradeTone(s.grade)
              }`}
            >
              <span className="text-[9px] font-bold uppercase opacity-70">Grade</span>
              <span className="text-xl font-black leading-none">{s.grade || '—'}</span>
            </div>

            <div className="flex gap-0.5 rounded-xl border border-white/10 bg-black/30 p-1">
              <button
                type="button"
                onClick={() => setPeriod('week')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  period === 'week'
                    ? 'bg-sky-500/35 text-sky-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                সপ্তাহ
              </button>
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  period === 'month'
                    ? 'bg-sky-500/35 text-sky-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                মাস
              </button>
            </div>
          </div>
        </div>

        <p className="mb-4 text-sm font-semibold leading-snug text-sky-50/95">
          {data.narrative.headline}
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'পাঠ সম্পন্ন', value: String(s.lessons_completed), icon: '✅' },
            {
              label: 'গড় স্কোর',
              value: s.average_score != null ? `${s.average_score}%` : '—',
              icon: '🎯',
            },
            { label: 'Streak', value: String(s.streak_days), icon: '🔥' },
            { label: 'XP এই পিরিয়ড', value: String(s.xp_earned), icon: '⚡' },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center backdrop-blur-sm"
            >
              <div className="text-base">{k.icon}</div>
              <p className="mt-0.5 text-lg font-black text-white">{k.value}</p>
              <p className="text-[10px] font-medium text-slate-400">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-white/8 bg-black/25 px-3 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-white/35">
            দৈনিক অ্যাক্টিভিটি
          </p>
          <div className="flex h-14 items-end gap-1">
            {data.daily.map((d) => {
              const h = Math.max(10, Math.round((d.lessons / maxDaily) * 100))
              return (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center justify-end"
                  title={`${d.date}: ${d.lessons}`}
                >
                  <div
                    className={`w-full max-w-[18px] rounded-t-md transition ${
                      d.lessons > 0
                        ? 'bg-gradient-to-t from-sky-600 to-cyan-300 shadow-sm shadow-sky-500/30'
                        : 'bg-white/8'
                    }`}
                    style={{ height: `${d.lessons > 0 ? h : 14}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-slate-500">
            <span>{data.daily[0]?.date?.slice(5) || ''}</span>
            <span className="font-semibold text-sky-300/70">
              {s.active_days}/{data.daily.length} দিন সক্রিয়
            </span>
            <span>{data.daily[data.daily.length - 1]?.date?.slice(5) || ''}</span>
          </div>
        </div>

        {(s.strong > 0 || s.weak > 0) && (
          <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-200">
              শক্তিশালী {s.strong}
            </span>
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-200">
              মাঝারি {s.medium}
            </span>
            <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-200">
              দুর্বল {s.weak}
            </span>
          </div>
        )}

        {data.subjects.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {data.subjects.slice(0, 3).map((sub) => (
              <div
                key={sub.subject_id}
                className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2 text-[11px]"
              >
                <span className="truncate font-semibold text-white/85">{sub.name}</span>
                <span className="shrink-0 font-bold text-sky-300">
                  {sub.completed} পাঠ
                  {sub.average_score != null ? ` · ${sub.average_score}%` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mb-4 rounded-xl border border-sky-500/15 bg-sky-500/5 px-3 py-2 text-[11px] leading-relaxed text-slate-300">
          💡 {data.narrative.tip}
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/student/performance"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3 text-xs font-black text-white shadow-[0_8px_20px_-6px_rgba(56,189,248,0.45)]"
          >
            পূর্ণ Report →
          </Link>
          <Link
            href="/dashboard/student"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-3 text-xs font-bold text-slate-300"
          >
            Path
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
