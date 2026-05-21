'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSpeech } from '@/hooks/useSpeech'
import type { KidsIslamicLesson } from '@/types/database'

export default function SurahPage() {
    const [lessons, setLessons] = useState<KidsIslamicLesson[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<KidsIslamicLesson | null>(null)
    const [learned, setLearned] = useState<string[]>([])
    const [memorized, setMemorized] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<'arabic' | 'pronunciation' | 'meaning'>('arabic')
    const { speak } = useSpeech()

    useEffect(() => {
        fetch('/api/kids/islamic/surah')
            .then(r => r.json())
            .then(d => {
                setLessons(d.lessons || [])
                if (d.lessons?.length > 0) setSelected(d.lessons[0])
            })
            .finally(() => setLoading(false))
    }, [])

    const handleSelect = (lesson: KidsIslamicLesson) => {
        setSelected(lesson)
        setActiveTab('arabic')
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
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-4xl mb-3"
                >📖</motion.div>
                <p className="text-amber-400">লোড হচ্ছে...</p>
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
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                        📖 {memorized.length}/{lessons.length} মুখস্থ
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-2"
                    >📖</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">সূরা শিখি</h1>
                    <p className="text-2xl text-amber-300 mb-1">السورة</p>
                    <p className="text-gray-400 text-sm">ছোট সূরা মুখস্থ করি</p>
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
                            className="bg-linear-to-r from-amber-400 to-orange-500 h-3 rounded-full"
                        />
                    </div>
                </div>

                {/* Surah List — Left side scroll */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {lessons.map((lesson, i) => (
                        <motion.button
                            key={lesson.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelect(lesson)}
                            className={`flex-shrink: 0; rounded-2xl border px-4 py-3 text-center transition-all min-width: 90px; ${selected?.id === lesson.id
                                    ? 'border-amber-500/50 bg-amber-500/20'
                                    : memorized.includes(lesson.id)
                                        ? 'border-emerald-500/30 bg-emerald-500/10'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <p className="text-xl mb-1">
                                {memorized.includes(lesson.id) ? '✅' : '📖'}
                            </p>
                            <p className="text-xs text-white font-semibold truncate max-width: 80px;">
                                {lesson.title_bn}
                            </p>
                        </motion.button>
                    ))}
                </div>

                {/* Selected Surah Detail */}
                <AnimatePresence mode="wait">
                    {selected && (
                        <motion.div
                            key={selected.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <div className="rounded-3xl bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-6">

                                {/* Surah name */}
                                <div className="text-center mb-4">
                                    <span className="inline-block bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-2">
                                        {selected.title_bn}
                                    </span>
                                    <p className="text-gray-400 text-xs">{selected.title}</p>
                                </div>

                                {/* Tab switcher */}
                                <div className="flex gap-1.5 mb-4 bg-white/5 rounded-xl p-1">
                                    {[
                                        { key: 'arabic', label: '🕌 আরবি' },
                                        { key: 'pronunciation', label: '🔤 উচ্চারণ' },
                                        { key: 'meaning', label: '📖 অর্থ' },
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                                                    ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow'
                                                    : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab content */}
                                <AnimatePresence mode="wait">
                                    {activeTab === 'arabic' && (
                                        <motion.div
                                            key="arabic"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center"
                                        >
                                            <p className="text-xl md:text-2xl leading-loose text-white mb-4"
                                                style={{ fontFamily: 'serif', direction: 'rtl', lineHeight: '2.5' }}>
                                                {selected.arabic_text}
                                            </p>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => speak(selected.arabic_text, 'ar-SA')}
                                                className="mx-auto flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-full text-sm hover:bg-amber-500/30 transition-all"
                                            >
                                                🔊 সূরা শুনুন
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    {activeTab === 'pronunciation' && (
                                        <motion.div
                                            key="pronunciation"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-3">
                                                <p className="text-amber-200 text-sm leading-loose italic">
                                                    {selected.pronunciation}
                                                </p>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => speak(selected.pronunciation || '', 'bn-BD')}
                                                className="w-full flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 py-2.5 rounded-xl text-sm hover:bg-amber-500/30 transition-all"
                                            >
                                                🔊 উচ্চারণ শুনুন
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    {activeTab === 'meaning' && (
                                        <motion.div
                                            key="meaning"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                                                <p className="text-gray-300 text-sm leading-loose">
                                                    {selected.bangla_translation}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action buttons */}
                                <div className="mt-4 flex gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => speak(selected.arabic_text, 'ar-SA')}
                                        className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-all"
                                    >
                                        🔁 আবার শুনুন
                                    </motion.button>

                                    {!memorized.includes(selected.id) ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleMemorized(selected.id)}
                                            className="flex-1 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30 text-sm"
                                        >
                                            ✅ মুখস্থ হয়েছে!
                                        </motion.button>
                                    ) : (
                                        <div className="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm text-center">
                                            ✅ মুখস্থ!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* All memorized */}
                {memorized.length === lessons.length && lessons.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-2xl bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-5 text-center"
                    >
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="text-amber-400 font-bold text-lg">মাশাআল্লাহ! সব সূরা মুখস্থ হয়েছে!</p>
                        <p className="text-gray-400 text-sm mt-1">আল্লাহ তোমার হিফজ কবুল করুন।</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}