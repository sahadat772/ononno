'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type WeakItem = {
  lesson_id: string
  title?: string
  title_bn?: string | null
  score: number
  band: 'weak' | 'medium'
  band_label: string
  href: string
}

export default function WeakAreaCard({
  compact = false,
}: {
  compact?: boolean
}) {
  const [weak, setWeak] = useState<WeakItem[]>([])
  const [medium, setMedium] = useState<WeakItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/student/weak-areas', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) {
          setMessage(data.message || 'লোড ব্যর্থ')
          return
        }
        setWeak(data.weak ?? [])
        setMedium(data.medium ?? [])
        if ((data.weak ?? []).length === 0 && (data.medium ?? []).length === 0) {
          setMessage(data.message || 'কোনো weak area নেই')
        }
      } catch {
        setMessage('নেটওয়ার্ক সমস্যা')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="mb-5 h-28 animate-pulse rounded-3xl border border-rose-500/15 bg-gradient-to-br from-rose-500/10 to-transparent" />
    )
  }

  if (weak.length === 0 && medium.length === 0) {
    return (
      <div className="mb-5 rounded-3xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200/90">
        ✨ {message || 'সব quiz ভালো — weak area নেই!'}
      </div>
    )
  }

  const show = [...weak, ...(compact ? [] : medium.slice(0, 3))].slice(
    0,
    compact ? 3 : 6,
  )
  const top = weak[0] || medium[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-5 overflow-hidden rounded-3xl border border-rose-500/25 bg-[#140a12] p-4 shadow-[0_0_36px_-14px_rgba(244,63,94,0.35)] sm:p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-rose-500/20 blur-3xl" />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-300/70">
              Learning Loop · M3
            </p>
            <h3 className="mt-0.5 text-lg font-black text-white">🔄 আবার পড়ো</h3>
            <p className="mt-0.5 text-xs text-white/50">
              দুর্বল টপিক রিভিশন — Daily Path-এও দেখাবে
            </p>
          </div>
          <div className="text-right text-xs shrink-0">
            <p className="font-black text-rose-300">{weak.length} weak</p>
            {!compact && (
              <p className="text-amber-300/80">{medium.length} medium</p>
            )}
          </div>
        </div>

        {top && (
          <Link
            href={top.href}
            className="flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-sm font-black text-white shadow-lg shadow-rose-500/25"
          >
            আজকের রিভিশন · {top.title_bn || top.title} →
          </Link>
        )}

        <div className="space-y-2">
          {show.map((item) => (
            <div
              key={item.lesson_id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 ${
                item.band === 'weak'
                  ? 'border-rose-500/35 bg-rose-500/10'
                  : 'border-amber-500/30 bg-amber-500/10'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {item.title_bn || item.title || 'Lesson'}
                </p>
                <p className="text-[11px] text-white/50">
                  Score {item.score}% · {item.band_label}
                </p>
              </div>
              <Link
                href={item.href}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white ${
                  item.band === 'weak'
                    ? 'bg-rose-500 hover:bg-rose-400'
                    : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                Revision
              </Link>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/student/learning-path"
          className="block pt-0.5 text-center text-xs font-semibold text-violet-300 hover:text-violet-200"
        >
          Study plan দিয়ে timed revision →
        </Link>
      </div>
    </motion.div>
  )
}
