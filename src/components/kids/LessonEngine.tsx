'use client'

import { useState, useEffect, useRef, } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

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

// ── Static positions ──────────────────────────────────────────────────────────

const CELEBRATION = [
    { y: -320, x: -80 }, { y: -280, x: 120 },
    { y: -350, x: 40 }, { y: -260, x: -140 },
    { y: -300, x: 100 },
]

// ── Main Engine ───────────────────────────────────────────────────────────────

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { speak, isSpeaking } = useSpeech()
    const { isListening, transcript, startListening, resetTranscript, supported } = useSpeechRecognition()

    const [exIdx, setExIdx] = useState(0)
    const [hearts, setHearts] = useState(3)
    const [xp, setXp] = useState(0)
    const [stars, setStars] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)
    const [listenState, setListenState] = useState<'idle' | 'correct' | 'wrong'>('idle')

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)

    const currentEx = lesson.exercises[exIdx]
    const progress = (exIdx / lesson.exercises.length) * 100
    const isResult = exIdx >= lesson.exercises.length

    // ── Auto-speak ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => {
            speak(currentEx.voiceText, lesson.lang)
        }, 500)
        return () => clearTimeout(timer)
    }, [exIdx, currentEx, speak, lesson.lang, isResult])

    // ── Voice recognition result ──────────────────────────────────────────────

    useEffect(() => {
        if (!transcript || isListening) return
        if (currentEx?.type !== 'listen-repeat') return

        const expected = currentEx.content.toLowerCase()
        const actual = transcript.toLowerCase()
        const correct = actual.includes(expected) || expected.includes(actual)

        queueMicrotask(() => {
            setListenState(correct ? 'correct' : 'wrong')
            if (correct) setXp(x => x + 5)
            else setHearts(h => Math.max(0, h - 1))
        })

        resetTranscript()
        const t = setTimeout(() => nextEx(), 2000)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, isListening])

    // ── Helpers ───────────────────────────────────────────────────────────────

    function celebrate() {
        setShowCelebration(true)
        speak('শাবাশ!', 'bn-BD')
        setTimeout(() => setShowCelebration(false), 1800)
    }

    function nextEx() {
        const next = exIdx + 1
        if (next < lesson.exercises.length) {
            setExIdx(next)
            setSelected(null)
            setIsCorrect(null)
            setListenState('idle')
            setHasDrawn(false)
            clearCanvas()
        } else {
            const pct = (xp / 35) * 100
            setStars(pct >= 90 ? 3 : pct >= 60 ? 2 : 1)
            setExIdx(lesson.exercises.length)
        }
    }

    function handleSelect(option: string) {
        if (selected) return
        setSelected(option)
        const correct = option === currentEx?.correctAnswer
        setIsCorrect(correct)
        if (correct) { celebrate(); setXp(x => x + 10) }
        else setHearts(h => Math.max(0, h - 1))
        setTimeout(() => nextEx(), 1400)
    }

    // ── Canvas ────────────────────────────────────────────────────────────────

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
                <p className="text-gray-400 mb-6">{lesson.letter} lesson শেষ!</p>

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

                {xp >= 20 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 mb-5 text-sm text-emerald-300"
                    >🔓 পরের lesson unlock হয়েছে!</motion.div>
                )}

                <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            setExIdx(0); setHearts(3); setXp(0)
                            setStars(0); setSelected(null); setIsCorrect(null)
                        }}
                        className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold"
                    >🔄 আবার</motion.button>
                    <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(lesson.backHref)}
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

            {/* Step label */}
            <div className="text-center mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                    {exIdx + 1}/{lesson.exercises.length} — {currentEx?.title}
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
                            <p className="text-2xl font-bold text-white mb-2">{lesson.word}</p>

                            {/* আবার শুনি button */}
                            <button onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                className={`bg-linear-to-r ${lesson.color} text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg mb-6 mx-auto flex items-center gap-2`}
                            >🔊 আবার শুনি</button>

                            {listenState === 'correct' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl mb-4">🌟</motion.div>
                            )}
                            {listenState === 'wrong' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 mb-4 text-red-400 text-sm"
                                >আবার চেষ্টা করো! 💪</motion.div>
                            )}

                            {listenState === 'idle' && (
                                <div className="space-y-3">
                                    {/* Mic button — supported হলে দেখাবে */}
                                    {supported && (
                                        <motion.button whileTap={{ scale: 0.95 }}
                                            onClick={() => startListening(lesson.lang)}
                                            disabled={isListening}
                                            className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg flex items-center justify-center gap-2 ${isListening
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'bg-white/10 border-2 border-white/20 text-white hover:bg-white/20'
                                                }`}
                                        >{isListening ? '🎤 শুনছি...' : '🎤 এখন বলো!'}</motion.button>
                                    )}

                                    {/* সবসময় এই button থাকবে */}
                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            speak(currentEx.voiceText, lesson.lang)
                                            setTimeout(() => {
                                                setXp(x => x + 3)
                                                nextEx()
                                            }, 1500)
                                        }}
                                        className="w-full py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm"
                                    >✅ শুনলাম! পরের ধাপে যাই →</motion.button>
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

                    {/* TRACE */}
                    {currentEx?.type === 'trace' && (
                        <motion.div key={`trace-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">✍️ আঙুল দিয়ে লিখি!</p>
                            <p className="text-gray-400 text-sm mb-4">{currentEx.content} লেখো</p>
                            <div className="relative mx-auto mb-4 width: 280px; height: 280px;">
                                <div className="absolute inset-0 flex items-center justify-center text-9xl font-bold text-white/8 select-none pointer-events-none">
                                    {currentEx.content}
                                </div>
                                <canvas ref={canvasRef} width={280} height={280}
                                    className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 cursor-crosshair touch-none"
                                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={clearCanvas} className="flex-1 py-3 rounded-2xl bg-white/10 text-gray-300 font-semibold hover:bg-white/20">🗑 মুছি</button>
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={() => { if (hasDrawn) { celebrate(); setXp(x => x + 5); setTimeout(nextEx, 1200) } }}
                                    disabled={!hasDrawn}
                                    className={`flex-1 py-3 rounded-2xl font-bold transition-all ${hasDrawn ? `bg-linear-to-r ${lesson.color} text-white shadow-lg` : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                                >✅ হয়েছে!</motion.button>
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

                    {/* PRONOUNCE */}
                    {currentEx?.type === 'pronounce' && (
                        <motion.div key={`pronounce-${exIdx}`}
                            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-3">🗣️ জোরে বলো!</p>

                            {/* Big word display */}
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                className={`w-full py-8 rounded-3xl bg-linear-to-br ${lesson.color} flex flex-col items-center justify-center gap-3 shadow-2xl mx-auto mb-6 cursor-pointer`}
                            >
                                <span className="text-7xl font-bold text-white">{currentEx.content}</span>
                                <span className="text-2xl text-white/80">{lesson.word}</span>
                                <span className="text-sm text-white/60 flex items-center gap-1">
                                    🔊 tap করলে শুনবে
                                </span>
                            </motion.div>

                            {/* Pronunciation guide */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                                <p className="text-gray-400 text-xs mb-1">উচ্চারণ গাইড</p>
                                <p className="text-white font-semibold">{currentEx.voiceText}</p>
                            </div>

                            {listenState === 'correct' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-3xl mb-1">🌟</p>
                                    <p className="text-emerald-400 font-bold">শাবাশ! চমৎকার উচ্চারণ!</p>
                                </motion.div>
                            )}
                            {listenState === 'wrong' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4"
                                >
                                    <p className="text-red-400 font-semibold">আবার চেষ্টা করো! 💪</p>
                                    <button onClick={() => speak(currentEx.voiceText, lesson.lang)}
                                        className="mt-2 text-sm text-red-300 underline"
                                    >আবার শুনি</button>
                                </motion.div>
                            )}

                            {listenState === 'idle' && (
                                <div className="space-y-3">
                                    {supported && (
                                        <motion.button whileTap={{ scale: 0.95 }}
                                            onClick={() => startListening(lesson.lang)}
                                            disabled={isListening}
                                            className={`w-full py-5 rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center gap-3 ${isListening
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : `bg-linear-to-r ${lesson.color} text-white`
                                                }`}
                                        >
                                            {isListening ? (
                                                <>
                                                    <motion.span
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{ repeat: Infinity, duration: 0.5 }}
                                                    >🎤</motion.span>
                                                    শুনছি...
                                                </>
                                            ) : (
                                                <>🎤 এখন বলো!</>
                                            )}
                                        </motion.button>
                                    )}

                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            speak(currentEx.voiceText, lesson.lang)
                                            setTimeout(() => {
                                                setXp(x => x + 3)
                                                nextEx()
                                            }, 1500)
                                        }}
                                        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-medium text-sm"
                                    >✅ বললাম! পরের ধাপে যাই →</motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ARCHERY TARGET */}
                    {currentEx?.type === 'archery-target' && (
                        <motion.div key={`archery-${exIdx}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">🏹 সঠিক লক্ষ্যে আঘাত করো!</p>
                            <p className="text-gray-400 text-sm mb-6">
                                {lesson.word} কোন বর্ণ দিয়ে শুরু?
                            </p>

                            {/* Targets */}
                            <div className="relative w-full h-72 bg-linear-to-b from-emerald-500/10 to-teal-500/5 rounded-3xl border border-white/10 overflow-hidden mb-4">

                                {/* Background grass */}
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-emerald-500/10" />

                                {currentEx.options?.map((opt, i) => (
                                    <motion.button key={i}
                                        animate={{
                                            y: [0, i % 2 === 0 ? -40 : 40, 0],
                                            x: [0, i % 3 === 0 ? 20 : -20, 0],
                                        }}
                                        transition={{
                                            duration: 2.5 + i * 0.8,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                            delay: i * 0.6,
                                        }}
                                        whileTap={{ scale: 0.1, opacity: 0, transition: { duration: 0.15 } }}
                                        onClick={() => handleSelect(opt)}
                                        className="absolute flex items-center justify-center"
                                        style={{
                                            left: `${10 + i * 22}%`,
                                            top: `${15 + (i % 2) * 35}%`,
                                            width: 80,
                                            height: 80,
                                        }}
                                    >
                                        {/* Target rings */}
                                        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${selected === opt
                                            ? opt === currentEx.correctAnswer
                                                ? 'ring-4 ring-emerald-400'
                                                : 'ring-4 ring-red-400'
                                            : ''
                                            }`}>
                                            {/* Outer ring */}
                                            <div className="absolute inset-0 rounded-full border-4 border-red-500/40" />
                                            {/* Middle ring */}
                                            <div className="absolute inset-2 rounded-full border-4 border-blue-500/40" />
                                            {/* Inner ring */}
                                            <div className="absolute inset-4 rounded-full border-4 border-red-500/40" />
                                            {/* Center */}
                                            <div className={`absolute inset-6 rounded-full ${selected === opt && opt === currentEx.correctAnswer
                                                ? 'bg-emerald-500'
                                                : selected === opt
                                                    ? 'bg-red-500'
                                                    : 'bg-amber-400'
                                                }`} />
                                            {/* Letter */}
                                            <span className="relative z-10 text-2xl font-bold text-white drop-shadow-lg">
                                                {opt}
                                            </span>
                                        </div>

                                        {/* Arrow indicator — correct answer এ */}
                                        {selected === opt && opt === currentEx.correctAnswer && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-8 text-2xl"
                                            >🏹</motion.div>
                                        )}
                                    </motion.button>
                                ))}

                                {/* Bow at bottom */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-3xl">
                                    🏹
                                </div>
                            </div>

                            {/* Feedback */}
                            {selected && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl p-3 text-sm font-semibold ${isCorrect
                                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                                        }`}
                                >
                                    {isCorrect ? '🎯 শাবাশ! সঠিক লক্ষ্য!' : `❌ সঠিক উত্তর: ${currentEx.correctAnswer}`}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* WORD BUILDER */}
                    {currentEx?.type === 'word-builder' && (
                        <motion.div key={`word-builder-${exIdx}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center max-w-sm w-full"
                        >
                            <p className="text-xl font-bold text-white mb-2">🔤 অক্ষর সাজাও!</p>
                            <p className="text-gray-400 text-sm mb-4">
                                {lesson.emoji} {lesson.word} বানাও
                            </p>

                            {/* Target word display — blank boxes */}
                            <div className="flex justify-center gap-2 mb-8">
                                {lesson.word.split('').map((char, i) => {
                                    const builtWord = (selected || '')
                                    const isPlaced = builtWord[i] !== undefined
                                    return (
                                        <motion.div
                                            key={i}
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

                            {/* Shuffled letter buttons */}
                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                                {currentEx.options?.map((opt, i) => {
                                    const builtWord = selected || ''
                                    const isUsed = builtWord.includes(opt) &&
                                        builtWord.split('').filter(c => c === opt).length >=
                                        (currentEx.options?.filter(c => c === opt).length || 1)

                                    return (
                                        <motion.button key={i}
                                            whileHover={!isUsed ? { scale: 1.1, y: -4 } : {}}
                                            whileTap={!isUsed ? { scale: 0.9 } : {}}
                                            onClick={() => {
                                                if (isUsed || selected === lesson.word) return
                                                const newWord = (selected || '') + opt
                                                setSelected(newWord)

                                                // সঠিক word হলে
                                                if (newWord === lesson.word) {
                                                    setIsCorrect(true)
                                                    celebrate()
                                                    setXp(x => x + 15)
                                                    setTimeout(() => nextEx(), 1500)
                                                }
                                                // ভুল হলে — reset
                                                else if (newWord.length >= lesson.word.length) {
                                                    setIsCorrect(false)
                                                    setHearts(h => Math.max(0, h - 1))
                                                    setTimeout(() => setSelected(null), 800)
                                                }
                                            }}
                                            className={`w-14 h-14 rounded-2xl text-2xl font-bold border-2 transition-all shadow-md ${isUsed
                                                ? 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed'
                                                : `bg-linear-to-br ${lesson.color} text-white border-transparent shadow-lg`
                                                }`}
                                        >
                                            {opt}
                                        </motion.button>
                                    )
                                })}
                            </div>

                            {/* Clear button */}
                            {selected && selected.length > 0 && isCorrect === null && (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelected(null)}
                                    className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-gray-400 text-sm font-medium mb-4"
                                >
                                    🗑 মুছি
                                </motion.button>
                            )}

                            {/* Feedback */}
                            {isCorrect === true && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-3 text-emerald-400 font-bold"
                                >
                                    🌟 শাবাশ! সঠিক word বানিয়েছো!
                                </motion.div>
                            )}
                            {isCorrect === false && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 text-red-400 text-sm"
                                >
                                    ❌ ভুল! আবার চেষ্টা করো
                                </motion.div>
                            )}
                        </motion.div>
                    )}



                </AnimatePresence>
            </div>
        </div>
    )
}

