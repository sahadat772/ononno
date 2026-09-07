'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type DailyTracker = {
  quran_ayahs_read: number
  duas_recited: number
  hadith_read: number
  tajweed_practiced: boolean
  memorization_done: boolean
  daily_streak: number
}

type Module = {
  id: string
  title: string
  description: string
  icon: string
  color: string
  href: string
  available: boolean
  badge: string | null
  isNew: boolean
  category: 'core' | 'ai' | 'study'
}

const islamicModules: Module[] = [
  {
    id: 'quran',
    title: 'কুরআন শরীফ',
    description: 'তিলাওয়াত, অর্থ ও আয়াত শোনা',
    icon: '📖',
    color: 'from-emerald-500 to-teal-500',
    href: '/dashboard/student/islamic/quran',
    available: true,
    badge: null,
    isNew: false,
    category: 'core',
  },
  {
    id: 'tajweed',
    title: 'Tajweed AI',
    description: 'তাজবিদ নিয়ম · AI practice',
    icon: '🎵',
    color: 'from-blue-500 to-indigo-500',
    href: '/dashboard/student/islamic/tajweed',
    available: true,
    badge: 'AI',
    isNew: true,
    category: 'ai',
  },
  {
    id: 'hifz',
    title: 'হিফজ Tracker',
    description: 'মুখস্থ + revision plan',
    icon: '📚',
    color: 'from-violet-500 to-purple-500',
    href: '/dashboard/student/islamic/memorization',
    available: true,
    badge: 'AI',
    isNew: true,
    category: 'ai',
  },
  {
    id: 'ustad',
    title: 'উস্তাদ AI',
    description: 'ইসলামিক প্রশ্নের উত্তর',
    icon: '🤖',
    color: 'from-teal-500 to-emerald-500',
    href: '/dashboard/student/islamic/chat',
    available: true,
    badge: 'AI',
    isNew: true,
    category: 'ai',
  },
  {
    id: 'hadith',
    title: 'হাদিস শরীফ',
    description: 'সহিহ হাদিস ও ব্যাখ্যা',
    icon: '📜',
    color: 'from-amber-500 to-yellow-500',
    href: '/dashboard/student/islamic/hadith',
    available: true,
    badge: null,
    isNew: false,
    category: 'study',
  },
  {
    id: 'dua',
    title: 'দোয়া সমূহ',
    description: 'দৈনন্দিন দোয়া শেখো',
    icon: '🤲',
    color: 'from-rose-500 to-pink-500',
    href: '/dashboard/student/islamic/dua',
    available: true,
    badge: null,
    isNew: false,
    category: 'core',
  },
  {
    id: 'fiqh',
    title: 'ফিকহ',
    description: 'নামাজ, রোজা ও বিধান',
    icon: '⚖️',
    color: 'from-cyan-500 to-sky-500',
    href: '/dashboard/student/islamic/fiqh',
    available: true,
    badge: null,
    isNew: false,
    category: 'study',
  },
  {
    id: 'tafsir',
    title: 'তাফসির',
    description: 'আয়াতের সহজ ব্যাখ্যা',
    icon: '🔍',
    color: 'from-orange-500 to-amber-500',
    href: '/dashboard/student/islamic/tafsir',
    available: true,
    badge: null,
    isNew: false,
    category: 'study',
  },
  {
    id: 'sirah',
    title: 'সিরাতুন নবী ﷺ',
    description: 'রাসূল ﷺ এর জীবনী',
    icon: '🌙',
    color: 'from-indigo-500 to-violet-500',
    href: '/dashboard/student/islamic/sirah',
    available: true,
    badge: null,
    isNew: false,
    category: 'study',
  },
  {
    id: 'progress',
    title: 'Weekly Report',
    description: 'সাপ্তাহিক অগ্রগতি দেখো',
    icon: '📊',
    color: 'from-slate-500 to-gray-600',
    href: '/dashboard/student/islamic/progress',
    available: true,
    badge: 'ML',
    isNew: true,
    category: 'ai',
  },
  {
    id: 'aqidah',
    title: 'আকিদা',
    description: 'ইমানের মূল বিষয়',
    icon: '☝️',
    color: 'from-cyan-500 to-sky-500',
    href: '#',
    available: false,
    badge: 'শীঘ্রই',
    isNew: false,
    category: 'study',
  },
  {
    id: 'history',
    title: 'ইসলামিক ইতিহাস',
    description: 'খুলাফা ও ইসলামের ইতিহাস',
    icon: '🏛️',
    color: 'from-teal-500 to-emerald-500',
    href: '#',
    available: false,
    badge: 'শীঘ্রই',
    isNew: false,
    category: 'study',
  },
]

const QUICK = [
  { href: '/dashboard/student/islamic/quran', icon: '📖', label: 'কুরআন', color: 'from-emerald-500 to-teal-600' },
  { href: '/dashboard/student/islamic/tajweed', icon: '🎵', label: 'Tajweed', color: 'from-blue-500 to-indigo-600' },
  { href: '/dashboard/student/islamic/memorization', icon: '📚', label: 'হিফজ', color: 'from-violet-500 to-purple-600' },
  { href: '/dashboard/student/islamic/chat', icon: '🤖', label: 'উস্তাদ', color: 'from-teal-500 to-emerald-600' },
]

const STATS = [
  { label: 'সূরা', value: '১১৪', icon: '📖' },
  { label: 'হাদিস', value: '৬+', icon: '📜' },
  { label: 'দোয়া', value: '৫০+', icon: '🤲' },
  { label: 'AI টুল', value: '৬টি', icon: '🤖' },
]

export default function IslamicPage() {
  const [tracker, setTracker] = useState<DailyTracker | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'core' | 'study'>('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || cancelled) return

        const today = new Date().toISOString().split('T')[0]

        const [{ data: trackerData }, { data: dueData }] = await Promise.all([
          supabase
            .from('daily_islamic_tracker')
            .select('*')
            .eq('student_id', user.id)
            .eq('date', today)
            .maybeSingle(),
          supabase
            .from('quran_memorization')
            .select('id')
            .eq('student_id', user.id)
            .lte('next_revision_at', new Date().toISOString()),
        ])

        if (!cancelled) {
          setTracker(trackerData)
          setDueCount(dueData?.length || 0)
        }
      } catch {
        // tables may not exist — UI still works
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return islamicModules.filter((m) => {
      if (activeFilter === 'ai') return m.category === 'ai'
      if (activeFilter === 'core') return m.category === 'core'
      if (activeFilter === 'study') return m.category === 'study'
      return true
    })
  }, [activeFilter])

  return (
    <div className="min-h-screen bg-[#070f0c] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.08),transparent_45%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070f0c]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard/student"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-gray-300 hover:text-white"
          >
            ←
          </Link>
          <div className="text-center">
            <p className="text-sm font-bold">🕌 ইসলামিক হাব</p>
            <p className="text-[10px] text-emerald-400">কুরআন · হাদিস · AI শিক্ষা</p>
          </div>
          <Link
            href="/dashboard/student/islamic/progress"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300"
          >
            📊
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-5 pb-12 md:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5 p-5 md:p-7"
        >
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl shadow-lg shadow-emerald-500/25 md:size-16 md:text-4xl">
              🕌
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-white md:text-3xl">ইসলামিক স্টাডি</h1>
              <p className="mt-1 text-sm text-emerald-100/80">
                বسم الله দিয়ে শুরু করো — আজকের পড়া বেছে নাও
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-black/20 px-4 py-4 text-center">
            <p className="text-xl leading-loose text-emerald-200 md:text-2xl" dir="rtl">
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            </p>
            <p className="mt-2 text-xs text-gray-400 md:text-sm">
              পড়ো তোমার রবের নামে যিনি সৃষ্টি করেছেন — সূরা আলাক: ১
            </p>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 px-1 py-2.5 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-sm font-bold text-emerald-400 md:text-base">{s.value}</div>
                <div className="text-[10px] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">দ্রুত শুরু</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map((q) => (
              <Link key={q.href} href={q.href}>
                <div className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:border-emerald-500/30 hover:bg-white/10 active:scale-95">
                  <div
                    className={`mb-1.5 grid size-11 place-items-center rounded-xl bg-gradient-to-br text-lg shadow-md ${q.color}`}
                  >
                    {q.icon}
                  </div>
                  <span className="text-center text-[11px] font-bold text-white">{q.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Daily tracker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-emerald-300">📅 আজকের অগ্রগতি</p>
            <div className="flex items-center gap-2">
              {dueCount > 0 && (
                <Link href="/dashboard/student/islamic/memorization">
                  <span className="animate-pulse rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                    📚 {dueCount} revision
                  </span>
                </Link>
              )}
              <Link
                href="/dashboard/student/islamic/progress"
                className="text-[11px] text-gray-400 hover:text-emerald-300"
              >
                Weekly →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[{
              icon: '📖',
              label: 'আয়াত',
              value: tracker?.quran_ayahs_read || 0,
              done: (tracker?.quran_ayahs_read || 0) > 0,
            },
            {
              icon: '🤲',
              label: 'দোয়া',
              value: tracker?.duas_recited || 0,
              done: (tracker?.duas_recited || 0) > 0,
            },
            {
              icon: '📜',
              label: 'হাদিস',
              value: tracker?.hadith_read || 0,
              done: (tracker?.hadith_read || 0) > 0,
            },
            {
              icon: '🎵',
              label: 'Tajweed',
              value: tracker?.tajweed_practiced ? '✅' : '—',
              done: !!tracker?.tajweed_practiced,
            }].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-2 text-center ${
                  item.done
                    ? 'border border-emerald-500/30 bg-emerald-500/15'
                    : 'border border-white/10 bg-white/5'
                }`}
              >
                <p className="text-base">{item.icon}</p>
                <p className={`text-sm font-bold ${item.done ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
          {(tracker?.daily_streak || 0) > 0 && (
            <p className="mt-2 text-center text-xs text-orange-300">
              🔥 {tracker?.daily_streak} দিনের streak!
            </p>
          )}
        </motion.div>

        {/* Ustaz banner */}
        <Link href="/dashboard/student/islamic/chat" className="mb-6 block">
          <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/15 to-purple-500/10 p-4 transition hover:border-violet-400/50">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl">
              🤖
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white">উস্তাদ AI</p>
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400">Online</span>
              </div>
              <p className="text-xs text-gray-400">কুরআন ও হাদিসের আলোকে প্রশ্ন করো</p>
            </div>
            <span className="text-violet-300">→</span>
          </div>
        </Link>

        {/* Filters + modules */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-white">📚 সব বিভাগ</h2>
          <div className="flex gap-1 rounded-xl bg-white/5 p-1">
            {(
              [
                { key: 'all' as const, label: 'সব' },
                { key: 'core' as const, label: 'মূল' },
                { key: 'ai' as const, label: 'AI' },
                { key: 'study' as const, label: 'পড়া' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeFilter === f.key
                    ? 'bg-emerald-500/25 text-emerald-200'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((module, i) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {module.available ? (
                  <Link href={module.href}>
                    <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-500/35 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-emerald-500/10">
                      <ModuleCard module={module} />
                    </div>
                  </Link>
                ) : (
                  <div className="h-full cursor-not-allowed rounded-2xl border border-white/5 bg-white/[0.02] p-4 opacity-55">
                    <ModuleCard module={module} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Inspiration */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-5 text-center">
          <p className="mb-1 text-sm text-amber-300">💡 আজকের অনুপ্রেরণা</p>
          <p className="text-lg leading-loose text-white md:text-xl" dir="rtl">
            طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
          </p>
          <p className="mt-2 text-xs text-gray-400">
            জ্ঞান অর্জন প্রতিটি মুসলিমের উপর ফরজ — ইবনে মাজাহ
          </p>
        </div>
      </div>
    </div>
  )
}

function ModuleCard({ module }: { module: Module }) {
  return (
    <>
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl shadow-md ${module.color}`}
        >
          {module.icon}
        </div>
        <div className="flex gap-1">
          {module.isNew && (
            <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
              নতুন
            </span>
          )}
          {module.badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                module.badge === 'শীঘ্রই'
                  ? 'bg-gray-500/20 text-gray-400'
                  : module.badge === 'AI'
                    ? 'border border-violet-500/30 bg-violet-500/15 text-violet-300'
                    : 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
              }`}
            >
              {module.badge}
            </span>
          )}
        </div>
      </div>
      <h3 className="mb-1 text-base font-bold text-white group-hover:text-emerald-300">{module.title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{module.description}</p>
      {module.available ? (
        <p className="mt-3 text-sm font-semibold text-emerald-400">শুরু করো →</p>
      ) : (
        <p className="mt-3 text-xs text-gray-500">শীঘ্রই আসছে</p>
      )}
    </>
  )
}
