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
    return <div className="mb-4 h-20 animate-pulse rounded-2xl border border-white/8 bg-white/5" />
  }

  if (!rec) return null

  const isResume = rec.status && rec.status !== 'completed'
  const label =
    rec.reason === 'no_progress' ? 'শুরু করো' : isResume ? 'চালিয়ে যাও' : 'আবার দেখো'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <Link href={rec.href} className="block">
        <div className="flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/20 to-violet-500/15 p-4 shadow-lg shadow-sky-500/10 transition hover:border-sky-400/40 active:scale-[0.99]">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-xl shadow-md">
            {rec.reason === 'no_progress' ? '📚' : '▶️'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-sky-300">
              {label}
              {stats?.completed != null && stats.completed > 0 && (
                <span className="ml-2 text-slate-500">· {stats.completed} পাঠ সম্পন্ন</span>
              )}
            </p>
            <p className="truncate font-bold text-white">{rec.title_bn || rec.title}</p>
            <p className="truncate text-xs text-slate-400">
              {rec.reason === 'no_progress'
                ? 'একাডেমিক হাব থেকে ক্লাস বেছে নাও'
                : isResume
                  ? 'শেষ যেখানে ছিলে সেখান থেকে শুরু'
                  : 'শেষ সম্পন্ন পাঠ — রিভিশন করো'}
            </p>
          </div>
          <span className="text-sky-300">→</span>
        </div>
      </Link>
    </motion.div>
  )
}
