'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'
import type { KidsIslamicLesson } from '@/types/database'

export default function DuaPage() {
    const [lessons, setLessons] = useState<KidsIslamicLesson[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<KidsIslamicLesson | null>(null)
    const [learned, setLearned] = useState<string[]>([])
    const [memorized, setMemorized] = useState<string[]>([])
    const { speak } = useSpeech()

    useEffect(() => {
        fetch('/api/kids/islamic/dua')
            .then(r => r.json())
            .then(d => {
                setLessons(d.lessons || [])
                if (d.lessons?.length > 0) setSelected(d.lessons[0])
            })
            .finally(() => setLoading(false))
    }, [])

    const handleSelect = (lesson: KidsIslamicLesson) => {
        setSelected(lesson)
        if (!learned.includes(lesson.id)) {
            setLearned(prev => [...prev, lesson.id])
        }
        speak(lesson.arabic_text, 'ar-SA')
    }

    const handleMemorized = (id: string) => {
        if (!memorized.includes(id)) {
            setMemorized(prev => [...prev, id])
        }
    }

    const progress = lessons.length > 0
        ? Math.round((memorized.length / lessons.length) * 100)
        : 0

    if (loading) return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-4xl mb-3"
                >🤲</motion.div>
                <p className="text-violet-400">লোড হচ্ছে...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/kids-zone/islamic"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← ফিরে যাও
                    </Link>
                    <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full">
                        🤲 {memorized.length}/{lessons.length} মুখস্থ
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-2"
                    >🤲</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">দোয়া শিখি</h1>
                    <p className="text-2xl text-violet-300 mb-1">الدعاء</p>
                    <p className="text-gray-400 text-sm">দৈনন্দিন দোয়া মুখস্থ করি</p>
                </motion.div>

                {/* Progress */}
                <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>মুখস্থ অগ্রগতি</span>
                        <span>{memorized.length}/{lessons.length} • {progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            className="bg-linear-to-r from-violet-400 to-purple-500 h-3 rounded-full"
                        />
                    </div>
                </div>

                {/* Selected Dua Detail */}
                <AnimatePresence mode="wait">
                    {selected && (
                        <motion.div
                            key={selected.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <div className="rounded-3xl bg-linear-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 p-6">

                                {/* Dua title */}
                                <div className="text-center mb-4">
                                    <span className="inline-block bg-violet-500/20 border border-violet-500/30 text-violet-400 px-4 py-1.5 rounded-full text-sm font-semibold">
                                        {selected.title_bn}
                                    </span>
                                </div>

                                {/* Arabic */}
                                <div className="text-center mb-4">
                                    <p className="text-2xl md:text-3xl leading-loose text-white mb-3"
                                        style={{ fontFamily: 'serif', direction: 'rtl' }}>
                                        {selected.arabic_text}
                                    </p>
                                    <div className="flex items-center justify-center gap-3 flex-wrap">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => speak(selected.arabic_text, 'ar-SA')}
                                            className="flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 text-violet-400 px-4 py-2 rounded-full text-sm hover:bg-violet-500/30 transition-all"
                                        >
                                            🔊 আরবি শুনুন
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => speak(selected.pronunciation || '', 'bn-BD')}
                                            className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-sm hover:bg-amber-500/30 transition-all"
                                        >
                                            🔊 উচ্চারণ শুনুন
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Pronunciation */}
                                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-3">
                                    <p className="text-xs text-amber-400 font-semibold mb-1">🔤 বাংলা উচ্চারণ</p>
                                    <p className="text-amber-200 text-sm leading-relaxed italic">
                                        {selected.pronunciation}
                                    </p>
                                </div>

                                {/* Meaning */}
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4">
                                    <p className="text-xs text-emerald-400 font-semibold mb-1">📖 বাংলা অর্থ</p>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {selected.bangla_translation}
                                    </p>
                                </div>

                                {/* Memorized button */}
                                {!memorized.includes(selected.id) ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleMemorized(selected.id)}
                                        className="w-full py-3 rounded-xl bg-linear-to-r from-violet-500 to-purple-500 text-white font-bold shadow-lg shadow-violet-500/30"
                                    >
                                        ✅ মুখস্থ হয়েছে!
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-center"
                                    >
                                        <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                                            ✅ মুখস্থ হয়েছে! মাশাআল্লাহ!
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dua List */}
                <div className="grid grid-cols-1 gap-3">
                    {lessons.map((lesson, i) => (
                        <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelect(lesson)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${selected?.id === lesson.id
                                    ? 'border-violet-500/50 bg-violet-500/20'
                                    : memorized.includes(lesson.id)
                                        ? 'border-emerald-500/30 bg-emerald-500/10'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink: 0; ${memorized.includes(lesson.id)
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : learned.includes(lesson.id)
                                            ? 'bg-violet-500/20 text-violet-400'
                                            : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {memorized.includes(lesson.id) ? '✅' : learned.includes(lesson.id) ? '👁️' : i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm">{lesson.title_bn}</p>
                                    <p className="text-gray-500 text-xs truncate">{lesson.title}</p>
                                </div>
                                {memorized.includes(lesson.id) && (
                                    <span className="text-xs text-emerald-400 flex-shrink: 0;">মুখস্থ ✓</span>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* All memorized */}
                {memorized.length === lessons.length && lessons.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 rounded-2xl bg-linear-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 p-5 text-center"
                    >
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="text-violet-400 font-bold text-lg">মাশাআল্লাহ! সব দোয়া মুখস্থ হয়েছে!</p>
                        <p className="text-gray-400 text-sm mt-1">আল্লাহ তোমার দোয়া কবুল করুন।</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}