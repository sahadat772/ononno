'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'
import type { KidsIslamicLesson } from '@/types/database'

export default function KalimaPage() {
    const [lessons, setLessons] = useState<KidsIslamicLesson[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<KidsIslamicLesson | null>(null)
    const [learned, setLearned] = useState<string[]>([])
    const { speak } = useSpeech()

    useEffect(() => {
        fetch('/api/kids/islamic/kalima')
            .then(r => r.json())
            .then(d => {
                setLessons(d.lessons || [])
                if (d.lessons?.length > 0) setSelected(d.lessons[0])
            })
            .finally(() => setLoading(false))
    }, [])

    const handleLearn = (lesson: KidsIslamicLesson) => {
        setSelected(lesson)
        if (!learned.includes(lesson.id)) {
            setLearned(prev => [...prev, lesson.id])
        }
        speak(lesson.arabic_text, 'ar-SA')
    }

    const progress = lessons.length > 0
        ? Math.round((learned.length / lessons.length) * 100)
        : 0

    if (loading) return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="text-4xl mb-3"
                >☪️</motion.div>
                <p className="text-emerald-400">লোড হচ্ছে...</p>
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
                    <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
                        ✅ {learned.length}/{lessons.length} শেখা হয়েছে
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-2"
                    >☝️</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">কালিমা শিখি</h1>
                    <p className="text-2xl text-blue-300 mb-1">الكلمة</p>
                    <p className="text-gray-400 text-sm">ইসলামের মূল কালিমাসমূহ</p>
                </motion.div>

                {/* Progress */}
                <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>অগ্রগতি</span>
                        <span>{learned.length}/{lessons.length} • {progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                            animate={{ width: `${progress}%` }}
                            className="bg-linear-to-r from-blue-400 to-indigo-500 h-3 rounded-full"
                        />
                    </div>
                </div>

                {/* Selected Kalima Detail */}
                <AnimatePresence mode="wait">
                    {selected && (
                        <motion.div
                            key={selected.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-6"
                        >
                            <div className="rounded-3xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 p-6">

                                {/* Arabic text */}
                                <div className="text-center mb-5">
                                    <p className="text-3xl md:text-4xl leading-loose text-white mb-3"
                                        style={{ fontFamily: 'serif', direction: 'rtl' }}>
                                        {selected.arabic_text}
                                    </p>

                                    {/* Listen button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => speak(selected.arabic_text, 'ar-SA')}
                                        className="mx-auto flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-500/30 transition-all"
                                    >
                                        🔊 আরবি শুনুন
                                    </motion.button>
                                </div>

                                {/* Pronunciation */}
                                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-3">
                                    <p className="text-xs text-amber-400 font-semibold mb-1">🔤 বাংলা উচ্চারণ</p>
                                    <p className="text-amber-200 text-sm leading-relaxed">{selected.pronunciation}</p>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => speak(selected.pronunciation || '', 'bn-BD')}
                                        className="mt-2 text-xs text-amber-400 hover:text-amber-300"
                                    >
                                        🔊 উচ্চারণ শুনুন
                                    </motion.button>
                                </div>

                                {/* Meaning */}
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-4">
                                    <p className="text-xs text-emerald-400 font-semibold mb-1">📖 বাংলা অর্থ</p>
                                    <p className="text-gray-300 text-sm leading-relaxed">{selected.bangla_translation}</p>
                                </div>

                                {/* Learned badge */}
                                {learned.includes(selected.id) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-center"
                                    >
                                        <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                                            ✅ শেখা হয়েছে! মাশাআল্লাহ!
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Kalima List */}
                <div className="space-y-3">
                    {lessons.map((lesson, i) => (
                        <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleLearn(lesson)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${selected?.id === lesson.id
                                    ? 'border-blue-500/50 bg-blue-500/20'
                                    : learned.includes(lesson.id)
                                        ? 'border-emerald-500/30 bg-emerald-500/10'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${learned.includes(lesson.id)
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {learned.includes(lesson.id) ? '✅' : i + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white text-sm">{lesson.title_bn}</p>
                                        <p className="text-gray-400 text-xs">{lesson.title}</p>
                                    </div>
                                </div>
                                <p className="text-lg text-white/70" style={{ fontFamily: 'serif', direction: 'rtl' }}>
                                    {lesson.arabic_text.slice(0, 15)}...
                                </p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Completion message */}
                {learned.length === lessons.length && lessons.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 rounded-2xl bg-linear-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-5 text-center"
                    >
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="text-emerald-400 font-bold text-lg">মাশাআল্লাহ! সব কালিমা শেখা হয়েছে!</p>
                        <p className="text-gray-400 text-sm mt-1">আল্লাহ তোমাকে কবুল করুন।</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}