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
  if (role === 'admin') return 'bg-fuchsia-500/15 text-pink-300 border-fuchsia-500/35'
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
    <main className="min-h-screen bg-[#030711] text-white overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-fuchsia-500/8 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-violet-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#087dff]/6 blur-3xl" />
      </div>

      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/8 bg-[#030711]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <Link href="/dashboard/admin" className="flex shrink-0 items-center gap-2.5">
            <div className="relative">
              <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#030711] bg-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-black tracking-tight">অনন্য</span>
              <span className="ml-2 rounded-md border border-fuchsia-500/40 bg-fuchsia-500/15 px-1.5 py-0.5 text-[10px] font-bold text-pink-300">ADMIN</span>
            </div>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((a) => (
              <Link key={a.href} href={a.href} className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:border-fuchsia-500/25 hover:bg-fuchsia-500/10 hover:text-pink-200">
                <span className="mr-1">{a.icon}</span>{a.label}
              </Link>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 rounded-xl border border-slate-600/80 bg-[#080d1b] px-2.5 py-1.5 transition hover:border-fuchsia-500/40">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xs font-bold shadow">{firstName.charAt(0)}</div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold leading-none">{firstName}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">Super Admin</p>
                </div>
                <span className="text-[10px] text-gray-500">{showProfile ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }} className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-[#080d1b]/98 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-3 border-b border-white/8 pb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-lg font-black shadow-lg">{firstName.charAt(0)}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{profile?.full_name}</p>
                        <p className="truncate text-xs text-gray-400">{profile?.email}</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] text-pink-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-pink-400" /> Super Admin
                        </span>
                      </div>
                    </div>
                    <Link href="/dashboard/admin/profile" className="mb-2 block rounded-xl border border-slate-600/80 bg-[#030711] py-2 text-center text-xs font-medium text-slate-300 transition hover:border-fuchsia-500/40 hover:text-pink-200">Profile Settings</Link>
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
          <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-fuchsia-500/12 via-[#080d1b] to-[#087dff]/8 p-6 md:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-500/12 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-sm text-gray-400">{greeting} · {new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  আস-সালামু আলাইকুম,{' '}
                  <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">{firstName}</span>
                </h1>
                <p className="mt-2 max-w-lg text-sm text-gray-400">Control center — users, curriculum, payments, AI ও soft-launch ops।</p>
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
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-700/70 bg-[#080d1b] p-4 transition hover:border-fuchsia-500/30 hover:bg-[#0a1020] md:p-5">
                  {stat.alert && <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-amber-400" />}
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

        <div className="mb-6 flex w-fit gap-1 rounded-2xl border border-slate-700/80 bg-[#080d1b] p-1.5">
          {([{ key: 'overview' as const, label: 'Overview' }, { key: 'ai' as const, label: 'AI / ML' }, { key: 'activity' as const, label: 'Activity' }]).map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === tab.key ? 'border border-fuchsia-500/40 bg-fuchsia-500/15 text-pink-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>{tab.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Module <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Hub</span></h2>
                  <p className="text-xs text-slate-500">সব admin tools এক নজরে — প্রয়োজন অনুযায়ী খোলো</p>
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
                        <Link href="/dashboard/admin/free-access" className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-500/30">Free Access →</Link>
                      )}
                      {pendingPay > 0 && (
                        <Link href="/dashboard/admin/subscriptions" className="rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/30">Payments →</Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
                {menuItems.map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }}>
                    <Link href={item.href} className="block h-full">
                      <div className={`group relative h-full cursor-pointer overflow-hidden rounded-2xl border ${item.border} bg-[#080d1b] p-5 transition-all duration-300 hover:bg-[#0c1220] hover:shadow-xl`}>
                        <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />
                        <div className="relative flex items-start justify-between gap-2">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-2xl shadow-lg transition-transform group-hover:scale-110`}>{item.icon}</div>
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.tag}</span>
                        </div>
                        <h3 className="relative mt-4 mb-1 text-sm font-bold text-white">{item.title}</h3>
                        <p className="relative text-xs leading-relaxed text-gray-500">{item.desc}</p>
                        <div className={`relative mt-4 flex items-center gap-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-xs font-semibold text-transparent opacity-70 group-hover:opacity-100`}>খোলো →</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">AI / ML Overview</h2>
                  <p className="text-xs text-gray-500">Live model health · usage · roadmap</p>
                </div>
                <Link href="/dashboard/admin/analytics" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-200">Full AI Analytics →</Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {aiModels.map((model) => (
                  <div key={model.name} className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-[#080d1b] p-4">
                    <span className={`h-2.5 w-2.5 rounded-full ${model.active ? 'animate-pulse bg-emerald-400' : 'bg-gray-600'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.sub} · {model.provider}</p>
                    </div>
                    <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${model.active ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-400' : 'border-gray-500/25 text-gray-400'}`}>{model.active ? 'Active' : 'Soon'}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mlRoadmap.map((f) => (
                  <div key={f.title} className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-[#080d1b] p-4">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Activity center</h2>
                  <p className="text-xs text-gray-500">Recent users · ops checklist</p>
                </div>
                <Link href="/dashboard/admin/users" className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-200">All users →</Link>
              </div>
              <div className="grid gap-4 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-700/70 bg-[#080d1b] p-5 lg:col-span-3">
                  <h3 className="mb-4 font-bold">সাম্প্রতিক ব্যবহারকারী</h3>
                  {recentUsers.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500">এখনো কোনো ব্যবহারকারী নেই</p>
                  ) : (
                    <div className="space-y-2">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 rounded-xl bg-[#0a1020] p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold">{(user.full_name || '?').charAt(0).toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{user.full_name}</p>
                            <p className="truncate text-xs text-gray-500">{user.email}</p>
                          </div>
                          <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${roleBadge(user.role || 'student')}`}>{roleLabel(user.role || 'student')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4 lg:col-span-2">
                  <div className="rounded-2xl border border-slate-700/70 bg-[#080d1b] p-5">
                    <h3 className="mb-3 font-bold">Ops checklist</h3>
                    <div className="space-y-2">
                      {activityFeed.map((a) => (
                        <div key={a.title} className="flex items-start gap-3 rounded-xl bg-[#0a1020] p-3">
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
                      <li className="flex justify-between"><span>Free access</span><Link href="/dashboard/admin/free-access" className="font-semibold text-amber-300">{stats.freeRequests}</Link></li>
                      <li className="flex justify-between"><span>Pending payments</span><Link href="/dashboard/admin/subscriptions" className="font-semibold text-amber-300">{pendingPay}</Link></li>
                      <li className="flex justify-between"><span>Readiness</span><Link href="/dashboard/admin/readiness" className="font-semibold text-lime-300">Open →</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative mt-4 border-t border-white/8 bg-[#050814]/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:justify-between md:px-6">
          <div className="max-w-sm">
            <div className="mb-2 flex items-center gap-2">
              <Image src="/icons/logo-icon.png" alt="অনন্য" width={28} height={28} className="rounded-lg" />
              <span className="font-black">অনন্য</span>
              <span className="rounded border border-fuchsia-500/40 bg-fuchsia-500/15 px-1.5 py-0.5 text-[9px] font-bold text-pink-300">ADMIN</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">Islamic + Academic learning — curriculum, payments, AI tutor ও student progress।</p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 text-xs text-gray-500">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-gray-400">Manage</p>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard/admin/curriculum" className="hover:text-white">Curriculum</Link></li>
                <li><Link href="/dashboard/admin/users" className="hover:text-white">Users</Link></li>
                <li><Link href="/dashboard/admin/subscriptions" className="hover:text-white">Payments</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-gray-400">Ops</p>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard/admin/free-access" className="hover:text-white">Free Access</Link></li>
                <li><Link href="/dashboard/admin/readiness" className="hover:text-white">Readiness</Link></li>
                <li><Link href="/dashboard/admin/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-gray-400">Insight</p>
              <ul className="space-y-1.5">
                <li><Link href="/dashboard/admin/learning-analytics" className="hover:text-white">Learning Analytics</Link></li>
                <li><Link href="/dashboard/admin/analytics" className="hover:text-white">AI Analytics</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl justify-between px-4 py-3 text-[11px] text-gray-600 md:px-6">
            <span>© {new Date().getFullYear()} অনন্য · Admin control center</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> System online</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
