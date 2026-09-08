'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import AdBanner from '@/components/shared/AdBanner'

const nurserySubjects = [
  {
    id: 'bangla',
    name: 'বাংলা',
    subtitle: 'অ আ ই · বর্ণমালা',
    icon: 'অ',
    emoji: '📗',
    color: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-400/40',
    href: '/dashboard/student/kids-zone/nursery/bangla',
  },
  {
    id: 'english',
    name: 'English',
    subtitle: 'ABC · Words',
    icon: 'A',
    emoji: '📘',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-400/40',
    href: '/dashboard/student/kids-zone/nursery/english',
  },
  {
    id: 'arabic',
    name: 'আরবি',
    subtitle: 'ا ب ت · হরফ',
    icon: 'ا',
    emoji: '🕌',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/40',
    href: '/dashboard/student/kids-zone/nursery/arabic',
  },
  {
    id: 'math',
    name: 'গণিত',
    subtitle: '১ ২ ৩ · গুনতি',
    icon: '১',
    emoji: '🔢',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/40',
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
    href: '/dashboard/student/kids-zone/islamic',
    icon: '🕌',
    label: 'সব',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
]

const kgZones = [
  {
    id: 'learn',
    name: 'শেখার জগৎ',
    icon: '📚',
    desc: 'বাংলা · English · সংখ্যা',
    color: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    href: '/dashboard/student/kids-zone/learn',
    available: true,
  },
  {
    id: 'islamic',
    name: 'ইসলামিক',
    icon: '🕌',
    desc: 'কালিমা · দোয়া · সূরা',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    href: '/dashboard/student/kids-zone/islamic',
    available: true,
  },
  {
    id: 'games',
    name: 'খেলার জগৎ',
    icon: '🎮',
    desc: 'মজার quiz · মিল খেলো',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    href: '/dashboard/student/kids-zone/games',
    available: true,
  },
  {
    id: 'music',
    name: 'গান ও ছড়া',
    icon: '🎵',
    desc: 'বাংলা ছড়া · ইসলামিক',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    href: '/dashboard/student/kids-zone/music',
    available: true,
  },
]

export default function KidsZonePage() {
  const [activeLevel, setActiveLevel] = useState<'nursery' | 'kg'>('nursery')
  const { isPaid, canDoLesson, loading: accessLoading } = useAccess()

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'সুপ্রভাত'
    if (hour < 17) return 'শুভ দুপুর'
    return 'শুভ সন্ধ্যা'
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07071a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(251,191,36,0.08),transparent_40%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07071a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard/student"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg font-bold text-white active:scale-95"
          >
            ←
          </Link>
          <div className="text-center">
            <p className="text-base font-black tracking-tight">🧒 Kids Zone</p>
            <p className="text-[10px] font-semibold text-violet-300">খেলো · শেখো · মজা করো</p>
          </div>
          <span className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-lg">
            ⭐
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 p-5 shadow-xl shadow-violet-900/30"
        >
          <div className="absolute -right-4 -top-4 text-7xl opacity-20">🎈</div>
          <div className="absolute bottom-2 right-6 text-4xl opacity-30">🌈</div>
          <div className="relative">
            <p className="text-sm font-bold text-amber-200">🌟 {greeting}, ছোট্ট বন্ধু!</p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-white md:text-3xl">
              আজ কী শিখবে?
            </h1>
            <p className="mt-1.5 max-w-xs text-sm text-white/85">
              বড় রঙিন বোতাম চাপো — খেলতে খেলতে পড়া হয়ে যাবে!
            </p>
          </div>
        </motion.div>

        {!accessLoading && !isPaid && !canDoLesson && (
          <div className="mb-5">
            <LockOverlay type="daily_limit" />
          </div>
        )}
        {!accessLoading && !isPaid && <AdBanner position="top" className="mb-5" />}

        <div className="mb-6 grid grid-cols-2 gap-3">
          {(
            [
              { key: 'nursery' as const, label: '🌱 Nursery', desc: 'অ আ ই · ABC · ১২৩', emoji: '🐣' },
              { key: 'kg' as const, label: '⭐ KG', desc: 'জগৎ বেছে নাও', emoji: '🚀' },
            ] as const
          ).map((level) => {
            const active = activeLevel === level.key
            return (
              <button
                key={level.key}
                type="button"
                onClick={() => setActiveLevel(level.key)}
                className={`min-h-[84px] rounded-3xl border-2 px-4 py-3 text-left transition active:scale-[0.97] ${
                  active
                    ? 'border-violet-400 bg-violet-500/25 text-white shadow-lg shadow-violet-500/20'
                    : 'border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{level.emoji}</span>
                  <div>
                    <div className="text-base font-black">{level.label}</div>
                    <div className="text-xs opacity-80">{level.desc}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {activeLevel === 'nursery' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-white">📚 বিষয় বেছে নাও</p>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                ৪টি বিষয়
              </span>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {nurserySubjects.map((subject, i) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={subject.href} className="block">
                    <div
                      className={`relative flex min-h-[148px] flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 p-4 text-center transition hover:brightness-110 active:scale-[0.97] ${subject.border} ${subject.bg}`}
                    >
                      <span className="absolute right-3 top-3 text-lg opacity-70">{subject.emoji}</span>
                      <div
                        className={`mb-3 grid size-16 place-items-center rounded-2xl bg-gradient-to-br text-2xl font-black text-white shadow-lg ${subject.color}`}
                      >
                        {subject.icon}
                      </div>
                      <p className="text-lg font-black text-white">{subject.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{subject.subtitle}</p>
                      <span className="mt-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/90">
                        শুরু করি →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🕌</span>
              <p className="text-sm font-black text-white">ইসলামিক মজার পড়া</p>
            </div>
            <div className="mb-5 grid grid-cols-4 gap-2">
              {islamicLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex min-h-[100px] flex-col items-center justify-center rounded-2xl border p-2 transition active:scale-95 ${item.bg} ${item.border}`}
                  >
                    <div
                      className={`mb-1.5 grid size-12 place-items-center rounded-xl bg-gradient-to-br text-xl shadow-md ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <p className="text-center text-[11px] font-bold leading-tight text-white">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/dashboard/student/kids-zone/games" className="block">
              <div className="rounded-[24px] border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-2xl">
                    🎮
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-white">খেলার জগৎ</p>
                    <p className="text-xs text-slate-300">সংখ্যা মিল · অক্ষর খেলা</p>
                  </div>
                  <span className="text-xl text-white/70">→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {activeLevel === 'kg' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 text-center text-sm font-black text-white">কোন জগতে যাবে?</p>
            <div className="grid grid-cols-2 gap-3">
              {kgZones.map((zone, i) =>
                zone.available ? (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={zone.href}>
                      <ZoneCard zone={zone} />
                    </Link>
                  </motion.div>
                ) : (
                  <div key={zone.id} className="opacity-55">
                    <ZoneCard zone={zone} locked />
                  </div>
                ),
              )}
            </div>
          </motion.div>
        )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য · Kids Zone · প্রতিদিন একটু শেখো 💚</p>
      </div>
    </div>
  )
}

function ZoneCard({
  zone,
  locked,
}: {
  zone: (typeof kgZones)[0]
  locked?: boolean
}) {
  return (
    <div
      className={`flex min-h-[150px] flex-col items-center justify-center rounded-[24px] border-2 p-4 text-center transition active:scale-[0.97] ${zone.border} ${zone.bg}`}
    >
      {locked && (
        <span className="mb-1 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-slate-300">
          🔒 শীঘ্রই
        </span>
      )}
      <div
        className={`mb-2 grid size-16 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${zone.color}`}
      >
        {zone.icon}
      </div>
      <p className="text-base font-black text-white">{zone.name}</p>
      <p className="mt-1 text-xs text-slate-400">{zone.desc}</p>
    </div>
  )
}
