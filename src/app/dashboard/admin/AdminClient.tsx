'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

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
  {
    title: 'ব্যবহারকারী',
    desc: 'সব user দেখো ও manage করো',
    icon: '👥',
    href: '/dashboard/admin/users',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/20',
    glow: 'hover:shadow-blue-500/20',
  },
  {
    title: 'কন্টেন্ট ম্যানেজমেন্ট',
    desc: 'Subjects ও lessons manage করো',
    icon: '📚',
    href: '/dashboard/admin/content',
    gradient: 'from-violet-500 to-purple-500',
    border: 'border-violet-500/20',
    glow: 'hover:shadow-violet-500/20',
  },
  {
    title: 'Free Access',
    desc: 'এতিম/দরিদ্র আবেদন যাচাই করো',
    icon: '🤲',
    href: '/dashboard/admin/free-access',
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-emerald-500/20',
  },
  {
    title: 'Subscription',
    desc: 'Payment ও subscription manage করো',
    icon: '💳',
    href: '/dashboard/admin/subscriptions',
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-500/20',
  },
  {
    title: 'AI/ML Analytics',
    desc: 'AI performance ও ML data দেখো',
    icon: '🧠',
    href: '/dashboard/admin/analytics',
    gradient: 'from-rose-500 to-pink-500',
    border: 'border-rose-500/20',
    glow: 'hover:shadow-rose-500/20',
  },
  {
    title: 'শিক্ষক ব্যবস্থাপনা',
    desc: 'Teacher list, approve ও assign করো',
    icon: '👨‍🏫',
    href: '/dashboard/admin/teachers',
    gradient: 'from-indigo-500 to-blue-500',
    border: 'border-indigo-500/20',
    glow: 'hover:shadow-indigo-500/20',
  },
  {
    title: 'Institution',
    desc: 'School/Madrasah partnership manage করো',
    icon: '🏫',
    href: '/dashboard/admin/institutions',
    gradient: 'from-teal-500 to-cyan-500',
    border: 'border-teal-500/20',
    glow: 'hover:shadow-teal-500/20',
  },
  {
    title: 'Notification',
    desc: 'সব user কে notification পাঠাও',
    icon: '🔔',
    href: '/dashboard/admin/notifications',
    gradient: 'from-yellow-500 to-amber-500',
    border: 'border-yellow-500/20',
    glow: 'hover:shadow-yellow-500/20',
  },
  {
    title: 'System Settings',
    desc: 'Platform settings ও configuration',
    icon: '⚙️',
    href: '/dashboard/admin/settings',
    gradient: 'from-gray-500 to-slate-500',
    border: 'border-gray-500/20',
    glow: 'hover:shadow-gray-500/20',
  },
]

const aiMetrics = [
  { label: 'AI Response Rate', value: '98.7%', icon: '🤖', color: 'text-emerald-400' },
  { label: 'Avg Response Time', value: '1.2s', icon: '⚡', color: 'text-amber-400' },
  { label: 'Daily AI Queries', value: '2.4K', icon: '💬', color: 'text-blue-400' },
  { label: 'Model Accuracy', value: '94.3%', icon: '🎯', color: 'text-violet-400' },
]

const quickActions = [
  { label: 'নতুন ঘোষণা', icon: '📢', href: '/dashboard/admin/notifications' },
  { label: 'Free Approve', icon: '✅', href: '/dashboard/admin/free-access' },
  { label: 'User যোগ', icon: '➕', href: '/dashboard/admin/users' },
  { label: 'Content যোগ', icon: '📝', href: '/dashboard/admin/content' },
]

export default function AdminClient({ profile, stats, recentUsers }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'activity'>('overview')

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div>
              <span className="font-bold text-white">Ononno</span>
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full ml-2">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="hidden md:flex gap-2">
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all flex items-center gap-1.5">
                  {a.icon} {a.label}
                </Link>
              ))}
            </div>

            {/* Profile Button */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-sm font-bold">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm text-white hidden md:block">{profile?.full_name}</span>
              <span className="text-gray-400 text-xs">{showProfile ? '▲' : '▼'}</span>
            </button>

            <LogoutButton />
          </div>
        </div>

        {/* Profile Dropdown */}
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-6 w-72 rounded-2xl border border-white/10 bg-[#0f0f2a] shadow-2xl p-4 z-50"
            >
              {/* Profile Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-bold text-white">{profile?.full_name}</p>
                  <p className="text-gray-400 text-xs">{profile?.email}</p>
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                    ⚙️ Super Admin
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'যোগ দিয়েছেন', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('bn-BD') : 'N/A' },
                  { label: 'Role', value: 'Admin' },
                  { label: 'Status', value: '🟢 Active' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/admin/profile"
                className="w-full block text-center py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all text-sm"
              >
                ⚙️ Profile Settings
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12">
        <motion.div variants={stagger} initial="initial" animate="animate">

          {/* Welcome Banner */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="rounded-3xl bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 border border-red-500/20 p-6 md:p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    আস-সালামু আলাইকুম, {profile?.full_name?.split(' ')[0]} ভাই! 👋
                  </h1>
                  <p className="text-gray-400 mt-1">Ononno Platform এর সম্পূর্ণ নিয়ন্ত্রণ আপনার হাতে</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 text-sm font-semibold">System Online</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'মোট ব্যবহারকারী', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-cyan-500' },
              { label: 'মোট শিক্ষার্থী', value: stats.totalStudents, icon: '🎓', color: 'from-emerald-500 to-teal-500' },
              { label: 'Free আবেদন', value: stats.freeRequests, icon: '🤲', color: 'from-amber-500 to-yellow-500', alert: stats.freeRequests > 0 },
              { label: 'মোট বিষয়', value: stats.totalSubjects, icon: '📚', color: 'from-violet-500 to-purple-500' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 relative overflow-hidden group hover:bg-white/10 transition-all"
              >
                {stat.alert && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 shadow-md`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: 'overview', label: '📊 Overview' },
              { key: 'ai', label: '🧠 AI/ML' },
              { key: 'activity', label: '🕐 Activity' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${activeTab === tab.key
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link href={item.href}>
                        <div className={`rounded-2xl border ${item.border} bg-white/5 hover:bg-white/10 hover:shadow-xl ${item.glow} p-5 transition-all duration-300 cursor-pointer h-full`}>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                            {item.icon}
                          </div>
                          <h3 className="font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                            যাও <span>→</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI/ML Tab */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* AI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {aiMetrics.map((m, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-2xl mb-2">{m.icon}</div>
                      <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* AI Models */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="font-bold text-white mb-4">🤖 Active AI Models</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'LLaMA 3.3 70B (Groq)', status: 'active', usage: '87%', type: 'AI Tutor' },
                      { name: 'Quran Analysis Model', status: 'active', usage: '23%', type: 'Islamic AI' },
                      { name: 'Career Path AI', status: 'active', usage: '45%', type: 'Career Guide' },
                      { name: 'Whisper (Tajweed)', status: 'coming', usage: '0%', type: 'Audio AI' },
                    ].map((model, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${model.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                          <div>
                            <p className="text-white text-sm font-semibold">{model.name}</p>
                            <p className="text-gray-500 text-xs">{model.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${model.status === 'active' ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {model.status === 'active' ? '✅ Active' : '🔜 Soon'}
                          </p>
                          <p className="text-xs text-gray-500">Usage: {model.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ML Roadmap */}
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
                  <h3 className="font-bold text-white mb-4">🚀 ML Roadmap</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { icon: '🎯', title: 'Personalized Learning', desc: 'Student এর দুর্বলতা খুঁজে বের করা', status: 'planned' },
                      { icon: '📊', title: 'Performance Prediction', desc: 'পরীক্ষার ফলাফল predict করা', status: 'planned' },
                      { icon: '🎙️', title: 'Tajweed AI (Whisper)', desc: 'কুরআন তিলাওয়াত check করা', status: 'in-progress' },
                      { icon: '💼', title: 'Job Match AI', desc: 'Skill অনুযায়ী job suggest', status: 'planned' },
                      { icon: '📈', title: 'Stock Market AI', desc: 'Halal investment guide', status: 'planned' },
                      { icon: '🧬', title: 'Adaptive Curriculum', desc: 'AI দিয়ে syllabus customize', status: 'planned' },
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                        <span className="text-xl">{f.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm">{f.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${f.status === 'in-progress'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-gray-500/20 text-gray-400'
                              }`}>
                              {f.status === 'in-progress' ? '🔨 চলছে' : '📋 Planned'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-white">সাম্প্রতিক ব্যবহারকারী</h2>
                    <Link href="/dashboard/admin/users" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      সব দেখো →
                    </Link>
                  </div>

                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="text-sm">এখনো কোনো ব্যবহারকারী নেই</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentUsers.map((user, i) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm">{user.full_name}</div>
                            <div className="text-xs text-gray-400 truncate">{user.email}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${user.role === 'admin'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : user.role === 'teacher'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : user.role === 'parent'
                                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }`}>
                              {user.role === 'admin' ? '⚙️ Admin' :
                                user.role === 'teacher' ? '👨‍🏫 Teacher' :
                                  user.role === 'parent' ? '👨‍👩‍👧 Parent' : '🎓 Student'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
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

        </motion.div>
      </div>
    </main>
  )
}