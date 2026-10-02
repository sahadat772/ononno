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

export default function LessonEngine({ lesson }: { lesson: LessonConfig }) {
    const router = useRouter()
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
    const voiceLang = resolveVoiceLang(lesson)
    const safeBackHref = lesson.backHref.replace(/\/addition\/?$/, '')
    const { speak, stop: stopSpeak } = useSpeech()
    const [exIdx, setExIdx] = useState(0)
    const [hearts, setHearts] = useState(3)
    const [xp, setXp] = useState(0)
    const [stars, setStars] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)

    const currentEx = lesson.exercises[exIdx]
    const totalSteps = lesson.exercises.length
    const progressPct = totalSteps ? (exIdx / totalSteps) * 100 : 0
    const isResult = exIdx >= totalSteps

    useEffect(() => {
        if (!currentEx || isResult) return
        const timer = setTimeout(() => speak(currentEx.voiceText, voiceLang), 500)
        return () => clearTimeout(timer)
    }, [exIdx, currentEx, speak, voiceLang, isResult])

    function celebrate() {
        setShowCelebration(true)
        speak('শাবাশ!', 'bn-BD')
        setTimeout(() => setShowCelebration(false), 1800)
    }

    function nextEx() {
        const next = exIdx + 1
        if (next < totalSteps) {
            setExIdx(next); setSelected(null); setHasDrawn(false); clearCanvas()
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
        if (correct) { celebrate(); setXp(x => x + 10) }
        else { setHearts(h => Math.max(0, h - 1)) }
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
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setSaveError('লগইন নেই'); setSaving(false); return }
            const { error } = await supabase.from('learning_progress').upsert({
                user_id: user.id, lesson_id: String(lesson.id), score: xp, stars, completed: true,
                completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,lesson_id' })
            if (error) { setSaveError(error.message); setSaving(false); return }
            router.push(safeBackHref)
            router.refresh()
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'সেভ ব্যর্থ')
            setSaving(false)
        }
    }

    if (isResult) return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] to-[#0a0a1a] flex flex-col items-center justify-center p-6 text-white">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center max-w-sm w-full">
                <div className="text-8xl mb-4">{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}</div>
                <div className="flex justify-center gap-2 mb-5">{[1,2,3].map(s => <span key={s} className={`text-4xl ${s <= stars ? '' : 'opacity-20'}`}>⭐</span>)}</div>
                <h2 className="text-2xl font-bold mb-1">{stars === 3 ? 'অসাধারণ! 🎉' : 'খুব ভালো! 👏'}</h2>
                <p className="text-gray-400 mb-4">{lesson.letter} lesson শেষ!</p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/5 rounded-2xl p-3"><div className="text-amber-400 font-bold">+{xp}</div><div className="text-xs text-gray-500">XP</div></div>
                    <div className="bg-white/5 rounded-2xl p-3"><div className="text-yellow-400 font-bold">{stars}/3</div><div className="text-xs text-gray-500">Stars</div></div>
                    <div className="bg-white/5 rounded-2xl p-3"><div className="text-red-400 font-bold">{hearts}/3</div><div className="text-xs text-gray-500">Hearts</div></div>
                </div>
                {saveError && <p className="mb-3 text-sm text-red-200">⚠️ {saveError}</p>}
                <motion.button whileTap={{ scale: 0.96 }} type="button" disabled={saving} onClick={() => void finishAndSave()}
                    className={`w-full min-h-12 rounded-2xl bg-gradient-to-r ${lesson.color} font-bold text-white shadow-lg disabled:opacity-60`}>
                    {saving ? 'সেভ হচ্ছে…' : '← তালিকায় ফিরে যাও'}
                </motion.button>
            </motion.div>
        </div>
    )

    if (!accessLoading && !isPaid && !canDoLesson) {
        return <div className="min-h-screen flex items-center justify-center p-6"><LockOverlay type="daily_limit" /></div>
    }

    const icon = letterIcon(lesson.letter, lesson.emoji)

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#120a2e] via-[#0d0a2e] to-[#080818] text-white flex flex-col">
            <div className={`pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br ${lesson.color} opacity-25 blur-3xl`} />
            <AnimatePresence>
                {showCelebration && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                        {CELEBRATION.map((pos, i) => (
                            <motion.div key={i} initial={{ y: 0, x: 0, opacity: 1, scale: 0 }} animate={{ y: pos.y, x: pos.x, opacity: 0, scale: 2.2 }} transition={{ duration: 1.3, delay: i * 0.06 }} className="absolute text-4xl">{['🌟','⭐','✨','🎉','🎊'][i]}</motion.div>
                        ))}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} className="rounded-full border border-white/20 bg-white/15 px-6 py-3 text-2xl font-black backdrop-blur-md">শাবাশ! 🎉</motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 shrink-0 px-4 pt-4 pb-2 flex items-center gap-2.5">
                <button type="button" onClick={() => router.push(safeBackHref)} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg font-bold text-white">←</button>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${lesson.color} text-lg font-black text-white shadow`}>
                    {lesson.letter}
                </div>
                <div className="flex-1 bg-white/10 rounded-full h-5 overflow-hidden border border-white/10">
                    <motion.div className={`h-5 rounded-full bg-gradient-to-r ${lesson.color} shadow-lg`} animate={{ width: `${progressPct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
                <div className="flex gap-0.5">{[1,2,3].map(h => <span key={h} className={`text-xl ${h <= hearts ? '' : 'opacity-25'}`}>❤️</span>)}</div>
                <div className="bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full text-sm font-bold text-amber-400">⚡ {xp}</div>
            </div>

            <div className="mb-3 px-4 text-center">
                <p className="text-base font-black text-white">{currentEx?.title}</p>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8">
                <AnimatePresence mode="wait">
                <motion.div key={currentEx?.id || 'step'} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="w-full max-w-sm">
                {currentEx?.type === 'intro' && (
                    <div className="text-center max-w-sm w-full">
                        <motion.div initial={{ scale: 0.75, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                            className="relative mx-auto mb-5 w-full max-w-xs">
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
                        <button type="button" onClick={() => speak(currentEx.voiceText, voiceLang)} className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 font-bold text-white mb-3">🔊 গল্প শোনো</button>
                        <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => nextEx()} className={`min-h-12 w-full rounded-2xl bg-gradient-to-r ${lesson.color} font-bold text-white shadow-lg`}>এগিয়ে যাও →</motion.button>
                    </div>
                )}

                {(currentEx?.type === 'listen-repeat' || currentEx?.type === 'pronounce') && (
                    <div className="text-center max-w-sm w-full">
                        <div className={`mx-auto mb-4 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br ${lesson.color} text-5xl font-black text-white shadow-xl`}>
                            {currentEx.type === 'pronounce' ? lesson.letter : currentEx.content}
                        </div>
                        {currentEx.type === 'listen-repeat' && (
                            <p className="mb-3 text-2xl font-bold text-slate-200">{lesson.emoji} {currentEx.content}</p>
                        )}
                        <button type="button" onClick={() => speak(currentEx.voiceText, voiceLang)} className="min-h-12 w-full rounded-2xl border border-white/15 bg-white/10 font-bold text-white mb-3">🔊 শোনো</button>
                        <button type="button" onClick={() => { celebrate(); setXp(x => x + 10); nextEx() }} className="min-h-12 w-full rounded-2xl bg-emerald-500 font-bold text-white mb-3">✓ বলেছি</button>
                        <button type="button" onClick={() => nextEx()} className="min-h-11 w-full rounded-2xl border border-white/15 bg-white/5 text-sm font-bold text-slate-300">স্কিপ →</button>
                    </div>
                )}

                {currentEx?.type === 'bubble-pop' && (
                    <div className="relative w-full max-w-sm h-80 mx-auto">
                        <p className="text-center text-sm text-sky-300 mb-2 font-bold">🫧 সঠিক বুদবুদ ফাটাও!</p>
                        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-sky-400/25 bg-gradient-to-b from-sky-950/50 to-indigo-950/40">
                            <div className="absolute left-1/4 top-1/4 size-20 rounded-full bg-sky-400/10 blur-2xl" />
                            <div className="absolute bottom-1/4 right-1/4 size-24 rounded-full bg-violet-400/10 blur-2xl" />
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
                                        animate={done && isSel
                                            ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] }
                                            : { scale: [1, 1.1, 1], y: [0, -12, 0], opacity: 1 }}
                                        transition={done && isSel
                                            ? { duration: 0.45 }
                                            : { duration: 2.1 + i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{ top: pos.top, left: pos.left }}
                                        className={`absolute flex size-[4.25rem] items-center justify-center rounded-full border-2 text-2xl font-black shadow-xl
                                            ${done && isSel
                                                ? (isRight ? 'border-emerald-200 bg-emerald-400 text-white' : 'border-red-200 bg-red-400 text-white')
                                                : `border-white/45 bg-gradient-to-br ${lesson.color} text-white`}`}>
                                        {opt}
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {(currentEx?.type === 'tap-correct' || currentEx?.type === 'quiz') && (
                    <div className="text-center max-w-sm w-full">
                        <div className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${lesson.color} text-4xl font-black text-white shadow-lg`}>
                            {lesson.letter}
                        </div>
                        <p className="text-lg text-slate-300 mb-4">{currentEx.title}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {(currentEx.options || []).map((opt) => (
                                <motion.button whileTap={{ scale: 0.92 }} key={opt} type="button" onClick={() => handleSelect(opt)}
                                    className={`min-h-16 rounded-2xl text-2xl font-black border-2 transition ${
                                        selected === null ? 'border-white/20 bg-white/10 text-white'
                                        : opt === currentEx.correctAnswer ? 'border-emerald-400 bg-emerald-500/35 text-emerald-50 shadow-lg shadow-emerald-500/20'
                                        : selected === opt ? 'border-red-400 bg-red-500/30 text-red-100'
                                        : 'border-white/10 bg-white/5 text-slate-500 opacity-50'
                                    }`}>{opt}</motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {currentEx?.type === 'letter-puzzle' && (
                    <div className="text-center max-w-sm w-full">
                        <div className="mb-4 rounded-3xl border-2 border-dashed border-amber-400/40 bg-amber-500/10 p-4">
                            <p className="text-sm text-amber-200 mb-2">🧩 ধাঁধা</p>
                            <p className="text-3xl font-black text-white">{lesson.emoji} {lesson.word}</p>
                            <p className="mt-1 text-sm text-slate-400">কোন বর্ণ দিয়ে শুরু?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(currentEx.options || []).map((opt) => (
                                <button key={opt} type="button" onClick={() => handleSelect(opt)}
                                    className={`min-h-16 rounded-2xl text-2xl font-black border-2 transition ${
                                        selected === null ? 'border-amber-400/30 bg-amber-500/15 text-white active:scale-95'
                                        : opt === currentEx.correctAnswer ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100'
                                        : selected === opt ? 'border-red-400 bg-red-500/30 text-red-100'
                                        : 'border-white/10 bg-white/5 text-slate-500'
                                    }`}>{opt}</button>
                            ))}
                        </div>
                    </div>
                )}

                {currentEx?.type === 'word-builder' && (
                    <div className="text-center max-w-sm w-full">
                        <div className="mb-4 flex items-center justify-center gap-2">
                            <span className="text-4xl">{icon}</span>
                            <span className="text-sm text-slate-400">শব্দ সাজাও</span>
                        </div>
                        <p className="mb-3 text-2xl font-bold text-amber-200">{currentEx.content}</p>
                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                            {(currentEx.options || []).map((letter, idx) => (
                                <button key={`${letter}-${idx}`} type="button" onClick={() => { celebrate(); setXp(x => x + 10); nextEx() }}
                                    className="grid size-14 place-items-center rounded-2xl border-2 border-sky-400/40 bg-sky-500/25 text-2xl font-black text-white shadow-lg">{letter}</button>
                            ))}
                        </div>
                        <button type="button" onClick={() => nextEx()} className="min-h-11 w-full rounded-2xl border border-white/15 bg-white/5 text-sm font-bold text-slate-300">এগিয়ে যাও →</button>
                    </div>
                )}

                {currentEx?.type === 'matching' && (
                    <div className="text-center max-w-sm w-full">
                        <p className="text-xl font-bold text-white mb-4">🔗 মেলাও!</p>
                        <div className="grid grid-cols-2 gap-3">
                            {(currentEx.options || []).map((opt) => {
                                const [L, W] = opt.split('-')
                                return (
                                    <button key={opt} type="button" onClick={() => handleSelect(opt)}
                                        className="min-h-14 rounded-2xl border-2 border-white/20 bg-white/10 text-white font-bold px-2">
                                        {L} — {W}
                                    </button>
                                )
                            })}
                        </div>
                        <button type="button" onClick={() => { celebrate(); setXp(x => x + 10); nextEx() }} className="mt-4 min-h-11 w-full rounded-2xl bg-sky-500 font-bold text-white">✓ হয়ে গেছে</button>
                    </div>
                )}

                {currentEx?.type === 'trace' && (
                    <div className="text-center max-w-sm w-full">
                        <div className={`mx-auto mb-3 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${lesson.color} text-4xl font-black text-white shadow-lg`}>
                            {currentEx.content}
                        </div>
                        <p className="mb-2 text-sm text-slate-400">আঙুল দিয়ে বর্ণটা আঁকো</p>
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
                </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
