'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech, unlockSpeechAudio } from '@/hooks/useSpeech'
import { useSpeechRecognition, matchSpokenToExpected } from '@/hooks/useSpeechRecognition'
import { createClient } from '@/lib/supabase'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import { letterIcon } from '@/lib/kids-letter-icons'
import { MatchingGame } from '@/components/kids/MatchingGame'

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

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
    const voiceLang = resolveVoiceLang(lesson)
    const safeBackHref = lesson.backHref.replace(/\/addition\/?$/, '')
    const { speak, stop: stopSpeak, status: speechStatus, isSpeaking, isLoading: speechLoading, unlock } = useSpeech()
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
        unlockSpeechAudio()
        unlock()
    }, [unlock])

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => {
            unlockSpeechAudio()
            speak(currentEx.voiceText, voiceLang)
        }, 500)
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
            unlockSpeechAudio()
            unlock()
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

    function replayVoice() {
        unlockSpeechAudio()
        unlock()
        if (currentEx?.voiceText) speak(currentEx.voiceText, voiceLang)
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

    if (accessLoading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#0a0a1a] text-white">
                <p className="animate-pulse text-sm">লোড…</p>
            </div>
        )
    }

    if (!canDoLesson) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#0a0a1a] p-4">
                <LockOverlay type="daily_limit" />
            </div>
        )
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-[#0a0a1a] text-white">
            {showCelebration && (
                <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
                    {CELEBRATION.map((c, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            animate={{ opacity: 0, y: c.y, x: c.x, scale: 0.4 }}
                            transition={{ duration: 1.4, ease: 'easeOut' }}
                            className="absolute left-1/2 top-1/2 text-3xl"
                        >
                            {['⭐', '🎉', '✨', '💫', '🌟'][i]}
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="mx-auto max-w-lg px-4 pb-10 pt-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => router.push(safeBackHref)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300"
                    >
                        ← ফিরে যাও
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-rose-400">{'❤️'.repeat(Math.max(0, hearts))}</span>
                        <span className="font-bold text-amber-300">⚡{xp}</span>
                    </div>
                </div>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${lesson.color} transition-all`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isResult ? 'result' : exIdx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl"
                    >
                        {!isResult && currentEx && (
                            <div className="mb-3 flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    onClick={replayVoice}
                                    disabled={speechLoading}
                                    className={`flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-2xl border-2 px-4 text-sm font-black transition active:scale-[0.98] ${
                                        isSpeaking
                                            ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
                                            : speechStatus.phase === 'error'
                                              ? 'border-amber-400/50 bg-amber-500/15 text-amber-100'
                                              : 'border-sky-400/40 bg-sky-500/15 text-white'
                                    }`}
                                >
                                    {speechLoading ? '⬇️ লোড…' : isSpeaking ? '🔊 শুনছো…' : '🔊 আবার শোনো'}
                                </button>
                                {speechStatus.phase === 'error' && (
                                    <p className="text-center text-xs text-amber-300">{speechStatus.message}</p>
                                )}
                            </div>
                        )}

                        {isResult ? (
                            <div className="py-6 text-center">
                                <p className="mb-2 text-5xl">{icon}</p>
                                <h2 className="mb-1 text-2xl font-black">লেসন শেষ!</h2>
                                <p className="mb-4 text-amber-300">{'⭐'.repeat(stars)} · {xp} XP</p>
                                {saveError && <p className="mb-2 text-sm text-red-300">{saveError}</p>}
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => void finishAndSave()}
                                    className={`min-h-12 w-full rounded-2xl bg-gradient-to-r ${lesson.color} text-sm font-black text-white`}
                                >
                                    {saving ? 'সেভ…' : '✓ সম্পন্ন ও ফিরে যাও'}
                                </button>
                            </div>
                        ) : currentEx?.type === 'intro' ? (
                            <div className="text-center">
                                <p className="mb-2 text-6xl">{icon}</p>
                                <h2 className="mb-2 text-xl font-black">{currentEx.title}</h2>
                                <p className="mb-4 whitespace-pre-line text-lg font-bold text-amber-100">{currentEx.content}</p>
                                <button type="button" onClick={() => nextEx()} className={`min-h-12 w-full rounded-2xl bg-gradient-to-r ${lesson.color} text-sm font-black`}>
                                    শুরু করো →
                                </button>
                            </div>
                        ) : currentEx?.type === 'listen-repeat' || currentEx?.type === 'pronounce' ? (
                            <div className="text-center">
                                <p className="mb-2 text-5xl">{icon}</p>
                                <h2 className="mb-1 text-lg font-black">{currentEx.title}</h2>
                                <p className="mb-3 text-sm text-slate-400">
                                    {currentEx.type === 'pronounce' ? 'জোরে বলো' : 'শুনে বলো'}
                                </p>
                                <p className="mb-4 text-4xl font-black text-amber-200">{currentEx.content}</p>
                                {micSupported ? (
                                    <button
                                        type="button"
                                        onClick={toggleMic}
                                        className={`mb-3 min-h-14 w-full rounded-2xl text-sm font-black ${
                                            isListening
                                                ? 'bg-rose-600 text-white animate-pulse'
                                                : voiceResult === 'correct'
                                                  ? 'bg-emerald-600 text-white'
                                                  : voiceResult === 'wrong'
                                                    ? 'bg-red-600/80 text-white'
                                                    : 'bg-violet-600 text-white'
                                        }`}
                                    >
                                        {isListening ? '⏹ থামো — শুনছি…' : voiceResult === 'correct' ? '✅ সঠিক!' : voiceResult === 'wrong' ? '❌ আবার চেষ্টা' : '🎤 মাইকে বলো'}
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => nextEx()} className="mb-3 min-h-12 w-full rounded-2xl bg-white/10 text-sm font-bold">
                                        ✓ বলেছি (মাইক নেই)
                                    </button>
                                )}
                                {(transcript || interimTranscript) && (
                                    <div className={`mb-2 rounded-xl border px-3 py-2 text-sm ${
                                        voiceResult === 'correct' ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                                        : voiceResult === 'wrong' ? 'border-red-400/40 bg-red-500/15 text-red-200'
                                        : 'border-white/10 bg-white/5 text-slate-200'
                                    }`}>
                                        তুমি বললে: <span className="font-bold">{transcript || interimTranscript}</span>
                                    </div>
                                )}
                                {micError && <p className="mb-2 text-sm text-red-300">{micError}</p>}
                                <button type="button" onClick={() => nextEx()} className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-slate-400">
                                    স্কিপ →
                                </button>
                            </div>
                        ) : currentEx?.type === 'tap-correct' || currentEx?.type === 'letter-puzzle' || currentEx?.type === 'quiz' || currentEx?.type === 'archery-target' ? (
                            <div className="text-center">
                                <p className="mb-2 text-5xl">{currentEx.content || icon}</p>
                                <h2 className="mb-4 text-lg font-black">{currentEx.title}</h2>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(currentEx.options || []).map((opt) => {
                                        const done = selected !== null
                                        const isSel = selected === opt
                                        const isRight = opt === currentEx.correctAnswer
                                        return (
                                            <button
                                                key={opt}
                                                type="button"
                                                disabled={done}
                                                onClick={() => handleSelect(opt)}
                                                className={`min-h-14 rounded-2xl border-2 text-base font-black transition ${
                                                    done && isRight
                                                        ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100'
                                                        : done && isSel
                                                          ? 'border-red-400 bg-red-500/30 text-red-100'
                                                          : 'border-white/20 bg-white/10 text-white active:scale-95'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : currentEx?.type === 'bubble-pop' ? (
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
                                                transition={{ duration: done && isSel ? 0.5 : 2.5, repeat: done ? 0 : Infinity, delay: i * 0.15 }}
                                                style={{ position: 'absolute', ...pos }}
                                                className={`grid size-16 place-items-center rounded-full border-2 text-sm font-black shadow-lg ${
                                                    done && isRight ? 'border-emerald-300 bg-emerald-500 text-white'
                                                    : done && isSel ? 'border-red-300 bg-red-500 text-white'
                                                    : 'border-sky-300/50 bg-sky-500/40 text-white'
                                                }`}
                                            >
                                                {opt}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : currentEx?.type === 'word-builder' ? (
                            <WordBuilderGame currentEx={currentEx} lesson={lesson} speak={speak} onSuccess={() => { setXp((x) => x + 10); celebrate(); setTimeout(() => nextEx(), 800) }} />
                        ) : currentEx?.type === 'matching' ? (
                            <MatchingGame currentEx={currentEx} lesson={lesson} speak={speak} onComplete={(ok) => { if (ok) { setXp((x) => x + 10); celebrate(); setTimeout(() => nextEx(), 600) } else setHearts((h) => Math.max(0, h - 1)) }} />
                        ) : currentEx?.type === 'trace' ? (
                            <div className="text-center">
                                <h2 className="mb-2 text-lg font-black">{currentEx.title}</h2>
                                <p className="mb-3 text-4xl font-black text-violet-200">{currentEx.content}</p>
                                <canvas
                                    ref={canvasRef}
                                    width={320}
                                    height={200}
                                    className="mx-auto mb-3 touch-none rounded-2xl border border-violet-400/30 bg-black/40"
                                    onMouseDown={startDraw}
                                    onMouseMove={draw}
                                    onMouseUp={endDraw}
                                    onMouseLeave={endDraw}
                                    onTouchStart={startDraw}
                                    onTouchMove={draw}
                                    onTouchEnd={endDraw}
                                />
                                <div className="flex gap-2">
                                    <button type="button" onClick={clearCanvas} className="min-h-11 flex-1 rounded-2xl border border-white/15 bg-white/5 text-sm font-bold">মুছো</button>
                                    <button type="button" disabled={!hasDrawn} onClick={() => { setXp((x) => x + 10); celebrate(); setTimeout(() => nextEx(), 800) }} className={`min-h-11 flex-1 rounded-2xl bg-gradient-to-r ${lesson.color} text-sm font-black disabled:opacity-40`}>ঠিক আছে</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="mb-4 text-sm text-slate-400">{currentEx?.title}</p>
                                <button type="button" onClick={() => nextEx()} className={`min-h-12 w-full rounded-2xl bg-gradient-to-r ${lesson.color} text-sm font-black`}>এগিয়ে যাও →</button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
