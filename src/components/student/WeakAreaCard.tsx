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
        const res = await fetch('/api/student/weak-areas')
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
        Weak areas খোঁজা হচ্ছে...
      </div>
    )
  }

  if (weak.length === 0 && medium.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200/90">
        ✨ {message || 'সব quiz ভালো — weak area নেই!'}
      </div>
    )
  }

  const show = [...weak, ...(compact ? [] : medium.slice(0, 3))].slice(
    0,
    compact ? 4 : 8,
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-500/30 bg-linear-to-br from-red-950/40 to-[#0a0a1a] p-4 md:p-5 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            🔄 আবার পড়ো
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Quiz score কম — revision করো (শুধু published lesson)
          </p>
        </div>
        <div className="text-right text-xs shrink-0">
          <p className="text-red-300 font-bold">{weak.length} weak</p>
          {!compact && (
            <p className="text-amber-300/80">{medium.length} medium</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {show.map((item) => (
          <div
            key={item.lesson_id}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
              item.band === 'weak'
                ? 'border-red-500/35 bg-red-500/10'
                : 'border-amber-500/30 bg-amber-500/10'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
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
                  ? 'bg-red-500 hover:bg-red-400'
                  : 'bg-amber-500 hover:bg-amber-400'
              }`}
            >
              Revision Start
            </Link>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/student/learning-path"
        className="block text-center text-xs text-violet-300 hover:text-violet-200 pt-1"
      >
        Study plan দিয়ে timed revision →
      </Link>
    </motion.div>
  )
}
