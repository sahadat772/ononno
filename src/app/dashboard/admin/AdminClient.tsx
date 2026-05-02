'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
import AnimatedCard from '@/components/ui/AnimatedCard'

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

export default function AdminClient({ profile, stats, recentUsers }: Props) {
  const menuItems = [
    {
      title: 'ব্যবহারকারী',
      desc: 'সব user দেখো ও manage করো',
      icon: '👥',
      href: '/dashboard/admin/users',
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'from-blue-50 to-cyan-50',
      shadow: 'shadow-blue-200',
      count: stats.totalUsers,
    },
    {
      title: 'কন্টেন্ট',
      desc: 'Subjects ও lessons manage করো',
      icon: '📚',
      href: '/dashboard/admin/content',
      gradient: 'from-purple-500 to-violet-600',
      bg: 'from-purple-50 to-violet-50',
      shadow: 'shadow-purple-200',
      count: stats.totalSubjects,
    },
    {
      title: 'Free Access',
      desc: 'এতিম/দরিদ্র আবেদন যাচাই করো',
      icon: '🤲',
      href: '/dashboard/admin/free-access',
      gradient: 'from-green-500 to-emerald-600',
      bg: 'from-green-50 to-emerald-50',
      shadow: 'shadow-green-200',
      count: stats.freeRequests,
      badge: stats.freeRequests > 0 ? 'pending' : null,
    },
    {
      title: 'Subscription',
      desc: 'Payment ও subscription manage করো',
      icon: '💳',
      href: '/dashboard/admin/subscriptions',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50 to-orange-50',
      shadow: 'shadow-amber-200',
      count: 0,
    },
    {
      title: 'AI Analytics',
      desc: 'ML data ও AI performance দেখো',
      icon: '🧠',
      href: '/dashboard/admin/analytics',
      gradient: 'from-rose-500 to-pink-600',
      bg: 'from-rose-50 to-pink-50',
      shadow: 'shadow-rose-200',
      count: 0,
    },
    {
      title: 'Institution',
      desc: 'School/Madrasah partnership manage করো',
      icon: '🏫',
      href: '/dashboard/admin/institutions',
      gradient: 'from-teal-500 to-cyan-600',
      bg: 'from-teal-50 to-cyan-50',
      shadow: 'shadow-teal-200',
      count: 0,
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-gradient-primary">Ononno Admin</div>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">{profile?.full_name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <motion.div variants={stagger} initial="initial" animate="animate">

          {/* Welcome */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Dashboard 👋
            </h1>
            <p className="text-gray-500 mt-1">Ononno platform এর সম্পূর্ণ নিয়ন্ত্রণ</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'মোট ব্যবহারকারী', value: stats.totalUsers, icon: '👥', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
              { label: 'মোট শিক্ষার্থী', value: stats.totalStudents, icon: '🎓', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50' },
              { label: 'Free আবেদন', value: stats.freeRequests, icon: '🤲', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50' },
              { label: 'মোট বিষয়', value: stats.totalSubjects, icon: '📚', gradient: 'from-purple-500 to-violet-500', bg: 'from-purple-50 to-violet-50' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 border border-white shadow-sm`}
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-xl mb-3 shadow-md`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Menu */}
          <motion.div variants={fadeUp} className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4">ব্যবস্থাপনা</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={item.href}>
                    <div className={`bg-gradient-to-br ${item.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all cursor-pointer`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg ${item.shadow}`}>
                          {item.icon}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{item.count}</div>
                          {item.badge && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              pending
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent users */}
          <AnimatedCard delay={0.3} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">সাম্প্রতিক ব্যবহারকারী</h2>
              <Link href="/dashboard/admin/users" className="text-sm text-green-700 hover:underline">
                সব দেখো →
              </Link>
            </div>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
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
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{user.full_name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'student' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatedCard>

        </motion.div>
      </div>
    </main>
  )
}