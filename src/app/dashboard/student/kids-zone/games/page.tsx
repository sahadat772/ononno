'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type QuizMode = 'numbers' | 'letters' | 'animals' | 'colors' | 'count' | 'shapes'
type Mode = 'menu' | QuizMode | 'memory' | 'result'

const TOTAL_ROUNDS = 8

const BN_NUMS = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const EN_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const BN_LETTERS = ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ক', 'খ', 'গ', 'ঘ']
const EN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

const ANIMALS = [
  { emoji: '🐱', name: 'বিড়াল' },
  { emoji: '🐶', name: 'কুকুর' },
  { emoji: '🐰', name: 'খরগোশ' },
  { emoji: '🐦', name: 'পাখি' },
  { emoji: '🐟', name: 'মাছ' },
  { emoji: '🦁', name: 'সিংহ' },
  { emoji: '🐘', name: 'হাতি' },
  { emoji: '🐄', name: 'গরু' },
  { emoji: '🐐', name: 'ছাগল' },
  { emoji: '🐔', name: 'মুরগি' },
]

const COLORS = [
  { emoji: '🔴', name: 'লাল' },
  { emoji: '🟢', name: 'সবুজ' },
  { emoji: '🔵', name: 'নীল' },
  { emoji: '🟡', name: 'হলুদ' },
  { emoji: '🟠', name: 'কমলা' },
  { emoji: '🟣', name: 'বেগুনি' },
  { emoji: '⚫', name: 'কালো' },
  { emoji: '⚪', name: 'সাদা' },
]

const SHAPES = [
  { emoji: '⭕', name: 'গোল' },
  { emoji: '⬜', name: 'বর্গ' },
  { emoji: '🔺', name: 'ত্রিভুজ' },
  { emoji: '⭐', name: 'তারা' },
  { emoji: '❤️', name: 'হার্ট' },
  { emoji: '💎', name: 'হীরে' },
]

const MEMORY_EMOJIS = ['🍎', '🍌', '🍇', '🍊', '🍉', '🍓']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type QuizItem = { prompt: string; answer: string; choices: string[] }

function buildQuiz(mode: QuizMode, round: number): QuizItem {
  if (mode === 'numbers') {
    const idx = round % BN_NUMS.length
    const answer = EN_NUMS[idx]
    const wrong = shuffle(EN_NUMS.filter((x) => x !== answer)).slice(0, 3)
    return { prompt: BN_NUMS[idx], answer, choices: shuffle([answer, ...wrong]) }
  }
  if (mode === 'letters') {
    const idx = round % BN_LETTERS.length
    const answer = EN_LETTERS[idx]
    const wrong = shuffle(EN_LETTERS.filter((x) => x !== answer)).slice(0, 3)
    return { prompt: BN_LETTERS[idx], answer, choices: shuffle([answer, ...wrong]) }
  }
  if (mode === 'animals') {
    const item = ANIMALS[round % ANIMALS.length]
    const wrong = shuffle(ANIMALS.filter((a) => a.name !== item.name))
      .slice(0, 3)
      .map((a) => a.name)
    return { prompt: item.emoji, answer: item.name, choices: shuffle([item.name, ...wrong]) }
  }
  if (mode === 'colors') {
    const item = COLORS[round % COLORS.length]
    const wrong = shuffle(COLORS.filter((c) => c.name !== item.name))
      .slice(0, 3)
      .map((c) => c.name)
    return { prompt: item.emoji, answer: item.name, choices: shuffle([item.name, ...wrong]) }
  }
  if (mode === 'shapes') {
    const item = SHAPES[round % SHAPES.length]
    const wrong = shuffle(SHAPES.filter((s) => s.name !== item.name))
      .slice(0, 3)
      .map((s) => s.name)
    return { prompt: item.emoji, answer: item.name, choices: shuffle([item.name, ...wrong]) }
  }
  // count
  const n = (round % 6) + 1
  const emoji = ['⭐', '🍎', '🎈', '🐟', '🌸', '⚽'][round % 6]
  const answer = BN_NUMS[n - 1]
  const wrong = shuffle(BN_NUMS.filter((x) => x !== answer)).slice(0, 3)
  return {
    prompt: Array(n).fill(emoji).join(''),
    answer,
    choices: shuffle([answer, ...wrong]),
  }
}

const GAME_LIST: {
  id: Mode
  title: string
  desc: string
  icon: string
  gradient: string
  border: string
  bg: string
}[] = [
  {
    id: 'numbers',
    title: 'সংখ্যা মিল',
    desc: '১ → 1 খুঁজে বের করো',
    icon: '🔢',
    gradient: 'from-amber-400 to-orange-500',
    border: 'border-amber-400/40',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'letters',
    title: 'অক্ষর খেলা',
    desc: 'অ → A মিলিয়ে দাও',
    icon: '🔤',
    gradient: 'from-sky-400 to-blue-500',
    border: 'border-sky-400/40',
    bg: 'bg-sky-500/10',
  },
  {
    id: 'animals',
    title: 'পশু চিনো',
    desc: 'কোন পশু? নাম বলো',
    icon: '🐱',
    gradient: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'colors',
    title: 'রঙ চিনো',
    desc: 'লাল · সবুজ · নীল',
    icon: '🎨',
    gradient: 'from-rose-400 to-pink-500',
    border: 'border-rose-400/40',
    bg: 'bg-rose-500/10',
  },
  {
    id: 'count',
    title: 'গুণে বলো',
    desc: 'কয়টা আছে গুনো',
    icon: '👆',
    gradient: 'from-violet-400 to-purple-500',
    border: 'border-violet-400/40',
    bg: 'bg-violet-500/10',
  },
  {
    id: 'shapes',
    title: 'আকৃতি চিনো',
    desc: 'গোল · বর্গ · তারা',
    icon: '⭐',
    gradient: 'from-cyan-400 to-sky-500',
    border: 'border-cyan-400/40',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'memory',
    title: 'মেমোরি কার্ড',
    desc: 'জোড়া মিলিয়ে খেলো',
    icon: '🧠',
    gradient: 'from-fuchsia-400 to-pink-500',
    border: 'border-fuchsia-400/40',
    bg: 'bg-fuchsia-500/10',
  },
]

type MemoryCard = { id: number; emoji: string; flipped: boolean; matched: boolean }

export default function KidsGamesPage() {
  const [mode, setMode] = useState<Mode>('menu')
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [quiz, setQuiz] = useState<QuizItem | null>(null)
  const [lastScore, setLastScore] = useState(0)

  // memory state
  const [memCards, setMemCards] = useState<MemoryCard[]>([])
  const [memFlipped, setMemFlipped] = useState<number[]>([])
  const [memLock, setMemLock] = useState(false)
  const [memMoves, setMemMoves] = useState(0)

  const startQuiz = useCallback((next: QuizMode) => {
    setMode(next)
    setScore(0)
    setRound(0)
    setFeedback(null)
    setQuiz(buildQuiz(next, 0))
  }, [])

  const startMemory = useCallback(() => {
    const pairs = shuffle(MEMORY_EMOJIS).slice(0, 4)
    const cards = shuffle(
      pairs.flatMap((emoji, i) => [
        { id: i * 2, emoji, flipped: false, matched: false },
        { id: i * 2 + 1, emoji, flipped: false, matched: false },
      ]),
    )
    setMemCards(cards)
    setMemFlipped([])
    setMemLock(false)
    setMemMoves(0)
    setScore(0)
    setMode('memory')
  }, [])

  function pickAnswer(choice: string) {
    if (feedback || !quiz || mode === 'menu' || mode === 'memory' || mode === 'result') return
    const ok = choice === quiz.answer
    setFeedback(ok ? 'correct' : 'wrong')
    const newScore = ok ? score + 1 : score
    if (ok) setScore(newScore)

    setTimeout(() => {
      const nextRound = round + 1
      if (nextRound >= TOTAL_ROUNDS) {
        setLastScore(newScore)
        setMode('result')
        return
      }
      setRound(nextRound)
      setQuiz(buildQuiz(mode as QuizMode, nextRound))
      setFeedback(null)
    }, 650)
  }

  function flipMemory(id: number) {
    if (memLock) return
    const card = memCards.find((c) => c.id === id)
    if (!card || card.flipped || card.matched) return
    if (memFlipped.length >= 2) return

    const nextFlipped = [...memFlipped, id]
    setMemCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)))
    setMemFlipped(nextFlipped)

    if (nextFlipped.length === 2) {
      setMemLock(true)
      setMemMoves((m) => m + 1)
      const [a, b] = nextFlipped
      const ca = memCards.find((c) => c.id === a)!
      const cb = memCards.find((c) => c.id === b)!
      // use updated emoji from current card + flipped one
      const emojiA = ca.id === id ? card.emoji : ca.emoji
      const emojiB = cb.id === id ? card.emoji : cb.emoji
      const matchEmoji =
        memCards.find((c) => c.id === a)?.emoji === memCards.find((c) => c.id === b)?.emoji
          ? memCards.find((c) => c.id === a)?.emoji
          : null

      // After state updates, compare properly
      setTimeout(() => {
        setMemCards((prev) => {
          const x = prev.find((c) => c.id === a)
          const y = prev.find((c) => c.id === b)
          if (x && y && x.emoji === y.emoji) {
            const updated = prev.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true, flipped: true } : c,
            )
            if (updated.every((c) => c.matched)) {
              setTimeout(() => {
                setLastScore(Math.max(1, 12 - memMoves))
                setScore(Math.max(1, 12 - memMoves))
                setMode('result')
              }, 400)
            }
            return updated
          }
          return prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c,
          )
        })
        setMemFlipped([])
        setMemLock(false)
      }, 700)
      void emojiA
      void emojiB
      void matchEmoji
    }
  }

  return (
    <main className="min-h-screen bg-[#07071a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(251,191,36,0.08),transparent_40%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07071a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard/student/kids-zone"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg font-bold"
          >
            ←
          </Link>
          <div className="text-center">
            <p className="text-base font-black">🎮 খেলার জগৎ</p>
            <p className="text-[10px] text-fuchsia-300">৭টা মজার গেম</p>
          </div>
          <span className="rounded-2xl border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-sm font-bold text-amber-200">
            ⭐ {score}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-lg px-4 py-5 pb-10">
        {mode === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-700 p-5 text-center shadow-xl">
              <div className="text-5xl">🎯🌈</div>
              <h1 className="mt-2 text-2xl font-black">খেলে শেখো!</h1>
              <p className="mt-1 text-sm text-white/90">সঠিক উত্তর চাপো — তারা জিতো</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GAME_LIST.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    if (g.id === 'memory') startMemory()
                    else if (g.id !== 'menu' && g.id !== 'result') startQuiz(g.id as QuizMode)
                  }}
                  className={`flex min-h-[92px] items-center gap-3 rounded-[22px] border-2 p-3 text-left transition active:scale-[0.98] ${g.border} ${g.bg}`}
                >
                  <div
                    className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-md ${g.gradient}`}
                  >
                    {g.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white">{g.title}</p>
                    <p className="text-xs text-slate-300">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'result' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-[28px] bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center shadow-2xl"
          >
            <div className="text-6xl">🌟</div>
            <h2 className="mt-3 text-2xl font-black text-white">শাবাশ!</h2>
            <p className="mt-2 text-lg font-bold text-amber-50">স্কোর: {lastScore} ⭐</p>
            <button
              type="button"
              onClick={() => {
                setMode('menu')
                setScore(0)
              }}
              className="mt-6 rounded-2xl bg-white px-8 py-3 text-base font-black text-orange-600"
            >
              আবার খেলি!
            </button>
          </motion.div>
        )}

        {mode === 'memory' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="rounded-xl border border-white/15 px-3 py-1.5 text-sm text-slate-300"
              >
                মেনু
              </button>
              <span className="text-sm font-bold text-slate-300">চালি: {memMoves}</span>
            </div>
            <p className="mb-4 text-center text-sm font-bold text-fuchsia-200">
              একই ছবির জোড়া খুঁজে বের করো!
            </p>
            <div className="grid grid-cols-4 gap-2">
              {memCards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => flipMemory(c.id)}
                  className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition active:scale-95 ${
                    c.matched
                      ? 'border-emerald-400/50 bg-emerald-500/20'
                      : c.flipped
                        ? 'border-fuchsia-400/40 bg-fuchsia-500/20'
                        : 'border-white/15 bg-white/10'
                  }`}
                >
                  {c.flipped || c.matched ? c.emoji : '❓'}
                </button>
              ))}
            </div>
          </div>
        )}

        {(mode === 'numbers' ||
          mode === 'letters' ||
          mode === 'animals' ||
          mode === 'colors' ||
          mode === 'count' ||
          mode === 'shapes') &&
          quiz && (
            <div>
              <div className="mb-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setMode('menu')}
                  className="rounded-xl border border-white/15 px-3 py-1.5 text-slate-300"
                >
                  মেনু
                </button>
                <span className="font-bold text-slate-300">
                  রাউন্ড {round + 1}/{TOTAL_ROUNDS}
                </span>
              </div>

              <div className="mb-5 rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-sm font-bold text-slate-400">
                  {mode === 'count'
                    ? 'কয়টা আছে?'
                    : mode === 'animals' || mode === 'colors' || mode === 'shapes'
                      ? 'এটা কী?'
                      : 'এটার মিল কোনটি?'}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${mode}-${round}-${quiz.prompt}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`mt-3 font-black text-white ${
                      mode === 'count' ? 'text-4xl leading-relaxed' : 'text-6xl'
                    }`}
                  >
                    {quiz.prompt}
                  </motion.p>
                </AnimatePresence>
                {feedback === 'correct' && (
                  <p className="mt-3 text-lg font-bold text-emerald-400">শাবাশ! ✅</p>
                )}
                {feedback === 'wrong' && (
                  <p className="mt-3 text-lg font-bold text-rose-400">
                    আবার চেষ্টা! (সঠিক: {quiz.answer})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quiz.choices.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pickAnswer(opt)}
                    disabled={!!feedback}
                    className="min-h-[76px] rounded-[22px] border-2 border-white/15 bg-white/10 px-2 text-xl font-black transition hover:bg-white/15 active:scale-95 disabled:opacity-60"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য Kids Zone · মজার গেমস</p>
      </div>
    </main>
  )
}
