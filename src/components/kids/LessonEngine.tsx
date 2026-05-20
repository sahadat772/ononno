'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { createClient } from '@/lib/supabase'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExerciseType =
    | 'intro'
    | 'listen-repeat'
    | 'tap-correct'
    | 'bubble-pop'
    | 'letter-puzzle'
    | 'trace'
    | 'quiz'
    | 'pronounce'
    | 'archery-target'
    | 'word-builder'
    | 'matching'

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
    exercises: Exercise[]
}

// ── Static celebration positions ──────────────────────────────────────────────

const CELEBRATION = [
    { y: -320, x: -80 }, { y: -280, x: 120 },
    { y: -350, x: 40 }, { y: -260, x: -140 },
    { y: -300, x: 100 },
]

// ── Pure shuffle function ─────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

// ── Matching Exercise Component ───────────────────────────────────────────────

function MatchingExercise({
    currentEx,
    lesson,
    speak,
    onComplete,
}: {
    currentEx: Exercise
    lesson: LessonConfig
    speak: (text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA') => void
    onComplete: (correct: boolean) => void
}) {
    const [leftSelected, setLeftSelected] = useState<string | null>(null)
    const [matched, setMatched] = useState<Record<string, string>>({})
    const [wrongPair, setWrongPair] = useState<string | null>(null)
    const [completed, setCompleted] = useState(false)

    const pairs = useMemo(() =>
        currentEx.options?.map(opt => {
            const [letter, word] = opt.split('-')
            return { letter, word }
        }) || []
        , [currentEx.options])

    const letters = useMemo(() => pairs.map(p => p.letter), [pairs])

    const words = useMemo(() =>
        shuffleArray(pairs.map(p => p.word))
        , [pairs])

    function handleLeftClick(letter: string) {
        if (matched[letter]) return
        speak(letter, lesson.lang)
        setLeftSelected(letter)
    }

    function handleRightClick(word: string) {
        if (!leftSelected) return
        if (Object.values(matched).includes(word)) return

        const correctWord = pairs.find(p => p.letter === leftSelected)?.word
        const isMatch = correctWord === word

        if (isMatch) {
            const newMatched = { ...matched, [leftSelected]: word }
            setMatched(newMatched)
            setLeftSelected(null)
            speak(word, lesson.lang)
            if (Object.keys(newMatched).length === pairs.length) {
                setCompleted(true)
                setTimeout(() => onComplete(true), 1000)
            }
        } else {
            setWrongPair(leftSelected)
            setTimeout(() => {
                setWrongPair(null)
                setLeftSelected(null)
            }, 800)
            onComplete(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center max-w-sm w-full"
        >
            <p className="text-xl font-bold text-white mb-2">🔗 মেলাও!</p>
            <p className="text-gray-400 text-sm mb-6">
                বাম দিক থেকে বেছে ডান দিকে মেলাও
            </p>

            <div className="flex gap-4 justify-center">
                {/* Left column */}
                <div className="flex flex-col gap-3 flex-1">
                    {letters.map((letter, i) => {
                        const isMatched = !!matched[letter]
                        const isSelected = leftSelected === letter
                        const isWrong = wrongPair === letter
                        return (
                            <motion.button key={i}
                                whileTap={!isMatched ? { scale: 0.95 } : {}}
                                animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                                onClick={() => !isMatched && handleLeftClick(letter)}
                                className={`h-14 rounded-2xl text-2xl font-bold border-2 transition-all ${isMatched
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : isSelected
                                        ? `bg-linear-to-br ${lesson.color} text-white border-transparent shadow-lg ring-4 ring-white/20`
                                        : isWrong
                                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    }`}
                            >
                                {isMatched ? '✅' : letter}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Connector */}
                <div className="flex flex-col justify-around py-2">
                    {letters.map((_, i) => (
                        <div key={i} className="w-6 h-0.5 bg-white/10" />
                    ))}
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-3 flex-1">
                    {words.map((word, i) => {
                        const isMatched = Object.values(matched).includes(word)
                        const matchedLetter = Object.entries(matched).find(([, w]) => w === word)?.[0]
                        return (
                            <motion.button key={i}
                                whileTap={!isMatched ? { scale: 0.95 } : {}}
                                onClick={() => !isMatched && handleRightClick(word)}
                                className={`h-14 rounded-2xl text-base font-bold border-2 transition-all px-2 ${isMatched
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : leftSelected
                                        ? 'bg-white/15 border-violet-500/40 text-white hover:bg-violet-500/20 cursor-pointer'
                                        : 'bg-white/10 border-white/20 text-gray-400'
                                    }`}
                            >
                                {isMatched ? `${matchedLetter} ✅` : word}
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {completed && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4"
                >
                    <p className="text-3xl mb-1">🎉</p>
                    <p className="text-emerald-400 font-bold">সব মিলে গেছে! শাবাশ!</p>
                </motion.div>
            )}

            {!completed && leftSelected && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-sm text-violet-400"
                >
                    {leftSelected} এর সাথে মিলিয়ে দাও →
                </motion.p>
            )}
        </motion.div>
    )
}

// ── Main LessonEngine Component ───────────────────────────────────────────────

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { speak, isSpeaking } = useSpeech()
    const { isListening, transcript, resetTranscript } = useSpeechRecognition()
    const [feedback, setFeedback] = useState<string | null>(null)

    const [exIdx, setExIdx] = useState(0)
    const [hearts, setHearts] = useState(3)
    const [xp, setXp] = useState(0)
    const [stars, setStars] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)
    // const [ setListenState] = useState<'idle' | 'correct' | 'wrong'>('idle')
    const [mistakes, setMistakes] = useState<Exercise[]>([])
    const [repeatMode, setRepeatMode] = useState(false)
    const [repeatQueue, setRepeatQueue] = useState<Exercise[]>([])
    const { state: voiceState, transcript: voiceTranscript, checkPronunciation, reset: resetVoice } = useVoiceRecorder()

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)

    // Repeat mode এ current exercise
    const currentEx = repeatMode
        ? repeatQueue[exIdx]
        : lesson.exercises[exIdx]

    const totalSteps = repeatMode
        ? repeatQueue.length
        : lesson.exercises.length

    const progress = (exIdx / totalSteps) * 100
    const isResult = exIdx >= totalSteps

    // ── Auto-speak ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => {
            speak(currentEx.voiceText, lesson.lang)
        }, 500)
        return () => clearTimeout(timer)
    }, [exIdx, currentEx, speak, lesson.lang, isResult, repeatMode])

    // ── Voice recognition ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!transcript || isListening) return
        if (currentEx?.type !== 'listen-repeat' && currentEx?.type !== 'pronounce') return

        const expected = currentEx.content.toLowerCase()
        const actual = transcript.toLowerCase()
        const correct = actual.includes(expected) || expected.includes(actual)

        queueMicrotask(() => {
            // setListenState(correct ? 'correct' : 'wrong')
            if (correct) setXp(x => x + 5)
            else setHearts(h => Math.max(0, h - 1))
        })

        resetTranscript()
        const t = setTimeout(() => nextEx(), 2000)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening])

    // ── Helpers ────────────────────────────────────────────────────────────────

    function celebrate() {
        setShowCelebration(true)
        speak('শাবাশ!', 'bn-BD')
        setTimeout(() => setShowCelebration(false), 1800)
    }

    function recordMistake(ex: Exercise) {
        // একই exercise দুইবার add না করতে
        setMistakes(prev =>
            prev.find(m => m.id === ex.id) ? prev : [...prev, ex]
        )
    }

    function nextEx() {
        const next = exIdx + 1
        resetVoice()
        if (next < totalSteps) {
            setExIdx(next)
            setSelected(null)
            setIsCorrect(null)
            // setListenState('idle')
            setHasDrawn(false)
            clearCanvas()
        } else {
            // Repeat mode শেষ হলে result
            if (repeatMode) {
                const pct = (xp / 50) * 100
                setStars(pct >= 90 ? 3 : pct >= 60 ? 2 : 1)
                setExIdx(totalSteps)
                return
            }

            // Mistake আছে → repeat mode শুরু
            if (mistakes.length > 0) {
                setRepeatMode(true)
                setRepeatQueue(mistakes)
                setMistakes([])
                setExIdx(0)
                setSelected(null)
                setIsCorrect(null)
                // setListenState('idle')
            } else {
                const pct = (xp / 50) * 100
                setStars(pct >= 90 ? 3 : pct >= 60 ? 2 : 1)
                setExIdx(totalSteps)
            }
        }
    }

    function handleSelect(option: string) {
        if (selected !== null) return  // ← null check করো
        setSelected(option)
        const correct = option === currentEx?.correctAnswer
        setIsCorrect(correct)
        if (correct) {
            celebrate()
            setXp(x => x + 10)
        } else {
            setHearts(h => Math.max(0, h - 1))
            if (currentEx) recordMistake(currentEx)
        }
        setTimeout(() => nextEx(), 1400)
    }

    // ── Canvas ─────────────────────────────────────────────────────────────────

    function getPos(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect()
        if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
    }

    function startDraw(e: React.TouchEvent | React.MouseEvent) {
        isDrawing.current = true
        setHasDrawn(true)
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext('2d'); if (!ctx) return
        const { x, y } = getPos(e, canvas)
        ctx.beginPath(); ctx.moveTo(x, y)
    }

    function draw(e: React.TouchEvent | React.MouseEvent) {
        if (!isDrawing.current) return
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext('2d'); if (!ctx) return
        const { x, y } = getPos(e, canvas)
        ctx.lineTo(x, y)
        ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 6
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.stroke()
    }

    function endDraw() { isDrawing.current = false }

    function clearCanvas() {
        const canvas = canvasRef.current; if (!canvas) return
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
    }

    // ── Result Screen ─────────────────────────────────────────────────────────

    if (isResult) return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] flex flex-col items-center justify-center p-6 text-white">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center max-w-sm w-full">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                    transition={{ repeat: 3, duration: 0.4 }}
                    className="text-8xl mb-4"
                >
                    {stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}
                </motion.div>

                <div className="flex justify-center gap-2 mb-5">
                    {[1, 2, 3].map(s => (
                        <motion.span key={s}
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: s * 0.2 }}
                            className={`text-4xl ${s <= stars ? 'opacity-100' : 'opacity-20'}`}
                        >⭐</motion.span>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                    {stars === 3 ? 'অসাধারণ! 🎉' : stars === 2 ? 'খুব ভালো! 👏' : 'চেষ্টা করেছো! 💪'}
                </h2>
                <p className="text-gray-400 mb-2">{lesson.letter} lesson শেষ!</p>

                {repeatMode && (
                    <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-3 mb-4 text-sm text-violet-300">
                        ✅ ভুল গুলো repeat করে শিখে ফেলেছো!
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'XP', value: `+${xp}`, icon: '⚡', color: 'text-amber-400' },
                        { label: 'Stars', value: `${stars}/3`, icon: '⭐', color: 'text-yellow-400' },
                        { label: 'Hearts', value: `${hearts}/3`, icon: '❤️', color: 'text-red-400' },
                    ].map((s, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
                        >
                            <div className="text-xl mb-1">{s.icon}</div>
                            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-gray-400">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {stars >= 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 mb-5 text-sm text-emerald-300"
                    >
                        🔓 পরের lesson unlock হয়েছে!
                    </motion.div>
                )}

                <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            setExIdx(0); setHearts(3); setXp(0)
                            setStars(0); setSelected(null); setIsCorrect(null)
                            setMistakes([]); setRepeatMode(false); setRepeatQueue([])
                        }}
                        className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold"
                    >🔄 আবার</motion.button>
                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={async () => {
                            try {
                                const supabase = createClient()
                                const { data: { user } } = await supabase.auth.getUser()
                                if (user) {
                                    // এই lesson complete mark করো
                                    await supabase.from('learning_progress').upsert({
                                        user_id: user.id,
                                        lesson_id: lesson.id,
                                        score: xp,
                                        stars: stars,
                                        completed: true,
                                        completed_at: new Date().toISOString(),
                                    }, { onConflict: 'user_id,lesson_id' })

                                    // student_stats update করো
                                    await supabase.rpc('increment_student_xp', {
                                        p_user_id: user.id,
                                        p_xp: xp,
                                        p_lessons: 1,
                                    })
                                }
                            } catch (e) {
                                console.error('Progress save failed:', e)
                            }
                            router.push(lesson.backHref)
                        }}
                        className={`flex-1 py-3 rounded-2xl bg-linear-to-r ${lesson.color} text-white font-bold shadow-lg`}
                    >পরের lesson →</motion.button>
                </div>
            </motion.div>
        </div>
    )

    // ── Main Render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] text-white flex flex-col">

            {/* Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
                    >
                        {CELEBRATION.map((pos, i) => (
                            <motion.div key={i}
                                initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
                                animate={{ y: pos.y, x: pos.x, opacity: 0, scale: 2 }}
                                transition={{ duration: 1.4, delay: i * 0.08 }}
                                className="absolute text-4xl"
                            >{['🌟', '⭐', '✨', '🎉', '🎊'][i]}</motion.div>
                        ))}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} exit={{ scale: 0 }} className="text-7xl">🌟</motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <div className="shrink-0 px-4 pt-4 pb-2 flex items-center gap-3">
                <button onClick={() => router.push(lesson.backHref)} className="text-gray-400 hover:text-white shrink-0">✕</button>
                <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                    <motion.div
                        className={`h-4 rounded-full bg-linear-to-r ${lesson.color}`}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3].map(h => <span key={h} className={`text-lg ${h <= hearts ? 'opacity-100' : 'opacity-20'}`}>❤️</span>)}
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <span className="text-xs">⚡</span>
                    <span className="text-amber-400 font-bold text-xs">{xp}</span>
                </div>
            </div>

            {/* Repeat mode banner */}
            {repeatMode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 mb-2 bg-violet-500/10 border border-violet-500/30 rounded-2xl px-4 py-2 flex items-center gap-2"
                >
                    <span className="text-lg">🔁</span>
                    <p className="text-violet-300 text-sm font-semibold">
                        ভুল গুলো আবার practice করো! ({exIdx + 1}/{repeatQueue.length})
                    </p>
                </motion.div>
            )}

            {/* Step label */}
            <div className="text-center mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                    {repeatMode ? '🔁 Repeat — ' : ''}{exIdx + 1}/{totalSteps} — {currentEx?.title}
                </span>
            </div>
            {/* Exercise */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
                <AnimatePresence mode="wait">

                    {/* INTRO */}
                    {currentEx?.type === 'intro' && (
                        <motion.div key={`intro-${exIdx}`}
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                className={`w-40 h-40 rounded-3xl bg-linear-to-br ${lesson.color} flex items-center justify-center text-7xl font-bold text-white shadow-2xl mx-auto mb-5 cursor-pointer relative`}
                            >
                                {currentEx.content}
                                <span className="absolute top-3 right-3 text-white/60 text-xl">{isSpeaking ? '🔊' : '🔈'}</span>
                            </motion.div>
                            <div className="text-6xl mb-2">{lesson.emoji}</div>
                            <h2 className="text-3xl font-bold text-white mb-1">{lesson.word}</h2>
                            <p className="text-gray-400 text-sm mb-4">{lesson.wordEn}</p>
                            <button onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                className={`bg-linear-to-r ${lesson.color} text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg mb-5 mx-auto flex items-center gap-2`}
                            >🔊 আবার শুনি</button>
                            <button onClick={nextEx}
                                className="w-full bg-linear-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl text-lg font-bold shadow-lg"
                            >পরের ধাপ →</button>
                        </motion.div>
                    )}

                    {/* LISTEN & REPEAT */}
                    {currentEx?.type === 'listen-repeat' && (
                        <motion.div key={`listen-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-5">🎧 শোনো এবং বলো!</p>

                            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                                className={`w-32 h-32 rounded-3xl bg-linear-to-br ${lesson.color} flex items-center justify-center text-6xl font-bold text-white shadow-xl mx-auto mb-3`}
                            >{currentEx.content}</motion.div>

                            <p className="text-2xl font-bold text-white mb-4">{lesson.word}</p>

                            <button onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                className={`bg-linear-to-r ${lesson.color} text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg mb-5 mx-auto flex items-center gap-2`}
                            >🔊 আবার শুনি</button>

                            {/* Voice state feedback */}
                            {voiceState === 'recording' && (
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-red-400 font-bold text-lg">🎤 শুনছি... বলো!</p>
                                    <p className="text-gray-400 text-sm mt-1">৩ সেকেন্ড সময় আছে</p>
                                </motion.div>
                            )}
                            {voiceState === 'processing' && (
                                <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl p-4 mb-4">
                                    <p className="text-violet-400 font-bold">⏳ যাচাই করছি...</p>
                                </div>
                            )}
                            {voiceState === 'correct' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-3xl mb-1">🌟</p>
                                    <p className="text-emerald-400 font-bold">শাবাশ! সঠিক উচ্চারণ!</p>
                                    {voiceTranscript && <p className="text-gray-400 text-sm mt-1">তুমি বলেছো: {voiceTranscript}</p>}
                                </motion.div>
                            )}
                            {voiceState === 'wrong' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-red-400 font-bold">আবার চেষ্টা করো! 💪</p>
                                    {voiceTranscript && <p className="text-gray-400 text-sm mt-1">তুমি বলেছো: {voiceTranscript}</p>}
                                </motion.div>
                            )}

                            {voiceState === 'idle' && (
                                <div className="space-y-3">
                                    <motion.button whileTap={{ scale: 0.95 }}
                                        onClick={async () => {
                                            const correct = await checkPronunciation(currentEx.content, lesson.lang)
                                            if (correct) {
                                                setXp(x => x + 5)
                                                setTimeout(() => nextEx(), 1500)
                                            } else {
                                                setHearts(h => Math.max(0, h - 1))
                                                setTimeout(() => resetVoice(), 2000)
                                            }
                                        }}
                                        className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg flex items-center justify-center gap-2 bg-linear-to-r ${lesson.color} text-white`}
                                    >🎤 এখন বলো!</motion.button>

                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => { setXp(x => x + 2); nextEx() }}
                                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-medium text-sm"
                                    >✅ শুনলাম! এড়িয়ে যাই →</motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* PRONOUNCE */}
                    {currentEx?.type === 'pronounce' && (
                        <motion.div key={`pronounce-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-3">🗣️ জোরে বলো!</p>

                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                className={`w-full py-8 rounded-3xl bg-linear-to-br ${lesson.color} flex flex-col items-center justify-center gap-3 shadow-2xl mx-auto mb-6 cursor-pointer`}
                            >
                                <span className="text-7xl font-bold text-white">{currentEx.content}</span>
                                <span className="text-2xl text-white/80">{lesson.word}</span>
                                <span className="text-sm text-white/60">🔊 tap করলে শুনবে</span>
                            </motion.div>

                            {voiceState === 'recording' && (
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-red-400 font-bold text-lg">🎤 শুনছি... বলো!</p>
                                    <p className="text-gray-400 text-sm">৩ সেকেন্ড সময় আছে</p>
                                </motion.div>
                            )}
                            {voiceState === 'processing' && (
                                <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl p-4 mb-4">
                                    <p className="text-violet-400 font-bold">⏳ যাচাই করছি...</p>
                                </div>
                            )}
                            {voiceState === 'correct' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-3xl mb-1">🌟</p>
                                    <p className="text-emerald-400 font-bold">চমৎকার উচ্চারণ!</p>
                                    {voiceTranscript && <p className="text-gray-400 text-sm mt-1">তুমি বলেছো: {voiceTranscript}</p>}
                                </motion.div>
                            )}
                            {voiceState === 'wrong' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-red-400 font-bold">আবার চেষ্টা করো! 💪</p>
                                    {voiceTranscript && <p className="text-gray-400 text-sm mt-1">তুমি বলেছো: {voiceTranscript}</p>}
                                </motion.div>
                            )}

                            {voiceState === 'idle' && (
                                <div className="space-y-3">
                                    <motion.button whileTap={{ scale: 0.95 }}
                                        onClick={async () => {
                                            const correct = await checkPronunciation(currentEx.content, lesson.lang)
                                            if (correct) {
                                                celebrate()
                                                setXp(x => x + 5)
                                                setTimeout(() => nextEx(), 1500)
                                            } else {
                                                setHearts(h => Math.max(0, h - 1))
                                                if (currentEx) recordMistake(currentEx)
                                                setTimeout(() => resetVoice(), 2000)
                                            }
                                        }}
                                        className={`w-full py-5 rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center gap-3 bg-linear-to-r ${lesson.color} text-white`}
                                    >🎤 এখন বলো!</motion.button>

                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => { setXp(x => x + 2); nextEx() }}
                                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-medium text-sm"
                                    >✅ বললাম! এড়িয়ে যাই →</motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* TAP CORRECT */}
                    {currentEx?.type === 'tap-correct' && (
                        <motion.div key={`tap-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">👆 সঠিকটা ধরো!</p>
                            <div className="text-5xl mb-5">{lesson.emoji}</div>
                            <div className="grid grid-cols-2 gap-3">
                                {currentEx.options?.map((opt, i) => {
                                    const isSelected = selected === opt
                                    const isRight = opt === currentEx.correctAnswer
                                    let cls = 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    if (isSelected) cls = isRight ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'
                                    else if (selected && isRight) cls = 'bg-emerald-500/30 border-emerald-500 text-emerald-300'
                                    return (
                                        <motion.button key={i} whileTap={!selected ? { scale: 0.95 } : {}}
                                            onClick={() => handleSelect(opt)}
                                            className={`py-6 rounded-2xl text-4xl font-bold border-2 transition-all ${cls}`}
                                        >{opt}{isSelected && (isRight ? ' ✅' : ' ❌')}</motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* BUBBLE POP */}
                    {currentEx?.type === 'bubble-pop' && (
                        <motion.div key={`bubble-${exIdx}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">🫧 সঠিক বুদবুদ ফাটাও!</p>
                            <p className="text-gray-400 text-sm mb-4">{lesson.word} কোন বর্ণ দিয়ে শুরু?</p>
                            <div className="relative w-full h-64 bg-linear-to-b from-sky-500/10 to-blue-500/5 rounded-3xl border border-white/10 overflow-hidden">
                                {currentEx.options?.map((opt, i) => (
                                    <motion.button key={i}
                                        animate={{ y: [0, -30 - i * 8, 0], x: [0, i % 2 === 0 ? 15 : -15, 0] }}
                                        transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                                        whileTap={{ scale: 2.5, opacity: 0, transition: { duration: 0.2 } }}
                                        onClick={() => handleSelect(opt)}
                                        className={`absolute w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-2 shadow-lg backdrop-blur-sm ${selected === opt
                                            ? opt === currentEx.correctAnswer ? 'bg-emerald-400 border-emerald-300 text-white' : 'bg-red-400 border-red-300 text-white'
                                            : 'bg-white/20 border-white/40 text-white'
                                            }`}
                                        style={{ left: `${15 + i * 20}%`, top: `${20 + (i % 2) * 30}%` }}
                                    >
                                        {opt}
                                        <div className="absolute top-2 left-3 w-4 h-3 bg-white/40 rounded-full -rotate-45" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* LETTER PUZZLE */}
                    {currentEx?.type === 'letter-puzzle' && (
                        <motion.div key={`puzzle-${exIdx}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-3">🧩 ধাঁধা মেলাও!</p>
                            <div className="w-32 h-32 rounded-3xl border-4 border-dashed border-white/30 bg-white/5 flex items-center justify-center text-6xl font-bold text-white mx-auto mb-5">
                                {selected
                                    ? <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>{selected}</motion.span>
                                    : <span className="text-white/20 text-4xl">?</span>
                                }
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {currentEx.options?.map((opt, i) => {
                                    const isSelected = selected === opt
                                    const isRight = opt === currentEx.correctAnswer
                                    let cls = 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    if (isSelected) cls = isRight ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'
                                    return (
                                        <motion.button key={i}
                                            whileHover={{ rotate: i % 2 === 0 ? 5 : -5, scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleSelect(opt)}
                                            className={`py-5 rounded-2xl text-4xl font-bold border-2 transition-all ${cls}`}
                                        >{opt}</motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* WORD BUILDER */}
                    {currentEx?.type === 'word-builder' && (
                        <motion.div key={`word-builder-${exIdx}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">🔤 অক্ষর সাজাও!</p>
                            <p className="text-gray-400 text-sm mb-4">{lesson.emoji} {lesson.word} বানাও</p>

                            <div className="flex justify-center gap-2 mb-8">
                                {lesson.word.split('').map((_, i) => {
                                    const builtWord = selected || ''
                                    const isPlaced = builtWord[i] !== undefined
                                    return (
                                        <motion.div key={i}
                                            animate={isPlaced ? { scale: [1, 1.2, 1] } : {}}
                                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${isPlaced
                                                ? `bg-linear-to-br ${lesson.color} text-white border-transparent shadow-lg`
                                                : 'bg-white/5 border-dashed border-white/30 text-gray-600'
                                                }`}
                                        >
                                            {isPlaced ? builtWord[i] : '_'}
                                        </motion.div>
                                    )
                                })}
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                                {currentEx.options?.map((opt, i) => {
                                    const builtWord = selected || ''
                                    const usedCount = builtWord.split('').filter(c => c === opt).length
                                    const availCount = currentEx.options?.filter(c => c === opt).length || 0
                                    const isUsed = usedCount >= availCount
                                    return (
                                        <motion.button key={i}
                                            whileHover={!isUsed ? { scale: 1.1, y: -4 } : {}}
                                            whileTap={!isUsed ? { scale: 0.9 } : {}}
                                            onClick={() => {
                                                if (isUsed || selected === lesson.word) return
                                                const newWord = (selected || '') + opt
                                                setSelected(newWord)
                                                if (newWord === lesson.word) {
                                                    setIsCorrect(true)
                                                    celebrate()
                                                    setXp(x => x + 15)
                                                    setTimeout(() => nextEx(), 1500)
                                                } else if (newWord.length >= lesson.word.length) {
                                                    setIsCorrect(false)
                                                    setHearts(h => Math.max(0, h - 1))
                                                    if (currentEx) recordMistake(currentEx)
                                                    setTimeout(() => { setSelected(null); setIsCorrect(null) }, 800)
                                                }
                                            }}
                                            className={`w-14 h-14 rounded-2xl text-2xl font-bold border-2 transition-all shadow-md ${isUsed
                                                ? 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed'
                                                : `bg-linear-to-br ${lesson.color} text-white border-transparent shadow-lg`
                                                }`}
                                        >{opt}</motion.button>
                                    )
                                })}
                            </div>

                            {selected && selected.length > 0 && isCorrect === null && (
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelected(null)}
                                    className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-gray-400 text-sm font-medium mb-4"
                                >🗑 মুছি</motion.button>
                            )}
                            {isCorrect === true && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-3 text-emerald-400 font-bold"
                                >🌟 শাবাশ! সঠিক word বানিয়েছো!</motion.div>
                            )}
                            {isCorrect === false && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 text-red-400 text-sm"
                                >❌ ভুল! আবার চেষ্টা করো</motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* MATCHING */}
                    {currentEx?.type === 'matching' && (
                        <MatchingExercise
                            currentEx={currentEx}
                            lesson={lesson}
                            speak={speak}
                            onComplete={(correct) => {
                                if (correct) {
                                    celebrate()
                                    setXp(x => x + 12)
                                } else {
                                    setHearts(h => Math.max(0, h - 1))
                                    if (currentEx) recordMistake(currentEx)
                                }
                                setTimeout(() => nextEx(), 1500)
                            }}
                        />
                    )}

                    {/* TRACE */}
                    {currentEx?.type === 'trace' && (
                        <motion.div key={`trace-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">✍️ আঙুল দিয়ে লিখি!</p>
                            <p className="text-gray-400 text-sm mb-4">{currentEx.content} লেখো</p>
                            <div className="relative mx-auto mb-4" style={{ width: 280, height: 280 }}>
                                <div className="absolute inset-0 flex items-center justify-center text-9xl font-bold opacity-10 text-white select-none pointer-events-none">
                                    {currentEx.content}
                                </div>
                                <canvas ref={canvasRef} width={280} height={280}
                                    className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 cursor-crosshair touch-none"
                                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={clearCanvas}
                                    className="flex-1 py-3 rounded-2xl bg-white/10 text-gray-300 font-semibold hover:bg-white/20"
                                >🗑 মুছি</button>
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={async () => {
                                        const canvas = canvasRef.current
                                        if (!canvas) return
                                        const ctx = canvas.getContext('2d')
                                        if (!ctx) return

                                        // Pixel check — একদম ফাঁকা হলে reject
                                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                                        const pixels = imageData.data
                                        let filledPixels = 0
                                        for (let i = 3; i < pixels.length; i += 4) {
                                            if (pixels[i] > 128) filledPixels++
                                        }
                                        if (filledPixels < 1500) {
                                            alert('আরেকটু বড় করে লেখো! ✍️')
                                            return
                                        }

                                        // Canvas কে base64 এ convert করো — white background দিয়ে
                                        const exportCanvas = document.createElement('canvas')
                                        exportCanvas.width = canvas.width
                                        exportCanvas.height = canvas.height
                                        const exportCtx = exportCanvas.getContext('2d')!
                                        exportCtx.fillStyle = 'white'
                                        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
                                        exportCtx.drawImage(canvas, 0, 0)
                                        const base64 = exportCanvas.toDataURL('image/png').split(',')[1]

                                        // Groq Vision দিয়ে verify করো
                                        try {
                                            setFeedback('checking')
                                            const res = await fetch('/api/trace-verify', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    imageBase64: base64,
                                                    expectedLetter: currentEx?.content,
                                                    language: lesson.lang,
                                                }),
                                            })
                                            const data = await res.json()

                                            if (data.isCorrect) {
                                                celebrate()
                                                setXp(x => x + 5)
                                                setTimeout(nextEx, 1200)
                                            } else {
                                                alert(`এটা "${currentEx?.content}" না! আবার চেষ্টা করো 💪`)
                                                clearCanvas()
                                            }
                                        } catch {
                                            // API fail হলে pixel check pass করলেই দিয়ে দাও
                                            celebrate()
                                            setXp(x => x + 5)
                                            setTimeout(nextEx, 1200)
                                        } finally {
                                            setFeedback(null)
                                        }
                                    }}
                                    disabled={!hasDrawn}
                                    className={`flex-1 py-3 rounded-2xl font-bold transition-all ${hasDrawn ? `bg-linear-to-r ${lesson.color} text-white shadow-lg` : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                        }`}
                                >{feedback === 'checking' ? '🔍 দেখছি...' : '✅ হয়েছে!'}</motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* QUIZ */}
                    {currentEx?.type === 'quiz' && (
                        <motion.div key={`quiz-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-6">🎯 {currentEx.title}</p>
                            <div className="space-y-3">
                                {currentEx.options?.map((opt, i) => {
                                    const isSelected = selected === opt
                                    const isRight = opt === currentEx.correctAnswer
                                    let cls = 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    if (isSelected) cls = isRight ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'
                                    else if (selected && isRight) cls = 'bg-emerald-500/30 border-emerald-500 text-emerald-300'
                                    return (
                                        <motion.button key={i} whileTap={!selected ? { scale: 0.98 } : {}}
                                            onClick={() => handleSelect(opt)}
                                            className={`w-full py-4 rounded-2xl text-2xl font-bold border-2 transition-all ${cls}`}
                                        >{opt}{isSelected && (isRight ? ' ✅' : ' ❌')}</motion.button>
                                    )
                                })}
                            </div>
                            {selected && (
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}
                                >{isCorrect ? '🌟 শাবাশ!' : `❌ সঠিক: ${currentEx.correctAnswer}`}</motion.p>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}