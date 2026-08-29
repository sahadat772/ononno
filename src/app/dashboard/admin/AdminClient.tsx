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
  }
  recentUsers: Record<string, string>[]
}

const menuItems = [
  { title: 'ব্যবহারকারী', desc: 'সব user দেখো ও manage করো', icon: '👥', href: '/dashboard/admin/users', linear: 'from-blue-500 to-cyan-400', border: 'border-blue-500/25', shadow: 'hover:shadow-blue-500/10' },
  { title: 'কারিকুলাম', desc: 'PDF import, class, subject, lesson manage', icon: '📚', href: '/dashboard/admin/curriculum', linear: 'from-violet-500 to-purple-400', border: 'border-violet-500/25', shadow: 'hover:shadow-violet-500/10' },
  { title: 'Free Access', desc: 'এতিম ও দরিদ্র আবেদন যাচাই', icon: '🤲', href: '/dashboard/admin/free-access', linear: 'from-emerald-500 to-teal-400', border: 'border-emerald-500/25', shadow: 'hover:shadow-emerald-500/10' },
  { title: 'Subscription', desc: 'Payment ও subscription manage', icon: '💳', href: '/dashboard/admin/subscriptions', linear: 'from-amber-500 to-orange-400', border: 'border-amber-500/25', shadow: 'hover:shadow-amber-500/10' },
  { title: 'ঘোষণা', desc: 'সব users কে ঘোষণা পাঠাও', icon: '📢', href: '/dashboard/admin/announcements', linear: 'from-rose-500 to-pink-400', border: 'border-rose-500/25', shadow: 'hover:shadow-rose-500/10' },
  { title: 'AI/ML Analytics', desc: 'AI performance ও ML data দেখো', icon: '🧠', href: '/dashboard/admin/analytics', linear: 'from-indigo-500 to-blue-400', border: 'border-indigo-500/25', shadow: 'hover:shadow-indigo-500/10' },
  { title: 'শিক্ষক ব্যবস্থাপনা', desc: 'Teacher approve ও assign করো', icon: '👨‍🏫', href: '/dashboard/admin/teachers', linear: 'from-teal-500 to-cyan-400', border: 'border-teal-500/25', shadow: 'hover:shadow-teal-500/10' },
  { title: 'System Settings', desc: 'Platform settings ও configuration', icon: '⚙️', href: '/dashboard/admin/settings', linear: 'from-slate-500 to-gray-400', border: 'border-slate-500/25', shadow: 'hover:shadow-slate-500/10' },
]
