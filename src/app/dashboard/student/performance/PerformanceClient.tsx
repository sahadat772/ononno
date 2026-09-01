'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bandColor, type LessonPerformance } from '@/lib/quiz-performance'

type Summary = {
  total: number
  strong: number
  medium: number
  weak: number
  average_score: number | null
}

export default function PerformanceClient({ studentName }: { studentName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [items, setItems] = useState<LessonPerformance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [weakOnly, setWeakOnly] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const q = weakOnly ? '?weak_only=1' : ''
        const res = await fetch(`/api/student/quiz-performance${q}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || data.error || 'Load failed')
        setSummary(data.summary)
        setItems(data.performances ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      } finally {
        setLoading(false)
      }
    })()
  }, [weakOnly])

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="border-b border-white/10 bg-white/5 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/student')}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/5"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold">📊 Quiz Performance</h1>
            <p className="text-xs text-white/40">{studentName} · Phase 2.4</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <p className="text-sm text-white/60">
          80%+ শক্তিশালী · 50–79% মাঝারি · 50%-এর নিচে দুর্বল — আবার পড়ো।
        </p>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'গড় স্কোর', value: summary.average_score != null ? `${summary.average_score}%` : '—' },
              { label: 'শক্তিশালী', value: summary.strong },
              { label: 'মাঝারি', value: summary.medium },
              { label: 'দুর্বল', value: summary.weak },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWeakOnly(false)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
              !weakOnly ? 'border-violet-400 bg-violet-500/20' : 'border-white/10'
            }`}
          >
            সব
          </button>
          <button
            type="button"
            onClick={() => setWeakOnly(true)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border ${
              weakOnly ? 'border-red-400 bg-red-500/20' : 'border-white/10'
            }`}
          >
            শুধু দুর্বল 🔄
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">লোড...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
            এখনো quiz performance নেই। Lesson পড়ে quiz দাও।
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div
                key={p.lesson_id}
                className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-2 ${bandColor(p.band)}`}
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.title_bn || p.title || p.lesson_id}</p>
                  <p className="text-xs opacity-80">{p.band_label}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{p.score}%</p>
                  {p.band === 'weak' && (
                    <p className="text-[10px] font-bold">আবার পড়ো 🔄</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/dashboard/student/learning-path')}
          className="w-full py-3 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 font-bold"
        >
          আজকের Plan →
        </button>
      </div>
    </div>
  )
}
