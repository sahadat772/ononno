'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition, matchSpokenToExpected } from '@/hooks/useSpeechRecognition'
import { createClient } from '@/lib/supabase'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import { letterIcon } from '@/lib/kids-letter-icons'

export type ExerciseType =
    | 'intro' | 'listen-repeat' | 'tap-correct' | 'bubble-pop' | 'letter-puzzle'
    | 'trace' | 'quiz' | 'pronounce' | 'archery-target' | 'word-builder' | 'matching'

export type Exercise = {
    id: string
    type: ExerciseType
    title: string
    voiceText: string
    content: string
    options?: string[]
    correctAnswer?: string
}

export type LessonConfig = {
    id: string
    letter: string
    word: string
    wordEn: string
    emoji: string
    color: string
    lang: 'bn-BD' | 'en-US' | 'ar-SA'
    backHref: string
    showDotCount?: boolean
    storyImage?: string
    letterImage?: string
    exercises: Exercise[]
}

const CELEBRATION = [
    { y: -320, x: -80 }, { y: -280, x: 120 },
    { y: -350, x: 40 }, { y: -260, x: -140 },
    { y: -300, x: 100 },
]

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

function resolveVoiceLang(lesson: LessonConfig): 'bn-BD' | 'en-US' | 'ar-SA' {
    if (lesson.lang === 'bn-BD') return 'bn-BD'
    if (lesson.lang === 'en-US') return 'en-US'
    if (lesson.lang === 'ar-SA') return 'ar-SA'
    return 'bn-BD'
}

function WordBuilderGame({
    currentEx, lesson, speak, onSuccess,
}: {
    currentEx: Exercise
    lesson: LessonConfig
    speak: (t: string, lang: 'bn-BD' | 'en-US' | 'ar-SA') => void
    onSuccess: () => void
}) {
    const voiceLang = resolveVoiceLang(lesson)
    const target = (currentEx.correctAnswer || currentEx.content || '').trim()
    const tiles = useMemo(() => {
        const base = currentEx.options?.length ? [...currentEx.options] : target.split('')
        return shuffleArray(base)
    }, [currentEx.id, currentEx.options, target])
    const [built, setBuilt] = useState<string[]>([])
    const [pool, setPool] = useState<string[]>(tiles)
    const [wrong, setWrong] = useState(false)
    const [done, setDone] = useState(false)

    useEffect(() => {
        setBuilt([])
        setPool(tiles)
        setWrong(false)
        setDone(false)
    }, [currentEx.id, tiles])

    function pick(letter: string, idx: number) {
        if (done) return
        const nextBuilt = [...built, letter]
        const nextPool = pool.filter((_, i) => i !== idx)
        setBuilt(nextBuilt)
        setPool(nextPool)
        setWrong(false)
        speak(letter, voiceLang)
        const soFar = nextBuilt.join('')
        if (soFar === target) {
            setDone(true)
            setTimeout(() => onSuccess(), 600)
        } else if (nextBuilt.length >= target.length && soFar !== target) {
            setWrong(true)
        }
    }

    function reset() {
        setBuilt([])
        setPool(tiles)
        setWrong(false)
        setDone(false)
    }

    const icon = letterIcon(lesson.letter, lesson.emoji)
    const display = built.length ? built.join('') : '· · ·'

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-4xl">{icon}</span>
                <span className="text-sm font-bold text-slate-400">শব্দ সাজাও</span>
            </div>
            <p className="mb-2 text-sm text-slate-500">লক্ষ্য: <span className="font-bold text-amber-300">{target}</span></p>
            <div className={`mb-5 min-h-[3.75rem] rounded-2xl border-2 px-4 py-3 text-3xl font-black tracking-wide transition-colors ${
                done ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
                : wrong ? 'border-red-400/50 bg-red-500/15 text-red-200'
                : 'border-amber-400/35 bg-amber-500/10 text-amber-100'
            }`}>
                {display}
            </div>
            <div className="mb-4 flex flex-wrap justify-center gap-2.5">
                {pool.map((letter, idx) => (
                    <motion.button
                        key={`${letter}-${idx}-${pool.length}`}
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: idx * 0.03 }}
                        onClick={() => pick(letter, idx)}
                        className="grid size-14 place-items-center rounded-2xl border-2 border-sky-400/45 bg-sky-500/30 text-2xl font-black text-white shadow-lg shadow-sky-500/10"
                    >
                        {letter}
                    </motion.button>
                ))}
            </div>
            {wrong && <p className="mb-2 text-sm font-bold text-red-300">আবার চেষ্টা করো 💪</p>}
            {done && <p className="mb-2 text-sm font-bold text-emerald-300">সঠিক! 🎉</p>}
            <button type="button" onClick={reset} className="min-h-11 w-full rounded-2xl border border-white/15 bg-white/5 text-sm font-bold text-slate-300">
                ↻ আবার সাজাও
            </button>
        </motion.div>
    )
}

function MatchingGame({
    currentEx, lesson, speak, onComplete,
}: {
    currentEx: Exercise
    lesson: LessonConfig
    speak: (t: string, lang: 'bn-BD' | 'en-US' | 'ar-SA') => void
    onComplete: (ok: boolean) => void
}) {
    const voiceLang = resolveVoiceLang(lesson)
    const pairs = useMemo(() => {
        return (currentEx.options || []).map((opt) => {
            const parts = opt.split('-')
            const letter = parts[0] || ''
            const word = parts.slice(1).join('-') || ''
            return { letter, word }
        }).filter((p) => p.letter && p.word)
    }, [currentEx.options, currentEx.id])

    const letters = useMemo(() => pairs.map((p) => p.letter), [pairs])
    const words = useMemo(() => shuffleArray(pairs.map((p) => p.word)), [pairs])

    const [leftSel, setLeftSel] = useState<string | null>(null)
    const [matched, setMatched] = useState<Record<string, string>>({})
    const [wrongPair, setWrongPair] = useState<string | null>(null)
    const [finished, setFinished] = useState(false)

    useEffect(() => {
        setLeftSel(null)
        setMatched({})
        setWrongPair(null)
        setFinished(false)
    }, [currentEx.id])

    function onLeft(letter: string) {
        if (matched[letter] || finished) return
        speak(letter, voiceLang)
        setLeftSel(letter)
        setWrongPair(null)
    }

    function onRight(word: string) {
        if (!leftSel || finished) return
        if (Object.values(matched).includes(word)) return
        const correctWord = pairs.find((p) => p.letter === leftSel)?.word
        if (correctWord === word) {
            const next = { ...matched, [leftSel]: word }
            setMatched(next)
            setLeftSel(null)
            speak(word, voiceLang)
            if (Object.keys(next).length === pairs.length) {
                setFinished(true)
                setTimeout(() => onComplete(true), 800)
            }
        } else {
            setWrongPair(leftSel)
            setTimeout(() => {
                setWrongPair(null)
                setLeftSel(null)
            }, 700)
            onComplete(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center">
            <p className="mb-1 text-xl font-black text-white">🔗 জোড়া মেলাও</p>
            <p className="mb-4 text-xs text-slate-400">বামে বর্ণ → ডানে শব্দ</p>
            <div className="flex gap-3 justify-center">
                <div className="flex flex-1 flex-col gap-2.5">
                    {letters.map((letter) => {
                        const isMatched = !!matched[letter]
                        const isSel = leftSel === letter
                        const isWrong = wrongPair === letter
                        return (
                            <motion.button
                                key={letter}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onLeft(letter)}
                                disabled={isMatched}
                                className={`flex h-14 items-center justify-center rounded-2xl border-2 text-2xl font-black transition ${
                                    isMatched
                                        ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                                        : isWrong
                                            ? 'border-red-400/60 bg-red-500/25 text-red-100'
                                            : isSel
                                                ? `border-transparent bg-gradient-to-br ${lesson.color} text-white shadow-lg`
                                                : 'border-white/20 bg-white/10 text-white'
                                }`}
                            >
                                {isMatched ? '✅' : letter}
                            </motion.button>
                        )
                    })}
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                    {words.map((word) => {
                        const isUsed = Object.values(matched).includes(word)
                        return (
                            <motion.button
                                key={word}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onRight(word)}
                                disabled={isUsed || !leftSel}
                                className={`flex h-14 items-center justify-center rounded-2xl border-2 px-2 text-sm font-bold transition ${
                                    isUsed
                                        ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                                        : leftSel
                                            ? 'border-sky-400/40 bg-sky-500/15 text-white'
                                            : 'border-white/15 bg-white/5 text-slate-400'
                                }`}
                            >
                                {isUsed ? '✅' : word}
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
                <p className="mt-3 text-xs text-slate-500">প্রথমে বাম দিকের বর্ণে ট্যাপ করো</p>
            )}
        </motion.div>
    )
}

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
    const voiceLang = resolveVoiceLang(lesson)
    const safeBackHref = lesson.backHref.replace(/\/addition\/?$/, '')
    const { speak, stop: stopSpeak } = useSpeech()
    const {
        isListening, transcript, interimTranscript, error: micError,
        supported: micSupported, startListening, stopListening, resetTranscript,
    } = useSpeechRecognition()

    const [exIdx, setExIdx] = useState(0)
    const [hearts, setHearts] = useState(3)
    const [xp, setXp] = useState(0)
    const [stars, setStars] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [voiceResult, setVoiceResult] = useState<'idle' | 'correct' | 'wrong'>('idle')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)
    const voiceHandled = useRef(false)

    const currentEx = lesson.exercises[exIdx]
    const totalSteps = lesson.exercises.length
    const isResult = exIdx >= totalSteps
    const progressPct = totalSteps ? (exIdx / totalSteps) * 100 : 0
    const icon = letterIcon(lesson.letter, lesson.emoji)

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => speak(currentEx.voiceText, voiceLang), 450)
        return () => clearTimeout(timer)
    }, [exIdx, currentEx, speak, voiceLang, isResult])

    useEffect(() => {
        setVoiceResult('idle')
        voiceHandled.current = false
        resetTranscript()
    }, [exIdx, resetTranscript])

    useEffect(() => {
        if (!transcript || isListening || voiceHandled.current) return
        if (currentEx?.type !== 'listen-repeat' && currentEx?.type !== 'pronounce') return
        voiceHandled.current = true
        const expected = currentEx.content
        const correct = matchSpokenToExpected(transcript, expected)
        if (correct) {
            setVoiceResult('correct')
            setXp((x) => x + 10)
            celebrate()
            setTimeout(() => nextEx(), 1400)
        } else {
            setVoiceResult('wrong')
            setHearts((h) => Math.max(0, h - 1))
            setTimeout(() => {
                setVoiceResult('idle')
                voiceHandled.current = false
                resetTranscript()
            }, 1800)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening])

    function celebrate() {
        setShowCelebration(true)
        speak(voiceLang === 'en-US' ? 'Well done!' : 'শাবাশ!', voiceLang === 'en-US' ? 'en-US' : 'bn-BD')
        setTimeout(() => setShowCelebration(false), 1600)
    }

    function nextEx() {
        try { stopListening() } catch { /* */ }
        resetTranscript()
        setVoiceResult('idle')
        voiceHandled.current = false
        const next = exIdx + 1
        if (next < totalSteps) {
            setExIdx(next)
            setSelected(null)
            setHasDrawn(false)
            clearCanvas()
        } else {
            const pct = totalSteps ? (xp / (totalSteps * 10)) * 100 : 0
            setStars(pct >= 85 ? 3 : pct >= 55 ? 2 : 1)
            setExIdx(totalSteps)
        }
    }

    function handleSelect(option: string) {
        if (selected !== null) return
        setSelected(option)
        const correct = option === currentEx?.correctAnswer
        if (correct) {
            celebrate()
            setXp((x) => x + 10)
        } else {
            setHearts((h) => Math.max(0, h - 1))
        }
        setTimeout(() => nextEx(), 1200)
    }

    function toggleMic() {
        try {
            if (isListening) {
                stopListening()
            } else {
                stopSpeak()
                resetTranscript()
                setVoiceResult('idle')
                voiceHandled.current = false
                startListening(voiceLang)
            }
        } catch { /* */ }
    }

    function getPos(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect()
        if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
    }
    function startDraw(e: React.TouchEvent | React.MouseEvent) {
        isDrawing.current = true
        setHasDrawn(true)
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const { x, y } = getPos(e, canvas)
        ctx.beginPath()
        ctx.moveTo(x, y)
    }
    function draw(e: React.TouchEvent | React.MouseEvent) {
        if (!isDrawing.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const { x, y } = getPos(e, canvas)
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#a78bfa'
        ctx.lineWidth = 7
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
    }
    function endDraw() { isDrawing.current = false }
    function clearCanvas() {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
    }

    async function finishAndSave() {
        if (saving) return
        setSaving(true)
        setSaveError(null)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setSaveError('লগইন নেই')
                setSaving(false)
                return
            }
            const { error } = await supabase.from('learning_progress').upsert({
                user_id: user.id,
                lesson_id: String(lesson.id),
                score: xp,
                stars,
                completed: true,
                completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,lesson_id' })
            if (error) {
                setSaveError(error.message)
                setSaving(false)
                return
            }
            try {
                const key = `kids_progress_${user.id}`
                const prev = JSON.parse(sessionStorage.getItem(key) || '{}')
                prev[String(lesson.id)] = { completed: true, stars, score: xp }
                sessionStorage.setItem(key, JSON.stringify(prev))
            } catch { /* */ }
            router.push(safeBackHref)
            router.refresh()
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'সেভ ব্যর্থ')
            setSaving(false)
        }
    }

    if (isResult) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#120a2e] via-[#0d0a2e] to-[#0a0a1a] flex flex-col items-center justify-center p-6 text-white">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${lesson.color} opacity-10`} />
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center max-w-sm w-full">
                    <div className="text-8xl mb-3">{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}</div>
                    <div className="flex justify-center gap-2 mb-5">
                        {[1, 2, 3].map((s) => (
                            <span key={s} className={`text-4xl ${s <= stars ? '' : 'opacity-20 grayscale'}`}>⭐</span>
                        ))}
                    </div>
                    <h2 className="text-2xl font-black mb-1">
                        {stars === 3 ? 'অসাধারণ! 🎉' : stars === 2 ? 'খুব ভালো! 👏' : 'চেষ্টা করেছো! 💪'}
                    </h2>
                    <p className="text-gray-400 mb-1">{lesson.letter} — {lesson.word} শেষ!</p>
                    <p className="text-3xl mb-5">{icon}</p>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="font-black text-amber-400">+{xp}</div>
                            <div className="text-xs text-gray-500">XP</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="font-black text-yellow-400">{stars}/3</div>
                            <div className="text-xs text-gray-500">Stars</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="font-black text-red-400">{hearts}/3</div>
                            <div className="text-xs text-gray-500">Hearts</div>
                        </div>
                    </div>
                    {saveError && <p className="mb-3 text-sm text-red-200">⚠️ {saveError}</p>}
                    <motion.button whileTap={{ scale: 0.96 }} type="button" disabled={saving} onClick={() => void finishAndSave()}
                        className={`w-full min-h-12 rounded-2xl bg-gradient-to-r ${lesson.color} font-bold text-white shadow-lg disabled:opacity-60`}>
                        {saving ? 'সেভ হচ্ছে…' : '← তালিকায় ফিরে যাও'}
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    if (!accessLoading && !isPaid && !canDoLesson) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <LockOverlay type="daily_limit" />
            </div>
        )
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#120a2e] via-[#0d0a2e] to-[#080818] text-white flex flex-col">
            <div className={`pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br ${lesson.color} opacity-25 blur-3xl`} />

            <AnimatePresence>
                {showCelebration && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                        {CELEBRATION.map((pos, i) => (
                            <motion.div key={i} initial={{ y: 0, x: 0, opacity: 1, scale: 0 }} animate={{ y: pos.y, x: pos.x, opacity: 0, scale: 2.2 }} transition={{ duration: 1.3, delay: i * 0.06 }} className="absolute text-4xl">
                                {['🌟', '⭐', '✨', '🎉', '🎊'][i]}
                            </motion.div>
                        ))}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} className="rounded-full border border-white/20 bg-white/15 px-6 py-3 text-2xl font-black backdrop-blur-md">
                            শাবাশ! 🎉
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 shrink-0 px-4 pt-4 pb-2 flex items-center gap-2.5">
                <button type="button" onClick={() => router.push(safeBackHref)} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg font-bold">←</button>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${lesson.color} text-lg font-black shadow-lg`}>
                    {lesson.letter}
                </div>
                <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden border border-white/10">
                    <motion.div className={`h-3 rounded-full bg-gradient-to-r ${lesson.color}`} animate={{ width: `${progressPct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
                <div className="flex gap-0.5">
                    {[1, 2, 3].map((h) => (
                        <span key={h} className={`text-lg ${h <= hearts ? '' : 'opacity-25 grayscale'}`}>❤️</span>
                    ))}
                </div>
                <div className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-sm font-bold text-amber-300">⚡{xp}</div>
            </div>

            <div className="relative z-10 mb-2 px-4 text-center">
                <motion.p key={currentEx?.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-base font-black text-white/90">
                    {currentEx?.title}
                </motion.p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentEx?.id || 'x'}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-sm"
                    >
                        {currentEx?.type === 'intro' && (
                            <div className="text-center">
                                <motion.div initial={{ scale: 0.75, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 20 }} className="relative mx-auto mb-5 w-full max-w-xs">
                                    <div className={`absolute -inset-3 rounded-[28px] bg-gradient-to-br ${lesson.color} opacity-40 blur-xl`} />
                                    <div className={`relative rounded-3xl bg-gradient-to-br ${lesson.color} p-[2.5px] shadow-2xl`}>
                                        <div className="rounded-[22px] bg-[#0c0a24]/95 px-6 py-6 text-center">
                                            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="mb-3 text-5xl">{icon}</motion.div>
                                            <div className="mb-1 text-7xl font-black leading-none text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">{currentEx.content}</div>
                                            <div className="mt-3 text-xl font-bold text-white/95">{lesson.word}</div>
                                            {lesson.wordEn && <div className="mt-0.5 text-sm text-white/50">{lesson.wordEn}</div>}
                                        </div>
                                    </div>
                                </motion.div>
                                <p className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-relaxed text-slate-200">{currentEx.voiceText}</p>
                                <button type="button" onClick={() => speak(currentEx.voiceText, voiceLang)} className="mb-3 min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 font-bold">🔊 গল্প শোনো</button>
                                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => nextEx()} className={`min-h-12 w-full rounded-2xl bg-gradient-to-r ${lesson.color} font-bold shadow-lg`}>এগিয়ে যাও →</motion.button>
                            </div>
                        )}

                        {(currentEx?.type === 'listen-repeat' || currentEx?.type === 'pronounce') && (
                            <div className="text-center">
                                <motion.div
                                    animate={isListening ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                                    transition={isListening ? { duration: 1.2, repeat: Infinity } : {}}
                                    className={`mx-auto mb-4 flex size-28 items-center justify-center rounded-[28px] bg-gradient-to-br ${lesson.color} text-5xl font-black shadow-2xl ${isListening ? 'ring-4 ring-red-400/60' : ''}`}
                                >
                                    {currentEx.type === 'pronounce' ? lesson.letter : currentEx.content}
                                </motion.div>
                                {currentEx.type === 'listen-repeat' && (
                                    <p className="mb-3 text-2xl font-bold text-slate-100">{lesson.emoji} {currentEx.content}</p>
                                )}
                                <p className="mb-3 text-sm text-slate-400">
                                    {currentEx.type === 'pronounce' ? 'জোরে বর্ণটি বলো' : 'শব্দটি শুনে বলো'}
                                </p>

                                <button type="button" onClick={() => speak(currentEx.voiceText, voiceLang)} className="mb-3 min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 font-bold">
                                    🔊 শোনো
                                </button>

                                {micSupported ? (
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        type="button"
                                        onClick={toggleMic}
                                        className={`mb-3 min-h-14 w-full rounded-2xl font-black text-lg shadow-lg transition ${
                                            isListening
                                                ? 'bg-red-500 text-white animate-pulse shadow-red-500/30'
                                                : voiceResult === 'correct'
                                                    ? 'bg-emerald-500 text-white'
                                                    : voiceResult === 'wrong'
                                                        ? 'bg-red-500/80 text-white'
                                                        : 'bg-emerald-500 text-white shadow-emerald-500/25'
                                        }`}
                                    >
                                        {isListening ? '⏹ থামো — শুনছি…' : voiceResult === 'correct' ? '✅ সঠিক!' : voiceResult === 'wrong' ? '❌ আবার চেষ্টা' : '🎤 মাইকে বলো'}
                                    </motion.button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { celebrate(); setXp((x) => x + 10); nextEx() }}
                                        className="mb-3 min-h-12 w-full rounded-2xl bg-emerald-500 font-bold"
                                    >
                                        ✓ বলেছি (মাইক নেই)
                                    </button>
                                )}

                                {(transcript || interimTranscript) && (
                                    <div className={`mb-2 rounded-xl border px-3 py-2 text-sm ${
                                        voiceResult === 'correct' ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                                        : voiceResult === 'wrong' ? 'border-red-400/40 bg-red-500/15 text-red-200'
                                        : 'border-white/15 bg-white/5 text-slate-300'
                                    }`}>
                                        তুমি বললে: <span className="font-bold">{transcript || interimTranscript}</span>
                                    </div>
                                )}
                                {micError && <p className="mb-2 text-sm text-red-300">{micError}</p>}
                                {!micSupported && <p className="mb-2 text-xs text-slate-500">Chrome/Safari-এ মাইক ভালো কাজ করে</p>}

                                <button type="button" onClick={() => nextEx()} className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-slate-400">
                                    স্কিপ →
                                </button>
                            </div>
                        )}

                        {currentEx?.type === 'bubble-pop' && (
                            <div className="relative mx-auto h-80 w-full">
                                <p className="mb-2 text-center text-sm font-bold text-sky-300">🫧 সঠিক বুদবুদ ফাটাও!</p>
                                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-sky-400/25 bg-gradient-to-b from-sky-950/50 to-indigo-950/40">
                                    {(currentEx.options || []).map((opt, i) => {
                                        const pos = [
                                            { top: '10%', left: '12%' }, { top: '14%', left: '58%' },
                                            { top: '46%', left: '8%' }, { top: '42%', left: '60%' },
                                            { top: '68%', left: '30%' }, { top: '72%', left: '65%' },
                                        ][i % 6]
                                        const done = selected !== null
                                        const isSel = selected === opt
                                        const isRight = opt === currentEx.correctAnswer
                                        return (
                                            <motion.button key={`${opt}-${i}`} type="button" disabled={done} onClick={() => handleSelect(opt)}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={done && isSel ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : { scale: [1, 1.1, 1], y: [0, -12, 0], opacity: 1 }}
                                                transition={done && isSel ? { duration: 0.45 } : { duration: 2.1 + i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                                                style={{ top: pos.top, left: pos.left }}
                                                className={`absolute flex size-[4.25rem] items-center justify-center rounded-full border-2 text-2xl font-black shadow-xl ${
                                                    done && isSel
                                                        ? (isRight ? 'border-emerald-200 bg-emerald-400 text-white' : 'border-red-200 bg-red-400 text-white')
                                                        : `border-white/45 bg-gradient-to-br ${lesson.color} text-white`
                                                }`}>
                                                {opt}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {(currentEx?.type === 'tap-correct' || currentEx?.type === 'quiz') && (
                            <div className="text-center">
                                <div className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${lesson.color} text-4xl font-black shadow-xl`}>
                                    {lesson.letter}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {(currentEx.options || []).map((opt) => (
                                        <motion.button whileTap={{ scale: 0.92 }} key={opt} type="button" onClick={() => handleSelect(opt)}
                                            className={`min-h-16 rounded-2xl text-2xl font-black border-2 transition ${
                                                selected === null ? 'border-white/20 bg-white/10 text-white'
                                                : opt === currentEx.correctAnswer ? 'border-emerald-400 bg-emerald-500/35 text-emerald-50 shadow-lg shadow-emerald-500/20'
                                                : selected === opt ? 'border-red-400 bg-red-500/30 text-red-100'
                                                : 'border-white/10 bg-white/5 text-slate-500 opacity-50'
                                            }`}>
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentEx?.type === 'letter-puzzle' && (
                            <div className="text-center">
                                <div className="mb-5 rounded-3xl border-2 border-dashed border-amber-400/45 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-5">
                                    <p className="mb-2 text-sm font-bold text-amber-200">🧩 ধাঁধা</p>
                                    <p className="text-3xl font-black">{lesson.emoji} {lesson.word}</p>
                                    <p className="mt-2 text-sm text-slate-400">কোন বর্ণ দিয়ে শুরু?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {(currentEx.options || []).map((opt) => (
                                        <motion.button whileTap={{ scale: 0.92 }} key={opt} type="button" onClick={() => handleSelect(opt)}
                                            className={`min-h-16 rounded-2xl text-2xl font-black border-2 transition ${
                                                selected === null ? 'border-amber-400/30 bg-amber-500/15 text-white'
                                                : opt === currentEx.correctAnswer ? 'border-emerald-400 bg-emerald-500/35 text-emerald-50'
                                                : selected === opt ? 'border-red-400 bg-red-500/30 text-red-100'
                                                : 'border-white/10 bg-white/5 text-slate-500 opacity-50'
                                            }`}>
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentEx?.type === 'word-builder' && (
                            <WordBuilderGame
                                currentEx={currentEx}
                                lesson={lesson}
                                speak={speak}
                                onSuccess={() => { celebrate(); setXp((x) => x + 10); setTimeout(() => nextEx(), 700) }}
                            />
                        )}

                        {currentEx?.type === 'matching' && (
                            <MatchingGame
                                currentEx={currentEx}
                                lesson={lesson}
                                speak={speak}
                                onComplete={(ok) => {
                                    if (ok) {
                                        celebrate()
                                        setXp((x) => x + 10)
                                        setTimeout(() => nextEx(), 700)
                                    } else {
                                        setHearts((h) => Math.max(0, h - 1))
                                    }
                                }}
                            />
                        )}

                        {currentEx?.type === 'trace' && (
                            <div className="text-center">
                                <div className={`mx-auto mb-3 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${lesson.color} text-4xl font-black shadow-xl`}>
                                    {currentEx.content}
                                </div>
                                <p className="mb-2 text-sm text-slate-400">আঙ্গুল দিয়ে বর্ণটা আঁকো</p>
                                <canvas
                                    ref={canvasRef}
                                    width={280}
                                    height={200}
                                    className="mx-auto mb-3 touch-none rounded-2xl border-2 border-violet-400/30 bg-white/5"
                                    onMouseDown={startDraw}
                                    onMouseMove={draw}
                                    onMouseUp={endDraw}
                                    onMouseLeave={endDraw}
                                    onTouchStart={startDraw}
                                    onTouchMove={draw}
                                    onTouchEnd={endDraw}
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={clearCanvas} className="min-h-11 flex-1 rounded-2xl border border-white/15 bg-white/5 font-bold text-slate-300">↻ মুছো</button>
                                    <motion.button whileTap={{ scale: 0.96 }} type="button"
                                        onClick={() => { if (hasDrawn) { celebrate(); setXp((x) => x + 10); nextEx() } }}
                                        className={`min-h-11 flex-1 rounded-2xl font-bold ${hasDrawn ? `bg-gradient-to-r ${lesson.color} text-white shadow-lg` : 'bg-white/10 text-slate-500'}`}>
                                        ✓ হয়ে গেছে
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
