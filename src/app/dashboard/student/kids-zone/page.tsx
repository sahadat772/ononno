'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import AdBanner from '@/components/shared/AdBanner'

const kgZones = [
  {
    id: 'learn',
    name: 'শেখার জগৎ',
    icon: '📚',
    color: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    href: '/dashboard/student/kids-zone/learn',
    subjects: ['বাংলা বর্ণমালা', 'English ABC', 'সংখ্যা শিখি'],
    available: true,
  },
  {
    id: 'islamic',
    name: 'ইসলামিক জগৎ',
    icon: '🕌',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    href: '/dashboard/student/kids-zone/islamic',
    subjects: ['কালিমা', 'দোয়া', 'সূরা'],
    available: true,
  },
  {
    id: 'games',
    name: 'খেলার জগৎ',
    icon: '🎮',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    href: '/dashboard/student/kids-zone/games',
    subjects: ['Word Puzzle', 'Quiz Battle', 'Memory'],
    available: false,
  },
  {
    id: 'music',
    name: 'গানের জগৎ',
    icon: '🎵',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    href: '/dashboard/student/kids-zone/music',
    subjects: ['ছড়া', 'Nasheed', 'Rhymes'],
    available: false,
  },
]

const nurserySubjects = [
  {
    id: 'bangla',
    name: 'বাংলা বর্ণ',
    icon: 'অ',
    color: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    href: '/dashboard/student/kids-zone/nursery/bangla',
    units: 5,
    lessons: 54,
  },
  {
    id: 'english',
    name: 'English ABC',
    icon: 'A',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    href: '/dashboard/student/kids-zone/nursery/english',
    units: 5,
    lessons: 31,
  },
  {
    id: 'arabic',
    name: 'Arabic হরফ',
    icon: 'ا',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    href: '/dashboard/student/kids-zone/nursery/arabic',
    units: 5,
    lessons: 35,
  },
  {
    id: 'math',
    name: 'গণিত',
    icon: '১২৩',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    href: '/dashboard/student/kids-zone/nursery/math',
    units: 6,
    lessons: 50,
  },
]

const islamicLinks = [
  {
    href: '/dashboard/student/kids-zone/islamic/kalima',
    icon: '☝️',
    label: 'কালিমা',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    href: '/dashboard/student/kids-zone/islamic/dua',
    icon: '🤲',
    label: 'দোয়া',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  {
    href: '/dashboard/student/kids-zone/islamic/surah',
    icon: '📖',
    label: 'সূরা',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    href: '/dashboard/student/kids-zone/islamic/arabic',
    icon: '🔤',
    label: 'আরবি',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
]

export default function KidsZonePage() {
  const [activeLevel, setActiveLevel] = useState<'nursery' | 'kg'>('nursery')
  const { isPaid, canDoLesson, loading: accessLoading } = useAccess()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'সুপ্রভাত'
    if (hour < 17) return 'শুভ দুপুর'
    return 'শুভ বিকেল'
  })()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.08),transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-4xl p-4 md:p-6">
        <Link
          href="/dashboard/student"
          className="mb-4 inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
        >
          ← Dashboard
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 md:p-6"
        >
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-200">🌟 {greeting}!</p>
              <h1 className="mt-1 text-2xl font-black text-white md:text-3xl">Kids Zone</h1>
              <p className="mt-1 text-sm text-purple-100">খেলার ছলে শেখা — Nursery ও KG</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  Voice + Trace + Quiz
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  Islamic basics
                </span>
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="shrink-0 text-6xl md:text-7xl"
            >
              🧒
            </motion.div>
          </div>
        </motion.div>

        {!accessLoading && !isPaid && !canDoLesson && (
          <div className="mb-6">
            <LockOverlay type="daily_limit" />
          </div>
        )}

        {!accessLoading && !isPaid && <AdBanner position="top" className="mb-6" />}

        {/* Level tabs */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(
            [
              { key: 'nursery' as const, label: '🌱 Nursery', desc: 'শেখার শুরু' },
              { key: 'kg' as const, label: '⭐ KG', desc: 'আরো এগিয়ে' },
            ] as const
          ).map((level) => (
            <button
              key={level.key}
              type="button"
              onClick={() => setActiveLevel(level.key)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeLevel === level.key
                  ? 'border-violet-400/50 bg-violet-600/25 text-white shadow-lg shadow-violet-500/10'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="font-bold">{level.label}</div>
              <div className="mt-0.5 text-xs opacity-70">{level.desc}</div>
            </button>
          ))}
        </div>

        {activeLevel === 'nursery' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="mb-1 text-lg font-black text-white">কী শিখবে?</h2>
            <p className="mb-4 text-sm text-slate-400">Unit · Lesson · Quiz — ধাপে ধাপে</p>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {nurserySubjects.map((subject, i) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <Link href={subject.href}>
                    <div
                      className={`relative h-full overflow-hidden rounded-2xl border p-4 ${subject.border} ${subject.bg}`}
                    >
                      <div
                        className={`mb-3 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-lg font-black text-white shadow-md ${subject.color}`}
                      >
                        {subject.icon}
                      </div>
                      <h3 className="font-bold text-white">{subject.name}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {subject.units} Unit · {subject.lessons} Lesson
                      </p>
                      <p
                        className={`mt-3 bg-gradient-to-r bg-clip-text text-xs font-bold text-transparent ${subject.color}`}
                      >
                        শুরু করো →
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕌</span>
                <h3 className="font-bold text-white">ইসলামিক</h3>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  বাধ্যতামূলক
                </span>
              </div>
              <Link
                href="/dashboard/student/kids-zone/islamic"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                সব →
              </Link>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2">
              {islamicLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`rounded-2xl border p-3 text-center transition hover:bg-white/5 ${item.bg} ${item.border}`}
                  >
                    <div
                      className={`mx-auto mb-2 grid size-10 place-items-center rounded-xl bg-gradient-to-br text-lg shadow ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <p className="text-lg text-emerald-200">بِسْمِ اللَّهِ</p>
              <p className="mt-1 text-sm text-slate-400">পড়ো তোমার রবের নামে</p>
            </div>
          </motion.div>
        )}

        {activeLevel === 'kg' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="mb-1 text-lg font-black text-white">কোন জগতে যাবে?</h2>
            <p className="mb-4 text-sm text-slate-400">Grid · Flashcard · Game style</p>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {kgZones.map((zone, i) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={!zone.available ? 'opacity-55' : ''}
                >
                  {zone.available ? (
                    <Link href={zone.href}>
                      <KGZoneCard zone={zone} />
                    </Link>
                  ) : (
                    <KGZoneCard zone={zone} locked />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕌</span>
                <h3 className="font-bold text-white">ইসলামিক</h3>
              </div>
              <Link
                href="/dashboard/student/kids-zone/islamic"
                className="text-xs font-semibold text-emerald-400"
              >
                সব →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {islamicLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`rounded-2xl border p-3 text-center ${item.bg} ${item.border}`}
                  >
                    <div
                      className={`mx-auto mb-2 grid size-10 place-items-center rounded-xl bg-gradient-to-br text-lg ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য · Kids Zone · খেলো ও শেখো</p>
      </div>
    </div>
  )
}

function KGZoneCard({
  zone,
  locked,
}: {
  zone: (typeof kgZones)[0]
  locked?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${zone.border} ${zone.bg} ${
        locked ? '' : 'hover:bg-white/5'
      }`}
    >
      {locked && (
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-slate-300">
          🔒 শীঘ্রই
        </span>
      )}
      <div
        className={`mb-3 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-2xl shadow-md ${zone.color}`}
      >
        {zone.icon}
      </div>
      <h3 className="text-lg font-bold text-white">{zone.name}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {zone.subjects.map((s) => (
          <span key={s} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
            {s}
          </span>
        ))}
      </div>
      {!locked && (
        <p
          className={`mt-3 bg-gradient-to-r bg-clip-text text-sm font-bold text-transparent ${zone.color}`}
        >
          প্রবেশ করো →
        </p>
      )}
    </div>
  )
}
