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
  const [realStats, setRealStats] = useState({ stars: 0, lessons: 0, streak: 0 })
  const [showReward, setShowReward] = useState(false)
  const classLevel = studentProfile?.class_level || 'nursery'
  const className = classNames[classLevel] || 'নার্সারি'
  const firstName = profile?.full_name?.split(' ')[0] || 'বন্ধু'
  const academicHref = `/dashboard/student/academic/learn/${String(classLevel).replace(/_/g, '-')}`

  useEffect(() => {
    const timer = setTimeout(() => setShowReward(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/student/daily-path', { cache: 'no-store' })
        const d = await res.json()
        if (res.ok && d) {
          setRealStats({
            stars: Number(d.total_xp) || 0,
            lessons: Number(d.lessons_completed_today) || 0,
            streak: Math.max(0, Number(d.streak_days) || 0),
          })
          return
        }
      } catch (e) {
        console.error(e)
      }
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('learning_progress')
          .select('status, xp_earned, completed_at, updated_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')
        if (data) {
          const daySet = new Set<string>()
          for (const r of data) {
            const dt = String(r.completed_at || r.updated_at || '').slice(0, 10)
            if (dt) daySet.add(dt)
          }
          let streak = 0
          const cursor = new Date()
          for (let i = 0; i < 60; i++) {
            const key = cursor.toISOString().slice(0, 10)
            if (daySet.has(key)) {
              streak++
              cursor.setUTCDate(cursor.getUTCDate() - 1)
            } else if (i === 0) {
              cursor.setUTCDate(cursor.getUTCDate() - 1)
              continue
            } else break
          }
          setRealStats({
            stars: data.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0),
            lessons: data.length,
            streak,
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
      border: 'border-sky-400/25',
      glow: 'shadow-sky-500/20',
    },
    {
      href: '/dashboard/student/kids-zone',
      emoji: '🎮',
      title: 'Kids Zone',
      desc: 'খেলার ছলে শেখা',
      gradient: 'from-fuchsia-500 to-pink-600',
      border: 'border-fuchsia-400/25',
      glow: 'shadow-fuchsia-500/20',
    },
    {
      href: '/dashboard/student/islamic',
      emoji: '🕌',
      title: 'ইসলামিক হাব',
      desc: 'কুরআন, দোয়া, নামাজ',
      gradient: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-400/25',
      glow: 'shadow-emerald-500/20',
    },
    {
      href: '/dashboard/student/ai-tutor',
      emoji: '🤖',
      title: 'AI শিক্ষক',
      desc: 'যেকোনো প্রশ্ন করো',
      gradient: 'from-violet-500 to-purple-600',
      border: 'border-violet-400/25',
      glow: 'shadow-violet-500/20',
    },
  ]

  const islamicQuick = [
    {
      href: '/dashboard/student/islamic/quran',
      emoji: '📖',
      title: 'কুরআন',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      href: '/dashboard/student/islamic/dua',
      emoji: '🤲',
      title: 'দোয়া',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      href: '/dashboard/student/islamic/fiqh',
      emoji: '🕌',
      title: 'নামাজ',
      color: 'from-purple-500 to-violet-600',
    },
    {
      href: '/dashboard/student/islamic/chat',
      emoji: '🤖',
      title: 'উস্তাদ AI',
      color: 'from-cyan-500 to-sky-600',
    },
  ]

  return (
    <div className="space-y-5 pb-4">
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
            onClick={() => setShowReward(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl border border-orange-400/30 bg-[#1a1020] p-7 text-center shadow-[0_0_48px_-8px_rgba(249,115,22,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-4xl shadow-lg shadow-orange-500/30">
                🌟
              </div>
              <h2 className="mb-1.5 text-xl font-black text-white">শাবাশ {firstName}!</h2>
              <p className="mb-5 text-sm text-slate-300">
                আজ একটু পড়া শুরু করো — তুমি পারবে!
              </p>
              <button
                type="button"
                onClick={() => setShowReward(false)}
                className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-sm font-black text-white shadow-lg shadow-orange-500/30"
              >
                শুরু করি! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini stats strip — sits under main Path/Report */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'XP', value: realStats.stars, icon: '⭐', tone: 'text-amber-300' },
          { label: 'আজ', value: realStats.lessons, icon: '📖', tone: 'text-sky-300' },
          { label: 'Streak', value: realStats.streak, icon: '🔥', tone: 'text-orange-300' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/8 bg-white/[0.04] px-2 py-3 text-center backdrop-blur-sm"
          >
            <div className="text-lg">{s.icon}</div>
            <div className={`text-base font-black ${s.tone}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-white">
          <span>✨</span> আজ কী শিখবে?
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {studyCards.map((c, i) => (
            <motion.div
              key={c.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={c.href} className="block">
                <div
                  className={`relative overflow-hidden rounded-3xl border ${c.border} bg-[#0e0e1a] p-4 shadow-lg ${c.glow} transition hover:brightness-110 active:scale-[0.99]`}
                >
                  <div
                    className={`mb-3 grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${c.gradient} text-2xl shadow-md`}
                  >
                    {c.emoji}
                  </div>
                  <h3 className="text-base font-black text-white">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{c.desc}</p>
                  <p
                    className={`mt-2 text-xs font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}
                  >
                    খুলো →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-white">
          <span>🕌</span> ইসলামিক — দ্রুত লিংক
        </h2>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {islamicQuick.map((c) => (
            <Link key={c.href} href={c.href}>
              <div className="h-full rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 transition hover:bg-white/[0.07]">
                <div
                  className={`mb-2 grid size-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-xl`}
                >
                  {c.emoji}
                </div>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/dashboard/student/learning-path" className="block">
        <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4 transition hover:bg-violet-500/15">
          <p className="text-sm font-bold text-violet-100">📅 আজকের Plan</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Learning path দেখে ধাপে ধাপে এগোও
          </p>
        </div>
      </Link>

      <p className="pt-2 text-center text-[11px] text-slate-600">
        প্রতিদিন একটু শিখলেই এগোবে — অনন্য 💚
      </p>
    </div>
  )
}
