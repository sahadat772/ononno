'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import PushPermission from '@/components/notification/PushPermission'
import {
  DEFAULT_PARENT_PREFS,
  PREFS_STORAGE_KEY,
  dhakaHourNow,
  isInQuietWindow,
  mergePrefs,
  type ParentPrefs,
} from '@/lib/parent-preferences'

type ChildCompare = {
  child_id: string
  full_name: string
  class_level: string | null
  week: { completed: number; avg_score: number | null; minutes_est: number }
  streak_days: number
  quiz_alerts: unknown[]
}

const CLASS_BN: Record<string, string> = {
  class_1: 'ক্লাস ১',
  class_2: 'ক্লাস ২',
  class_3: 'ক্লাস ৩',
  class_4: 'ক্লাস ৪',
  class_5: 'ক্লাস ৫',
  class_6: 'ক্লাস ৬',
  class_7: 'ক্লাস ৭',
  class_8: 'ক্লাস ৮',
  class_9: 'ক্লাস ৯',
  class_10: 'ক্লাস ১০',
  class_11: 'ক্লাস ১১',
  class_12: 'ক্লাস ১২',
  nursery: 'নার্সারি',
  kg: 'কেজি',
}

function formatClass(level: string | null) {
  if (!level) return '—'
  return CLASS_BN[level] || level.replace(/_/g, ' ')
}

const TOGGLES: {
  key: keyof Pick<
    ParentPrefs,
    'lesson_done' | 'quiz_fail' | 'inactive_reminder' | 'weekly_digest' | 'quiet_hours'
  >
  label: string
  desc: string
  icon: string
}[] = [
  { key: 'lesson_done', label: 'পাঠ সম্পন্ন', desc: 'সন্তান পাঠ শেষ করলে নোটিশ', icon: '✅' },
  { key: 'quiz_fail', label: 'কুইজ ফেল (৬০% এর নিচে)', desc: 'পাস না হলে অ্যালার্ট', icon: '⚠️' },
  { key: 'inactive_reminder', label: 'নিষ্ক্রিয় রিমাইন্ডার', desc: 'কয়েকদিন না পড়লে মনে করিয়ে দেবে', icon: '😴' },
  { key: 'weekly_digest', label: 'সাপ্তাহিক সারাংশ', desc: 'সপ্তাহের progress একসাথে', icon: '📅' },
  { key: 'quiet_hours', label: 'নীরব সময় মান্য করো', desc: 'রাত ১০টা – সকাল ৭টা (Dhaka) non-critical বন্ধ', icon: '🌙' },
]

export default function ParentEngagementPanel() {
  const [prefs, setPrefs] = useState<ParentPrefs>(DEFAULT_PARENT_PREFS)
  const [saved, setSaved] = useState(false)
  const [compare, setCompare] = useState<ChildCompare[]>([])
  const [hour, setHour] = useState(12)

  useEffect(() => {
    setHour(dhakaHourNow())
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY)
      if (raw) setPrefs(mergePrefs(JSON.parse(raw)))
    } catch {
      /* ignore */
    }
    fetch('/api/parent/preferences', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.prefs) {
          const m = mergePrefs(d.prefs)
          setPrefs(m)
          try {
            localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(m))
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {})

    fetch('/api/parent/insights', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.children)) setCompare(d.children)
      })
      .catch(() => {})
  }, [])

  const quietNow = useMemo(() => isInQuietWindow(prefs, hour), [prefs, hour])

  const update = useCallback(async (key: keyof ParentPrefs, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value, updated_at: new Date().toISOString() }
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      void fetch('/api/parent/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefs: next }),
      })
      return next
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const maxCompleted = Math.max(1, ...compare.map((c) => c.week.completed))
  const maxStreak = Math.max(1, ...compare.map((c) => c.streak_days))

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white">
          Priority 2 ·{' '}
          <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
            Engagement
          </span>
        </h2>
        {saved && (
          <span className="text-[11px] font-semibold text-emerald-400">সংরক্ষিত ✓</span>
        )}
      </div>

      <PushPermission variant="parent" showWhenGranted />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-4 ${
          quietNow
            ? 'border-indigo-500/30 bg-indigo-500/10'
            : 'border-emerald-500/25 bg-emerald-500/10'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">
              {quietNow ? '🌙 এখন নীরব সময়' : '☀️ নোটিশ চালু সময়'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Asia/Dhaka · এখন ~{hour}:00 · ডিফল্ট {prefs.quiet_start}:00–{prefs.quiet_end}:00
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              prefs.quiet_hours
                ? 'bg-indigo-500/20 text-indigo-200'
                : 'bg-white/10 text-slate-400'
            }`}
          >
            {prefs.quiet_hours ? 'ON' : 'OFF'}
          </span>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-white/10 bg-[#12122a]/80 p-4">
        <p className="mb-3 text-xs font-bold text-slate-300">Push preferences</p>
        <ul className="space-y-2">
          {TOGGLES.map((t) => (
            <li
              key={t.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex min-w-0 items-start gap-2">
                <span className="text-base">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{t.label}</p>
                  <p className="text-[11px] text-slate-500">{t.desc}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!prefs[t.key]}
                onClick={() => void update(t.key, !prefs[t.key])}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  prefs[t.key] ? 'bg-violet-600' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
                    prefs[t.key] ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-slate-600">
          Browser Allow না থাকলে preferences কাজ করবে না ·{' '}
          <Link href="/dashboard/parent/notifications" className="text-violet-300 underline">
            নোটিশ ইনবক্স
          </Link>
        </p>
      </div>

      {compare.length >= 2 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-[#0c0c1c] to-violet-500/10 p-4"
        >
          <h3 className="text-sm font-bold text-white">ভাই-বোন তুলনা</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            স্বাস্থ্যকর তুলনা — প্রতিযোগিতা নয়, একসাথে অগ্রগতি
          </p>
          <div className="mt-4 space-y-4">
            {compare.map((c) => {
              const pctDone = Math.round((c.week.completed / maxCompleted) * 100)
              const pctStreak = Math.round((c.streak_days / maxStreak) * 100)
              return (
                <div key={c.child_id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{c.full_name.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-500">{formatClass(c.class_level)}</p>
                    </div>
                    <Link
                      href={`/dashboard/parent/child/${c.child_id}`}
                      className="text-[10px] font-semibold text-sky-300"
                    >
                      বিস্তারিত
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
                        <span>এ সপ্তাহে পাঠ</span>
                        <span className="text-emerald-300">{c.week.completed}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: `${pctDone}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
                        <span>স্ট্রিক</span>
                        <span className="text-amber-200">🔥 {c.streak_days}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{ width: `${pctStreak}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-400">
                        গড় {c.week.avg_score != null ? `${c.week.avg_score}%` : '—'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-400">
                        ~{c.week.minutes_est} মি.
                      </span>
                      {c.quiz_alerts?.length > 0 && (
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-300">
                          {c.quiz_alerts.length} কুইজ অ্যালার্ট
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.section>
      )}

      {compare.length === 1 && (
        <p className="text-center text-[11px] text-slate-600">
          আরও একজন সন্তান লিংক করলে এখানে side-by-side তুলনা দেখাবে
        </p>
      )}
    </div>
  )
}
