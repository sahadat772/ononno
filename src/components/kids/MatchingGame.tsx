'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

type SpeechLang = 'bn-BD' | 'en-US' | 'ar-SA'

type Exercise = {
  id: string
  type: string
  title: string
  voiceText: string
  content: string
  options?: string[]
  correctAnswer?: string
}

type LessonConfig = {
  color: string
  lang: SpeechLang
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function resolveVoiceLang(lesson: LessonConfig): SpeechLang {
  if (lesson.lang === 'en-US') return 'en-US'
  if (lesson.lang === 'ar-SA') return 'ar-SA'
  return 'bn-BD'
}

/** Parse "left|right" or "left-right" pair strings for matching game. */
function parseMatchPair(opt: string): { left: string; right: string } | null {
  const s = (opt || '').trim()
  if (!s) return null
  if (s.includes('|')) {
    const i = s.indexOf('|')
    const left = s.slice(0, i).trim()
    const right = s.slice(i + 1).trim()
    if (left && right) return { left, right }
  }
  const i = s.indexOf('-')
  if (i > 0) {
    const left = s.slice(0, i).trim()
    const right = s.slice(i + 1).trim()
    if (left && right) return { left, right }
  }
  return null
}

function isMostlyEmoji(s: string): boolean {
  return !/[\u0980-\u09FFa-zA-Z0-9]/.test(s)
}

export function MatchingGame({
  currentEx,
  lesson,
  speak,
  onComplete,
}: {
  currentEx: Exercise
  lesson: LessonConfig
  speak: (t: string, lang: SpeechLang) => void
  onComplete: (ok: boolean) => void
}) {
  const voiceLang = resolveVoiceLang(lesson)
  const pairs = useMemo(() => {
    return (currentEx.options || [])
      .map(parseMatchPair)
      .filter((p): p is { left: string; right: string } => !!p)
  }, [currentEx.options, currentEx.id])

  const leftItems = useMemo(() => pairs.map((p) => p.left), [pairs])
  const rightItems = useMemo(() => shuffleArray(pairs.map((p) => p.right)), [pairs])

  const [leftSel, setLeftSel] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [wrongPair, setWrongPair] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)

  useEffect(() => {
    setLeftSel(null)
    setMatched({})
    setWrongPair(null)
    setFinished(false)
    setWrongFlash(false)
  }, [currentEx.id])

  function onLeft(left: string) {
    if (matched[left] || finished) return
    const pair = pairs.find((p) => p.left === left)
    // Emoji left → speak the matched name; text left → speak the example word
    if (pair && isMostlyEmoji(left)) speak(pair.right, voiceLang)
    else speak(left, voiceLang)
    setLeftSel(left)
    setWrongPair(null)
    setWrongFlash(false)
  }

  function onRight(right: string) {
    if (!leftSel || finished) return
    if (Object.values(matched).includes(right)) return
    const correctRight = pairs.find((p) => p.left === leftSel)?.right
    if (correctRight === right) {
      const next = { ...matched, [leftSel]: right }
      setMatched(next)
      setLeftSel(null)
      speak(right, voiceLang)
      if (Object.keys(next).length === pairs.length) {
        setFinished(true)
        setTimeout(() => onComplete(true), 700)
      }
    } else {
      setWrongPair(leftSel)
      setWrongFlash(true)
      setTimeout(() => {
        setWrongPair(null)
        setLeftSel(null)
        setWrongFlash(false)
      }, 650)
      onComplete(false)
    }
  }

  const leftIsIcon = leftItems.some(isMostlyEmoji)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center">
      <p className="mb-1 text-xl font-black text-white">🔗 জোড়া মেলাও</p>
      <p className="mb-3 text-xs text-slate-400">
        {leftIsIcon ? 'বামে ছবি → ডানে নাম' : 'বামে study উদাহরণ → ডানে নাম'}
      </p>
      {wrongFlash && (
        <p className="mb-2 text-sm font-bold text-red-300">মিলেনি — আবার চেষ্টা করো</p>
      )}
      <div className="flex gap-3 justify-center">
        <div className="flex flex-1 flex-col gap-2.5">
          {leftItems.map((left, idx) => {
            const isMatched = !!matched[left]
            const isSel = leftSel === left
            const isWrong = wrongPair === left
            return (
              <motion.button
                key={`L-${left}-${idx}`}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onLeft(left)}
                disabled={isMatched}
                className={`flex min-h-14 items-center justify-center rounded-2xl border-2 px-1 text-base font-black leading-tight transition sm:text-lg ${
                  isMatched
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : isWrong
                      ? 'border-red-400/60 bg-red-500/25 text-red-100'
                      : isSel
                        ? `border-transparent bg-gradient-to-br ${lesson.color} text-white shadow-lg ring-2 ring-white/40`
                        : 'border-white/20 bg-white/10 text-white'
                }`}
              >
                {isMatched ? '✅' : left}
              </motion.button>
            )
          })}
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          {rightItems.map((right, idx) => {
            const isUsed = Object.values(matched).includes(right)
            return (
              <motion.button
                key={`R-${right}-${idx}`}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onRight(right)}
                disabled={isUsed || !leftSel}
                className={`flex min-h-14 items-center justify-center rounded-2xl border-2 px-2 text-base font-bold transition ${
                  isUsed
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : leftSel
                      ? 'border-sky-400/40 bg-sky-500/15 text-white'
                      : 'border-white/15 bg-white/5 text-slate-400'
                }`}
              >
                {isUsed ? '✅' : right}
              </motion.button>
            )
          })}
        </div>
      </div>
      {finished && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 text-lg font-black text-emerald-300">
          সব মিলেছে! 🎉
        </motion.p>
      )}
      {!leftSel && !finished && (
        <p className="mt-3 text-xs text-slate-500">প্রথমে বাম দিকের উদাহরণে ট্যাপ করো</p>
      )}
    </motion.div>
  )
}
