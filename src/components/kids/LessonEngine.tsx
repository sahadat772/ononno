'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { createClient } from '@/lib/supabase'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'

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
    showDotCount?: boolean
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
    const words = useMemo(() => shuffleArray(pairs.map(p => p.word)), [pairs])

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
            setTimeout(() => { setWrongPair(null); setLeftSelected(null) }, 800)
            onComplete(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
            <p className="text-xl font-bold text-white mb-2">🔗 মেলাও!</p>
            <p className="text-gray-400 text-sm mb-6">বাম দিক থেকে বেছে ডান দিকে মেলাও</p>
            <div className="flex gap-4 justify-center">
                <div className="flex flex-col gap-3 flex-1">
                    {letters.map((letter, i) => {
                        const isMatched = !!matched[letter]
                        const isSelected = leftSelected === letter
                        const isWrong = wrongPair === letter
                        return (
                            <motion.button key={i} whileTap={!isMatched ? { scale: 0.95 } : {}} animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                                onClick={() => !isMatched && handleLeftClick(letter)}
                                className={`h-14 rounded-2xl text-2xl font-bold border-2 transition-all ${isMatched ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : isSelected ? `bg-gradient-to-br ${lesson.color} text-white border-transparent shadow-lg ring-4 ring-white/20` : isWrong ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/10 border-white/20 text-white'}`}>
                                {isMatched ? '✅' : letter}
                            </motion.button>
                        )
                    })}
                </div>
                <div className="flex flex-col justify-around py-2">{letters.map((_, i) => <div key={i} className="w-6 h-0.5 bg-white/10" />)}</div>
                <div className="flex flex-col gap-3 flex-1">
                    {words.map((word, i) => {
                        const isMatched = Object.values(matched).includes(word)
                        const matchedLetter = Object.entries(matched).find(([, w]) => w === word)?.[0]
                        return (
                            <motion.button key={i} whileTap={!isMatched ? { scale: 0.95 } : {}} onClick={() => !isMatched && handleRightClick(word)}
                                className={`h-14 rounded-2xl text-base font-bold border-2 px-2 ${isMatched ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : leftSelected ? 'bg-white/15 border-violet-500/40 text-white' : 'bg-white/10 border-white/20 text-gray-400'}`}>
                                {isMatched ? `${matchedLetter} ✅` : word}
                            </motion.button>
                        )
                    })}
                </div>
            </div>
            {completed && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4"><p className="text-3xl mb-1">🎉</p><p className="text-emerald-400 font-bold">সব মিলে গেছে! শাবাশ!</p></motion.div>}
        </motion.div>
    )
}

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
    const { speak, isSpeaking } = useSpeech()
    const { isListening, transcript, resetTranscript } = useSpeechRecognition()
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
    const { state: voiceState, transcript: voiceTranscript, checkPronunciation, reset: resetVoice } = useVoiceRecorder()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)

    const currentEx = repeatMode ? repeatQueue[exIdx] : lesson.exercises[exIdx]
    const totalSteps = repeatMode ? repeatQueue.length : lesson.exercises.length
    const progress = (exIdx / totalSteps) * 100
    const isResult = exIdx >= totalSteps

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => speak(currentEx.voiceText, lesson.lang), 500)
        return () => clearTimeout(timer)
    }, [exIdx, currentEx, speak, lesson.lang, isResult, repeatMode])

    useEffect(() => {
        if (!transcript || isListening) return
        if (currentEx?.type !== 'listen-repeat' && currentEx?.type !== 'pronounce') return
        const expected = currentEx.content.toLowerCase()
        const actual = transcript.toLowerCase()
        const correct = actual.includes(expected) || expected.includes(actual)
        queueMicrotask(() => {
            if (correct) setXp(x => x + 5)
            else setHearts(h => Math.max(0, h - 1))
        })
        resetTranscript()
        const t = setTimeout(() => nextEx(), 2000)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening])

    function celebrate() {
        setShowCelebration(true)
        speak('শাবাশ!', 'bn-BD')
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
        const { x, y } = getPos(e, canvas); ctx.lineTo(x, y); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
    }
    function endDraw() { isDrawing.current = false }
    function clearCanvas() {
        const canvas = canvasRef.current; if (!canvas) return
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
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
                <button type="button" onClick={() => router.push(lesson.backHref)} className="w-full min-h-12 rounded-2xl bg-sky-500 font-bold text-white">← তালিকায় ফিরে যাও</button>
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
                <button type="button" onClick={() => router.push(lesson.backHref)} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg font-bold text-white active:scale-95">←</button>
                <div className="flex-1 bg-white/10 rounded-full h-5 overflow-hidden border border-white/10">
                    <motion.div className={`h-5 rounded-full bg-gradient-to-r ${lesson.color}`} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="flex gap-0.5">{[1,2,3].map(h => <span key={h} className={`text-xl ${h <= hearts ? '' : 'opacity-25'}`}>❤️</span>)}</div>
                <div className="bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full text-sm font-bold text-amber-400">⚡ {xp}</div>
            </div>

            {repeatMode && (
                <div className="mx-4 mb-2 bg-violet-500/10 border border-violet-500/30 rounded-2xl px-4 py-2 text-sm text-violet-300 font-semibold">🔁 ভুল গুলো আবার practice ({exIdx + 1}/{repeatQueue.length})</div>
            )}

            <div className="text-center mb-3 px-4">
                <p className="text-base font-black text-white">{repeatMode ? '🔁 ' : ''}{currentEx?.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">ধাপ {exIdx + 1} / {totalSteps} · {lesson.letter} {lesson.emoji}</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
                <AnimatePresence mode="wait">
                    {currentEx?.type === 'intro' && (
                        <motion.div key={`intro-${exIdx}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <div onClick={() => speak(currentEx.voiceText, lesson.lang)} className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-7xl font-bold text-white shadow-2xl mx-auto mb-5 cursor-pointer`}>{lesson.letter}</div>
                            <p className="text-2xl font-bold mb-2">{lesson.emoji} {lesson.word}</p>
                            <p className="text-gray-400 text-sm mb-6">{currentEx.voiceText}</p>
                            <button type="button" onClick={() => nextEx()} className="w-full min-h-12 rounded-2xl bg-sky-500 font-bold text-white">পরের ধাপ →</button>
                        </motion.div>
                    )}

                    {currentEx?.type === 'listen-repeat' && (
                        <motion.div key={`lr-${exIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <p className="text-5xl font-bold mb-4">{currentEx.content}</p>
                            <button type="button" onClick={() => speak(currentEx.voiceText, lesson.lang)} className="mb-4 rounded-full bg-white/10 px-6 py-3 text-white">🔊 আবার শোনো</button>
                            <button type="button" onClick={() => { setXp(x => x + 5); nextEx() }} className="w-full min-h-12 rounded-2xl bg-emerald-500 font-bold text-white">বলেছি →</button>
                        </motion.div>
                    )}

                    {currentEx?.type === 'pronounce' && (
                        <motion.div key={`pr-${exIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <p className="text-6xl font-bold mb-6">{currentEx.content}</p>
                            <button type="button" onClick={() => { setXp(x => x + 5); nextEx() }} className="w-full min-h-12 rounded-2xl bg-violet-500 font-bold text-white">জোরে বলেছি ✓</button>
                        </motion.div>
                    )}

                    {(currentEx?.type === 'tap-correct' || currentEx?.type === 'letter-puzzle' || currentEx?.type === 'quiz') && (
                        <motion.div key={`tap-${exIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <p className="text-lg text-gray-300 mb-6">{currentEx.title}</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(currentEx.options || []).map((opt) => (
                                    <button key={opt} type="button" onClick={() => handleSelect(opt)}
                                        className={`min-h-16 rounded-2xl text-2xl font-bold border-2 ${selected === opt ? (isCorrect ? 'bg-emerald-500 border-emerald-400' : 'bg-red-500 border-red-400') : 'bg-white/10 border-white/20'} text-white`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {currentEx?.type === 'bubble-pop' && (
                        <motion.div key={`bub-${exIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <p className="mb-4 text-gray-300">{currentEx.title}</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                {(currentEx.options || []).map((opt) => (
                                    <button key={opt} type="button" onClick={() => handleSelect(opt)}
                                        className={`size-20 rounded-full text-2xl font-bold ${selected === opt ? (isCorrect ? 'bg-emerald-500' : 'bg-red-500') : 'bg-sky-500/30 border-2 border-sky-400'} text-white`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {currentEx?.type === 'word-builder' && (
                        <motion.div key={`wb-${exIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <p className="text-gray-300 mb-4">{currentEx.title}</p>
                            <p className="text-3xl font-bold mb-6 text-amber-300">{currentEx.correctAnswer}</p>
                            <button type="button" onClick={() => handleSelect(currentEx.correctAnswer || '')} className="w-full min-h-12 rounded-2xl bg-amber-500 font-bold text-white">সাজিয়েছি ✓</button>
                        </motion.div>
                    )}

                    {currentEx?.type === 'matching' && (
                        <MatchingExercise key={`m-${exIdx}`} currentEx={currentEx} lesson={lesson} speak={speak} onComplete={(c) => { if (c) { celebrate(); setXp(x => x + 10); setTimeout(() => nextEx(), 800) } else setHearts(h => Math.max(0, h - 1)) }} />
                    )}

                    {currentEx?.type === 'trace' && (
                        <motion.div key={`tr-${exIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center max-w-sm w-full">
                            <p className="text-5xl font-bold mb-3">{currentEx.content}</p>
                            <canvas ref={canvasRef} width={280} height={200} className="mx-auto mb-4 rounded-2xl border border-white/20 bg-white/5 touch-none"
                                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
                            <div className="flex gap-2">
                                <button type="button" onClick={clearCanvas} className="flex-1 min-h-12 rounded-2xl border border-white/20 font-bold">মুছো</button>
                                <button type="button" onClick={() => { if (hasDrawn) { setXp(x => x + 10); celebrate(); nextEx() } }} className="flex-1 min-h-12 rounded-2xl bg-sky-500 font-bold text-white">শেষ ✓</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
