'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KidsZoneShell from '@/components/kids/KidsZoneShell'
import { useSpeech } from '@/hooks/useSpeech'

type Rhyme = {
  id: string
  title: string
  emoji: string
  category: 'bangla' | 'islamic' | 'numbers'
  lines: string[]
  color: string
}

const RHYMES: Rhyme[] = [
  {
    id: 'hati',
    title: 'হাতি নানা',
    emoji: '🐘',
    category: 'bangla',
    color: 'from-amber-400 to-orange-500',
    lines: [
      'হাতি নানা বেড়ায় বাগানে',
      'খায় কলা, খায় পানি',
      'দুলিয়ে কান, নাচে গান',
      'সবাই বলে — বাহবা হাতি নানা!',
    ],
  },
  {
    id: 'chad',
    title: 'চাঁদ উঠেছে',
    emoji: '🌙',
    category: 'bangla',
    color: 'from-sky-400 to-indigo-500',
    lines: [
      'চাঁদ উঠেছে ফুল ফুটেছে',
      'কদম তলায় বুলবুলি নাচে',
      'আমরাও নাচি, আনন্দে হাসি',
      'আল্লাহর দান চাঁদ আর ফুল!',
    ],
  },
  {
    id: 'mach',
    title: 'মাছ ধরো',
    emoji: '🐟',
    category: 'bangla',
    color: 'from-cyan-400 to-teal-500',
    lines: [
      'নদীতে মাছ সাঁতার কাটে',
      'আমি ধরবো একটা বড় মাছ',
      'জাল ফেলো, ধরো ধরো',
      'মাছ এলো — ভাজা খাবো!',
    ],
  },
  {
    id: 'bristi',
    title: 'বৃষ্টি পড়ে',
    emoji: '🌧️',
    category: 'bangla',
    color: 'from-blue-400 to-violet-500',
    lines: [
      'বৃষ্টি পড়ে টাপুর টুপুর',
      'নদীর জল বাড়ে ঝুমুর ঝুমুর',
      'ছাতা নিয়ে বের হবো',
      'জলে ভিজে খেলা করবো!',
    ],
  },
  {
    id: 'bismillah',
    title: 'বিসমিল্লাহ',
    emoji: '🤲',
    category: 'islamic',
    color: 'from-emerald-400 to-teal-500',
    lines: [
      'কাজ শুরুতে বলি বিসমিল্লাহ',
      'খাওয়ার আগে বলি বিসমিল্লাহ',
      'ঘুমানোর আগে বলি বিসমিল্লাহ',
      'সব কাজে মনে রাখি আল্লাহ!',
    ],
  },
  {
    id: 'allah-one',
    title: 'আল্লাহ এক',
    emoji: '⭐',
    category: 'islamic',
    color: 'from-green-400 to-emerald-600',
    lines: [
      'আল্লাহ এক, তাঁর কোনো শরিক নেই',
      'তিনিই সৃষ্টি করেন চাঁদ সূর্য',
      'তিনিই দেন খাবার পানি',
      'আমরা বলি — আলহামদুলিল্লাহ!',
    ],
  },
  {
    id: 'salam',
    title: 'সালাম বলো',
    emoji: '🤝',
    category: 'islamic',
    color: 'from-teal-400 to-cyan-500',
    lines: [
      'দেখা হলে বলি আসসালামু আলাইকুম',
      'উত্তর দিই ওয়া আলাইকুমুস সালাম',
      'ভালো কথা বলি, হাসি মুখে থাকি',
      'সবাইকে ভালোবাসি আল্লাহর জন্য!',
    ],
  },
  {
    id: 'dua-sleep',
    title: 'ঘুমের আগে',
    emoji: '🛏️',
    category: 'islamic',
    color: 'from-indigo-400 to-purple-500',
    lines: [
      'ঘুমাতে যাই, দোয়া পড়ি',
      'বিসমিকাল্লাহুম্মা আমুতু ওয়া আহইয়া',
      'আল্লাহ আমাদের রক্ষা করেন',
      'সকালে উঠে আলহামদুলিল্লাহ বলি!',
    ],
  },
  {
    id: 'ek-dui',
    title: 'এক দুই তিন',
    emoji: '🔢',
    category: 'numbers',
    color: 'from-rose-400 to-pink-500',
    lines: [
      'এক দুই তিন চার',
      'পাঁচ ছয় সাত আট',
      'নয় দশ এগারো বারো',
      'গুণতে গুণতে মজা করো!',
    ],
  },
  {
    id: 'a-aa',
    title: 'অ আ ই ঈ',
    emoji: '🔤',
    category: 'numbers',
    color: 'from-violet-400 to-purple-500',
    lines: [
      'অ দিয়ে অজগর, আ দিয়ে আম',
      'ই দিয়ে ইলিশ, ঈ দিয়ে ঈগল',
      'উ দিয়ে উট, ঊ দিয়ে ঊষা',
      'বাংলা শিখি মজার মজার!',
    ],
  },
]

const CATEGORIES = [
  { id: 'all' as const, label: 'সব', emoji: '🌈' },
  { id: 'bangla' as const, label: 'বাংলা ছড়া', emoji: '🇧🇩' },
  { id: 'islamic' as const, label: 'ইসলামিক', emoji: '🕌' },
  { id: 'numbers' as const, label: 'শেখার ছড়া', emoji: '📚' },
]

export default function KidsMusicPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['id']>('all')
  const [selected, setSelected] = useState<Rhyme | null>(null)
  const [lineIdx, setLineIdx] = useState(0)
  const { speak, stop, isSpeaking, isLoading } = useSpeech()

  const list = useMemo(
    () => (filter === 'all' ? RHYMES : RHYMES.filter((r) => r.category === filter)),
    [filter],
  )

  const playAll = (rhyme: Rhyme) => {
    stop()
    setSelected(rhyme)
    setLineIdx(0)
    const full = rhyme.lines.join('। ')
    speak(full, 'bn-BD')
  }

  const playLine = (rhyme: Rhyme, idx: number) => {
    stop()
    setSelected(rhyme)
    setLineIdx(idx)
    speak(rhyme.lines[idx], 'bn-BD')
  }

  const nextLine = () => {
    if (!selected) return
    const next = lineIdx + 1
    if (next < selected.lines.length) {
      setLineIdx(next)
      speak(selected.lines[next], 'bn-BD')
    }
  }

  return (
    <KidsZoneShell title="গান ও ছড়া" subtitle="শোনো · বলো · মজা করো" emoji="🎵" stars={list.length * 5}>
      {/* Category chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setFilter(c.id)
              setSelected(null)
              stop()
            }}
            className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
              filter === c.id
                ? 'border-pink-400/50 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/25'
                : 'border-white/10 bg-white/5 text-slate-300'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Selected player */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-5 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br ${selected.color} p-5 shadow-xl`}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-4xl">{selected.emoji}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-white drop-shadow">{selected.title}</h2>
                <p className="text-xs font-semibold text-white/80">
                  {isLoading ? 'লোড হচ্ছে…' : isSpeaking ? '▶️ চলছে…' : 'শোনার জন্য প্রস্তুত'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stop()
                  setSelected(null)
                }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-lg font-bold text-white active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {selected.lines.map((line, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => playLine(selected, i)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-base font-bold transition active:scale-[0.98] ${
                    i === lineIdx && isSpeaking
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'bg-black/20 text-white hover:bg-black/30'
                  }`}
                >
                  {line}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => playAll(selected)}
                className="flex-1 rounded-2xl bg-white py-3.5 text-center text-sm font-black text-slate-900 shadow-lg active:scale-[0.98]"
              >
                {isSpeaking || isLoading ? '🔊 শুনছি…' : '▶️ পুরোটা শোনো'}
              </button>
              <button
                type="button"
                onClick={nextLine}
                disabled={!selected || lineIdx >= selected.lines.length - 1}
                className="rounded-2xl bg-black/25 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-40 active:scale-95"
              >
                পরের লাইন →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rhyme cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((r, idx) => (
          <motion.button
            key={r.id}
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => playAll(r)}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${r.color} p-4 text-left shadow-lg active:scale-[0.97] ${
              selected?.id === r.id ? 'ring-4 ring-white/40' : ''
            }`}
          >
            <div className="absolute -right-2 -top-2 text-5xl opacity-25">{r.emoji}</div>
            <div className="relative">
              <span className="text-3xl">{r.emoji}</span>
              <h3 className="mt-2 text-sm font-black leading-tight text-white drop-shadow">{r.title}</h3>
              <p className="mt-1 text-[10px] font-semibold text-white/75">
                {r.category === 'islamic' ? 'ইসলামিক' : r.category === 'numbers' ? 'শেখা' : 'বাংলা'} · {r.lines.length} লাইন
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 text-center">
        <p className="mb-1 font-semibold text-pink-300">💡 টিপস</p>
        <p className="text-sm text-slate-400">
          কার্ডে ট্যাপ করলে পুরো ছড়া শোনা যাবে। প্রতিটি লাইনে ট্যাপ করে আলাদা শোনো — তারপর নিজে বলো!
        </p>
      </div>
    </KidsZoneShell>
  )
}
