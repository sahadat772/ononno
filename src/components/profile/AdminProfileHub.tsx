'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

type Profile = Record<string, string> | null

type Counts = {
  classes: number
  subjects: number
  chapters: number
  lessons: number
  published: number
  users: number
}

type Activity = {
  id: string
  icon: string
  text: string
  time: string
  color: string
}

const SIDE_NAV = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/admin/curriculum', label: 'Curriculum', icon: '📚' },
  { href: '/dashboard/admin/curriculum/lessons', label: 'AI Generation', icon: '🤖' },
  { href: '/dashboard/admin/curriculum/lessons', label: 'Review & Publish', icon: '✅' },
  { href: '/dashboard/admin/users', label: 'Students', icon: '👥' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📊' },
  { href: '/dashboard/admin/profile', label: 'System Settings', icon: '⚙️' },
]

export default function AdminProfileHub({ profile }: { profile: Profile }) {
  const pathname = usePathname() || ''
  const name = profile?.full_name || 'Admin'
  const email = profile?.email || ''
  const first = name.split(' ')[0] || 'Admin'
  const [counts, setCounts] = useState<Counts>({
    classes: 0,
    subjects: 0,
    chapters: 0,
    lessons: 0,
    published: 0,
    users: 0,
  })
  const [activity, setActivity] = useState<Activity[]>([])

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [c, s, ch, l, p, u] = await Promise.all([
          supabase.from('curriculum_classes').select('id', { count: 'exact', head: true }),
          supabase.from('curriculum_subjects').select('id', { count: 'exact', head: true }),
          supabase.from('curriculum_chapters').select('id', { count: 'exact', head: true }),
          supabase.from('curriculum_lessons').select('id', { count: 'exact', head: true }),
          supabase
            .from('curriculum_lessons')
            .select('id', { count: 'exact', head: true })
            .eq('is_published', true),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ])
        setCounts({
          classes: c.count ?? 0,
          subjects: s.count ?? 0,
          chapters: ch.count ?? 0,
          lessons: l.count ?? 0,
          published: p.count ?? 0,
          users: u.count ?? 0,
        })

        const { data: recent } = await supabase
          .from('curriculum_lessons')
          .select('id, title, title_bn, is_published, updated_at, workflow_status')
          .order('updated_at', { ascending: false })
          .limit(4)

        if (recent?.length) {
          setActivity(
            recent.map((r, i) => {
              const title = (r.title_bn || r.title || 'Lesson') as string
              const pub = Boolean(r.is_published)
              return {
                id: String(r.id),
                icon: pub ? '✅' : '🤖',
                text: pub
                  ? `Content approved · ${title.slice(0, 40)}`
                  : `AI / draft update · ${title.slice(0, 40)}`,
                time: r.updated_at
                  ? new Date(r.updated_at as string).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : `${i + 1}h ago`,
                color: pub ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700',
              }
            }),
          )
        } else {
          setActivity([
            {
              id: '1',
              icon: '📥',
              text: 'New curriculum ready to import',
              time: '—',
              color: 'bg-sky-100 text-sky-700',
            },
            {
              id: '2',
              icon: '🤖',
              text: 'Generate lessons from PDF',
              time: '—',
              color: 'bg-violet-100 text-violet-700',
            },
          ])
        }
      } catch {
        /* ignore */
      }
    }
    void load()
  }, [])

  const pubPct =
    counts.lessons > 0 ? Math.round((counts.published / counts.lessons) * 100) : 0
  const other = Math.max(0, counts.lessons - counts.published)
  const otherPct = counts.lessons > 0 ? Math.round((other / counts.lessons) * 100) : 0

  const quick = [
    {
      href: '/dashboard/admin/curriculum/import',
      icon: '📥',
      label: 'Import Curriculum',
      sub: 'From Google Drive',
      bg: 'bg-sky-50 border-sky-200',
      iconBg: 'bg-sky-500',
    },
    {
      href: '/dashboard/admin/curriculum/lessons',
      icon: '🤖',
      label: 'AI Generation',
      sub: 'Generate Study Content',
      bg: 'bg-violet-50 border-violet-200',
      iconBg: 'bg-violet-500',
    },
    {
      href: '/dashboard/admin/curriculum/lessons',
      icon: '🔍',
      label: 'Review Content',
      sub: 'Check & Approve',
      bg: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-500',
    },
    {
      href: '/dashboard/admin/curriculum/lessons',
      icon: '🚀',
      label: 'Publish Content',
      sub: 'Make Live for Students',
      bg: 'bg-rose-50 border-rose-200',
      iconBg: 'bg-rose-500',
    },
  ]

  return (
    <div className="min-h-dvh bg-[#eef2ff] text-slate-800">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col bg-gradient-to-b from-[#1e3a8a] to-[#1e293b] text-white lg:flex">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
            <Image src="/icons/logo-icon.png" alt="ONONNO" width={32} height={32} className="rounded-lg" />
            <span className="text-sm font-black tracking-wide">ONONNO</span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {SIDE_NAV.map((item) => {
              const isProfile = item.label === 'System Settings' && pathname.includes('/profile')
              const active =
                item.href === '/dashboard/admin'
                  ? pathname === '/dashboard/admin'
                  : pathname.startsWith(item.href) && item.href !== '/dashboard/admin'
              const on = isProfile || (active && item.label !== 'System Settings')
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    on
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
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
                  <div className="flex size-full items-center justify-center bg-sky-500 text-sm font-bold">
                    {first.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{first}</p>
                <p className="text-[10px] text-white/60">Super Admin</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <Image src="/icons/logo-icon.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black text-slate-800">ONONNO Admin</span>
            </Link>
            <Link
              href="/dashboard/admin"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
            >
              ← Dashboard
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              🛡️ Admin Profile Page
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Manage Curriculum · Monitor Progress · Drive Impact
            </span>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative size-16 overflow-hidden rounded-full border-4 border-sky-100 sm:size-20">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 text-2xl font-black text-white">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{name}</h1>
                  <p className="text-sm font-semibold text-sky-600">Admin</p>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/profile"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Edit Profile
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total Classes', value: counts.classes, tone: 'text-sky-600' },
                { label: 'Subjects', value: counts.subjects, tone: 'text-violet-600' },
                { label: 'Chapters', value: counts.chapters, tone: 'text-emerald-600' },
                { label: 'Lessons', value: counts.lessons, tone: 'text-amber-600' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-center"
                >
                  <p className={`text-2xl font-black tabular-nums ${s.tone}`}>{s.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-black text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quick.map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className={`rounded-2xl border p-3.5 transition hover:-translate-y-0.5 hover:shadow-md ${q.bg}`}
                >
                  <span
                    className={`mb-2 inline-flex size-9 items-center justify-center rounded-xl text-lg text-white ${q.iconBg}`}
                  >
                    {q.icon}
                  </span>
                  <p className="text-xs font-black text-slate-800 sm:text-sm">{q.label}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-500">{q.sub}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800">Recent Activity</h2>
                <Link
                  href="/dashboard/admin/curriculum/lessons"
                  className="text-[11px] font-bold text-sky-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <ul className="space-y-2.5">
                {activity.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm ${a.color}`}
                    >
                      {a.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700 sm:text-sm">{a.text}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-black text-slate-800">Overview</h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start lg:flex-col">
                <div
                  className="relative size-32 shrink-0 rounded-full shadow-inner"
                  style={{
                    background: `conic-gradient(
                      #22c55e 0% ${pubPct}%,
                      #f59e0b ${pubPct}% ${Math.min(100, pubPct + Math.round(otherPct * 0.5))}%,
                      #94a3b8 ${Math.min(100, pubPct + Math.round(otherPct * 0.5))}% 100%
                    )`,
                  }}
                >
                  <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                    <p className="text-[10px] font-semibold text-slate-400">Total Content</p>
                    <p className="text-xl font-black text-slate-900">{counts.lessons}</p>
                  </div>
                </div>
                <ul className="w-full space-y-2 text-xs">
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold text-slate-600">
                      <span className="size-2.5 rounded-full bg-emerald-500" /> Published
                    </span>
                    <span className="font-bold text-slate-800">
                      {counts.published} ({pubPct}%)
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold text-slate-600">
                      <span className="size-2.5 rounded-full bg-amber-500" /> Pending / Draft
                    </span>
                    <span className="font-bold text-slate-800">
                      {other} ({otherPct}%)
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold text-slate-600">
                      <span className="size-2.5 rounded-full bg-slate-400" /> Users
                    </span>
                    <span className="font-bold text-slate-800">{counts.users}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
                💻
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 sm:text-base">
                  Build a Better Learning Future
                </p>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Your work helps thousands of students learn, explore and grow.
                </p>
              </div>
              <Link
                href="/dashboard/admin/readiness"
                className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500"
              >
                Soft-launch readiness →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
