'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition, matchSpokenToExpected } from '@/hooks/useSpeechRecognition'
import { createClient } from '@/lib/supabase'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
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
    if (lesson.backHref?.includes('/nursery/english') || lesson.backHref?.includes('/nursery/arabic')) {
        return 'bn-BD'
    }
    if (lesson.lang === 'en-US') return 'en-US'
    if (lesson.lang === 'ar-SA' || lesson.backHref?.includes('/arabic')) return 'ar-SA'
    if (lesson.backHref?.includes('/english')) return 'en-US'
    return 'bn-BD'
}

function WordBuilderExercise({
    currentEx, lesson, speak, onSuccess,
}: {
    currentEx: Exercise
    lesson: LessonConfig
    speak: (text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA') => void
    onSuccess: () => void
}) {
    const voiceLang = resolveVoiceLang(lesson)
    const target = (currentEx.correctAnswer || currentEx.content || '').trim()
    const tiles = useMemo(() => {
        const base = currentEx.options?.length ? [...currentEx.options] : target.split('')
        return shuffleArray(base)
    }, [currentEx.options, currentEx.id, target])
    const [built, setBuilt] = useState<string[]>([])
    const [pool, setPool] = useState<string[]>(tiles)
    const [wrong, setWrong] = useState(false)
    useEffect(() => { setBuilt([]); setPool(tiles); setWrong(false) }, [currentEx.id, tiles])
    function pick(letter: string, idx: number) {
        const nextBuilt = [...built, letter]
        const nextPool = pool.filter((_, i) => i !== idx)
        setBuilt(nextBuilt); setPool(nextPool); setWrong(false)
        speak(letter, voiceLang)
        const soFar = nextBuilt.join('')
        if (soFar === target) setTimeout(() => onSuccess(), 500)
        else if (nextBuilt.length >= target.length && soFar !== target) setWrong(true)
    }
    function reset() { setBuilt([]); setPool(tiles); setWrong(false) }
    const display = built.length ? built.join('') : '· · ·'
    const icon = letterIcon(lesson.letter, lesson.emoji)
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <span className="text-4xl">{icon}</span>
                <span className="text-sm text-slate-400">শব্দ সাজাও</span>
            </div>
            <div className={`mb-5 min-h-[3.5rem] rounded-2xl border-2 px-4 py-3 text-3xl font-black tracking-wide ${
                wrong ? 'border-red-400/50 bg-red-500/10 text-red-200'
                : built.join('') === target ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
            }`}>{display}</div>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
                {pool.map((letter, idx) => (
                    <button key={`${letter}-${idx}`} type="button" onClick={() => pick(letter, idx)}
                        className="grid size-14 place-items-center rounded-2xl border-2 border-sky-400/40 bg-sky-500/25 text-2xl font-black text-white shadow-lg transition active:scale-95">{letter}</button>
                ))}
            </div>
            {pool.length === 0 && built.join('') !== target && <p className="mb-2 text-sm text-red-300">আবার চেষ্টা করো</p>}
            <button type="button" onClick={reset} className="min-h-11 w-full rounded-2xl border border-white/15 bg-white/5 text-sm font-bold text-slate-300">↺ আবার সাজাও</button>
        </motion.div>
    )
}

function MatchingExercise({
    currentEx, lesson, speak, onComplete,
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
    const voiceLang = resolveVoiceLang(lesson)
    const pairs = useMemo(() => currentEx.options?.map(opt => {
        const [letter, word] = opt.split('-')
        return { letter, word }
    }) || [], [currentEx.options])
    const letters = useMemo(() => pairs.map(p => p.letter), [pairs])
    const words = useMemo(() => shuffleArray(pairs.map(p => p.word)), [pairs])
    function handleLeftClick(letter: string) {
        if (matched[letter]) return
        speak(letter, voiceLang)
        setLeftSelected(letter)
    }
    function handleRightClick(word: string) {
        if (!leftSelected || Object.values(matched).includes(word)) return
        const correctWord = pairs.find(p => p.letter === leftSelected)?.word
        if (correctWord === word) {
            const newMatched = { ...matched, [leftSelected]: word }
            setMatched(newMatched)
            setLeftSelected(null)
            speak(word, voiceLang)
            if (Object.keys(newMatched).length === pairs.length) {
                setCompleted(true)
                setTimeout(() => onComplete(true), 1000)
            }
        } else {
            setWrongPair(leftSelected)
            setTimeout(() => { setWrongPair(null); setLeftSelected(null) }, 800)
            onComplete(false)
        }
    }
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm w-full">
            <p className="text-xl font-bold text-white mb-2">🔗 মেলাও!</p>
            <div className="flex gap-4 justify-center">
                <div className="flex flex-col gap-3 flex-1">
                    {letters.map((letter, i) => (
                        <motion.button key={i} type="button" onClick={() => !matched[letter] && handleLeftClick(letter)}
                            className={`h-14 rounded-2xl text-2xl font-bold border-2 ${matched[letter] ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : leftSelected === letter ? `bg-gradient-to-br ${lesson.color} text-white` : wrongPair === letter ? 'bg-red-500/20 border-red-500/40' : 'bg-white/10 border-white/20 text-white'}`}>
                            {matched[letter] ? '✅' : letter}
                        </motion.button>
                    ))}
                </div>
                <div className="flex flex-col gap-3 flex-1">
                    {words.map((word, i) => (
                        <motion.button key={i} type="button" onClick={() => !Object.values(matched).includes(word) && handleRightClick(word)}
                            className={`h-14 rounded-2xl text-base font-bold border-2 px-2 ${Object.values(matched).includes(word) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/10 border-white/20 text-white'}`}>
                            {word}
                        </motion.button>
                    ))}
                </div>
            </div>
            {completed && <p className="mt-4 text-emerald-400 font-bold">🎉 শাবাশ!</p>}
        </motion.div>
    )
}

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
    const voiceLang = resolveVoiceLang(lesson)
    const safeBackHref = lesson.backHref.replace(/\/addition\/?$/, '')
    const {
        isListening, transcript, interimTranscript, error: micError,
        supported: micSupported, startListening, stopListening, resetTranscript,
    } = useSpeechRecognition()
    const { speak, stop: stopSpeak } = useSpeech()
    const [exIdx, setExIdx] = useState(0)
    const [hearts, setHearts] = useState(3)
    const [xp, setXp] = useState(0)
    const [stars, setStars] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)
    const [mistakes, setMistakes] = useState<Exercise[]>([])
    const [repeatMode, setRepeatMode] = useState(false)
    const [repeatQueue, setRepeatQueue] = useState<Exercise[]>([])
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const { reset: resetVoice } = useVoiceRecorder()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)

    const currentEx = repeatMode ? repeatQueue[exIdx] : lesson.exercises[exIdx]
    const totalSteps = repeatMode ? repeatQueue.length : lesson.exercises.length
    const progressPct = totalSteps ? (exIdx / totalSteps) * 100 : 0
    const isResult = exIdx >= totalSteps

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => speak(currentEx.voiceText, voiceLang), 500)
        return () => clearTimeout(timer)
    }, [exIdx, currentEx, speak, voiceLang, isResult, repeatMode])

    useEffect(() => {
        if (!transcript || isListening) return
        if (currentEx?.type !== 'listen-repeat' && currentEx?.type !== 'pronounce') return
        const expected = currentEx.content
        const correct = matchSpokenToExpected(transcript, expected)
        queueMicrotask(() => {
            if (correct) {
                setXp((x) => x + 10)
                celebrate()
            } else {
                setHearts((h) => Math.max(0, h - 1))
            }
        })
        resetTranscript()
        const timer = setTimeout(() => nextEx(), correct ? 1200 : 1800)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening])

    function celebrate() {
        setShowCelebration(true)
        speak(voiceLang === 'en-US' ? 'Well done!' : 'শাবাশ!', voiceLang === 'en-US' ? 'en-US' : 'bn-BD')
        setTimeout(() => setShowCelebration(false), 1800)
    }

    function recordMistake(ex: Exercise) {
        setMistakes(prev => prev.find(m => m.id === ex.id) ? prev : [...prev, ex])
    }

    function nextEx() {
        const next = exIdx + 1
        resetVoice()
        if (next < totalSteps) {
            setExIdx(next); setSelected(null); setIsCorrect(null); setHasDrawn(false); clearCanvas()
        } else if (repeatMode) {
            const pct = (xp / 50) * 100
            setStars(pct >= 90 ? 3 : pct >= 60 ? 2 : 1)
            setExIdx(totalSteps)
        } else if (mistakes.length > 0) {
            setRepeatMode(true); setRepeatQueue(mistakes); setMistakes([]); setExIdx(0); setSelected(null); setIsCorrect(null)
        } else {
            const pct = (xp / 50) * 100
            setStars(pct >= 90 ? 3 : pct >= 60 ? 2 : 1)
            setExIdx(totalSteps)
        }
    }

    function handleSelect(option: string) {
        if (selected !== null) return
        setSelected(option)
        const correct = option === currentEx?.correctAnswer
        setIsCorrect(correct)
        if (correct) { celebrate(); setXp(x => x + 10) }
        else { setHearts(h => Math.max(0, h - 1)); if (currentEx) recordMistake(currentEx) }
        setTimeout(() => nextEx(), 1400)
    }

    function getPos(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect()
        if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
    }
    function startDraw(e: React.TouchEvent | React.MouseEvent) {
        isDrawing.current = true; setHasDrawn(true)
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext('2d'); if (!ctx) return
        const { x, y } = getPos(e, canvas); ctx.beginPath(); ctx.moveTo(x, y)
    }
    function draw(e: React.TouchEvent | React.MouseEvent) {
        if (!isDrawing.current) return
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext('2d'); if (!ctx) return
        const { x, y } = getPos(e, canvas)
        ctx.lineTo(x, y); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke()
    }
    function endDraw() { isDrawing.current = false }
    function clearCanvas() {
        const canvas = canvasRef.current; if (!canvas) return
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
    }

    async function finishAndSave() {
        if (saving) return
        setSaving(true)
        setSaveError(null)
        let saved = false
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setSaveError('লগইন নেই — progress সেভ হয়নি')
                setSaving(false)
                return
            }

            const lessonId = String(lesson.id)
            const completedAt = new Date().toISOString()

            const kidsRow = {
                user_id: user.id,
                lesson_id: lessonId,
                score: xp,
                stars,
                completed: true,
                completed_at: completedAt,
            }

            const { error: e1 } = await supabase
                .from('learning_progress')
                .upsert(kidsRow, { onConflict: 'user_id,lesson_id' })

            if (!e1) {
                saved = true
            } else {
                console.warn('Progress upsert failed:', e1.message, e1)

                await supabase
                    .from('learning_progress')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('lesson_id', lessonId)

                const { error: e2 } = await supabase
                    .from('learning_progress')
                    .insert(kidsRow)

                if (!e2) {
                    saved = true
                } else {
                    console.warn('Progress insert failed:', e2.message, e2)

                    const curriculumRow = {
                        user_id: user.id,
                        lesson_id: lessonId,
                        status: 'completed',
                        score: xp,
                        xp_earned: xp,
                        completed: true,
                        stars,
                        completed_at: completedAt,
                    }
                    const { error: e3 } = await supabase
                        .from('learning_progress')
                        .insert(curriculumRow)

                    if (!e3) {
                        saved = true
                    } else {
                        console.error('Progress all save attempts failed:', e3.message, e3)
                        setSaveError(e3.message || e2.message || e1.message || 'সেভ ব্যর্থ')
                    }
                }
            }

            try {
                const key = `kids_progress_${user.id}`
                const prev = JSON.parse(sessionStorage.getItem(key) || '{}')
                prev[lessonId] = { completed: true, stars, score: xp }
                sessionStorage.setItem(key, JSON.stringify(prev))
            } catch { /* ignore */ }
        } catch (e) {
            console.error('Progress save exception:', e)
            setSaveError(e instanceof Error ? e.message : 'সেভ ব্যর্থ')
        }

        if (saved) {
            await new Promise((r) => setTimeout(r, 250))
            router.push(safeBackHref)
            router.refresh()
        } else {
            setSaving(false)
        }
    }

    function toggleMic() {
        try {
            if (isListening) stopListening()
            else { stopSpeak(); startListening(voiceLang) }
        } catch { /* */ }
    }

    if (isResult) return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] to-[#0a0a1a] flex flex-col items-center justify-center p-6 text-white">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center max-w-sm w-full">
                <div className="text-8xl mb-4">{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}</div>
                <div className="flex justify-center gap-2 mb-5">{[1,2,3].map(s => <span key={s} className={`text-4xl ${s <= stars ? '' : 'opacity-20'}`}>⭐</span>)}</div>
                <h2 className="text-2xl font-bold mb-1">{stars === 3 ? 'অসাধারণ! 🎉' : stars === 2 ? 'খুব ভালো! 👏' : 'চেষ্টা করেছো! 💪'}</h2>
                <p className="text-gray-400 mb-4">{lesson.letter} lesson শেষ!</p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/5 rounded-2xl p-3"><div className="text-amber-400 font-bold">+{xp}</div><div className="text-xs text-gray-500">XP</div></div>
                    <div className="bg-white/5 rounded-2xl p-3"><div className="text-yellow-400 font-bold">{stars}/3</div><div className="text-xs text-gray-500">Stars</div></div>
                    <div className="bg-white/5 rounded-2xl p-3"><div className="text-red-400 font-bold">{hearts}/3</div><div className="text-xs text-gray-500">Hearts</div></div>
                </div>
                {saveError && (
                    <p className="mb-3 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">
                        ⚠️ {saveError}
                    </p>
                )}
                <button
                    type="button"
                    disabled={saving}
                    onClick={() => void finishAndSave()}
                    className="w-full min-h-12 rounded-2xl bg-sky-500 font-bold text-white disabled:opacity-60"
                >
                    {saving ? 'সেভ হচ্ছে…' : saveError ? 'আবার চেষ্টা করো' : '← তালিকায় ফিরে যাও'}
                </button>
            </motion.div>
        </div>
    )

    if (!accessLoading && !isPaid && !canDoLesson) {
        return <div className="min-h-screen flex items-center justify-center p-6"><LockOverlay type="daily_limit" /></div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] to-[#0a0a1a] text-white flex flex-col">
            <AnimatePresence>
                {showCelebration && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                        {CELEBRATION.map((pos, i) => (
                            <motion.div key={i} initial={{ y: 0, x: 0, opacity: 1, scale: 0 }} animate={{ y: pos.y, x: pos.x, opacity: 0, scale: 2 }} transition={{ duration: 1.4, delay: i * 0.08 }} className="absolute text-4xl">{['🌟','⭐','✨','🎉','🎊'][i]}</motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="shrink-0 px-4 pt-4 pb-2 flex items-center gap-3">
                <button type="button" onClick={() => router.push(safeBackHref)} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg font-bold text-white">←</button>
                <div className="flex-1 bg-white/10 rounded-full h-5 overflow-hidden border border-white/10">
                    <motion.div className={`h-5 rounded-full bg-gradient-to-r ${lesson.color}`} animate={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex gap-0.5">{[1,2,3].map(h => <span key={h} className={`text-xl ${h <= hearts ? '' : 'opacity-25'}`}>❤️</span>)}</div>
                <div className="bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full text-sm font-bold text-amber-400">⚡ {xp}</div>
            </div>

            {repeatMode && (
                <div className="mx-4 mb-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
                    🔁 ভুলগুলো আবার ({exIdx + 1}/{repeatQueue.length})
                </div>
            )}

            <div className="mb-3 px-4 text-center">
                <p className="text-base font-black text-white">{repeatMode ? '🔁 ' : ''}{currentEx?.title}</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
                {currentEx?.type === 'intro' && (
                    <div className="text-center max-w-sm">
                        <div className="text-7xl mb-4">{letterIcon(lesson.letter, lesson.emoji)}</div>
                        <p className="text-5xl font-black mb-2">{currentEx.content}</p>
                        <p className="text-xl text-slate-300 mb-6">{lesson.word}</p>
                        <button type="button" onClick={() => speak(currentEx.voiceText, voiceLang)} className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 font-bold text-white mb-3">🔊 শোনো</button>
                        <button type="button" onClick={() => nextEx()} className="min-h-12 w-full rounded-2xl bg-sky-500 font-bold text-white">এগিয়ে যাও →</button>
                    </div>
                )}
                {(currentEx?.type === 'listen-repeat' || currentEx?.type === 'pronounce') && (
                    <div className="text-center max-w-sm w-full">
                        <p className="text-4xl font-black mb-4">{currentEx.content}</p>
                        <button type="button" onClick={() => speak(currentEx.voiceText, voiceLang)} className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 font-bold text-white mb-3">🔊 শোনো</button>
                        {micSupported && (
                            <button type="button" onClick={toggleMic} className={`min-h-12 w-full rounded-2xl font-bold mb-3 ${isListening ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                {isListening ? '⏹ থামো' : '🎤 বলো'}
                            </button>
                        )}
                        {(transcript || interimTranscript) && <p className="text-sm text-slate-400 mb-2">তুমি বললে: {transcript || interimTranscript}</p>}
                        {micError && <p className="text-sm text-red-300 mb-2">{micError}</p>}
                        <button type="button" onClick={() => nextEx()} className="min-h-11 w-full rounded-2xl border border-white/15 bg-white/5 text-sm font-bold text-slate-300">স্কিপ →</button>
                    </div>
                )}
                {(currentEx?.type === 'tap-correct' || currentEx?.type === 'quiz' || currentEx?.type === 'letter-puzzle' || currentEx?.type === 'bubble-pop') && (
                    <div className="text-center max-w-sm w-full">
                        <p className="text-lg text-slate-300 mb-4">{currentEx.title}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {(currentEx.options || []).map((opt) => (
                                <button key={opt} type="button" onClick={() => handleSelect(opt)}
                                    className={`min-h-16 rounded-2xl text-2xl font-black border-2 transition ${
                                        selected === null ? 'border-white/20 bg-white/10 text-white active:scale-95'
                                        : opt === currentEx.correctAnswer ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100'
                                        : selected === opt ? 'border-red-400 bg-red-500/30 text-red-100'
                                        : 'border-white/10 bg-white/5 text-slate-500'
                                    }`}>{opt}</button>
                            ))}
                        </div>
                    </div>
                )}
                {currentEx?.type === 'word-builder' && (
                    <WordBuilderExercise currentEx={currentEx} lesson={lesson} speak={speak} onSuccess={() => { celebrate(); setXp(x => x + 10); setTimeout(() => nextEx(), 800) }} />
                )}
                {currentEx?.type === 'matching' && (
                    <MatchingExercise currentEx={currentEx} lesson={lesson} speak={speak} onComplete={(ok) => { if (ok) { celebrate(); setXp(x => x + 10); setTimeout(() => nextEx(), 800) } else { setHearts(h => Math.max(0, h - 1)); if (currentEx) recordMistake(currentEx) } }} />
                )}
                {currentEx?.type === 'trace' && (
                    <div className="text-center max-w-sm w-full">
                        <p className="text-5xl font-black mb-3">{currentEx.content}</p>
                        <canvas ref={canvasRef} width={280} height={200}
                            className="mx-auto mb-3 rounded-2xl border-2 border-white/20 bg-white/5 touch-none"
                            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={clearCanvas} className="min-h-11 flex-1 rounded-2xl border border-white/15 bg-white/5 font-bold text-slate-300">↺ মুছো</button>
                            <button type="button" onClick={() => { if (hasDrawn) { celebrate(); setXp(x => x + 10); nextEx() } }} className="min-h-11 flex-1 rounded-2xl bg-sky-500 font-bold text-white">✓ হয়ে গেছে</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
