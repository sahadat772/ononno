'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Props {
    profile: Record<string, string> | null
    studentProfile: Record<string, string> | null
}

const classNames: Record<string, string> = {
    nursery: 'নার্সারি',
    kg: 'কেজি',
    class_1: 'প্রথম শ্রেণী',
    class_2: 'দ্বিতীয় শ্রেণী',
}

const subjects = [
    {
        name: 'বাংলা',
        icon: '🔤',
        color: 'from-red-400 to-rose-500',
        bg: 'bg-red-50',
        border: 'border-red-200',
        href: '/dashboard/student/kids-zone/learn/bangla', // ✅ fix
        topics: ['অক্ষর শিখি', 'শব্দ শিখি', 'বাক্য শিখি'],
    },
    {
        name: 'ইংরেজি',
        icon: '🔡',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        href: '/dashboard/student/kids-zone/learn/english', // ✅ fix
        topics: ['A B C D', 'Words', 'Sentences'],
    },
    {
        name: 'গণিত',
        icon: '🔢',
        color: 'from-green-400 to-emerald-500',
        bg: 'bg-green-50',
        border: 'border-green-200',
        href: '/dashboard/student/kids-zone/learn/numbers', // ✅ fix
        topics: ['সংখ্যা গণনা', 'যোগ-বিয়োগ', 'আকার-আকৃতি'],
    },
    {
        name: 'ইসলাম',
        icon: '🕌',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        href: '/dashboard/student/kids-zone/islamic', // ✅ fix
        topics: ['সূরা শিখি', 'দোয়া শিখি', 'নামাজ শিখি'],
        badge: 'বাধ্যতামূলক',
    },
    {
        name: 'পরিবেশ',
        icon: '🌍',
        color: 'from-amber-400 to-yellow-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        href: '/dashboard/student/kids-zone/learn/world', // ✅ fix
        topics: ['প্রাণী জগৎ', 'গাছপালা', 'আমার পরিবার'],
    },
    {
        name: 'চিত্রকলা',
        icon: '🎨',
        color: 'from-purple-400 to-violet-500',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        href: '/dashboard/student/kids-zone/creative', // ✅ fix
        topics: ['রং চেনো', 'আঁকো', 'রঙ করো'],
    },
]

const dailyQuran = [
    { surah: 'সূরা ফাতিহা', ayah: '১-৭', learned: true },
    { surah: 'সূরা ইখলাস', ayah: '১-৪', learned: true },
    { surah: 'সূরা ফালাক', ayah: '১-৫', learned: false },
    { surah: 'সূরা নাস', ayah: '১-৬', learned: false },
]

const rewards = [
    { name: 'প্রথম দিন', icon: '⭐', earned: true },
    { name: '৭ দিন', icon: '🌟', earned: false },
    { name: 'কুরআন পাঠ', icon: '📖', earned: true },
    { name: 'গণিত মাস্টার', icon: '🔢', earned: false },
    { name: 'ইংরেজি হিরো', icon: '🦸', earned: false },
    { name: '১ মাস', icon: '🏆', earned: false },
]

export default function NurseryDashboard({ profile, studentProfile }: Props) {
    const [currentTime, setCurrentTime] = useState('')
    const [greeting, setGreeting] = useState('')
    const [showReward, setShowReward] = useState(false)
    const classLevel = studentProfile?.class_level || 'nursery'
    const className = classNames[classLevel] || 'নার্সারি'

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const hours = now.getHours()
            setCurrentTime(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }))

            if (hours < 12) setGreeting('সুপ্রভাত')
            else if (hours < 17) setGreeting('শুভ দুপুর')
            else setGreeting('শুভ বিকেল')
        }
        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    // Random reward show
    useEffect(() => {
        const timer = setTimeout(() => setShowReward(true), 2000)
        return () => clearTimeout(timer)
    }, [])

    const firstName = profile?.full_name?.split(' ')[0] || 'বন্ধু'

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0d1a2e] to-[#0a0a1a] p-4 md:p-6">

            {/* Celebration Modal */}
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReward(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                                transition={{ repeat: 3, duration: 0.5 }}
                                className="text-7xl mb-4"
                            >
                                🌟
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                শাবাশ {firstName}!
                            </h2>
                            <p className="text-yellow-100 mb-4">তুমি আজ login করেছো! পড়াশোনা শুরু করো।</p>
                            <button
                                onClick={() => setShowReward(false)}
                                className="bg-white text-orange-500 font-bold px-8 py-3 rounded-2xl text-lg hover:bg-yellow-50 transition-colors"
                            >
                                শুরু করি! 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-3xl"
                                >
                                    👋
                                </motion.span>
                                <span className="text-white/80 text-sm">{greeting}! {currentTime}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {firstName} বন্ধু!
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                                    🏫 {className}
                                </span>
                                <span className="bg-yellow-400/30 text-yellow-200 text-sm px-3 py-1 rounded-full">
                                    🔥 ১ দিনের streak
                                </span>
                            </div>
                        </div>

                        {/* Character */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-7xl"
                        >
                            🧒
                        </motion.div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 relative">
                        <div className="flex justify-between text-white/70 text-xs mb-1">
                            <span>আজকের লক্ষ্য</span>
                            <span>০/৪ বিষয়</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '0%' }}
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { icon: '⭐', label: 'তারা', value: '২', color: 'from-yellow-400 to-amber-500' },
                    { icon: '📚', label: 'লেসন', value: '০', color: 'from-blue-400 to-cyan-500' },
                    { icon: '✅', label: 'Quiz', value: '০', color: 'from-green-400 to-emerald-500' },
                    { icon: '🔥', label: 'Streak', value: '১', color: 'from-orange-400 to-red-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                            className="text-2xl mb-1"
                        >
                            {stat.icon}
                        </motion.div>
                        <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                        </div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6"
            >
                <Link href="/dashboard/student/kids-zone">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-3xl bg-gradient-to-r from-violet-600 to-purple-700 p-5 relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-5xl"
                            >
                                🗺️
                            </motion.div>
                        </div>
                        <div className="relative pr-16">
                            <p className="text-violet-200 text-xs font-semibold mb-1">✨ তোমার জন্য বিশেষ</p>
                            <h3 className="text-white font-bold text-xl mb-1">Kids Zone এ যাও!</h3>
                            <p className="text-violet-200 text-sm">খেলার ছলে শেখো — বাংলা, English, গণিত, ইসলাম</p>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Islamic Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🕌</span>
                    <h2 className="text-lg font-bold text-white">ইসলামিক শিক্ষা</h2>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        বাধ্যতামূলক
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Quran */}
                    <Link href="/dashboard/student/islamic/quran">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 relative overflow-hidden cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 text-6xl opacity-20">📖</div>
                            <div className="relative">
                                <div className="text-3xl mb-2">📖</div>
                                <h3 className="text-white font-bold text-lg">কুরআন শিখি</h3>
                                <p className="text-emerald-100 text-sm">সূরা ও দোয়া মুখস্থ করি</p>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {dailyQuran.map((item, i) => (
                                        <span key={i} className={`text-xs px-2 py-1 rounded-full ${item.learned ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'}`}>
                                            {item.learned ? '✅' : '⭕'} {item.surah}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Dua & Namaz */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/student/islamic/dua">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 cursor-pointer h-full"
                            >
                                <div className="text-3xl mb-2">🤲</div>
                                <h3 className="text-white font-bold">দোয়া শিখি</h3>
                                <p className="text-blue-100 text-xs mt-1">দৈনন্দিন দোয়া</p>
                            </motion.div>
                        </Link>
                        <Link href="/dashboard/student/islamic/fiqh">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-4 cursor-pointer h-full"
                            >
                                <div className="text-3xl mb-2">🕌</div>
                                <h3 className="text-white font-bold">নামাজ শিখি</h3>
                                <p className="text-purple-100 text-xs mt-1">ওযু ও নামাজ</p>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Subjects Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
            >
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📚</span>
                    <h2 className="text-lg font-bold text-white">আজকের পাঠ</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subjects.filter(s => s.name !== 'ইসলাম').map((subject, i) => (
                        <motion.div
                            key={subject.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href={subject.href}>
                                <div className={`rounded-2xl bg-gradient-to-br ${subject.color} p-5 cursor-pointer relative overflow-hidden`}>
                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 text-5xl opacity-20 -translate-y-1/4 translate-x-1/4">
                                        {subject.icon}
                                    </div>

                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                                        className="text-4xl mb-3 relative"
                                    >
                                        {subject.icon}
                                    </motion.div>
                                    <h3 className="text-white font-bold text-lg mb-1">{subject.name}</h3>

                                    {/* Topics */}
                                    <div className="space-y-1">
                                        {subject.topics.slice(0, 2).map((topic, j) => (
                                            <div key={j} className="text-white/80 text-xs flex items-center gap-1">
                                                <span>▸</span> {topic}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-3 bg-white/20 rounded-full h-2">
                                        <div className="bg-white/60 h-2 rounded-full w-0" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* AI Tutor */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
            >
                <Link href="/dashboard/student/ai-tutor">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-3xl bg-gradient-to-r from-violet-600 to-purple-700 p-6 relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-6xl"
                            >
                                🤖
                            </motion.div>
                        </div>

                        <div className="relative pr-20">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-green-300 text-xs font-semibold">AI শিক্ষক অনলাইন</span>
                            </div>
                            <h3 className="text-white font-bold text-xl mb-1">AI শিক্ষকের সাথে কথা বলো!</h3>
                            <p className="text-purple-200 text-sm">যেকোনো প্রশ্ন করো — বাংলায় উত্তর পাবে</p>
                            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                শুরু করো ▶
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Rewards Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
            >
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏆</span>
                    <h2 className="text-lg font-bold text-white">আমার পুরস্কার</h2>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {rewards.map((reward, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                            className={`rounded-2xl border p-3 text-center transition-all ${reward.earned
                                ? 'border-yellow-500/50 bg-yellow-500/10'
                                : 'border-white/10 bg-white/5 opacity-50'
                                }`}
                        >
                            <div className="text-2xl mb-1">{reward.icon}</div>
                            <p className="text-xs text-gray-300">{reward.name}</p>
                            {reward.earned && (
                                <p className="text-xs text-yellow-400 mt-1">✅ অর্জিত</p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Daily Tip */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 text-center"
            >
                <p className="text-amber-300 text-sm font-semibold mb-1">💡 আজকের কথা</p>
                <p className="text-white text-lg">
                    পড়ো তোমার রবের নামে! 📖
                </p>
                <p className="text-gray-400 text-xs mt-1">প্রতিদিন একটু একটু শিখলেই বড় হওয়া যায়</p>
            </motion.div>
        </div>
    )
}