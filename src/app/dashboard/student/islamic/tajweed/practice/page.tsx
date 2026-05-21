'use client'

import { useState, useRef, useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSpeech } from '@/hooks/useSpeech'

const PRACTICE_AYAHS: Record<string, { arabic: string; bn: string }[]> = {
    ghunna: [
        { arabic: 'مِنَ النَّاسِ', bn: 'মিনান্নাস' },
        { arabic: 'إِنَّ اللَّهَ', bn: 'ইন্নাল্লাহ' },
        { arabic: 'وَمِنَ النَّاسِ', bn: 'ওয়ামিনান্নাস' },
    ],
    ikhfa: [
        { arabic: 'مَن كَانَ', bn: 'মান কানা' },
        { arabic: 'إِن كُنتُمْ', bn: 'ইন কুনতুম' },
        { arabic: 'مِن قَبْلِ', bn: 'মিন কাবলি' },
    ],
    idgham: [
        { arabic: 'مَن يَعْمَلْ', bn: 'মাইয়্যামাল' },
        { arabic: 'مِن وَلِيٍّ', bn: 'মিওওয়ালিয়্যিন' },
        { arabic: 'مِن رَّبِّكَ', bn: 'মির্রাব্বিকা' },
    ],
    iqlab: [
        { arabic: 'مِن بَعْدِ', bn: 'মিম বাদি' },
        { arabic: 'أَنبِئُونِي', bn: 'আমবিউনি' },
        { arabic: 'سَمِيعٌ بَصِيرٌ', bn: 'সামিউম বাসির' },
    ],
    madd: [
        { arabic: 'قَالَ', bn: 'কা-লা' },
        { arabic: 'الرَّحْمَٰنِ', bn: 'আর্রাহমা-নি' },
        { arabic: 'نُوحِيهَا', bn: 'নূহী-হা' },
    ],
    qalqalah: [
        { arabic: 'يَخْلُقْ', bn: 'ইয়াখলুক্' },
        { arabic: 'مِن طِينٍ', bn: 'মিন ত্বীন্' },
        { arabic: 'بِالْحَقِّ', bn: 'বিলহাক্ক্' },
    ],
}

const RULE_NAMES: Record<string, string> = {
    ghunna: 'গুন্নাহ',
    ikhfa: 'ইখফা',
    idgham: 'ইদগাম',
    iqlab: 'ইকলাব',
    madd: 'মাদ্দ',
    qalqalah: 'কালকালাহ',
}

// Math.random render এ call হবে না — useMemo দিয়ে একবার calculate
const WAVEFORM_HEIGHTS = Array.from({ length: 12 }, () => 20 + Math.floor(Math.random() * 40))
const WAVEFORM_DURATIONS = Array.from({ length: 12 }, () =>
    parseFloat((0.5 + Math.random() * 0.5).toFixed(2))
)

type AIResult = {
    score: number
    mistakes: { word: string; error: string; correction: string }[]
    feedback: string
    encouragement: string
    rule_applied_correctly: boolean
}

function PracticeContent() {
    const searchParams = useSearchParams()
    const ruleId = searchParams.get('rule') || 'ghunna'
    const ayahs = PRACTICE_AYAHS[ruleId] || PRACTICE_AYAHS.ghunna
    const ruleName = RULE_NAMES[ruleId] || 'গুন্নাহ'

    const [currentAyahIndex, setCurrentAyahIndex] = useState(0)
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'result'>('idle')
    const [result, setResult] = useState<AIResult | null>(null)
    const [sessionScores, setSessionScores] = useState<number[]>([])
    const [showTip, setShowTip] = useState(false)

    // Recording refs — useVoiceRecorder use করছি না
    // কারণ tajweed এ manual start/stop দরকার, fixed 3s নয়
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const { speak } = useSpeech()

    const currentAyah = ayahs[currentAyahIndex]

    const avgScore = useMemo(() =>
        sessionScores.length > 0
            ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
            : 0,
        [sessionScores]
    )

    const handleListen = () => speak(currentAyah.arabic, 'ar-SA')

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            chunksRef.current = []

            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.start()
            setStatus('listening')
            setResult(null)
        } catch {
            alert('Microphone permission দিন।')
        }
    }

    const handleStopRecording = async () => {
        const mediaRecorder = mediaRecorderRef.current
        if (!mediaRecorder || mediaRecorder.state !== 'recording') return

        setStatus('processing')

        mediaRecorder.onstop = async () => {
            mediaRecorder.stream.getTracks().forEach(t => t.stop())

            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            const audioBlob = new Blob(chunksRef.current, { type: mimeType })

            try {
                const formData = new FormData()
                formData.append('audio', audioBlob, 'recording.webm')
                formData.append('ayah_text', currentAyah.arabic)
                formData.append('rule_id', ruleId)

                const res = await fetch('/api/islamic/tajweed-check', {
                    method: 'POST',
                    body: formData,
                })

                const data = await res.json()

                if (res.ok) {
                    setResult(data)
                    setSessionScores(prev => [...prev, data.score])
                    setStatus('result')
                } else {
                    setStatus('idle')
                    alert('AI check করতে সমস্যা হয়েছে। আবার চেষ্টা করো।')
                }
            } catch {
                setStatus('idle')
                alert('Recording সমস্যা হয়েছে। আবার চেষ্টা করো।')
            }
        }

        mediaRecorder.stop()
    }

    const handleNext = () => {
        setCurrentAyahIndex(prev =>
            prev < ayahs.length - 1 ? prev + 1 : 0
        )
        setResult(null)
        setStatus('idle')
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400'
        if (score >= 60) return 'text-amber-400'
        return 'text-rose-400'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
        if (score >= 60) return 'from-amber-500/20 to-orange-500/20 border-amber-500/30'
        return 'from-rose-500/20 to-pink-500/20 border-rose-500/30'
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/islamic/tajweed"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Tajweed Rules
                    </Link>
                    {sessionScores.length > 0 && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/10 ${getScoreColor(avgScore)}`}>
                            গড় score: {avgScore}%
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <p className="text-gray-400 text-sm mb-1">AI Tajweed Practice</p>
                    <h1 className="text-2xl font-bold text-white mb-1">{ruleName} Practice</h1>
                    <p className="text-gray-500 text-sm">আয়াত {currentAyahIndex + 1} / {ayahs.length}</p>
                </motion.div>

                {/* Ayah Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentAyahIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="mb-6"
                    >
                        <div className="rounded-3xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 text-center">
                            <p
                                className="text-4xl md:text-5xl leading-loose text-white mb-3"
                                style={{ fontFamily: 'serif', direction: 'rtl' }}
                            >
                                {currentAyah.arabic}
                            </p>
                            <p className="text-gray-400 text-sm mb-4 italic">{currentAyah.bn}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleListen}
                                className="mx-auto flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-500/30 transition-all"
                            >
                                🔊 সঠিক উচ্চারণ শুনুন
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Tip */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTip(!showTip)}
                    className="w-full mb-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-all"
                >
                    {showTip ? '▲ টিপস লুকাও' : `▼ ${ruleName} এর টিপস দেখো`}
                </motion.button>
                <AnimatePresence>
                    {showTip && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4"
                        >
                            <p className="text-amber-200 text-sm">
                                {ruleId === 'ghunna' && 'নাক বন্ধ করে পড়ার মতো অনুভব করো — ২ count টানো'}
                                {ruleId === 'ikhfa' && 'নুনকে পুরো বলো না, আবার একদম লুকাও না — মাঝামাঝি'}
                                {ruleId === 'idgham' && 'নুনকে পরের হরফের সাথে মিলিয়ে পড়ো — আলাদা করো না'}
                                {ruleId === 'iqlab' && 'নুনকে মিম এ পরিবর্তন করো, গুন্নাহ সহ ২ count'}
                                {ruleId === 'madd' && '২ count বা ৪ count বা ৬ count — কোন madd সেটা দেখো'}
                                {ruleId === 'qalqalah' && 'হরফটা আটকে যায়, তারপর bounce করে বের হয়'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording Section */}
                <div className="mb-6">
                    {status === 'idle' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartRecording}
                            className="w-full py-5 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                        >
                            🎙️ তেলাওয়াত শুরু করো
                        </motion.button>
                    )}

                    {status === 'listening' && (
                        <div className="text-center">
                            {/* Waveform — static heights, no Math.random in render */}
                            <div className="flex items-center justify-center gap-1.5 mb-4 h-16">
                                {WAVEFORM_HEIGHTS.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 bg-emerald-400 rounded-full"
                                        animate={{ height: ['8px', `${h}px`, '8px'] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: WAVEFORM_DURATIONS[i],
                                            delay: i * 0.08,
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-emerald-400 font-semibold mb-4 animate-pulse">
                                🔴 রেকর্ড হচ্ছে...
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStopRecording}
                                className="w-full py-4 rounded-2xl bg-rose-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30"
                            >
                                ⏹️ থামাও এবং AI Check করো
                            </motion.button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="text-center py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="text-4xl mb-3 inline-block"
                            >⚙️</motion.div>
                            <p className="text-gray-400">AI analyze করছে...</p>
                            <p className="text-gray-500 text-sm mt-1">Groq Whisper + LLaMA</p>
                        </div>
                    )}
                </div>

                {/* Result */}
                <AnimatePresence>
                    {status === 'result' && result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6"
                        >
                            <div className={`rounded-3xl bg-linear-to-br border p-6 ${getScoreBg(result.score)}`}>

                                {/* Score */}
                                <div className="text-center mb-5">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5 }}
                                        className={`text-6xl font-bold mb-1 ${getScoreColor(result.score)}`}
                                    >
                                        {result.score}
                                    </motion.div>
                                    <p className="text-gray-400 text-sm">/ 100</p>
                                    <div className="w-full bg-white/10 rounded-full h-3 mt-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.score}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className={`h-3 rounded-full ${result.score >= 80
                                                    ? 'bg-linear-to-r from-emerald-400 to-teal-500'
                                                    : result.score >= 60
                                                        ? 'bg-linear-to-r from-amber-400 to-orange-500'
                                                        : 'bg-linear-to-r from-rose-400 to-pink-500'
                                                }`}
                                        />
                                    </div>
                                    <p className="text-sm mt-2">
                                        {result.rule_applied_correctly
                                            ? <span className="text-emerald-400">✅ {ruleName} সঠিকভাবে apply হয়েছে!</span>
                                            : <span className="text-amber-400">⚠️ {ruleName} আরো practice দরকার</span>
                                        }
                                    </p>
                                </div>

                                {/* Mistakes */}
                                {result.mistakes && result.mistakes.length > 0 && (
                                    <div className="rounded-xl bg-white/5 p-4 mb-3">
                                        <p className="text-xs text-rose-400 font-semibold mb-3">
                                            ❌ ভুলগুলো ({result.mistakes.length}টি)
                                        </p>
                                        <div className="space-y-2">
                                            {result.mistakes.map((m, i) => (
                                                <div key={i} className="rounded-lg bg-white/5 p-3">
                                                    <p
                                                        className="text-white font-bold mb-1"
                                                        style={{ fontFamily: 'serif', direction: 'rtl' }}
                                                    >
                                                        {m.word}
                                                    </p>
                                                    <p className="text-rose-400 text-xs mb-1">❌ {m.error}</p>
                                                    <p className="text-emerald-400 text-xs">✅ {m.correction}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Feedback */}
                                <div className="rounded-xl bg-white/5 p-4 mb-3">
                                    <p className="text-xs text-gray-400 font-semibold mb-2">🤖 AI Feedback</p>
                                    <p className="text-gray-300 text-sm leading-relaxed">{result.feedback}</p>
                                </div>

                                {/* Encouragement */}
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4">
                                    <p className="text-emerald-300 text-sm text-center">💚 {result.encouragement}</p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setResult(null); setStatus('idle') }}
                                        className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold"
                                    >
                                        🔁 আবার চেষ্টা করো
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNext}
                                        className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg"
                                    >
                                        পরের আয়াত →
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Session summary */}
                {sessionScores.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-2xl bg-white/5 border border-white/10 p-4"
                    >
                        <p className="text-xs text-gray-400 font-semibold mb-3">
                            📊 এই session এর summary ({sessionScores.length} টি practice)
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {sessionScores.map((score, i) => (
                                <span
                                    key={i}
                                    className={`text-xs px-3 py-1.5 rounded-full font-bold ${score >= 80
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : score >= 60
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-rose-500/20 text-rose-400'
                                        }`}
                                >
                                    #{i + 1}: {score}%
                                </span>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-gray-400">গড় score</span>
                            <span className={`font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default function TajweedPracticePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] flex items-center justify-center">
                <p className="text-emerald-400">লোড হচ্ছে...</p>
            </div>
        }>
            <PracticeContent />
        </Suspense>
    )
}