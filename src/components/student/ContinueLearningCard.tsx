'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Rec = {
  title: string
  title_bn: string
  href: string
  status?: string
  reason?: string
}

export default function ContinueLearningCard() {
  const [rec, setRec] = useState<Rec | null>(null)
  const [stats, setStats] = useState<{ completed?: number; tracked_lessons?: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/student/continue-learning', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d?.recommendation) setRec(d.recommendation)
        if (d?.stats) setStats(d.stats)
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
      <div className="mb-5 h-24 animate-pulse rounded-3xl border border-sky-500/15 bg-gradient-to-r from-sky-500/10 to-transparent" />
    )
  }

  if (!rec) return null

  const isResume = rec.status && rec.status !== 'completed'
  const label =
    rec.reason === 'no_progress' ? 'শুরু করো' : isResume ? 'চালিয়ে যাও' : 'আবার দেখো'
  const subtitle =
    rec.reason === 'no_progress'
      ? 'একাডেমিক হাব থেকে ক্লাস বেছে নাও'
      : isResume
        ? 'শেষ যেখানে ছিলে সেখান থেকে শুরু'
        : 'শেষ সম্পন্ন পাঠ — রিভিশন করো'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5"
    >
      <Link href={rec.href} className="block">
        <div className="relative overflow-hidden rounded-3xl border border-sky-400/25 bg-[#0a1420] p-4 shadow-[0_0_32px_-12px_rgba(56,189,248,0.35)] transition hover:border-sky-400/40 active:scale-[0.99] sm:p-4.5">
          <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="relative flex items-center gap-3.5">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-2xl shadow-lg shadow-sky-500/30">
              {rec.reason === 'no_progress' ? '📚' : '▶️'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-300/80">
                Continue · {label}
                {stats?.completed != null && stats.completed > 0 && (
                  <span className="ml-2 font-semibold normal-case tracking-normal text-slate-500">
                    · {stats.completed} পাঠ সম্পন্ন
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-base font-black text-white">
                {rec.title_bn || rec.title}
              </p>
              <p className="truncate text-xs text-slate-400">{subtitle}</p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/15 text-sm font-black text-sky-200">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
