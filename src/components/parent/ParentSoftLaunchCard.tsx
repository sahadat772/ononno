'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PushPermission from '@/components/notification/PushPermission'
import PWAInstallBanner from '@/components/notification/PWAInstallBanner'

type ChildRow = {
  child_id: string
  full_name: string
  completed_lessons: number
  week_completed: number
  last_activity: string | null
  href: string
}

type Summary = {
  tagline_bn?: string
  tip_bn?: string
  totals?: {
    children: number
    completed: number
    week_completed?: number
  }
  children?: ChildRow[]
}

export default function ParentSoftLaunchCard() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/parent/soft-launch-summary', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && !d.error) setData(d)
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
    return <div className="mb-5 h-28 animate-pulse rounded-2xl border border-white/8 bg-white/5" />
  }

  if (!data) return null

  const kids = data.children ?? []

  return (
    <div className="mb-5 space-y-3">
      <PWAInstallBanner />
      <PushPermission variant="parent" showWhenGranted />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-[#0c0c1c] to-emerald-500/10 p-4 md:p-5"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-300">
              {data.tagline_bn || 'সফট লঞ্চ'}
            </span>
            <h2 className="mt-2 text-base font-bold text-white">সন্তানের অগ্রগতি</h2>
            <p className="mt-0.5 text-xs text-slate-400">{data.tip_bn}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-300">
              {(data.totals?.week_completed ?? 0).toLocaleString('bn-BD')}
            </p>
            <p className="text-[10px] text-slate-500">এই সপ্তাহে পাঠ</p>
          </div>
        </div>

        {kids.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4 text-center">
            <p className="text-sm text-slate-300">এখনো কোনো সন্তান লিংক নেই</p>
            <Link
              href="/dashboard/parent/create-child"
              className="mt-2 inline-block text-xs font-semibold text-violet-300 hover:underline"
            >
              সন্তান যোগ করো →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {kids.map((c) => (
              <li key={c.child_id}>
                <Link
                  href={c.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5 transition hover:bg-white/[0.07]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{c.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      মোট {c.completed_lessons} সম্পন্ন · এই সপ্তাহে {c.week_completed}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-violet-300">দেখো →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
}
