'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import AnimatedCard from '@/components/ui/AnimatedCard'

const lessons = [
    {
        id: 1,
        title: 'আরবি হরফ পরিচিতি',
        subtitle: 'আলিফ থেকে ইয়া পর্যন্ত',
        duration: '15 মিনিট',
        level: 'শিশু',
        completed: false,
        icon: '🔤',
    },
    {
        id: 2,
        title: 'হরকত শিক্ষা',
        subtitle: 'যবর, যের, পেশ',
        duration: '20 মিনিট',
        level: 'শিশু',
        completed: false,
        icon: '✏️',
    },
    {
        id: 3,
        title: 'তানভীন ও সাকিন',
        subtitle: 'নুনসহ হরকত',
        duration: '20 মিনিট',
        level: 'প্রাথমিক',
        completed: false,
        icon: '📝',
    },
    {
        id: 4,
        title: 'সূরা আল-ফাতিহা',
        subtitle: 'কুরআনের প্রথম সূরা',
        duration: '25 মিনিট',
        level: 'প্রাথমিক',
        completed: false,
        icon: '📖',
    },
    {
        id: 5,
        title: 'সূরা আল-ইখলাস',
        subtitle: 'তাওহীদের সূরা',
        duration: '15 মিনিট',
        level: 'প্রাথমিক',
        completed: false,
        icon: '⭐',
    },
    {
        id: 6,
        title: 'সূরা আল-ফালাক',
        subtitle: 'আশ্রয় প্রার্থনার সূরা',
        duration: '15 মিনিট',
        level: 'মাধ্যমিক',
        completed: false,
        icon: '🌙',
    },
]

const levelColors: Record<string, string> = {
    শিশু: 'bg-green-100 text-green-700',
    প্রাথমিক: 'bg-blue-100 text-blue-700',
    মাধ্যমিক: 'bg-purple-100 text-purple-700',
    উন্নত: 'bg-amber-100 text-amber-700',
}

export default function QuranPage() {
    const [selectedLesson, setSelectedLesson] = useState<typeof lessons[0] | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/student/islamic" className="text-gray-400 hover:text-gray-600">←</Link>
                        <div className="text-lg font-bold text-gradient-primary">কুরআন তিলাওয়াত</div>
                    </div>
                    <div className="text-sm text-gray-500">০/{lessons.length} সম্পন্ন</div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
                    <div className="relative z-10">
                        <div className="text-5xl mb-4">📖</div>
                        <h1 className="text-2xl font-bold mb-2">কুরআন তিলাওয়াত</h1>
                        <p className="text-green-100 text-sm mb-2">
                            اقْرَأْ بِاسْمِ رَبِّكَ — পড়ো তোমার রবের নামে
                        </p>
                        <p className="text-green-100/80 text-sm">
                            নূরানী পদ্ধতিতে ধাপে ধাপে কুরআন শিখো। AI তোমার উচ্চারণ check করবে।
                        </p>
                    </div>
                </motion.div>

                {/* Tajweed AI Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 mb-8 flex items-center gap-4"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-200 shrink-0">
                        🎤
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-amber-800 mb-1">Tajweed AI — শীঘ্রই আসছে</div>
                        <div className="text-amber-600 text-sm">
                            মাইক্রোফোনে তিলাওয়াত করো — AI তোমার মাখরাজ ও তাজওয়ীদ check করে feedback দেবে
                        </div>
                    </div>
                    <div className="shrink-0">
                        <span className="bg-amber-200 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                            Coming Soon
                        </span>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Lesson list */}
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="font-bold text-gray-900 mb-4">পাঠ্যক্রম</h2>
                        {lessons.map((lesson, i) => (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedLesson?.id === lesson.id
                                        ? 'border-green-300 shadow-md shadow-green-100'
                                        : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${lesson.completed
                                            ? 'bg-green-100'
                                            : 'bg-gray-50'
                                        }`}>
                                        {lesson.completed ? '✅' : lesson.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[lesson.level]}`}>
                                                {lesson.level}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{lesson.subtitle}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs text-gray-400">{lesson.duration}</div>
                                        <div className="text-green-500 mt-1">→</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Lesson viewer */}
                    <div className="lg:col-span-1">
                        <AnimatePresence mode="wait">
                            {selectedLesson ? (
                                <motion.div
                                    key={selectedLesson.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="sticky top-24"
                                >
                                    <AnimatedCard className="p-6" hover={false}>
                                        <div className="text-center mb-6">
                                            <div className="text-5xl mb-3">{selectedLesson.icon}</div>
                                            <h3 className="font-bold text-gray-900 text-lg">{selectedLesson.title}</h3>
                                            <p className="text-gray-500 text-sm mt-1">{selectedLesson.subtitle}</p>
                                        </div>

                                        {/* Arabic text preview */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 text-center border border-green-100">
                                            <p className="text-4xl font-arabic leading-loose text-gray-800 mb-3" dir="rtl">
                                                بِسْمِ اللَّهِ
                                            </p>
                                            <p className="text-sm text-gray-500">বিসমিল্লাহ</p>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex gap-3 mb-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setIsPlaying(!isPlaying)}
                                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                            >
                                                {isPlaying ? '⏸ বিরতি' : '▶ শুনো'}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
                                            >
                                                🎤 তিলাওয়াত করো
                                            </motion.button>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full gradient-primary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-200"
                                        >
                                            পাঠ শুরু করো →
                                        </motion.button>
                                    </AnimatedCard>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-8 text-center"
                                >
                                    <div className="text-5xl mb-4">📖</div>
                                    <p className="text-gray-500 text-sm">
                                        বাম দিক থেকে একটি পাঠ select করো
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    )
}