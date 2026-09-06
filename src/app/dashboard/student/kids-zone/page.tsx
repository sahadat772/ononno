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
    subjects: ['বাংলা', 'English', 'সংখ্যা'],
    available: true,
  },
  {
    id: 'islamic',
    name: 'ইসলামিক',
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
    subjects: ['Puzzle', 'Quiz'],
    available: false,
  },
  {
    id: 'music',
    name: 'গান',
    icon: '🎵',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    href: '/dashboard/student/kids-zone/music',
    subjects: ['ছড়া', 'Rhymes'],
    available: false,
  },
]

const nurserySubjects = [
  {
    id: 'bangla',
    name: 'বাংলা',
    icon: 'অ',
    color: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    href: '/dashboard/student/kids-zone/nursery/bangla',
  },
  {
    id: 'english',
    name: 'English',
    icon: 'A',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    href: '/dashboard/student/kids-zone/nursery/english',
  },
  {
    id: 'arabic',
    name: 'আরবি',
    icon: 'ا',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    href: '/dashboard/student/kids-zone/nursery/arabic',
  },
  {
    id: 'math',
    name: 'গণিত',
    icon: '১',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    href: '/dashboard/student/kids-zone/nursery/math',
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

      {/* K1 sticky child bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard/student"
            className="flex min-h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white active:scale-95"
          >
            ← Dashboard
          </Link>
          <p className="text-center text-base font-black">🧒 Kids Zone</p>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-sm font-bold text-amber-300">
            ⭐
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-200">🌟 {greeting}!</p>
              <h1 className="mt-1 text-2xl font-black text-white">খেলো ও শেখো</h1>
              <p className="mt-1 text-sm text-purple-100">বড় বোতাম চাপো — সহজে শেখা</p>
            </div>
            <div className="text-6xl">🧒</div>
          </div>
        </motion.div>

        {!accessLoading && !isPaid && !canDoLesson && (
          <div className="mb-6">
            <LockOverlay type="daily_limit" />
          </div>
        )}
        {!accessLoading && !isPaid && <AdBanner position="top" className="mb-6" />}

        <div className="mb-6 grid grid-cols-2 gap-3">
          {(
            [
              { key: 'nursery' as const, label: '🌱 Nursery', desc: 'অ আ ই · ABC' },
              { key: 'kg' as const, label: '⭐ KG', desc: 'আরো খেলা' },
            ] as const
          ).map((level) => (
            <button
              key={level.key}
              type="button"
              onClick={() => setActiveLevel(level.key)}
              className={`min-h-[72px] rounded-3xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                activeLevel === level.key
                  ? 'border-violet-400/50 bg-violet-600/30 text-white'
                  : 'border-white/10 bg-white/5 text-slate-400'
              }`}
            >
              <div className="text-lg font-black">{level.label}</div>
              <div className="text-xs opacity-80">{level.desc}</div>
            </button>
          ))}
        </div>

        {activeLevel === 'nursery' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 text-center text-sm font-bold text-slate-300">কী শিখবে?</p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {nurserySubjects.map((subject) => (
                <Link key={subject.id} href={subject.href}>
                  <div
                    className={`flex min-h-[130px] flex-col items-center justify-center rounded-3xl border p-4 text-center transition active:scale-[0.98] ${subject.border} ${subject.bg}`}
                  >
                    <div
                      className={`mb-2 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-md ${subject.color}`}
                    >
                      {subject.icon}
                    </div>
                    <p className="text-base font-black text-white">{subject.name}</p>
                    <p className="mt-1 text-xs text-slate-400">শুরু →</p>
                  </div>
                </Link>
              ))}
            </div>

            <p className="mb-2 text-center text-sm font-bold text-slate-300">🕌 ইসলামিক</p>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {islamicLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex min-h-[88px] flex-col items-center justify-center rounded-2xl border p-2 ${item.bg} ${item.border}`}
                  >
                    <div
                      className={`mb-1 grid size-11 place-items-center rounded-xl bg-gradient-to-br text-lg ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <p className="text-[11px] font-bold text-white">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {activeLevel === 'kg' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 text-center text-sm font-bold text-slate-300">কোন জগৎ?</p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {kgZones.map((zone) =>
                zone.available ? (
                  <Link key={zone.id} href={zone.href}>
                    <KGZoneCard zone={zone} />
                  </Link>
                ) : (
                  <div key={zone.id} className="opacity-50">
                    <KGZoneCard zone={zone} locked />
                  </div>
                ),
              )}
            </div>
          </motion.div>
        )}

        <p className="mt-8 text-center text-xs text-slate-600">অনন্য · Kids Zone</p>
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
      className={`flex min-h-[130px] flex-col items-center justify-center rounded-3xl border p-4 text-center ${zone.border} ${zone.bg}`}
    >
      {locked && <span className="mb-1 text-[10px] text-slate-400">🔒 শীঘ্রই</span>}
      <div
        className={`mb-2 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${zone.color}`}
      >
        {zone.icon}
      </div>
      <p className="font-black text-white">{zone.name}</p>
    </div>
  )
}
