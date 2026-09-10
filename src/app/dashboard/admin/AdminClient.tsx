'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
import Image from 'next/image'

interface Props {
  profile: Record<string, string> | null
  stats: {
    totalUsers: number
    totalStudents: number
    freeRequests: number
    totalSubjects: number
    pendingPayments?: number
  }
  recentUsers: Record<string, string>[]
}

const menuItems = [
  { title: 'ব্যবহারকারী', desc: 'User list, role ও access control', icon: '👥', href: '/dashboard/admin/users', gradient: 'from-blue-500 to-cyan-400', border: 'border-blue-500/20', tag: 'Core' },
  { title: 'কারিকুলাম', desc: 'Class, subject, lesson ও PDF import', icon: '📚', href: '/dashboard/admin/curriculum', gradient: 'from-violet-500 to-purple-400', border: 'border-violet-500/20', tag: 'Core' },
  { title: 'Free Access', desc: 'এতিম/দরিদ্র আবেদন যাচাই', icon: '🤲', href: '/dashboard/admin/free-access', gradient: 'from-emerald-500 to-teal-400', border: 'border-emerald-500/20', tag: 'Ops' },
  { title: 'Subscription', desc: 'Payment verify ও plan manage', icon: '💳', href: '/dashboard/admin/subscriptions', gradient: 'from-amber-500 to-orange-400', border: 'border-amber-500/20', tag: 'Ops' },
  { title: 'ঘোষণা', desc: 'সবাইকে announcement পাঠাও', icon: '📢', href: '/dashboard/admin/announcements', gradient: 'from-rose-500 to-pink-400', border: 'border-rose-500/20', tag: 'Comms' },
  { title: 'Learning Analytics', desc: 'Session, progress ও weakness', icon: '📈', href: '/dashboard/admin/learning-analytics', gradient: 'from-cyan-500 to-sky-400', border: 'border-cyan-500/20', tag: 'Insight' },
  { title: 'AI / ML', desc: 'Tutor performance ও model usage', icon: '🧠', href: '/dashboard/admin/analytics', gradient: 'from-indigo-500 to-blue-400', border: 'border-indigo-500/20', tag: 'Insight' },
  { title: 'Content', desc: 'Content review ও moderation', icon: '📝', href: '/dashboard/admin/content', gradient: 'from-teal-500 to-emerald-400', border: 'border-teal-500/20', tag: 'Core' },
  { title: 'Readiness', desc: 'Soft-launch checklist ও ops snapshot', icon: '🚀', href: '/dashboard/admin/readiness', gradient: 'from-lime-500 to-emerald-400', border: 'border-lime-500/20', tag: 'Ops' },
]

const aiModels = [
  { name: 'LLaMA 3.3 70B', sub: 'AI Tutor & Chat', provider: 'Groq', usage: 87, latency: '0.9s', active: true },
  { name: 'Llama 4 Scout', sub: 'Vision & Trace Verify', provider: 'Groq', usage: 62, latency: '1.4s', active: true },
  { name: 'Whisper', sub: 'Pronunciation / Tajweed', provider: 'Groq', usage: 45, latency: '1.1s', active: true },
  { name: 'Adaptive Curriculum', sub: 'ML Personalization', provider: '—', usage: 0, latency: '—', active: false },
]

const mlRoadmap = [
  { icon: '🎯', title: 'Personalized Learning', desc: 'দুর্বলতা AI দিয়ে চিহ্নিত', phase: 'Phase 1', status: 'building' },
  { icon: '🎙️', title: 'Tajweed AI', desc: 'তিলাওয়াত pronunciation check', phase: 'Phase 1', status: 'building' },
  { icon: '📊', title: 'Performance Prediction', desc: 'পরীক্ষার ফলাফল predict', phase: 'Phase 2', status: 'planned' },
  { icon: '💼', title: 'Job Match AI', desc: 'Skill অনুযায়ী career match', phase: 'Phase 2', status: 'planned' },
  { icon: '📈', title: 'Halal Finance AI', desc: 'Halal investment guide', phase: 'Phase 3', status: 'planned' },
  { icon: '🧬', title: 'Adaptive Curriculum', desc: 'Syllabus personalize', phase: 'Phase 3', status: 'planned' },
]

const activityFeed = [
  { icon: '👤', title: 'নতুন registration', desc: 'Student / parent signup' },
  { icon: '💳', title: 'Payment pending', desc: 'Manual bKash/Nagad verify' },
  { icon: '🤲', title: 'Free access request', desc: 'Admin approve/reject' },
  { icon: '📚', title: 'Lesson progress', desc: 'Student completes lesson' },
]

const navLinks = [
  { label: 'Curriculum', href: '/dashboard/admin/curriculum', icon: '📚' },
  { label: 'Payments', href: '/dashboard/admin/subscriptions', icon: '💳' },
  { label: 'Free Access', href: '/dashboard/admin/free-access', icon: '🤲' },
  { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
  { label: 'Announce', href: '/dashboard/admin/announcements', icon: '📢' },
  { label: 'Readiness', href: '/dashboard/admin/readiness', icon: '🚀' },
]

function roleBadge(role: string) {
  if (role === 'admin') return 'bg-red-500/15 text-red-400 border-red-500/25'
  if (role === 'teacher') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  if (role === 'parent') return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
  return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
}

function roleLabel(role: string) {
  if (role === 'admin') return 'Admin'
  if (role === 'teacher') return 'Teacher'
  if (role === 'parent') return 'Parent'
  return 'Student'
}

export default function AdminClient({ profile, stats, recentUsers }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'activity'>('overview')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা'
  const firstName = profile?.full_name?.split(' ')[0] || 'Admin'
  const pendingPay = stats.pendingPayments ?? 0

  return (
    <main className="min-h-screen bg-[#060612] text-white overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-red-500/6 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-violet-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/8 bg-[#060612]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <Link href="/dashboard/admin" className="flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#060612] bg-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-black tracking-tight">অনন্য</span>
              <span className="ml-2 rounded-md border border-red-500/30 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400">ADMIN</span>
            </div>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((a) => (
              <Link key={a.href} href={a.href} className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:border-white/10 hover:bg-white/5 hover:text-white">
                <span className="mr-1">{a.icon}</span>{a.label}
              </Link>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/8">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-xs font-bold shadow">{firstName.charAt(0)}</div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold leading-none">{firstName}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">Super Admin</p>
                </div>
                <span className="text-[10px] text-gray-500">{showProfile ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }} className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-[#0e0e24]/95 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-3 border-b border-white/8 pb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-lg font-black shadow-lg">{firstName.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{profile?.full_name}</p>
                        <p className="truncate text-xs text-gray-400">{profile?.email}</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Super Admin
                        </span>
                      </div>
                    </div>
                    <Link href="/dashboard/admin/profile" className="mb-2 block rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs font-medium text-gray-300 transition hover:bg-white/10">Profile Settings</Link>
                    <LogoutButton />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden sm:block"><LogoutButton /></div>
          </div>
        </div>
      </nav>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-24 md:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-red-500/10 via-[#0c0c1c] to-violet-500/5 p-6 md:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-sm text-gray-400">{greeting} · {new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  আস-সালামু আলাইকুম,{' '}
                  <span className="bg-gradient-to-r from-red-300 to-rose-200 bg-clip-text text-transparent">{firstName}</span>
                </h1>
                <p className="mt-2 max-w-lg text-sm text-gray-400">Platform control center — users, curriculum, payments ও AI এক জায়গায়।</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">System Online</span>
                </div>
                {(stats.freeRequests > 0 || pendingPay > 0) && (
                  <p className="text-xs text-amber-300/90">
                    {stats.freeRequests > 0 && `${stats.freeRequests} free request`}
                    {stats.freeRequests > 0 && pendingPay > 0 && ' · '}
                    {pendingPay > 0 && `${pendingPay} pending payment`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { label: 'মোট ব্যবহারকারী', value: stats.totalUsers, icon: '👥', gradient: 'from-blue-500 to-cyan-400', href: '/dashboard/admin/users' },
            { label: 'মোট শিক্ষার্থী', value: stats.totalStudents, icon: '🎓', gradient: 'from-emerald-500 to-teal-400', href: '/dashboard/admin/users' },
            { label: 'Free আবেদন', value: stats.freeRequests, icon: '🤲', gradient: 'from-amber-500 to-orange-400', href: '/dashboard/admin/free-access', alert: stats.freeRequests > 0 },
            { label: 'Subjects / Curriculum', value: stats.totalSubjects, icon: '📚', gradient: 'from-violet-500 to-purple-400', href: '/dashboard/admin/curriculum' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }} whileHover={{ y: -3 }}>
              <Link href={stat.href} className="block h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.05] md:p-5">
                  {stat.alert && <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-red-500" />}
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-lg shadow-lg md:mb-4 md:h-11 md:w-11 md:text-xl`}>{stat.icon}</div>
                  <div className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-2xl font-black text-transparent md:text-3xl`}>{stat.value.toLocaleString('bn-BD')}</div>
                  <div className="mt-1 text-[11px] font-medium text-gray-500 md:text-xs">{stat.label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/dashboard/admin/curriculum" className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20">📚 Curriculum</Link>
          <Link href="/dashboard/admin/subscriptions" className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20">💳 Payments</Link>
          <Link href="/dashboard/admin/free-access" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
            🤲 Free Access{stats.freeRequests > 0 && <span className="ml-1.5 rounded-full bg-emerald-500/30 px-1.5 py-0.5 text-[10px]">{stats.freeRequests}</span>}
          </Link>
          <Link href="/dashboard/admin/learning-analytics" className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20">📈 Analytics</Link>
          <Link href="/dashboard/admin/readiness" className="rounded-xl border border-lime-500/25 bg-lime-500/10 px-3.5 py-2 text-xs font-semibold text-lime-200 transition hover:bg-lime-500/20">🚀 Readiness</Link>
        </div>

        <div className="mb-6 flex w-fit gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1.5">
          {([{ key: 'overview' as const, label: 'Overview' }, { key: 'ai' as const, label: 'AI / ML' }, { key: 'activity' as const, label: 'Activity' }]).map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === tab.key ? 'border border-white/10 bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>{tab.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Module hub</h2>
                  <p className="text-xs text-gray-500">সব admin tools এক নজরে — প্রয়োজন অনুযায়ী খোলো</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-400">Core</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-400">Ops</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-400">Insight</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-gray-400">Comms</span>
                </div>
              </div>

              {(stats.freeRequests > 0 || pendingPay > 0) && (
                <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 md:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-amber-100">Attention needed</p>
                      <p className="mt-0.5 text-xs text-amber-200/70">
                        {stats.freeRequests > 0 && `${stats.freeRequests} free access request`}
                        {stats.freeRequests > 0 && pendingPay > 0 && ' · '}
                        {pendingPay > 0 && `${pendingPay} pending payment`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stats.freeRequests > 0 && (
                        <Link href="/dashboard/admin/free-access" className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/30">Free Access →</Link>
                      )}
                      {pendingPay > 0 && (
                        <Link href="/dashboard/admin/subscriptions" className="rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/30 transition hover:bg-amber-500/30">Payments →</Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
                {menuItems.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }}>
                    <Link href={item.href} className="block h-full">
                      <div className={`group relative h-full cursor-pointer overflow-hidden rounded-2xl border ${item.border} bg-white/[0.03] p-5 transition-all duration-300 hover:bg-white/[0.06] hover:shadow-xl`}>
                        <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />
                        <div className="relative flex items-start justify-between gap-2">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-2xl shadow-lg transition-transform group-hover:scale-110`}>{item.icon}</div>
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.tag}</span>
                        </div>
                        <h3 className="relative mt-4 mb-1 text-sm font-bold text-white">{item.title}</h3>
                        <p className="relative text-xs leading-relaxed text-gray-500">{item.desc}</p>
                        <div className={`relative mt-4 flex items-center gap-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-xs font-semibold text-transparent opacity-70 transition-opacity group-hover:opacity-100`}>খোলো <span className="transition-transform group-hover:translate-x-0.5">→</span></div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: 'Curriculum ready', value: stats.totalSubjects, hint: 'subjects in DB', href: '/dashboard/admin/curriculum', color: 'text-violet-300' },
                  { title: 'Students onboard', value: stats.totalStudents, hint: 'active learners', href: '/dashboard/admin/users', color: 'text-emerald-300' },
                  { title: 'Platform users', value: stats.totalUsers, hint: 'all roles', href: '/dashboard/admin/users', color: 'text-blue-300' },
                ].map((b) => (
                  <Link key={b.title} href={b.href} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.05]">
                    <p className="text-[11px] text-gray-500">{b.title}</p>
                    <p className={`mt-1 text-xl font-black ${b.color}`}>{b.value.toLocaleString('bn-BD')}</p>
                    <p className="text-[10px] text-gray-600">{b.hint}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">AI / ML Overview</h2>
                  <p className="text-xs text-gray-500">Live model health · usage · roadmap</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/admin/analytics" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20">Full AI Analytics →</Link>
                  <Link href="/dashboard/admin/learning-analytics" className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/20">Learning Analytics →</Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Uptime', value: '99.2%', sub: 'Last 7 days', icon: '🟢', color: 'text-emerald-400', bar: 99 },
                  { label: 'Avg latency', value: '1.1s', sub: 'Tutor responses', icon: '⚡', color: 'text-amber-400', bar: 72 },
                  { label: 'Daily queries', value: '—', sub: 'Wire real logs soon', icon: '💬', color: 'text-blue-400', bar: 40 },
                  { label: 'Active models', value: '3 / 4', sub: 'Groq stack', icon: '🧠', color: 'text-violet-400', bar: 75 },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center justify-between"><span className="text-lg">{m.icon}</span><span className="text-[10px] text-gray-500">{m.sub}</span></div>
                    <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                    <div className="mt-1 text-xs text-gray-400">{m.label}</div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${m.bar}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-5">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 md:p-6 lg:col-span-3">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 font-bold"><span>🤖</span> Model status</h3>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">Groq · Online</span>
                  </div>
                  <div className="space-y-2.5">
                    {aiModels.map((model) => (
                      <div key={model.name} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/6 bg-white/[0.04] p-3.5 md:gap-4 md:p-4">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${model.active ? 'animate-pulse bg-emerald-400' : 'bg-gray-600'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.sub} · {model.provider}</p>
                        </div>
                        <div className="hidden text-right text-[10px] text-gray-500 sm:block"><p>Latency <span className="font-semibold text-gray-300">{model.latency}</span></p></div>
                        {model.active && (
                          <div className="w-24 shrink-0 sm:w-28">
                            <div className="mb-1 flex justify-between text-[10px] text-gray-500"><span>Load</span><span>{model.usage}%</span></div>
                            <div className="h-1.5 w-full rounded-full bg-white/10"><div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${model.usage}%` }} /></div>
                          </div>
                        )}
                        <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${model.active ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-400' : 'border-gray-500/25 bg-gray-500/15 text-gray-400'}`}>{model.active ? 'Active' : 'Soon'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-5 md:p-6 lg:col-span-2">
                  <h3 className="mb-3 font-bold">🛡️ Health notes</h3>
                  <ul className="space-y-2.5 text-xs text-gray-300">
                    <li className="rounded-xl border border-white/8 bg-black/20 p-3">Tutor uses Groq fallback chain if primary model 404.</li>
                    <li className="rounded-xl border border-white/8 bg-black/20 p-3">Quran audio proxied via /api/islamic/audio.</li>
                    <li className="rounded-xl border border-white/8 bg-black/20 p-3">Real token/cost metrics — next instrumentation step.</li>
                  </ul>
                  <Link href="/dashboard/admin/analytics" className="mt-4 inline-flex text-xs font-semibold text-indigo-300 hover:text-indigo-200">Open analytics page →</Link>
                </div>
              </div>
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-bold"><span>🚀</span> ML Roadmap</h3>
                  <span className="text-[10px] text-gray-500">Phase-wise delivery</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {mlRoadmap.map((f) => (
                    <div key={f.title} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.04] p-4">
                      <span className="text-xl">{f.icon}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{f.title}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${f.status === 'building' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-gray-500/20 bg-gray-500/15 text-gray-400'}`}>{f.phase} · {f.status === 'building' ? 'Building' : 'Planned'}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Activity center</h2>
                  <p className="text-xs text-gray-500">Recent users · role mix · ops checklist</p>
                </div>
                <Link href="/dashboard/admin/users" className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20">All users →</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: 'Total users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-cyan-400' },
                  { label: 'Students', value: stats.totalStudents, icon: '🎓', color: 'from-emerald-500 to-teal-400' },
                  { label: 'Free pending', value: stats.freeRequests, icon: '🤲', color: 'from-amber-500 to-orange-400' },
                  { label: 'Pay pending', value: pendingPay, icon: '💳', color: 'from-rose-500 to-pink-400' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-sm`}>{s.icon}</div>
                    <p className={`bg-gradient-to-r ${s.color} bg-clip-text text-xl font-black text-transparent`}>{s.value.toLocaleString('bn-BD')}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-5">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 md:p-6 lg:col-span-3">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold">সাম্প্রতিক ব্যবহারকারী</h3>
                    <span className="text-[10px] text-gray-500">{recentUsers.length} shown</span>
                  </div>
                  {recentUsers.length === 0 ? (
                    <div className="py-12 text-center"><p className="mb-2 text-4xl">👥</p><p className="text-sm text-gray-500">এখনো কোনো ব্যবহারকারী নেই</p></div>
                  ) : (
                    <div className="space-y-2">
                      {recentUsers.map((user, i) => (
                        <motion.div key={user.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 rounded-xl border border-transparent bg-white/[0.04] p-3 transition hover:border-white/8 hover:bg-white/[0.06] md:gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold shadow-md">{(user.full_name || '?').charAt(0).toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{user.full_name}</p>
                            <p className="truncate text-xs text-gray-500">{user.email}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold md:text-xs ${roleBadge(user.role || 'student')}`}>{roleLabel(user.role || 'student')}</span>
                            <p className="mt-1 text-[10px] text-gray-600">{user.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD') : ''}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4 lg:col-span-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <h3 className="mb-3 font-bold">Ops checklist</h3>
                    <div className="space-y-2">
                      {activityFeed.map((a) => (
                        <div key={a.title} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.04] p-3">
                          <span className="text-lg">{a.icon}</span>
                          <div>
                            <p className="text-sm font-semibold">{a.title}</p>
                            <p className="text-xs text-gray-500">{a.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5">
                    <h3 className="mb-2 font-bold">Action needed</h3>
                    <ul className="space-y-2 text-xs text-gray-300">
                      <li className="flex justify-between gap-2"><span>Free access requests</span><Link href="/dashboard/admin/free-access" className="font-semibold text-amber-300 hover:underline">{stats.freeRequests}</Link></li>
                      <li className="flex justify-between gap-2"><span>Pending payments</span><Link href="/dashboard/admin/subscriptions" className="font-semibold text-amber-300 hover:underline">{pendingPay}</Link></li>
                      <li className="flex justify-between gap-2"><span>Curriculum subjects</span><Link href="/dashboard/admin/curriculum" className="font-semibold text-amber-300 hover:underline">{stats.totalSubjects}</Link></li>
                      <li className="flex justify-between gap-2"><span>Soft-launch readiness</span><Link href="/dashboard/admin/readiness" className="font-semibold text-lime-300 hover:underline">Open →</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative mt-4 border-t border-white/8 bg-[#05050e]/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="max-w-sm">
            <div className="mb-2 flex items-center gap-2">
              <Image src="/icons/logo-icon.png" alt="অনন্য" width={28} height={28} className="rounded-lg" />
              <span className="font-black tracking-tight">অনন্য</span>
              <span className="rounded border border-red-500/30 bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400">ADMIN</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Islamic + Academic learning platform — curriculum, payments, AI tutor ও student progress এক জায়গায়।
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Manage</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/dashboard/admin/curriculum" className="hover:text-white">Curriculum</Link></li>
                <li><Link href="/dashboard/admin/users" className="hover:text-white">Users</Link></li>
                <li><Link href="/dashboard/admin/subscriptions" className="hover:text-white">Payments</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Ops</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/dashboard/admin/free-access" className="hover:text-white">Free Access</Link></li>
                <li><Link href="/dashboard/admin/announcements" className="hover:text-white">Announcements</Link></li>
                <li><Link href="/dashboard/admin/readiness" className="hover:text-white">Readiness</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Insight</p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li><Link href="/dashboard/admin/learning-analytics" className="hover:text-white">Learning Analytics</Link></li>
                <li><Link href="/dashboard/admin/analytics" className="hover:text-white">AI Analytics</Link></li>
                <li><Link href="/dashboard/admin/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-gray-600 md:px-6">
            <span>© {new Date().getFullYear()} অনন্য · Admin control center</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              System online
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}
