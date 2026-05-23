'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

interface Props {
  profile: Record<string, string> | null
  stats: {
    totalUsers: number
    totalStudents: number
    freeRequests: number
    totalSubjects: number
  }
  recentUsers: Record<string, string>[]
}

const menuItems = [
  { title: 'ব্যবহারকারী', desc: 'সব user দেখো ও manage করো', icon: '👥', href: '/dashboard/admin/users', linear: 'from-blue-500 to-cyan-400', border: 'border-blue-500/25', shadow: 'hover:shadow-blue-500/10' },
  { title: 'কন্টেন্ট', desc: 'Subjects ও lessons manage করো', icon: '📚', href: '/dashboard/admin/content', linear: 'from-violet-500 to-purple-400', border: 'border-violet-500/25', shadow: 'hover:shadow-violet-500/10' },
  { title: 'Free Access', desc: 'এতিম ও দরিদ্র আবেদন যাচাই', icon: '🤲', href: '/dashboard/admin/free-access', linear: 'from-emerald-500 to-teal-400', border: 'border-emerald-500/25', shadow: 'hover:shadow-emerald-500/10' },
  { title: 'Subscription', desc: 'Payment ও subscription manage', icon: '💳', href: '/dashboard/admin/subscriptions', linear: 'from-amber-500 to-orange-400', border: 'border-amber-500/25', shadow: 'hover:shadow-amber-500/10' },
  { title: 'ঘোষণা', desc: 'সব users কে ঘোষণা পাঠাও', icon: '📢', href: '/dashboard/admin/announcements', linear: 'from-rose-500 to-pink-400', border: 'border-rose-500/25', shadow: 'hover:shadow-rose-500/10' },
  { title: 'AI/ML Analytics', desc: 'AI performance ও ML data দেখো', icon: '🧠', href: '/dashboard/admin/analytics', linear: 'from-indigo-500 to-blue-400', border: 'border-indigo-500/25', shadow: 'hover:shadow-indigo-500/10' },
  { title: 'শিক্ষক ব্যবস্থাপনা', desc: 'Teacher approve ও assign করো', icon: '👨‍🏫', href: '/dashboard/admin/teachers', linear: 'from-teal-500 to-cyan-400', border: 'border-teal-500/25', shadow: 'hover:shadow-teal-500/10' },
  { title: 'System Settings', desc: 'Platform settings ও configuration', icon: '⚙️', href: '/dashboard/admin/settings', linear: 'from-slate-500 to-gray-400', border: 'border-slate-500/25', shadow: 'hover:shadow-slate-500/10' },
]

const aiModels = [
  { name: 'LLaMA 3.3 70B', sub: 'AI Tutor & Chat', usage: 87, active: true },
  { name: 'Llama 4 Scout', sub: 'Vision & Trace Verify', usage: 62, active: true },
  { name: 'Whisper (Groq)', sub: 'Pronunciation Check', usage: 45, active: true },
  { name: 'Adaptive Curriculum', sub: 'ML Personalization', usage: 0, active: false },
]

const mlRoadmap = [
  { icon: '🎯', title: 'Personalized Learning', desc: 'Student এর দুর্বলতা AI দিয়ে খুঁজে বের করা', done: false },
  { icon: '🎙️', title: 'Tajweed AI', desc: 'Whisper দিয়ে কুরআন তিলাওয়াত check করা', done: false },
  { icon: '📊', title: 'Performance Prediction', desc: 'পরীক্ষার ফলাফল আগে থেকে predict করা', done: false },
  { icon: '💼', title: 'Job Match AI', desc: 'Skill অনুযায়ী সেরা job suggest করা', done: false },
  { icon: '📈', title: 'Stock Market AI', desc: 'Halal investment guide করা', done: false },
  { icon: '🧬', title: 'Adaptive Curriculum', desc: 'AI দিয়ে syllabus personalize করা', done: false },
]

export default function AdminClient({ profile, stats, recentUsers }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'activity'>('overview')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা'
  const firstName = profile?.full_name?.split(' ')[0] || 'Admin'

  return (
    <main className="min-h-screen bg-[#07071a] text-white overflow-x-hidden">

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/4 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-linear(rgba(255,255,255,1) 1px, transparent 1px), linear-linear(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '64px 64px' }}
        />
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.07] bg-[#07071a]/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/dashboard/admin" className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-base font-black shadow-lg shadow-red-500/30">
                অ
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#07071a] animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-white text-lg tracking-tight">অনন্য</span>
              <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md font-semibold">ADMIN</span>
            </div>
          </Link>

          {/* Quick Links — desktop */}
          <div className="hidden lg:flex items-center gap-1.5">
            {[
              { label: '📢 ঘোষণা', href: '/dashboard/admin/announcements' },
              { label: '✅ Free Approve', href: '/dashboard/admin/free-access' },
              { label: '💳 Payments', href: '/dashboard/admin/subscriptions' },
              { label: '📚 Content', href: '/dashboard/admin/content' },
            ].map((a, i) => (
              <Link key={i} href={a.href}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all font-medium">
                {a.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/8 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-sm font-bold shadow-md">
                  {firstName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-white leading-none">{firstName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Super Admin</p>
                </div>
                <span className="text-gray-500 text-xs">{showProfile ? '▲' : '▼'}</span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 right-0 w-72 rounded-2xl border border-white/10 bg-[#0f0f28]/95 backdrop-blur-xl shadow-2xl p-4 z-50"
                  >
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.08]">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-xl font-black shadow-lg">
                        {firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{profile?.full_name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{profile?.email}</p>
                        <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          Super Admin
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'যোগ দিয়েছেন', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('bn-BD') : 'N/A' },
                        { label: 'Status', value: '🟢 Active' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="text-gray-300 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/dashboard/admin/profile"
                      className="w-full block text-center py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-xs font-medium">
                      ⚙️ Profile Settings
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16 relative">

        {/* ── WELCOME BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative rounded-3xl overflow-hidden border border-red-500/15 p-6 md:p-8">
            {/* Banner BG */}
            <div className="absolute inset-0 bg-linear-to-br from-red-500/8 via-rose-500/5 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-red-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">{greeting} ☀️</p>
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  আস-সালামু আলাইকুম, {firstName} ভাই!
                </h1>
                <p className="text-gray-400 mt-2 text-sm">
                  Ononno Platform এর সম্পূর্ণ নিয়ন্ত্রণ আপনার হাতে 🚀
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-xl px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-semibold">System Online</span>
                </div>
                <p className="text-gray-500 text-xs">
                  {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8"
        >
          {[
            { label: 'মোট ব্যবহারকারী', value: stats.totalUsers, icon: '👥', linear: 'from-blue-500 to-cyan-400', href: '/dashboard/admin/users' },
            { label: 'মোট শিক্ষার্থী', value: stats.totalStudents, icon: '🎓', linear: 'from-emerald-500 to-teal-400', href: '/dashboard/admin/users' },
            { label: 'Free আবেদন', value: stats.freeRequests, icon: '🤲', linear: 'from-amber-500 to-orange-400', href: '/dashboard/admin/free-access', alert: stats.freeRequests > 0 },
            { label: 'মোট বিষয়', value: stats.totalSubjects, icon: '📚', linear: 'from-violet-500 to-purple-400', href: '/dashboard/admin/content' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
            >
              <Link href={stat.href}>
                <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-5 cursor-pointer transition-all duration-300 overflow-hidden group">
                  {stat.alert && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <div className={`absolute inset-0 bg-linear-to-br ${stat.linear} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.linear} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className={`text-3xl font-black bg-linear-to-r ${stat.linear} bg-clip-text text-transparent`}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 font-medium">{stat.label}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── TABS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-1.5 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1.5 w-fit"
        >
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'ai', label: '🧠 AI/ML' },
            { key: 'activity', label: '🕐 Activity' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link href={item.href} className="block h-full">
                      <div className={`h-full rounded-2xl border ${item.border} bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-xl ${item.shadow} p-5 transition-all duration-300 group cursor-pointer`}>
                        <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${item.linear} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                        <div className={`mt-4 text-xs font-semibold bg-linear-to-r ${item.linear} bg-clip-text text-transparent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                          যাও <span>→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI/ML */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* AI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'AI Response Rate', value: '98.7%', icon: '🤖', color: 'text-emerald-400' },
                  { label: 'Avg Response Time', value: '1.2s', icon: '⚡', color: 'text-amber-400' },
                  { label: 'Daily AI Queries', value: '2.4K', icon: '💬', color: 'text-blue-400' },
                  { label: 'Model Accuracy', value: '94.3%', icon: '🎯', color: 'text-violet-400' },
                ].map((m, i) => (
                  <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="text-2xl mb-3">{m.icon}</div>
                    <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* AI Models */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  🤖 <span>Active AI Models</span>
                </h3>
                <div className="space-y-3">
                  {aiModels.map((model, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${model.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{model.name}</p>
                        <p className="text-gray-500 text-xs">{model.sub}</p>
                      </div>
                      {model.active && (
                        <div className="w-28 shrink-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Usage</span>
                            <span className="text-gray-300">{model.usage}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all"
                              style={{ width: `${model.usage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${model.active
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/25'
                        }`}>
                        {model.active ? '✅ Active' : '🔜 Soon'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ML Roadmap */}
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  🚀 <span>ML Roadmap</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mlRoadmap.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                      <span className="text-2xl">{f.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">{f.title}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/20">
                            📋 Planned
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVITY */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    🕐 <span>সাম্প্রতিক ব্যবহারকারী</span>
                  </h2>
                  <Link href="/dashboard/admin/users"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    সব দেখো →
                  </Link>
                </div>

                {recentUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-5xl mb-3">👥</p>
                    <p className="text-gray-500 text-sm">এখনো কোনো ব্যবহারকারী নেই</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentUsers.map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-transparent hover:border-white/[0.08] transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${user.role === 'admin' ? 'bg-red-500/15 text-red-400 border-red-500/25'
                            : user.role === 'teacher' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                              : user.role === 'parent' ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
                                : 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                            }`}>
                            {user.role === 'admin' ? '⚙️ Admin'
                              : user.role === 'teacher' ? '👨‍🏫 Teacher'
                                : user.role === 'parent' ? '👨‍👩‍👧 Parent'
                                  : '🎓 Student'}
                          </span>
                          <p className="text-[11px] text-gray-600 mt-1">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('bn-BD') : ''}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}