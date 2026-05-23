'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'
import AdBanner from '@/components/shared/AdBanner'

const floatingItems = ['⭐', '🌟', '✨', '🎈', '🎀', '🌈', '🦋', '🌸']

const kgZones = [
    {
        id: 'learn',
        name: 'শেখার জগৎ',
        icon: '📚',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        href: '/dashboard/student/kids-zone/learn',
        subjects: ['বাংলা বর্ণমালা', 'English ABC', 'সংখ্যা শিখি'],
        available: true,
    },
    {
        id: 'islamic',
        name: 'ইসলামিক জগৎ',
        icon: '🕌',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        href: '/dashboard/student/kids-zone/islamic',
        subjects: ['কালিমা শিখি', 'দোয়া শিখি', 'সূরা শিখি'],
        available: true,
    },
    {
        id: 'games',
        name: 'খেলার জগৎ',
        icon: '🎮',
        color: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        href: '/dashboard/student/kids-zone/games',
        subjects: ['Word Puzzle', 'Quiz Battle', 'Memory Cards'],
        available: false,
    },
    {
        id: 'music',
        name: 'গানের জগৎ',
        icon: '🎵',
        color: 'from-rose-400 to-pink-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        href: '/dashboard/student/kids-zone/music',
        subjects: ['বাংলা ছড়া', 'Islamic Nasheed', 'English Rhymes'],
        available: false,
    },
]

const nurserySubjects = [
    {
        id: 'bangla',
        name: 'বাংলা বর্ণ',
        icon: 'অ',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        href: '/dashboard/student/kids-zone/nursery/bangla',
        units: 5,
        lessons: 54,
    },
    {
        id: 'english',
        name: 'English ABC',
        icon: 'A',
        color: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        href: '/dashboard/student/kids-zone/nursery/english',
        units: 5,
        lessons: 31,
    },
    {
        id: 'arabic',
        name: 'Arabic হরফ',
        icon: 'ا',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        href: '/dashboard/student/kids-zone/nursery/arabic',
        units: 5,
        lessons: 35,
    },
    {
        id: 'math',
        name: 'গণিত',
        icon: '১২৩',
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        href: '/dashboard/student/kids-zone/nursery/math',
        units: 6,
        lessons: 50,
    },
]

// Nursery Islamic quick links — নতুন
const nurseryIslamicLinks = [
    {
        href: '/dashboard/student/kids-zone/islamic/kalima',
        icon: '☝️',
        label: 'কালিমা',
        color: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
    },
    {
        href: '/dashboard/student/kids-zone/islamic/dua',
        icon: '🤲',
        label: 'দোয়া',
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
    },
    {
        href: '/dashboard/student/kids-zone/islamic/surah',
        icon: '📖',
        label: 'সূরা',
        color: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    {
        href: '/dashboard/student/kids-zone/islamic/arabic',
        icon: '🔤',
        label: 'আরবি',
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
]

export default function KidsZonePage() {
    const [activeLevel, setActiveLevel] = useState<'nursery' | 'kg'>('nursery')
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()

    const greeting = (() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'সুপ্রভাত'
        if (hour < 17) return 'শুভ দুপুর'
        return 'শুভ বিকেল'
    })()

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white overflow-x-hidden">

            {/* Floating Background */}
            {floatingItems.map((item, i) => (
                <motion.div
                    key={i}
                    className="fixed text-2xl pointer-events-none select-none opacity-20"
                    style={{ left: `${10 + i * 11}%`, top: `${5 + (i % 3) * 20}%` }}
                    animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
                >
                    {item}
                </motion.div>
            ))}

            <div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto">

                {/* Back */}
                <Link href="/dashboard/student" className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-2 mb-4 transition-colors">
                    ← Dashboard এ ফিরে যাও
                </Link>

                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-linear-to-r from-violet-600 via-purple-600 to-blue-600 p-5 md:p-6 mb-6 relative overflow-hidden"
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-yellow-300 text-xs"
                                style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%` }}
                                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 2 + (i % 3), delay: i * 0.2 }}
                            >✦</motion.div>
                        ))}
                    </div>

                    <div className="relative flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <motion.p
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-yellow-300 text-sm font-semibold mb-1"
                            >
                                🌟 {greeting}!
                            </motion.p>
                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">
                                Kids Zone এ স্বাগতম! 🎉
                            </h1>
                            <p className="text-purple-200 text-sm">তোমার level বেছে নাও</p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {[
                                    { icon: '⭐', label: '১২ তারা', color: 'bg-yellow-500/30 text-yellow-300' },
                                    { icon: '🔥', label: '৩ দিন streak', color: 'bg-orange-500/30 text-orange-300' },
                                    { icon: '⚡', label: '৪৫ XP', color: 'bg-violet-500/30 text-violet-300' },
                                ].map((stat, i) => (
                                    <span key={i} className={`text-xs px-3 py-1.5 rounded-full font-semibold ${stat.color}`}>
                                        {stat.icon} {stat.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-6xl md:text-8xl shrink-0"
                        >
                            🧒
                        </motion.div>
                    </div>
                </motion.div>
                {/* Free user daily limit — সব tab এ দেখাবে */}
                {!accessLoading && !isPaid && !canDoLesson && (
                    <div className="mb-6">
                        <LockOverlay type="daily_limit" />
                    </div>
                )}

                {/* Ad Banner for free users */}
                {!accessLoading && !isPaid && (
                    <AdBanner position="top" className="mb-6" />
                )}

                {/* Level Tabs */}
                <div className="flex gap-3 mb-6">

                    {[
                        { key: 'nursery', label: '🌱 Nursery', desc: 'শেখার শুরু' },
                        { key: 'kg', label: '⭐ KG', desc: 'আরো শিখি' },
                    ].map(level => (
                        <motion.button
                            key={level.key}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveLevel(level.key as 'nursery' | 'kg')}
                            className={`flex-1 py-3 px-4 rounded-2xl text-left transition-all border ${activeLevel === level.key
                                ? 'bg-linear-to-r from-violet-600/30 to-purple-600/30 border-violet-500/50 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <div className="font-bold text-base">{level.label}</div>
                            <div className="text-xs mt-0.5 opacity-70">{level.desc}</div>
                        </motion.button>
                    ))}
                </div>

                {/* ── NURSERY ── */}
                {activeLevel === 'nursery' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-lg font-bold text-white mb-1">🌱 Nursery — কী শিখবে?</h2>
                        <p className="text-gray-400 text-sm mb-4">Voice + Trace + Quiz — Duolingo style এ শেখো</p>

                        {/* Subjects Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {nurserySubjects.map((subject, i) => (
                                <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Link href={subject.href}>
                                        <div className={`rounded-3xl border ${subject.border} ${subject.bg} p-4 md:p-5 relative overflow-hidden`}>
                                            <div className="absolute top-1 right-2 text-5xl opacity-10 font-bold select-none">
                                                {subject.icon}
                                            </div>
                                            <motion.div
                                                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                                transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                                                className={`w-14 h-14 rounded-2xl bg-linear-to-br ${subject.color} flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg`}
                                            >
                                                {subject.icon}
                                            </motion.div>
                                            <h3 className="font-bold text-white text-base mb-1">{subject.name}</h3>
                                            <div className="flex gap-2 text-xs text-gray-400 mb-3">
                                                <span>📂 {subject.units} Unit</span>
                                                <span>📝 {subject.lessons} Lesson</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                                                <div className={`h-2 rounded-full bg-linear-to-r ${subject.color} w-0`} />
                                            </div>
                                            <div className="text-xs text-gray-500">০% সম্পন্ন</div>
                                            <div className={`mt-3 text-xs font-bold bg-linear-to-r ${subject.color} bg-clip-text text-transparent`}>
                                                শুরু করো →
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Islamic Section — নতুন */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🕌</span>
                                    <h3 className="text-white font-bold">ইসলামিক শিক্ষা</h3>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        বাধ্যতামূলক
                                    </span>
                                </div>
                                <Link href="/dashboard/student/kids-zone/islamic"
                                    className="text-xs text-emerald-400 hover:text-emerald-300">
                                    সব দেখো →
                                </Link>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {nurseryIslamicLinks.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.35 + i * 0.08 }}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link href={item.href}>
                                            <div className={`rounded-2xl ${item.bg} border ${item.border} p-3 text-center cursor-pointer`}>
                                                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center text-xl mx-auto mb-2 shadow`}>
                                                    {item.icon}
                                                </div>
                                                <p className="text-white text-xs font-semibold">{item.label}</p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
                        >
                            <p className="text-2xl text-emerald-300 mb-1">بِسْمِ اللَّهِ</p>
                            <p className="text-gray-400 text-sm">পড়ো তোমার রবের নামে! 📖</p>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── KG ── */}
                {activeLevel === 'kg' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                        <h2 className="text-lg font-bold text-white mb-1">⭐ KG — কোন জগতে যাবে?</h2>
                        <p className="text-gray-400 text-sm mb-4">Grid, Flashcard, Game — নিজের মতো করে শেখো</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {kgZones.map((zone, i) => (
                                <motion.div
                                    key={zone.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    whileHover={zone.available ? { y: -4, scale: 1.02 } : {}}
                                    whileTap={zone.available ? { scale: 0.97 } : {}}
                                    className={!zone.available ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    {zone.available ? (
                                        <Link href={zone.href}><KGZoneCard zone={zone} /></Link>
                                    ) : (
                                        <KGZoneCard zone={zone} locked />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* KG Islamic quick links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="mb-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🕌</span>
                                    <h3 className="text-white font-bold">ইসলামিক শিক্ষা</h3>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        বাধ্যতামূলক
                                    </span>
                                </div>
                                <Link href="/dashboard/student/kids-zone/islamic"
                                    className="text-xs text-emerald-400 hover:text-emerald-300">
                                    সব দেখো →
                                </Link>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {nurseryIslamicLinks.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + i * 0.08 }}
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link href={item.href}>
                                            <div className={`rounded-2xl ${item.bg} border ${item.border} p-3 text-center cursor-pointer`}>
                                                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center text-xl mx-auto mb-2 shadow`}>
                                                    {item.icon}
                                                </div>
                                                <p className="text-white text-xs font-semibold">{item.label}</p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-3xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5"
                        >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <p className="text-amber-300 font-bold text-base mb-1">🎯 আজকের চ্যালেঞ্জ</p>
                                    <p className="text-gray-300 text-sm">৫টি বাংলা বর্ণ শিখলে বিশেষ badge পাবে!</p>
                                </div>
                                <Link href="/dashboard/student/kids-zone/learn">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/30"
                                    >
                                        শুরু করো! →
                                    </motion.button>
                                </Link>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>০/৫ বর্ণ শেখা হয়েছে</span><span>০%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3">
                                    <div className="bg-linear-to-r from-amber-400 to-orange-400 h-3 rounded-full w-0" />
                                </div>
                            </div>
                        </motion.div>
                        {/* Ad Banner bottom KG */}
                        {!accessLoading && !isPaid && (
                            <AdBanner position="bottom" className="mt-6" />
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

function KGZoneCard({ zone, locked }: { zone: typeof kgZones[0]; locked?: boolean }) {
    return (
        <div className={`rounded-3xl border ${zone.border} ${zone.bg} p-5 relative overflow-hidden transition-all`}>
            <div className="absolute top-0 right-0 text-7xl opacity-10 -translate-y-2 translate-x-2 select-none">{zone.icon}</div>
            {locked && (
                <div className="absolute top-3 right-3 bg-gray-800/80 rounded-full px-2 py-1 text-xs text-gray-400">🔒 শীঘ্রই</div>
            )}
            <div className="relative">
                <motion.div
                    animate={!locked ? { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className={`w-14 h-14 rounded-2xl bg-linear-to-br ${zone.color} flex items-center justify-center text-3xl mb-3 shadow-lg`}
                >
                    {zone.icon}
                </motion.div>
                <h3 className="font-bold text-white text-lg mb-2">{zone.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                    {zone.subjects.map((subject, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">{subject}</span>
                    ))}
                </div>
                {!locked && (
                    <div className={`mt-3 text-sm font-bold bg-linear-to-r ${zone.color} bg-clip-text text-transparent`}>
                        প্রবেশ করো →
                    </div>
                )}
            </div>
        </div>
    )
}