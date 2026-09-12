'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { usePathname } from 'next/navigation'
import type { StudentExtra } from '@/lib/profile-health'
import StudentEditProfilePanel from '@/components/profile/StudentEditProfilePanel'

type Profile = Record<string, string> | null

interface Props {
  profile: Profile
  studentExtra?: StudentExtra | null
}

const CLASS_BN: Record<string, string> = {
  nursery: 'Nursery',
  kg: 'KG',
  class_1: 'Class 1',
  class_2: 'Class 2',
  class_3: 'Class 3',
  class_4: 'Class 4',
  class_5: 'Class 5',
  class_6: 'Class 6',
  class_7: 'Class 7',
  class_8: 'Class 8',
  class_9: 'Class 9',
  class_10: 'Class 10',
  class_11: 'Class 11',
  class_12: 'Class 12',
  general: 'General',
}

const SIDE_NAV = [
  { href: '/dashboard/student', label: 'Home', icon: '🏠' },
  { href: '/dashboard/student/academic', label: 'My Learning', icon: '📚' },
  { href: '/dashboard/student/learning-path', label: 'Study Planner', icon: '📅' },
  { href: '/dashboard/student/performance', label: 'Progress', icon: '📈' },
  { href: '/dashboard/student/performance', label: 'Quizzes', icon: '❓' },
  { href: '/dashboard/student/academic', label: 'Missions', icon: '🎯' },
  { href: '/dashboard/student/profile', label: 'Achievements', icon: '⭐' },
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
  const classLabel = CLASS_BN[classLevel] || classLevel.replace(/_/g, ' ')
  const name = profile?.full_name || 'Student'
  const first = name.split(' ')[0]
  const motto = profile?.bio || 'Dream Big · Learn More · Be a Hero'
  const [editing, setEditing] = useState(false)

  const [stats, setStats] = useState({ lessons: 0, xp: 0, streak: 0, avgScore: 0 })
  const [activity, setActivity] = useState<Activity[]>([])
  const [subjectProg, setSubjectProg] = useState([
    { name: 'Bangla', short: 'বাংলা', done: 0, total: 5, pct: 0, icon: '📖', tone: 'bg-pink-50 text-pink-600' },
    { name: 'English', short: 'English', done: 0, total: 5, pct: 0, icon: '🔤', tone: 'bg-sky-50 text-sky-600' },
    { name: 'Math', short: 'Math', done: 0, total: 5, pct: 0, icon: '🔢', tone: 'bg-violet-50 text-violet-600' },
    { name: 'Science', short: 'Science', done: 0, total: 5, pct: 0, icon: '🔬', tone: 'bg-emerald-50 text-emerald-600' },
  ])

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('learning_progress')
          .select('status, score, xp_earned, lesson_id, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(40)

        if (data?.length) {
          const completed = data.filter((r) => r.status === 'completed')
          const xp = data.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0)
          const scores = data.filter((r) => r.score != null).map((r) => Number(r.score) || 0)
          const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
          setStats({
            lessons: completed.length,
            xp,
            streak: Math.min(Math.max(1, completed.length), 14),
            avgScore: avg,
          })

          const base = Math.min(5, Math.max(0, Math.ceil(completed.length / 2)))
          setSubjectProg([
            { name: 'Bangla', short: 'বাংলা', done: Math.min(5, base + (completed.length > 0 ? 1 : 0)), total: 5, pct: Math.min(100, (Math.min(5, base + 1) / 5) * 100), icon: '📖', tone: 'bg-pink-50 text-pink-600' },
            { name: 'English', short: 'English', done: Math.min(5, Math.max(0, base - 1)), total: 5, pct: Math.min(100, (Math.min(5, Math.max(0, base - 1)) / 5) * 100), icon: '🔤', tone: 'bg-sky-50 text-sky-600' },
            { name: 'Math', short: 'Math', done: Math.min(5, base + (avg >= 60 ? 1 : 0)), total: 5, pct: Math.min(100, ((base + (avg >= 60 ? 1 : 0)) / 5) * 100), icon: '🔢', tone: 'bg-violet-50 text-violet-600' },
            { name: 'Science', short: 'Science', done: Math.min(5, Math.floor(base / 2)), total: 5, pct: Math.min(100, (Math.floor(base / 2) / 5) * 100), icon: '🔬', tone: 'bg-emerald-50 text-emerald-600' },
          ])

          setActivity(
            data.slice(0, 4).map((r, i) => {
              const sc = r.score != null ? Number(r.score) : null
              const xpE = Number(r.xp_earned) || (sc != null && sc >= 60 ? 30 : 15)
              const done = r.status === 'completed'
              return {
                id: String(r.lesson_id || i),
                icon: done ? (sc != null && sc >= 80 ? '💜' : '📘') : '⭐',
                text: done ? (sc != null ? `Scored ${sc}% in quiz` : 'Completed a lesson') : 'Learning progress update',
                time: r.updated_at
                  ? new Date(r.updated_at as string).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })
                  : 'Recently',
                xp: `+${xpE} XP`,
                color: done ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700',
              }
            }),
          )
        } else {
          setActivity([
            { id: '1', icon: '📘', text: 'Start your first lesson', time: 'Today', xp: '+50 XP', color: 'bg-violet-100 text-violet-700' },
          ])
        }
      } catch {
        /* ignore */
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

  return (
    <div className="min-h-dvh bg-[#f3f0ff] text-slate-800">
      <StudentEditProfilePanel profile={profile} open={editing} onClose={() => setEditing(false)} />

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col bg-gradient-to-b from-[#5b21b6] to-[#4c1d95] text-white lg:flex">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
            <Image src="/icons/logo-icon.png" alt="ONONNO" width={32} height={32} className="rounded-lg" />
            <span className="text-sm font-black tracking-wide">ONONNO</span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {SIDE_NAV.map((item) => {
              const active =
                item.label === 'Achievements'
                  ? pathname.includes('/profile')
                  : item.href === '/dashboard/student'
                    ? pathname === '/dashboard/student'
                    : pathname.startsWith(item.href) && item.label !== 'Home'
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active ? 'bg-white/20 text-white shadow-inner' : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2.5">
              <div className="relative size-9 overflow-hidden rounded-full border-2 border-white/30">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-fuchsia-500 text-sm font-bold">{first.charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{first}</p>
                <p className="text-[10px] text-white/60">{classLabel}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link href="/dashboard/student" className="flex items-center gap-2">
              <Image src="/icons/logo-icon.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black">ONONNO</span>
            </Link>
            <Link href="/dashboard/student" className="rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700">
              ← Home
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              🎓 Student Profile Page
            </span>
            <span className="text-xs font-semibold text-slate-500">Learn · Earn XP · Unlock New Adventures</span>
          </div>

          <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative size-16 overflow-hidden rounded-full border-4 border-violet-100 sm:size-[4.5rem]">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-black text-white">{first.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{name}</h1>
                  <span className="mt-0.5 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{classLabel}</span>
                  <p className="mt-1 text-xs font-medium text-slate-500">{motto}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(true)} className="rounded-xl border border-violet-200 bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500">
                Edit Profile
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {[
                { label: 'Level', value: String(level), sub: 'Explorer', icon: '🏆', bg: 'from-amber-50 to-orange-50 border-amber-100' },
                { label: 'XP', value: stats.xp.toLocaleString(), sub: `/ ${xpGoal.toLocaleString()}`, icon: '⚡', bg: 'from-sky-50 to-blue-50 border-sky-100' },
                { label: 'Streak', value: String(stats.streak || 1), sub: 'Days', icon: '🔥', bg: 'from-orange-50 to-rose-50 border-orange-100' },
                { label: 'Badges', value: String(badges), sub: 'Earned', icon: '❤️', bg: 'from-pink-50 to-fuchsia-50 border-pink-100' },
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
                <p className="text-base font-black text-slate-800 sm:text-lg">Your Next Mission</p>
                <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Complete more lessons to unlock the next chapter!</p>
                <div className="mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-white/70">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${missionPct}%` }} />
                </div>
                <p className="mt-1 text-[11px] font-bold text-violet-700">{missionDone}/{missionTotal}</p>
              </div>
              <Link href="/dashboard/student/academic" className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-500">
                View Map
              </Link>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">My Learning Journey</h2>
              <Link href="/dashboard/student/academic" className="text-[11px] font-bold text-violet-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {subjectProg.map((s) => (
                <div key={s.name} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                  <div className={`mx-auto mb-2 flex size-10 items-center justify-center rounded-xl text-lg ${s.tone}`}>{s.icon}</div>
                  <p className="text-xs font-black text-slate-800">{s.short}</p>
                  <p className="text-[10px] font-semibold text-slate-400">{s.done}/{s.total} Chapters</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${s.pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-violet-600">{Math.round(s.pct)}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">Recent Activity</h2>
              <Link href="/dashboard/student/performance" className="text-[11px] font-bold text-violet-600 hover:underline">View All</Link>
            </div>
            <ul className="space-y-2.5">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
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
                <p className="text-sm font-black text-slate-800 sm:text-base">Small Steps, Big Dreams!</p>
                <p className="mt-0.5 text-xs text-slate-500">You are doing great! Keep going.</p>
              </div>
              <div className="text-3xl">🚩</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
