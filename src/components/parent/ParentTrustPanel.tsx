'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import PWAInstallBanner from '@/components/notification/PWAInstallBanner'
import {
  currentWeekKey,
  getGoalForChild,
  loadGoals,
  saveGoals,
  type ParentGoalsState,
} from '@/lib/parent-goals'

type ChildRow = {
  child_id: string
  full_name: string
  class_level: string | null
  week: {
    completed: number
    avg_score: number | null
    minutes_est: number
  }
  streak_days: number
  quiz_alerts: { title: string; score: number }[]
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

export default function ParentTrustPanel() {
  const [children, setChildren] = useState<ChildRow[]>([])
  const [goals, setGoals] = useState<ParentGoalsState>({
    week_key: currentWeekKey(),
    goals: [],
  })
  const [teacherMsg, setTeacherMsg] = useState('')
  const [teacherTo, setTeacherTo] = useState('')
  const [copied, setCopied] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)

  useEffect(() => {
    setGoals(loadGoals())
    fetch('/api/parent/insights', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.children)) setChildren(d.children)
      })
      .catch(() => {})
  }, [])

  const updateGoal = useCallback(
    (childId: string, patch: Partial<{ target_lessons: number; target_avg_score: number }>) => {
      setGoals((prev) => {
        const rest = prev.goals.filter((g) => g.child_id !== childId)
        const base = getGoalForChild(prev, childId)
        const next: ParentGoalsState = {
          week_key: currentWeekKey(),
          goals: [...rest, { ...base, ...patch, child_id: childId }],
        }
        saveGoals(next)
        return next
      })
      setGoalSaved(true)
      setTimeout(() => setGoalSaved(false), 1200)
    },
    [],
  )

  const reportText = useMemo(() => {
    const lines = [
      `অনন্য · সাপ্তাহিক রিপোর্ট (${currentWeekKey()})`,
      `তারিখ: ${new Date().toLocaleDateString('bn-BD')}`,
      '',
    ]
    for (const c of children) {
      const g = getGoalForChild(goals, c.child_id)
      lines.push(`• ${c.full_name} (${formatClass(c.class_level)})`)
      lines.push(
        `  পাঠ: ${c.week.completed}/${g.target_lessons} · গড় স্কোর: ${
          c.week.avg_score != null ? c.week.avg_score + '%' : '—'
        } · স্ট্রিক: ${c.streak_days} দিন`,
      )
      if (c.quiz_alerts?.length) {
        lines.push(`  কুইজ অ্যালার্ট: ${c.quiz_alerts.length}টি (<৬০%)`)
      }
      lines.push('')
    }
    lines.push('— অনন্য Parent Hub')
    return lines.join('\n')
  }, [children, goals])

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = reportText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openTeacherMail = () => {
    const subject = encodeURIComponent('অনন্য · সন্তানের পড়া সম্পর্কে')
    const body = encodeURIComponent(
      teacherMsg ||
        'আসসালামু আলাইকুম,\n\nআমার সন্তানের পড়াশোনা নিয়ে আলোচনা করতে চাই।\n\n' +
          reportText,
    )
    const to = teacherTo.trim() || ''
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white">
          Priority 3 ·{' '}
          <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            Goals · Report · Trust
          </span>
        </h2>
        {goalSaved && (
          <span className="text-[11px] font-semibold text-emerald-400">গোল সেভ ✓</span>
        )}
      </div>

      <PWAInstallBanner />

      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-[#0c0c1c] to-sky-500/10 p-4"
      >
        <h3 className="text-sm font-bold text-white">সাপ্তাহিক লক্ষ্য</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          এই সপ্তাহ ({currentWeekKey()}) — কতগুলো পাঠ শেষ হোক
        </p>

        {children.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">সন্তান লিংক করলে এখানে গোল সেট করতে পারবেন</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {children.map((c) => {
              const g = getGoalForChild(goals, c.child_id)
              const pct = Math.min(
                100,
                Math.round((c.week.completed / Math.max(1, g.target_lessons)) * 100),
              )
              const met = c.week.completed >= g.target_lessons
              return (
                <li
                  key={c.child_id}
                  className="rounded-xl border border-white/8 bg-black/20 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{c.full_name.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-500">{formatClass(c.class_level)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        met
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {c.week.completed}/{g.target_lessons} পাঠ
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        met
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[10px] text-slate-500">টার্গেট পাঠ</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={g.target_lessons}
                      onChange={(e) =>
                        updateGoal(c.child_id, {
                          target_lessons: Math.max(
                            1,
                            Math.min(50, Number(e.target.value) || 1),
                          ),
                        })
                      }
                      className="h-8 w-16 rounded-lg border border-white/10 bg-[#141428] px-2 text-center text-xs font-bold text-white outline-none focus:border-emerald-500/40"
                    />
                    <label className="ml-2 text-[10px] text-slate-500">গড় স্কোর লক্ষ্য</label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={g.target_avg_score}
                      onChange={(e) =>
                        updateGoal(c.child_id, {
                          target_avg_score: Math.max(
                            40,
                            Math.min(100, Number(e.target.value) || 70),
                          ),
                        })
                      }
                      className="h-8 w-16 rounded-lg border border-white/10 bg-[#141428] px-2 text-center text-xs font-bold text-white outline-none focus:border-emerald-500/40"
                    />
                    <span className="text-[10px] text-slate-500">
                      এখন {c.week.avg_score != null ? `${c.week.avg_score}%` : '—'}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </motion.section>

      <div className="rounded-2xl border border-white/10 bg-[#12122a]/80 p-4">
        <h3 className="text-sm font-bold text-white">সাপ্তাহিক রিপোর্ট শেয়ার</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">কপি করে WhatsApp / ইমেইলে পাঠান</p>
        <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-white/8 bg-black/30 p-3 text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
          {reportText || 'ডেটা লোড হচ্ছে…'}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyReport()}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold"
          >
            {copied ? 'কপি হয়েছে ✓' : '📋 কপি করো'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && navigator.share) {
                void navigator.share({ title: 'অনন্য রিপোর্ট', text: reportText })
              } else {
                void copyReport()
              }
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300"
          >
            ↗️ শেয়ার
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4">
        <h3 className="text-sm font-bold text-white">শিক্ষককে বার্তা</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Teacher role পূর্ণ ইন্টিগ্রেশন আসবে — আপাতত ইমেইল দিয়ে পাঠান
        </p>
        <input
          type="email"
          value={teacherTo}
          onChange={(e) => setTeacherTo(e.target.value)}
          placeholder="teacher@school.com"
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-sky-500/40"
        />
        <textarea
          value={teacherMsg}
          onChange={(e) => setTeacherMsg(e.target.value)}
          rows={3}
          placeholder="আসসালামু আলাইকুম, সন্তানের পড়া নিয়ে…"
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-sky-500/40"
        />
        <button
          type="button"
          onClick={openTeacherMail}
          className="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-200"
        >
          ✉️ ইমেইল খুলুন
        </button>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <h3 className="text-xs font-bold text-slate-300">নিরাপত্তা ও বিশ্বাস</h3>
        <ul className="mt-2 space-y-1.5 text-[11px] text-slate-500">
          <li>• শুধু আপনার লিংকড সন্তানের ডেটা দেখা যায়</li>
          <li>• Student শুধু নিজের class_level এর curriculum পায়</li>
          <li>
            •{' '}
            <Link href="/dashboard/parent/notifications" className="text-violet-300 underline">
              নোটিশ ইনবক্স
            </Link>{' '}
            ·{' '}
            <Link href="/dashboard/parent/profile" className="text-violet-300 underline">
              প্রোফাইল
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
