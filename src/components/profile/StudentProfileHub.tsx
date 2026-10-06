'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { usePathname } from 'next/navigation'
import type { StudentExtra } from '@/lib/profile-health'
import { buildProfileHealthItems, scoreProfileHealth } from '@/lib/profile-health'
import StudentEditProfilePanel from '@/components/profile/StudentEditProfilePanel'
import SafeAvatar from '@/components/profile/SafeAvatar'

type Profile = Record<string, string> | null

interface Props {
  profile: Profile
  studentExtra?: StudentExtra | null
}

const CLASS_BN: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'প্রথম শ্রেণি',
  class_2: 'দ্বিতীয় শ্রেণি',
  class_3: 'তৃতীয় শ্রেণি',
  class_4: 'চতুর্থ শ্রেণি',
  class_5: 'পঞ্চম শ্রেণি',
  class_6: 'ষষ্ঠ শ্রেণি',
  class_7: 'সপ্তম শ্রেণি',
  class_8: 'অষ্টম শ্রেণি',
  class_9: 'নবম শ্রেণি',
  class_10: 'দশম শ্রেণি',
  class_11: 'একাদশ শ্রেণি',
  class_12: 'দ্বাদশ শ্রেণি',
  general: 'সাধারণ',
}

const SIDE_NAV = [
  { href: '/dashboard/student', label: 'হোম', icon: '🏠' },
  { href: '/dashboard/student/academic', label: 'শেখা', icon: '📚' },
  { href: '/dashboard/student/learning-path', label: 'প্ল্যানার', icon: '📅' },
  { href: '/dashboard/student/performance', label: 'অগ্রগতি', icon: '📈' },
  { href: '/dashboard/student/kids-zone', label: 'কিডস জোন', icon: '🧒' },
  { href: '/dashboard/student/profile', label: 'প্রোফাইল', icon: '⭐' },
]

type Activity = {
  id: string
  icon: string
  text: string
  time: string
  xp: string
  color: string
}

export default function StudentProfileHub({ profile, studentExtra }: Props) {
  const pathname = usePathname() || ''
  const classLevel = studentExtra?.class_level || 'general'
  const classLabel = CLASS_BN[classLevel] || String(classLevel).replace(/_/g, ' ')
  const name = profile?.full_name || 'Student'
  const first = name.split(' ')[0] || 'S'
  const motto = profile?.bio || 'স্বপ্ন দেখো · শেখো · এগিয়ে যাও'
  const [editing, setEditing] = useState(false)

  let health = { score: 0, filled: 0, total: 0, label: 'শুরু করুন', color: 'rose' }
  try {
    health = scoreProfileHealth(buildProfileHealthItems(profile, studentExtra))
  } catch {
    /* ignore */
  }

  const [stats, setStats] = useState({ lessons: 0, xp: 0, streak: 0, avgScore: 0 })
  const [activity, setActivity] = useState<Activity[]>([
    {
      id: '1',
      icon: '📘',
      text: 'প্রথম পাঠ শুরু করো',
      time: 'আজ',
      xp: '+50 XP',
      color: 'bg-violet-100 text-violet-700',
    },
  ])
  const [subjectProg, setSubjectProg] = useState([
    { name: 'Bangla', short: 'বাংলা', done: 0, total: 5, pct: 0, icon: '📖', tone: 'bg-pink-50 text-pink-600' },
    { name: 'English', short: 'English', done: 0, total: 5, pct: 0, icon: '🔤', tone: 'bg-sky-50 text-sky-600' },
    { name: 'Math', short: 'গণিত', done: 0, total: 5, pct: 0, icon: '🔢', tone: 'bg-violet-50 text-violet-600' },
    { name: 'Science', short: 'বিজ্ঞান', done: 0, total: 5, pct: 0, icon: '🔬', tone: 'bg-emerald-50 text-emerald-600' },
  ])

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
          .select('status, score, xp_earned, lesson_id, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(40)

        if (!data?.length) return

        const completed = data.filter((r) => r.status === 'completed')
        const xp = data.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
        const scores = data.filter((r) => r.score != null).map((r) => Number(r.score) || 0)
        const avg =
          scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

        setStats({
          lessons: completed.length,
          xp,
          streak: Math.min(Math.max(1, completed.length), 14),
          avgScore: avg,
        })

        const base = Math.min(5, Math.max(0, Math.ceil(completed.length / 2)))
        setSubjectProg([
          {
            name: 'Bangla',
            short: 'বাংলা',
            done: Math.min(5, base + (completed.length > 0 ? 1 : 0)),
            total: 5,
            pct: Math.min(100, (Math.min(5, base + 1) / 5) * 100),
            icon: '📖',
            tone: 'bg-pink-50 text-pink-600',
          },
          {
            name: 'English',
            short: 'English',
            done: Math.min(5, Math.max(0, base - 1)),
            total: 5,
            pct: Math.min(100, (Math.min(5, Math.max(0, base - 1)) / 5) * 100),
            icon: '🔤',
            tone: 'bg-sky-50 text-sky-600',
          },
          {
            name: 'Math',
            short: 'গণিত',
            done: Math.min(5, base + (avg >= 60 ? 1 : 0)),
            total: 5,
            pct: Math.min(100, ((base + (avg >= 60 ? 1 : 0)) / 5) * 100),
            icon: '🔢',
            tone: 'bg-violet-50 text-violet-600',
          },
          {
            name: 'Science',
            short: 'বিজ্ঞান',
            done: Math.min(5, Math.floor(base / 2)),
            total: 5,
            pct: Math.min(100, (Math.floor(base / 2) / 5) * 100),
            icon: '🔬',
            tone: 'bg-emerald-50 text-emerald-600',
          },
        ])

        setActivity(
          data.slice(0, 4).map((r, i) => {
            const sc = r.score != null ? Number(r.score) : null
            const xpE = Number(r.xp_earned) || (sc != null && sc >= 60 ? 30 : 15)
            const done = r.status === 'completed'
            return {
              id: String(r.lesson_id || i),
              icon: done ? (sc != null && sc >= 80 ? '💜' : '📘') : '⭐',
              text: done
                ? sc != null
                  ? `কুইজে ${sc}% স্কোর`
                  : 'একটি পাঠ সম্পন্ন'
                : 'শেখার অগ্রগতি আপডেট',
              time: r.updated_at
                ? new Date(r.updated_at as string).toLocaleString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                  })
                : 'সম্প্রতি',
              xp: `+${xpE} XP`,
              color: done ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700',
            }
          }),
        )
      } catch {
        /* ignore network errors */
      }
    }
    void load()
  }, [])

  const level = Math.max(1, Math.floor(stats.xp / 500) + 1)
  const xpGoal = 2000
  const badges = Math.min(12, Math.floor(stats.lessons / 2) + (stats.avgScore >= 80 ? 1 : 0))
  const missionDone = Math.min(8, stats.lessons)
  const missionTotal = 8
  const missionPct = Math.round((missionDone / missionTotal) * 100)

  const healthColor =
    health.color === 'emerald'
      ? 'from-emerald-500 to-teal-500'
      : health.color === 'sky'
        ? 'from-sky-500 to-cyan-500'
        : health.color === 'amber'
          ? 'from-amber-500 to-orange-500'
          : 'from-rose-500 to-pink-500'

  return (
    <div className="min-h-dvh bg-[#f3f0ff] text-slate-800">
      <StudentEditProfilePanel
        profile={profile}
        studentExtra={studentExtra}
        open={editing}
        onClose={() => setEditing(false)}
      />

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col bg-gradient-to-b from-[#5b21b6] to-[#4c1d95] text-white lg:flex">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
            <Image src="/icons/logo-icon.png" alt="ONONNO" width={32} height={32} className="rounded-lg" />
            <span className="text-sm font-black tracking-wide">ONONNO</span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {SIDE_NAV.map((item) => {
              const active =
                item.href === '/dashboard/student/profile'
                  ? pathname.includes('/profile')
                  : item.href === '/dashboard/student'
                    ? pathname === '/dashboard/student'
                    : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex w-full items-center gap-2.5 rounded-xl p-1 text-left transition hover:bg-white/10"
            >
              <div className="relative size-9 overflow-hidden rounded-full border-2 border-white/30">
                <SafeAvatar src={profile?.avatar_url} name={name} textClassName="text-sm font-bold text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{first}</p>
                <p className="text-[10px] text-white/60">{classLabel} · সম্পাদনা</p>
              </div>
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link href="/dashboard/student" className="flex items-center gap-2">
              <Image src="/icons/logo-icon.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black">ONONNO</span>
            </Link>
            <Link
              href="/dashboard/student"
              className="rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700"
            >
              ← হোম
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              🎓 স্টুডেন্ট প্রোফাইল
            </span>
            <span className="text-xs font-semibold text-slate-500">শেখো · XP অর্জন করো · এগিয়ে যাও</span>
          </div>

          <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setEditing(true)} className="relative group">
                  <div className="relative size-16 overflow-hidden rounded-full border-4 border-violet-100 sm:size-[4.5rem]">
                    <SafeAvatar src={profile?.avatar_url} name={name} textClassName="text-2xl font-black text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-white bg-violet-600 text-[10px] text-white shadow group-hover:bg-violet-500">
                    ✏️
                  </span>
                </button>
                <div>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{name}</h1>
                  <span className="mt-0.5 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                    {classLabel}
                  </span>
                  {studentExtra?.school_name ? (
                    <p className="mt-1 text-[11px] font-medium text-slate-400">🏫 {studentExtra.school_name}</p>
                  ) : null}
                  <p className="mt-1 text-xs font-medium text-slate-500">{motto}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/20 transition hover:brightness-110 active:scale-95"
              >
                ✏️ প্রোফাইল সম্পাদনা
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50/50"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  প্রোফাইল সম্পূর্ণতা · {health.label}
                </span>
                <span className="text-xs font-black text-violet-700">{health.score}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${healthColor} transition-all`}
                  style={{ width: `${Math.min(100, Math.max(0, health.score))}%` }}
                />
              </div>
              {health.score < 100 ? (
                <p className="mt-1.5 text-[10px] font-semibold text-violet-600">
                  {health.filled}/{health.total} পূর্ণ · বাকি তথ্য যোগ করতে ট্যাপ করো →
                </p>
              ) : null}
            </button>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {[
                { label: 'লেভেল', value: String(level), sub: 'Explorer', icon: '🏆', bg: 'from-amber-50 to-orange-50 border-amber-100' },
                { label: 'XP', value: stats.xp.toLocaleString(), sub: `/ ${xpGoal.toLocaleString()}`, icon: '⚡', bg: 'from-sky-50 to-blue-50 border-sky-100' },
                { label: 'স্ট্রিক', value: String(stats.streak || 1), sub: 'দিন', icon: '🔥', bg: 'from-orange-50 to-rose-50 border-orange-100' },
                { label: 'ব্যাজ', value: String(badges), sub: 'অর্জিত', icon: '❤️', bg: 'from-pink-50 to-fuchsia-50 border-pink-100' },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border bg-gradient-to-br px-3 py-3 text-center ${s.bg}`}>
                  <div className="text-lg">{s.icon}</div>
                  <p className="text-xl font-black text-slate-800">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mb-4 overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-100 via-yellow-50 to-lime-100 p-4 shadow-sm sm:p-5">
            <div className="relative z-10 flex flex-wrap items-center gap-4">
              <div className="text-5xl sm:text-6xl">🎒</div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-slate-800 sm:text-lg">পরের মিশন</p>
                <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">আরও পাঠ শেষ করে পরের অধ্যায় আনলক করো!</p>
                <div className="mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    style={{ width: `${missionPct}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] font-bold text-violet-700">
                  {missionDone}/{missionTotal}
                </p>
              </div>
              <Link
                href="/dashboard/student/academic"
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-500"
              >
                ম্যাপ দেখো
              </Link>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">আমার শেখার যাত্রা</h2>
              <Link href="/dashboard/student/academic" className="text-[11px] font-bold text-violet-600 hover:underline">
                সব দেখো
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {subjectProg.map((s) => (
                <div key={s.name} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                  <div className={`mx-auto mb-2 flex size-10 items-center justify-center rounded-xl text-lg ${s.tone}`}>{s.icon}</div>
                  <p className="text-xs font-black text-slate-800">{s.short}</p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {s.done}/{s.total} অধ্যায়
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-violet-600">{Math.round(s.pct)}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">সাম্প্রতিক কার্যক্রম</h2>
              <Link href="/dashboard/student/performance" className="text-[11px] font-bold text-violet-600 hover:underline">
                সব দেখো
              </Link>
            </div>
            <ul className="space-y-2.5">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-base ${a.color}`}>{a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 sm:text-sm">{a.text}</p>
                    <p className="text-[10px] text-slate-400">{a.time}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-emerald-600">{a.xp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 sm:text-base">ছোট পদক্ষেপ, বড় স্বপ্ন!</p>
                <p className="mt-0.5 text-xs text-slate-500">তুমি দারুণ করছো — চালিয়ে যাও।</p>
              </div>
              <div className="text-3xl">🚩</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
