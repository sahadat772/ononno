'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Mode = 'menu' | 'numbers' | 'letters'

const BN_NUMS = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
const EN_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const BN_LETTERS = ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ক', 'খ', 'গ', 'ঘ']
const EN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function KidsGamesPage() {
  const [mode, setMode] = useState<Mode>('menu')
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [targetIdx, setTargetIdx] = useState(0)
  const [options, setOptions] = useState<string[]>([])

  const pool = useMemo(() => {
    if (mode === 'numbers') {
      return BN_NUMS.map((bn, i) => ({ prompt: bn, answer: EN_NUMS[i], choices: EN_NUMS }))
    }
    if (mode === 'letters') {
      return BN_LETTERS.map((bn, i) => ({ prompt: bn, answer: EN_LETTERS[i], choices: EN_LETTERS }))
    }
    return []
  }, [mode])

  function startGame(next: 'numbers' | 'letters') {
    setMode(next)
    setScore(0)
    setRound(0)
    setFeedback(null)
    // seed first question after state update via timeout
    setTimeout(() => nextQuestion(next, 0), 0)
  }

  function nextQuestion(gameMode: 'numbers' | 'letters', r: number) {
    const source =
      gameMode === 'numbers'
        ? BN_NUMS.map((bn, i) => ({ prompt: bn, answer: EN_NUMS[i], choices: EN_NUMS }))
        : BN_LETTERS.map((bn, i) => ({ prompt: bn, answer: EN_LETTERS[i], choices: EN_LETTERS }))
    const idx = r % source.length
    const item = source[idx]
    const wrong = shuffle(item.choices.filter((c) => c !== item.answer)).slice(0, 3)
    setTargetIdx(idx)
    setOptions(shuffle([item.answer, ...wrong]))
    setFeedback(null)
  }

  function pick(choice: string) {
    if (feedback) return
    const item = pool[targetIdx]
    if (!item) return
    const ok = choice === item.answer
    setFeedback(ok ? 'correct' : 'wrong')
    if (ok) setScore((s) => s + 1)
    setTimeout(() => {
      const nextRound = round + 1
      setRound(nextRound)
      if (nextRound >= 8) {
        setMode('menu')
        return
      }
      nextQuestion(mode as 'numbers' | 'letters', nextRound)
    }, 700)
  }

  const current = pool[targetIdx]

  return (
    <main className="min-h-screen bg-[#07071a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.15),transparent_50%)]" />

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
            <p className="text-[10px] text-fuchsia-300">মজার quiz</p>
          </div>
          <span className="rounded-2xl border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-sm font-bold text-amber-200">
            ⭐ {score}
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6">
        {mode === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 rounded-[28px] bg-gradient-to-br from-fuchsia-600 to-violet-700 p-5 text-center shadow-xl">
              <div className="text-5xl">🎯</div>
              <h1 className="mt-2 text-2xl font-black">খেলে শেখো!</h1>
              <p className="mt-1 text-sm text-white/85">সঠিক উত্তর চাপো — তারা জিতো</p>
              {score > 0 && (
                <p className="mt-3 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
                  শেষ স্কোর: {score}/8 🌟
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => startGame('numbers')}
                className="flex min-h-[96px] items-center gap-4 rounded-[24px] border-2 border-amber-400/40 bg-amber-500/10 p-4 text-left transition active:scale-[0.98]"
              >
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-black">
                  ১
                </div>
                <div>
                  <p className="text-lg font-black">সংখ্যা মিল</p>
                  <p className="text-sm text-slate-300">১ → 1 খুঁজে বের করো</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => startGame('letters')}
                className="flex min-h-[96px] items-center gap-4 rounded-[24px] border-2 border-sky-400/40 bg-sky-500/10 p-4 text-left transition active:scale-[0.98]"
              >
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-3xl font-black">
                  অ
                </div>
                <div>
                  <p className="text-lg font-black">অক্ষর খেলা</p>
                  <p className="text-sm text-slate-300">অ → A মিলিয়ে দাও</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {(mode === 'numbers' || mode === 'letters') && current && (
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
                রাউন্ড {round + 1}/8
              </span>
            </div>

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-sm font-bold text-slate-400">এটার মিল কোনটি?</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${mode}-${targetIdx}-${round}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-3 text-6xl font-black text-white"
                >
                  {current.prompt}
                </motion.p>
              </AnimatePresence>
              {feedback === 'correct' && (
                <p className="mt-3 text-lg font-bold text-emerald-400">শাবাশ! ✅</p>
              )}
              {feedback === 'wrong' && (
                <p className="mt-3 text-lg font-bold text-rose-400">আবার চেষ্টা! ❌</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pick(opt)}
                  disabled={!!feedback}
                  className="min-h-[80px] rounded-[22px] border-2 border-white/15 bg-white/10 text-3xl font-black transition hover:bg-white/15 active:scale-95 disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-600">অনন্য Kids Zone Games</p>
      </div>
    </main>
  )
}
