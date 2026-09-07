'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Props {
  profile: Record<string, string> | null
  studentProfile: Record<string, string> | null
}

const classNames: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'প্রথম শ্রেণী',
  class_2: 'দ্বিতীয় শ্রেণী',
}

export default function NurseryDashboard({ profile, studentProfile }: Props) {
  const [realStats, setRealStats] = useState({ stars: 0, lessons: 0, streak: 1 })
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')
  const [showReward, setShowReward] = useState(false)
  const classLevel = studentProfile?.class_level || 'nursery'
  const className = classNames[classLevel] || 'নার্সারি'
  const firstName = profile?.full_name?.split(' ')[0] || 'বন্ধু'
  const academicHref = `/dashboard/student/academic/learn/${String(classLevel).replace(/_/g, '-')}`

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      setCurrentTime(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }))
      if (hours < 12) setGreeting('সুপ্রভাত')
      else if (hours < 17) setGreeting('শুভ দুপুর')
      else setGreeting('শুভ সন্ধ্যা')
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowReward(true), 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('learning_progress')
          .select('status, xp_earned')
          .eq('user_id', user.id)
          .eq('status', 'completed')
        if (data) {
          setRealStats({
            stars: data.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0),
            lessons: data.length,
            streak: Math.max(1, Math.min(data.length, 7)),
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    void loadStats()
  }, [])

  const studyCards = [
    {
      href: academicHref,
      emoji: '📚',
      title: 'NCTB পড়া',
      desc: `${className} — আজকের পাঠ`,
      gradient: 'from-sky-500 to-blue-600',
    },
    {
      href: '/dashboard/student/kids-zone',
      emoji: '🎮',
      title: 'Kids Zone',
      desc: 'খেলার ছলে শেখা',
      gradient: 'from-fuchsia-500 to-pink-600',
    },
    {
      href: '/dashboard/student/islamic',
      emoji: '🕌',
      title: 'ইসলামিক হাব',
      desc: 'কুরআন, দোয়া, নামাজ',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      href: '/dashboard/student/ai-tutor',
      emoji: '🤖',
      title: 'AI শিক্ষক',
      desc: 'যেকোনো প্রশ্ন করো',
      gradient: 'from-violet-500 to-purple-600',
    },
  ]

  const islamicQuick = [
    { href: '/dashboard/student/islamic/quran', emoji: '📖', title: 'কুরআন', color: 'from-emerald-500 to-teal-600' },
    { href: '/dashboard/student/islamic/dua', emoji: '🤲', title: 'দোয়া', color: 'from-blue-500 to-indigo-600' },
    { href: '/dashboard/student/islamic/fiqh', emoji: '🕌', title: 'নামাজ', color: 'from-purple-500 to-violet-600' },
    { href: '/dashboard/student/islamic/chat', emoji: '🤖', title: 'উস্তাদ AI', color: 'from-cyan-500 to-sky-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0d1525] to-[#0a0a1a] px-4 pb-10 pt-2 md:px-6">
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowReward(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 text-6xl">🌟</div>
              <h2 className="mb-2 text-2xl font-bold text-white">শাবাশ {firstName}!</h2>
              <p className="mb-5 text-amber-50">আজ একটু পড়া শুরু করো — তুমি পারবে!</p>
              <button
                type="button"
                onClick={() => setShowReward(false)}
                className="rounded-2xl bg-white px-8 py-3 text-lg font-bold text-orange-500"
              >
                শুরু করি! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 md:p-6">
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-white/80">
                👋 {greeting} · {currentTime}
              </p>
              <h1 className="mt-1 text-2xl font-black text-white md:text-3xl">{firstName} বন্ধু!</h1>
              <span className="mt-2 inline-flex rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                🏫 {className}
              </span>
            </div>
            <div className="text-5xl">🧒</div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'তারা', value: realStats.stars, icon: '⭐' },
              { label: 'পাঠ', value: realStats.lessons, icon: '📖' },
              { label: 'Streak', value: realStats.streak, icon: '🔥' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/15 px-2 py-2.5 text-center backdrop-blur-sm">
                <div className="text-lg">{s.icon}</div>
                <div className="text-base font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
        <span>✨</span> আজ কী শিখবে?
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {studyCards.map((c, i) => (
          <motion.div key={c.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link href={c.href} className="block">
              <div
                className={`rounded-2xl bg-gradient-to-br ${c.gradient} p-5 shadow-lg transition hover:scale-[1.02] active:scale-[0.99]`}
              >
                <div className="text-3xl">{c.emoji}</div>
                <h3 className="mt-2 text-lg font-bold text-white">{c.title}</h3>
                <p className="text-sm text-white/85">{c.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
        <span>🕌</span> ইসলামিক — দ্রুত লিংক
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {islamicQuick.map((c) => (
          <Link key={c.href} href={c.href}>
            <div className={`h-full rounded-2xl bg-gradient-to-br ${c.color} p-4 transition hover:brightness-110`}>
              <div className="text-2xl">{c.emoji}</div>
              <h3 className="mt-2 font-bold text-white">{c.title}</h3>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/dashboard/student/learning-path" className="mb-4 block">
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 transition hover:bg-violet-500/15">
          <p className="text-sm font-semibold text-violet-200">📅 আজকের Plan</p>
          <p className="text-xs text-slate-400">Learning path দেখে ধাপে ধাপে এগোও</p>
        </div>
      </Link>

      <p className="mt-6 text-center text-xs text-slate-500">প্রতিদিন একটু শিখলেই এগোবে — অনন্য 💚</p>
    </div>
  )
}
