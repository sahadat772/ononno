'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WeakAreaCard from '@/components/student/WeakAreaCard'

type Summary = {
  total: number
  strong: number
  medium: number
  weak: number
  average_score: number | null
}

export default function QuizPerformanceSummary() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/student/quiz-performance')
        const data = await res.json()
        if (res.ok) setSummary(data.summary ?? null)
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
        Performance লোড হচ্ছে...
      </div>
    )
  }

  if (!summary || summary.total === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
        এখনো quiz performance নেই — একটি lesson শেষ করে quiz দাও।
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-500/25 bg-violet-950/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">📊 Quiz Performance</h3>
          <span className="text-xs text-white/40">
            গড় {summary.average_score ?? '—'}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2">
            <p className="font-bold text-emerald-300">{summary.strong}</p>
            <p className="text-white/40">Strong</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 py-2">
            <p className="font-bold text-amber-300">{summary.medium}</p>
            <p className="text-white/40">Medium</p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 py-2">
            <p className="font-bold text-red-300">{summary.weak}</p>
            <p className="text-white/40">Weak</p>
          </div>
        </div>
        <Link
          href="/dashboard/student/learning-path"
          className="block text-center text-xs text-violet-300 hover:text-violet-200"
        >
          Study plan →
        </Link>
      </div>

      {(summary.weak > 0 || summary.medium > 0) && <WeakAreaCard compact />}
    </div>
  )
}
