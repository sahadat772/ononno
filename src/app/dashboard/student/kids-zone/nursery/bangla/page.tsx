'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const units = [
    {
        id: 1,
        title: 'স্বরবর্ণ',
        subtitle: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ',
        icon: '🌱',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        lessons: [
            { id: 'swarabarna-a', title: 'অ — অজগর', icon: 'অ', unlocked: true, completed: false, xp: 10 },
            { id: 'swarabarna-aa', title: 'আ — আম', icon: 'আ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-i', title: 'ই — ইলিশ', icon: 'ই', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-ii', title: 'ঈ — ঈগল', icon: 'ঈ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-u', title: 'উ — উট', icon: 'উ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-uu', title: 'ঊ — ঊষা', icon: 'ঊ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-ri', title: 'ঋ — ঋষি', icon: 'ঋ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-e', title: 'এ — একতারা', icon: 'এ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-oi', title: 'ঐ — ঐরাবত', icon: 'ঐ', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-o', title: 'ও — ওল', icon: 'ও', unlocked: false, completed: false, xp: 10 },
            { id: 'swarabarna-ou', title: 'ঔ — ঔষধ', icon: 'ঔ', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-swarabarna', title: 'স্বরবর্ণ Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 2,
        title: 'ব্যঞ্জনবর্ণ — Part 1',
        subtitle: 'ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ',
        icon: '🌿',
        color: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        lessons: [
            { id: 'banjanbarna-ka', title: 'ক — কলা', icon: 'ক', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-kha', title: 'খ — খরগোশ', icon: 'খ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-ga', title: 'গ — গরু', icon: 'গ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-gha', title: 'ঘ — ঘড়ি', icon: 'ঘ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-nga', title: 'ঙ — বাঙ', icon: 'ঙ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-cha', title: 'চ — চাঁদ', icon: 'চ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-chha', title: 'ছ — ছাগল', icon: 'ছ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-ja', title: 'জ — জাম', icon: 'জ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-jha', title: 'ঝ — ঝড়', icon: 'ঝ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-ta', title: 'ট — টমেটো', icon: 'ট', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-da', title: 'ড — ডাব', icon: 'ড', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna-na', title: 'ণ — মণি', icon: 'ণ', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-banjanbarna-1', title: 'ব্যঞ্জনবর্ণ Part 1 Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 3,
        title: 'ব্যঞ্জনবর্ণ — Part 2',
        subtitle: 'ত থ দ ধ ন প ফ ব ভ ম',
        icon: '🌳',
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        lessons: [
            { id: 'banjanbarna2-ta', title: 'ত — তরমুজ', icon: 'ত', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-da', title: 'দ — দাঁত', icon: 'দ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-na', title: 'ন — নৌকা', icon: 'ন', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-pa', title: 'প — পাখি', icon: 'প', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-pha', title: 'ফ — ফুল', icon: 'ফ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-ba', title: 'ব — বাঘ', icon: 'ব', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-bha', title: 'ভ — ভালুক', icon: 'ভ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna2-ma', title: 'ম — মাছ', icon: 'ম', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-banjanbarna-2', title: 'ব্যঞ্জনবর্ণ Part 2 Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 4,
        title: 'ব্যঞ্জনবর্ণ — Part 3',
        subtitle: 'য র ল শ ষ স হ ড় ঢ় য়',
        icon: '🏆',
        color: 'from-rose-400 to-pink-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        lessons: [
            { id: 'banjanbarna3-ya', title: 'য — যাত্রী', icon: 'য', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna3-ra', title: 'র — রকেট', icon: 'র', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna3-la', title: 'ল — লাল', icon: 'ল', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna3-sha', title: 'শ — শাপলা', icon: 'শ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna3-sa', title: 'স — সাপ', icon: 'স', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna3-ha', title: 'হ — হাতি', icon: 'হ', unlocked: false, completed: false, xp: 10 },
            { id: 'banjanbarna3-rra', title: 'ড় — গাড়ি', icon: 'ড়', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-banjanbarna-3', title: 'ব্যঞ্জনবর্ণ Part 3 Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 5,
        title: 'যুক্তবর্ণ',
        subtitle: 'ক্ষ জ্ঞ ত্র শ্র এবং রিভিশন',
        icon: '🌟',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        lessons: [
            { id: 'jukta-ksha', title: 'ক্ষ — ক্ষমা', icon: 'ক্ষ', unlocked: false, completed: false, xp: 15 },
            { id: 'jukta-gya', title: 'জ্ঞ — জ্ঞান', icon: 'জ্ঞ', unlocked: false, completed: false, xp: 15 },
            { id: 'jukta-tra', title: 'ত্র — ত্রিকোণ', icon: 'ত্র', unlocked: false, completed: false, xp: 15 },
            { id: 'jukta-shra', title: 'শ্র — শ্রম', icon: 'শ্র', unlocked: false, completed: false, xp: 15 },
            { id: 'jukta-review', title: 'সব বর্ণ রিভিশন', icon: '🔄', unlocked: false, completed: false, xp: 20 },
        ],
        bossQuiz: { id: 'boss-jukta', title: 'চূড়ান্ত Boss Quiz', unlocked: false, xp: 100 },
    },
]

export default function NurseryBanglaPage() {
    const [expandedUnit, setExpandedUnit] = useState<number>(1)

    const totalLessons = units.reduce((sum, u) => sum + u.lessons.length, 0)
    const completedLessons = units.reduce((sum, u) => sum + u.lessons.filter(l => l.completed).length, 0)
    const progressPercent = Math.round((completedLessons / totalLessons) * 100)

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white pb-10">

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                    <Link href="/dashboard/student/kids-zone" className="text-gray-400 hover:text-white transition-colors text-sm">
                        ← Kids Zone
                    </Link>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(h => <span key={h} className="text-xl">❤️</span>)}
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                        <span className="text-sm">⚡</span>
                        <span className="text-amber-400 font-bold text-sm">০ XP</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-5">

                {/* Subject Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-linear-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-5 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0"
                        >
                            অ
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white">বাংলা বর্ণমালা</h1>
                            <p className="text-gray-400 text-sm">স্বরবর্ণ থেকে যুক্তবর্ণ পর্যন্ত</p>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>{completedLessons}/{totalLessons} lesson</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-2.5 rounded-full bg-linear-to-r from-blue-400 to-cyan-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Units */}
                <div className="space-y-3">
                    {units.map((unit, unitIdx) => {
                        const isExpanded = expandedUnit === unit.id
                        const isUnitUnlocked = unitIdx === 0
                        const unitCompleted = unit.lessons.filter(l => l.completed).length

                        return (
                            <motion.div
                                key={unit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: unitIdx * 0.08 }}
                            >
                                {/* Unit Header Button */}
                                <button
                                    onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)}
                                    className={`w-full rounded-2xl border ${unit.border} ${unit.bg} p-4 text-left transition-all ${!isUnitUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${unit.color} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                                            {isUnitUnlocked ? unit.icon : '🔒'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-white text-base">{unit.title}</h3>
                                                {!isUnitUnlocked && (
                                                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                                                        🔒 আগের Unit শেষ করো
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-xs truncate">{unit.subtitle}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 bg-white/10 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full bg-linear-to-r ${unit.color}`}
                                                        style={{ width: `${(unitCompleted / unit.lessons.length) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">{unitCompleted}/{unit.lessons.length}</span>
                                            </div>
                                        </div>
                                        <span className="text-gray-500 shrink-0 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </button>

                                {/* Lessons */}
                                {isExpanded && isUnitUnlocked && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2 px-2 space-y-2"
                                    >
                                        {unit.lessons.map((lesson, lessonIdx) => (
                                            <motion.div
                                                key={lesson.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: lessonIdx * 0.04 }}
                                                className={`flex items-center gap-3 ${lessonIdx % 2 === 0 ? 'ml-2' : 'ml-10'}`}
                                            >
                                                <Link
                                                    href={lesson.unlocked
                                                        ? `/dashboard/student/kids-zone/nursery/bangla/${lesson.id}`
                                                        : '#'}
                                                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg shrink-0 ${lesson.completed
                                                            ? `bg-linear-to-br ${unit.color} text-white`
                                                            : lesson.unlocked
                                                                ? `bg-linear-to-br ${unit.color} text-white ring-4 ring-white/20 animate-pulse`
                                                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {lesson.completed ? '✅' : lesson.unlocked ? lesson.icon : '🔒'}
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${lesson.unlocked ? 'text-white' : 'text-gray-500'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <p className="text-xs text-amber-400">⚡ {lesson.xp} XP</p>
                                                </div>
                                                {lesson.completed && (
                                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                                                        সম্পন্ন
                                                    </span>
                                                )}
                                            </motion.div>
                                        ))}

                                        {/* Boss Quiz */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: unit.lessons.length * 0.04 }}
                                            className="mt-3"
                                        >
                                            <div className={`rounded-2xl border-2 border-dashed p-4 flex items-center gap-3 ${unit.bossQuiz.unlocked
                                                    ? 'border-amber-500/50 bg-amber-500/10'
                                                    : 'border-gray-600 bg-gray-800/30 opacity-50'
                                                }`}>
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shrink-0">
                                                    {unit.bossQuiz.unlocked ? '👑' : '🔒'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-sm">{unit.bossQuiz.title}</p>
                                                    <p className="text-xs text-gray-400">সব lesson শেষ করলে unlock হবে</p>
                                                </div>
                                                <span className="text-xs text-amber-400 font-bold shrink-0">⚡ {unit.bossQuiz.xp} XP</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Tip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
                >
                    <p className="text-emerald-300 font-semibold mb-1">💡 মনে রেখো!</p>
                    <p className="text-gray-400 text-sm">
                        ৬০% পেলে পরের lesson unlock হবে। ৩টি heart শেষ হলে ৩০ মিনিট অপেক্ষা করতে হবে।
                    </p>
                </motion.div>
            </div>
        </div>
    )
}