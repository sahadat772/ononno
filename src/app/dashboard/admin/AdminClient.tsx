'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/shared/LogoutButton'
import AdminDashboardBody from '@/components/admin/dashboard/AdminDashboardBody'

interface Props {
  profile: Record<string, unknown> | null
  stats: {
    totalUsers: number
    totalStudents: number
    freeRequests: number
    totalSubjects: number
    pendingPayments?: number
    totalClasses?: number
    totalLessons?: number
    publishedLessons?: number
  }
  recentUsers: Record<string, unknown>[]
  recentLessons?: Record<string, unknown>[]
  classProgress?: { label: string; pct: number; tone: string }[]
  pipeline?: {
    extracted: number
    generated: number
    review: number
    approved: number
    published: number
  }
  isSuperAdmin?: boolean
  permissions?: string[]
}

const SIDE_NAV = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/admin/curriculum', label: 'Curriculum', icon: '📚' },
  { href: '/dashboard/admin/curriculum/import', label: 'AI Content', icon: '🤖' },
  { href: '/dashboard/admin/content', label: 'Review & Publish', icon: '✅' },
  { href: '/dashboard/admin/users', label: 'Students', icon: '🎓' },
  { href: '/dashboard/admin/users', label: 'Teachers', icon: '👨‍🏫' },
  { href: '/dashboard/admin/users', label: 'Parents', icon: '👨‍👩‍👧' },
  { href: '/dashboard/admin/learning-analytics', label: 'Analytics', icon: '📊' },
  { href: '/dashboard/admin/announcements', label: 'Gamification', icon: '🎮' },
  { href: '/dashboard/admin/profile', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/admin/readiness', label: 'Audit Logs', icon: '📋' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function AdminClient({
  profile,
  stats,
  recentUsers,
  recentLessons = [],
  classProgress = [],
  pipeline = { extracted: 0, generated: 0, review: 0, approved: 0, published: 0 },
}: Props) {
  const [q, setQ] = useState('')
  const name = String(profile?.full_name || 'Admin')
  const first = name.split(' ')[0]
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const activity = useMemo(() => {
    const items: { icon: string; text: string; time: string; color: string }[] = []
    for (const l of recentLessons.slice(0, 3)) {
      items.push({
        icon: '📘',
        text: `${String(l.title_bn || l.title || 'Lesson')} ${l.is_published ? 'published' : 'updated'}`,
        time: l.updated_at ? new Date(String(l.updated_at)).toLocaleString() : 'Recently',
        color: 'bg-violet-100 text-violet-700',
      })
    }
    for (const u of recentUsers.slice(0, 2)) {
      items.push({
        icon: '👤',
        text: `New ${String(u.role || 'user')}: ${String(u.full_name || u.email || 'User')}`,
        time: u.created_at ? new Date(String(u.created_at)).toLocaleString() : 'Recently',
        color: 'bg-sky-100 text-sky-700',
      })
    }
    if (!items.length) {
      items.push({
        icon: '✨',
        text: 'Welcome to ONONNO admin',
        time: 'Now',
        color: 'bg-emerald-100 text-emerald-700',
      })
    }
    return items
  }, [recentLessons, recentUsers])

  return (
    <div className="flex min-h-dvh bg-[#f4f7fb] text-slate-800">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col bg-gradient-to-b from-[#0b1b3a] to-[#0a162e] text-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-5">
          <Image src="/icons/logo-icon.png" alt="ONONNO" width={34} height={34} className="rounded-lg" />
          <div>
            <p className="text-sm font-black tracking-wide">ONONNO</p>
            <p className="text-[10px] text-white/50">Admin Workspace</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4">
          {SIDE_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                item.label === 'Dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2.5">
            <div className="relative size-9 overflow-hidden rounded-full border-2 border-white/20 bg-blue-500/40">
              {profile?.avatar_url ? (
                <Image src={String(profile.avatar_url)} alt="" fill className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-bold">{first.charAt(0)}</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{first}</p>
              <p className="text-[10px] text-white/50">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/admin" className="flex items-center gap-2 lg:hidden">
              <Image src="/icons/logo-icon.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black">ONONNO</span>
            </Link>
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search anything… (classes, subjects, lessons, students)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <Link href="/dashboard/admin/announcements" className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              🔔
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-500" />
            </Link>
            <Link href="/dashboard/admin/profile" className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 hover:bg-slate-50">
              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">{first.charAt(0)}</div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight">{first}</p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
            </Link>
          </div>
        </header>

        <AdminDashboardBody
          first={first}
          dateStr={dateStr}
          greeting={greeting()}
          stats={stats}
          classProgress={classProgress}
          pipeline={pipeline}
          activity={activity}
          recentLessons={recentLessons}
        />

        <div className="flex justify-end px-4 pb-6 sm:px-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
