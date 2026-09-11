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
  { title: 'ব্যবহারকারী', desc: 'User list, role ও access control', icon: '👥', href: '/dashboard/admin/users', gradient: 'from-blue-500 to-cyan-400', border: 'border-blue-500/20' },
  { title: 'কারিকুলাম', desc: 'Class, subject, lesson ও PDF import', icon: '📚', href: '/dashboard/admin/curriculum', gradient: 'from-violet-500 to-purple-400', border: 'border-violet-500/20' },
  { title: 'Free Access', desc: 'এতিম/দরিদ্র আবেদন যাচাই', icon: '🤲', href: '/dashboard/admin/free-access', gradient: 'from-emerald-500 to-teal-400', border: 'border-emerald-500/20' },
  { title: 'Subscription', desc: 'Payment verify ও plan manage', icon: '💳', href: '/dashboard/admin/subscriptions', gradient: 'from-amber-500 to-orange-400', border: 'border-amber-500/20' },
  { title: 'ঘোষণা', desc: 'Announcement', icon: '📢', href: '/dashboard/admin/announcements', gradient: 'from-rose-500 to-pink-400', border: 'border-rose-500/20' },
  { title: 'Learning Analytics', desc: 'Session ও progress', icon: '📈', href: '/dashboard/admin/learning-analytics', gradient: 'from-cyan-500 to-sky-400', border: 'border-cyan-500/20' },
  { title: 'AI / ML', desc: 'Tutor performance', icon: '🧠', href: '/dashboard/admin/analytics', gradient: 'from-indigo-500 to-blue-400', border: 'border-indigo-500/20' },
  { title: 'Content', desc: 'Content review', icon: '📝', href: '/dashboard/admin/content', gradient: 'from-teal-500 to-emerald-400', border: 'border-teal-500/20' },
  { title: 'বানান চেকার', desc: 'বাংলা বানান ও টাইপো যাচাই (AI)', icon: '✍️', href: '/dashboard/admin/tools/spell-check', gradient: 'from-pink-500 to-rose-400', border: 'border-pink-500/20' },
  { title: 'Readiness', desc: 'Soft-launch checklist', icon: '🚀', href: '/dashboard/admin/readiness', gradient: 'from-lime-500 to-emerald-400', border: 'border-lime-500/20' },
]

export default function AdminClient({ profile, stats, recentUsers }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const firstName = profile?.full_name?.split(' ')[0] || 'Admin'
  const pendingPay = stats.pendingPayments ?? 0

  return (
    <main className="min-h-screen bg-[#030711] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/8 bg-[#030711]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard/admin" className="flex items-center gap-2.5">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
            <span className="text-base font-black">অনন্য</span>
            <span className="rounded-md border border-fuchsia-500/40 bg-fuchsia-500/15 px-1.5 py-0.5 text-[10px] font-bold text-pink-300">ADMIN</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 rounded-xl border border-slate-600/80 bg-[#080d1b] px-2.5 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xs font-bold">{firstName.charAt(0)}</div>
                <span className="hidden text-xs font-semibold md:inline">{firstName}</span>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-white/10 bg-[#080d1b] p-4 shadow-2xl">
                    <p className="truncate text-sm font-bold">{profile?.full_name}</p>
                    <p className="truncate text-xs text-gray-400">{profile?.email}</p>
                    <Link href="/dashboard/admin/profile" className="mt-3 block rounded-xl border border-slate-600 py-2 text-center text-xs">Profile</Link>
                    <div className="mt-2"><LogoutButton /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24">
        <div className="mb-6 rounded-3xl border border-white/8 bg-gradient-to-br from-fuchsia-500/12 via-[#080d1b] to-[#087dff]/8 p-6">
          <h1 className="text-2xl font-black">
            আস-সালামু আলাইকুম, <span className="bg-gradient-to-r from-pink-300 to-violet-300 bg-clip-text text-transparent">{firstName}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">Control center — users, curriculum, payments, AI ও soft-launch.</p>
          {(stats.freeRequests > 0 || pendingPay > 0) && (
            <p className="mt-2 text-xs text-amber-300">
              {stats.freeRequests > 0 && `${stats.freeRequests} free request`}
              {stats.freeRequests > 0 && pendingPay > 0 && ' · '}
              {pendingPay > 0 && `${pendingPay} pending payment`}
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'মোট ব্যবহারকারী', value: stats.totalUsers, href: '/dashboard/admin/users' },
            { label: 'মোট শিক্ষার্থী', value: stats.totalStudents, href: '/dashboard/admin/users' },
            { label: 'Free আবেদন', value: stats.freeRequests, href: '/dashboard/admin/free-access' },
            { label: 'Subjects', value: stats.totalSubjects, href: '/dashboard/admin/curriculum' },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="rounded-2xl border border-slate-700/70 bg-[#080d1b] p-4 hover:border-fuchsia-500/30">
              <div className="text-2xl font-black text-fuchsia-200">{s.value.toLocaleString('bn-BD')}</div>
              <div className="mt-1 text-[11px] text-gray-500">{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/dashboard/admin/curriculum" className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-200">📚 Curriculum</Link>
          <Link href="/dashboard/admin/tools/spell-check" className="rounded-xl border border-pink-500/25 bg-pink-500/10 px-3.5 py-2 text-xs font-semibold text-pink-200">✍️ বানান</Link>
          <Link href="/dashboard/admin/subscriptions" className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-200">💳 Payments</Link>
          <Link href="/dashboard/admin/free-access" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-200">🤲 Free Access</Link>
          <Link href="/dashboard/admin/readiness" className="rounded-xl border border-lime-500/25 bg-lime-500/10 px-3.5 py-2 text-xs font-semibold text-lime-200">🚀 Readiness</Link>
        </div>

        <h2 className="mb-3 text-lg font-bold">Module Hub</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded-2xl border ${item.border} bg-[#080d1b] p-4 transition hover:bg-[#0a1020]`}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-lg`}>{item.icon}</div>
              <p className="font-bold">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>

        {recentUsers?.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#080d1b] p-4">
            <p className="mb-3 text-sm font-bold">Recent users</p>
            <ul className="space-y-2 text-sm text-slate-300">
              {recentUsers.slice(0, 8).map((u, i) => (
                <li key={i} className="flex justify-between border-b border-white/5 py-1.5">
                  <span>{u.full_name || u.email || '—'}</span>
                  <span className="text-xs text-slate-500">{u.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
