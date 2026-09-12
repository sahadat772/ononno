'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import type { StudentExtra } from '@/lib/profile-health'

type Profile = Record<string, string> | null

interface Props {
  profile: Profile
  studentExtra?: StudentExtra | null
}

const CLASS_BN: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'প্রথম শ্রেণী',
  class_2: 'দ্বিতীয় শ্রেণী',
  class_3: 'তৃতীয় শ্রেণী',
  class_4: 'চতুর্থ শ্রেণী',
  class_5: 'পঞ্চম শ্রেণী',
  class_6: 'ষষ্ঠ শ্রেণী',
  class_7: 'সপ্তম শ্রেণী',
  class_8: 'অষ্টম শ্রেণী',
  class_9: 'নবম শ্রেণী',
  class_10: 'দশম শ্রেণী',
  class_11: 'একাদশ শ্রেণী',
  class_12: 'দ্বাদশ শ্রেণী',
}

export default function StudentProfileHub({ profile, studentExtra }: Props) {
  const classLevel = studentExtra?.class_level || 'general'
  const classLabel = CLASS_BN[classLevel] || classLevel.replace(/_/g, ' ')
  const name = profile?.full_name || 'Student'
  const first = name.split(' ')[0]

  const [stats, setStats] = useState({
    lessons: 0,
    xp: 0,
    streak: 0,
    avgScore: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('learning_progress')
          .select('status, score, xp_earned')
          .eq('user_id', user.id)
        if (!data?.length) return
        const completed = data.filter((r) => r.status === 'completed')
        const xp = data.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
        const scores = data.map((r) => Number(r.score) || 0).filter((n) => n > 0)
        const avg = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0
        setStats({
          lessons: completed.length,
          xp,
          streak: Math.min(completed.length, 14),
          avgScore: avg,
        })
      } catch {
        /* ignore */
      }
    }
    void load()
  }, [])

  const level = Math.max(1, Math.floor(stats.xp / 500) + 1)
  const xpInLevel = stats.xp % 500
  const xpGoal = 500
  const badges = Math.min(12, Math.floor(stats.lessons / 2) + (stats.avgScore >= 80 ? 1 : 0))

  const subjects = [
    { name: 'বাংলা', pct: Math.min(100, stats.lessons * 12 + 20), color: 'from-pink-500 to-rose-500' },
    { name: 'English', pct: Math.min(100, stats.lessons * 10 + 15), color: 'from-sky-500 to-blue-500' },
    { name: 'গণিত', pct: Math.min(100, stats.avgScore || 25), color: 'from-violet-500 to-indigo-500' },
    { name: 'বিজ্ঞান', pct: Math.min(100, stats.lessons * 8 + 10), color: 'from-emerald-500 to-teal-500' },
  ]

  return (
    <div className="min-h-dvh bg-[#0b0620] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-3 pb-8 pt-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard/student"
              className="text-[11px] font-semibold text-violet-300/80 hover:text-violet-200"
            >
              ← Student Hub
            </Link>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Student Profile{' '}
              <span className="text-sm font-semibold text-violet-300">· Learn · Earn XP</span>
            </h1>
          </div>
        </div>

        <div className="mb-4 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#1a0f3a] via-[#120a28] to-[#0d0820] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-violet-400/40 sm:size-20">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-black">
                  {first.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black sm:text-xl">{name}</p>
              <p className="text-xs text-violet-200/80">{profile?.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-violet-500/30 bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-200">
                  {classLabel}
                </span>
                <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/15 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-200">
                  Dream Big · Learn More
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: '🏆', label: 'Level', value: String(level), sub: 'Explorer' },
              { icon: '⚡', label: 'XP', value: String(stats.xp), sub: `/${xpGoal} level` },
              { icon: '🔥', label: 'Streak', value: String(stats.streak), sub: 'Days' },
              { icon: '🎖️', label: 'Badges', value: String(badges), sub: 'Earned' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center"
              >
                <div className="text-lg">{s.icon}</div>
                <p className="text-lg font-black text-violet-100">{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400">
                  {s.label} · {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-violet-500/15 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-5xl">🎒</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300/90">
                Your Next Mission
              </p>
              <p className="mt-1 text-sm font-bold text-white sm:text-base">
                আরও কয়েকটি পাঠ শেষ করো — পরের chapter unlock হবে
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-500"
                  style={{ width: `${Math.min(100, (stats.lessons % 8) * 12.5 + 12)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Progress · Level {level} · XP {xpInLevel}/{xpGoal}
              </p>
            </div>
            <Link
              href="/dashboard/student/academic"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30"
            >
              View Map →
            </Link>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-[#120a28]/80 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black">My Learning Journey</h2>
            <Link href="/dashboard/student/academic" className="text-[11px] text-violet-300">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {subjects.map((s) => (
              <div key={s.name} className="rounded-xl border border-white/8 bg-white/5 p-3">
                <p className="text-xs font-bold text-white">{s.name}</p>
                <p className="mt-1 text-[10px] text-slate-400">{s.pct}% chapters</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#120a28]/80 p-4">
            <h2 className="mb-3 text-sm font-black">Recent Activity</h2>
            <ul className="space-y-2.5 text-sm">
              <li className="flex justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                <span className="text-slate-300">📚 সম্পন্ন লেসন</span>
                <span className="font-bold text-emerald-300">{stats.lessons}</span>
              </li>
              <li className="flex justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                <span className="text-slate-300">✅ গড় quiz</span>
                <span className="font-bold text-sky-300">{stats.avgScore || '—'}%</span>
              </li>
              <li className="flex justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                <span className="text-slate-300">⚡ মোট XP</span>
                <span className="font-bold text-amber-300">+{stats.xp}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-4">
            <p className="text-xs font-bold text-violet-200">Small Steps, Big Dreams!</p>
            <p className="mt-2 text-sm text-slate-300">
              তুমি ভালো করছো, {first} — প্রতিদিন একটু পড়লে streak বাড়বে।
            </p>
            <Link
              href="/dashboard/student/learning-path"
              className="mt-3 inline-flex rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
            >
              আজকের Plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
