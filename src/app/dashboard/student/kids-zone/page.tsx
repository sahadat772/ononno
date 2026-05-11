'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const zones = [
    {
        id: 'learn',
        name: 'শেখার জগৎ',
        nameEn: 'Learn Zone',
        icon: '📚',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/30',
        href: '/dashboard/student/kids-zone/learn',
        subjects: ['বাংলা বর্ণমালা', 'English ABC', 'সংখ্যা শিখি', 'বিশ্ব পরিচয়'],
        available: true,
        character: '📖',
    },
    {
        id: 'islamic',
        name: 'ইসলামিক জগৎ',
        nameEn: 'Islamic Zone',
        icon: '🕌',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/30',
        href: '/dashboard/student/kids-zone/islamic',
        subjects: ['Arabic Letters', 'কালিমা', 'দোয়া', 'সূরা'],
        available: true,
        character: '🌙',
    },
    {
        id: 'games',
        name: 'খেলার জগৎ',
        nameEn: 'Game Zone',
        icon: '🎮',
        color: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        glow: 'shadow-violet-500/30',
        href: '/dashboard/student/kids-zone/games',
        subjects: ['Word Puzzle', 'Quiz Battle', 'Memory Cards', 'Math Games'],
        available: false,
        character: '🎯',
    },
    {
        id: 'music',
        name: 'গানের জগৎ',
        nameEn: 'Music Zone',
        icon: '🎵',
        color: 'from-rose-400 to-pink-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-rose-500/30',
        href: '/dashboard/student/kids-zone/music',
        subjects: ['বাংলা ছড়া', 'Islamic Nasheed', 'English Rhymes'],
        available: false,
        character: '🎶',
    },
    {
        id: 'creative',
        name: 'সৃজনশীল জগৎ',
        nameEn: 'Creative Zone',
        icon: '🎨',
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/30',
        href: '/dashboard/student/kids-zone/creative',
        subjects: ['Drawing', 'Role Play', 'Show & Tell', 'Colors'],
        available: false,
        character: '🖌️',
    },
    {
        id: 'achievements',
        name: 'পুরস্কারের জগৎ',
        nameEn: 'Achievement Zone',
        icon: '🏆',
        color: 'from-yellow-400 to-amber-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        glow: 'shadow-yellow-500/30',
        href: '/dashboard/student/kids-zone/achievements',
        subjects: ['আমার তারা', 'Badges', 'Streak', 'Progress'],
        available: false,
        character: '⭐',
    },
]

const floatingItems = ['⭐', '🌟', '✨', '🎈', '🎀', '🌈', '🦋', '🌸']

export default function KidsZonePage() {
    const [greeting, setGreeting] = useState('সুপ্রভাত')
    const [selectedZone, setSelectedZone] = useState<string | null>(null)

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('সুপ্রভাত')
        else if (hour < 17) setGreeting('শুভ দুপুর')
        else setGreeting('শুভ বিকেল')
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white overflow-hidden">

            {/* Floating Background Items */}
            {floatingItems.map((item, i) => (
                <motion.div
                    key={i}
                    className="fixed text-2xl pointer-events-none select-none opacity-20"
                    style={{
                        left: `${10 + (i * 12)}%`,
                        top: `${5 + (i % 3) * 20}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3 + i * 0.5,
                        delay: i * 0.3,
                    }}
                >
                    {item}
                </motion.div>
            ))}

            {/* Header */}
            <div className="relative z-10 p-4 md:p-6">
                <Link
                    href="/dashboard/student"
                    className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-2 mb-4 transition-colors"
                >
                    ← Dashboard এ ফিরে যাও
                </Link>

                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 p-6 mb-6 relative overflow-hidden"
                >
                    {/* Stars decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-yellow-300 text-xs"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2 + Math.random() * 2,
                                    delay: Math.random() * 2,
                                }}
                            >
                                ✦
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <motion.p
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-yellow-300 text-sm font-semibold mb-1"
                            >
                                🌟 {greeting}!
                            </motion.p>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Kids Zone এ স্বাগতম! 🎉
                            </h1>
                            <p className="text-purple-200 text-sm">
                                আজকে কোন জগতে যেতে চাও?
                            </p>

                            {/* Stats Row */}
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
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

                        {/* Animated Character */}
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-8xl"
                        >
                            🧒
                        </motion.div>
                    </div>
                </motion.div>

                {/* Zone Grid */}
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🗺️
                    </motion.span>
                    কোন জগতে যাবে?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {zones.map((zone, i) => (
                        <motion.div
                            key={zone.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={zone.available ? { y: -8, scale: 1.03 } : {}}
                            whileTap={zone.available ? { scale: 0.97 } : {}}
                        >
                            {zone.available ? (
                                <Link href={zone.href}>
                                    <ZoneCard zone={zone} />
                                </Link>
                            ) : (
                                <div className="opacity-60 cursor-not-allowed">
                                    <ZoneCard zone={zone} locked />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Daily Challenge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5"
                >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-amber-300 font-bold text-lg mb-1">
                                🎯 আজকের চ্যালেঞ্জ
                            </p>
                            <p className="text-gray-300 text-sm">
                                ৫টি বাংলা বর্ণ শিখলে বিশেষ badge পাবে!
                            </p>
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

                    {/* Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>০/৫ বর্ণ শেখা হয়েছে</span>
                            <span>০%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                            <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-3 rounded-full w-0" />
                        </div>
                    </div>
                </motion.div>

                {/* Islamic Reminder */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
                >
                    <p className="text-2xl text-emerald-300 mb-1">بِسْمِ اللَّهِ</p>
                    <p className="text-gray-400 text-sm">পড়ো তোমার রবের নামে! 📖</p>
                </motion.div>
            </div>
        </div>
    )
}

function ZoneCard({ zone, locked }: { zone: typeof zones[0]; locked?: boolean }) {
    return (
        <div className={`rounded-3xl border ${zone.border} ${zone.bg} p-5 h-full transition-all duration-300 hover:shadow-xl hover:${zone.glow} relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 text-8xl opacity-10 -translate-y-4 translate-x-4">
                {zone.character}
            </div>

            {/* Lock badge */}
            {locked && (
                <div className="absolute top-3 right-3 bg-gray-800/80 rounded-full px-2 py-1 text-xs text-gray-400">
                    🔒 শীঘ্রই
                </div>
            )}

            <div className="relative">
                {/* Icon */}
                <motion.div
                    animate={!locked ? { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${zone.color} flex items-center justify-center text-4xl mb-4 shadow-lg`}
                >
                    {zone.icon}
                </motion.div>

                <h3 className="font-bold text-white text-xl mb-0.5">{zone.name}</h3>
                <p className="text-gray-400 text-xs mb-3">{zone.nameEn}</p>

                {/* Subjects */}
                <div className="flex flex-wrap gap-1.5">
                    {zone.subjects.map((subject, i) => (
                        <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300`}
                        >
                            {subject}
                        </span>
                    ))}
                </div>

                {!locked && (
                    <div className={`mt-4 text-sm font-bold bg-gradient-to-r ${zone.color} bg-clip-text text-transparent flex items-center gap-1`}>
                        প্রবেশ করো <span className="text-base">→</span>
                    </div>
                )}
            </div>
        </div>
    )
}