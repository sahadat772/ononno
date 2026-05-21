'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

type Props = {
    profile: { full_name: string; role: string } | null
    progressData: { content_type: string; status: string }[]
    todayTracker: {
        quran_ayahs_read: number
        duas_recited: number
        hadith_read: number
        tajweed_practiced: boolean
        memorization_done: boolean
        daily_streak: number
    } | null
    dueRevisionsCount: number
}

const ISLAMIC_MODULES = [
    {
        href: '/dashboard/student/islamic/quran',
        icon: '📖',
        title: 'কুরআন',
        title_ar: 'القرآن',
        desc: '১১৪ সূরা, বাংলা অর্থ, ৫ কারী audio, AI Analysis',
        color: 'from-emerald-500 to-teal-600',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        badge: null,
    },
    {
        href: '/dashboard/student/islamic/tajweed',
        icon: '🎵',
        title: 'Tajweed',
        title_ar: 'التجويد',
        desc: '৬টি Tajweed rules, AI voice check, score',
        color: 'from-blue-500 to-indigo-600',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        badge: 'নতুন',
    },
    {
        href: '/dashboard/student/islamic/memorization',
        icon: '📚',
        title: 'হিফজ Tracker',
        title_ar: 'حفظ القرآن',
        desc: 'Spaced Repetition, AI revision plan',
        color: 'from-violet-500 to-purple-600',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        badge: 'AI',
    },
    {
        href: '/dashboard/student/islamic/hadith',
        icon: '📜',
        title: 'হাদিস',
        title_ar: 'الحديث',
        desc: 'সহীহ হাদিস, AI ব্যাখ্যা, বাংলায়',
        color: 'from-amber-500 to-orange-600',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        badge: null,
    },
    {
        href: '/dashboard/student/islamic/dua',
        icon: '🤲',
        title: 'দোয়া',
        title_ar: 'الدعاء',
        desc: 'Situation-based AI দোয়া recommender',
        color: 'from-rose-500 to-pink-600',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        badge: 'AI',
    },
    {
        href: '/dashboard/student/islamic/fiqh',
        icon: '⚖️',
        title: 'ফিকহ',
        title_ar: 'الفقه',
        desc: 'ইসলামিক বিধিবিধান, হালাল/হারাম',
        color: 'from-cyan-500 to-sky-600',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        badge: null,
    },
    {
        href: '/dashboard/student/islamic/tafsir',
        icon: '🔍',
        title: 'তাফসির',
        title_ar: 'التفسير',
        desc: 'কুরআনের গভীর ব্যাখ্যা',
        color: 'from-teal-500 to-emerald-600',
        border: 'border-teal-500/30',
        bg: 'bg-teal-500/10',
        badge: null,
    },
    {
        href: '/dashboard/student/islamic/sirah',
        icon: '🌙',
        title: 'সিরাহ',
        title_ar: 'السيرة',
        desc: 'নবীজির (সা.) জীবনী',
        color: 'from-indigo-500 to-violet-600',
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/10',
        badge: null,
    },
    {
        href: '/dashboard/student/islamic/progress',
        icon: '📊',
        title: 'Progress',
        title_ar: 'التقدم',
        desc: 'Weekly ML analysis, Parent report',
        color: 'from-gray-500 to-slate-600',
        border: 'border-gray-500/30',
        bg: 'bg-gray-500/10',
        badge: 'ML',
    },
]

export default function IslamicDashboardClient({
    profile,
    progressData,
    todayTracker,
    dueRevisionsCount,
}: Props) {
    const completedCount = progressData.filter(p => p.status === 'completed').length
    const inProgressCount = progressData.filter(p => p.status === 'in_progress').length

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Dashboard
                    </Link>
                    <Link
                        href="/dashboard/student/islamic/progress"
                        className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full hover:bg-emerald-500/30 transition-all"
                    >
                        📊 Weekly Report
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="text-5xl mb-2"
                    >🕌</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">Islamic Module</h1>
                    <p className="text-2xl text-emerald-300 mb-1">التعليم الإسلامي</p>
                    <p className="text-gray-400 text-sm">
                        আস-সালামু আলাইকুম, {profile?.full_name?.split(' ')[0] || 'ভাই/আপু'} 👋
                    </p>
                </motion.div>

                {/* Today's tracker */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-emerald-400 font-bold text-sm">আজকের অগ্রগতি</p>
                        {dueRevisionsCount > 0 && (
                            <Link href="/dashboard/student/islamic/memorization">
                                <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-full animate-pulse">
                                    📚 {dueRevisionsCount}টি revision বাকি
                                </span>
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            {
                                icon: '📖',
                                label: 'আয়াত',
                                value: todayTracker?.quran_ayahs_read || 0,
                                done: (todayTracker?.quran_ayahs_read || 0) > 0,
                            },
                            {
                                icon: '🤲',
                                label: 'দোয়া',
                                value: todayTracker?.duas_recited || 0,
                                done: (todayTracker?.duas_recited || 0) > 0,
                            },
                            {
                                icon: '📜',
                                label: 'হাদিস',
                                value: todayTracker?.hadith_read || 0,
                                done: (todayTracker?.hadith_read || 0) > 0,
                            },
                            {
                                icon: '🎵',
                                label: 'Tajweed',
                                value: todayTracker?.tajweed_practiced ? '✅' : '—',
                                done: todayTracker?.tajweed_practiced || false,
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`rounded-xl p-2 text-center ${item.done
                                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                                        : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <p className="text-lg">{item.icon}</p>
                                <p className={`text-sm font-bold ${item.done ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {item.value}
                                </p>
                                <p className="text-xs text-gray-500">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Streak */}
                    {(todayTracker?.daily_streak || 0) > 0 && (
                        <div className="mt-3 text-center">
                            <span className="text-xs text-orange-400">
                                🔥 {todayTracker?.daily_streak} দিনের streak চলছে!
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Progress summary */}
                {progressData.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
                            <p className="text-gray-400 text-xs">Completed</p>
                        </div>
                        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                            <p className="text-2xl font-bold text-amber-400">{inProgressCount}</p>
                            <p className="text-gray-400 text-xs">In Progress</p>
                        </div>
                    </div>
                )}

                {/* Islamic Chatbot quick link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <Link href="/dashboard/student/islamic/chat">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-2xl bg-linear-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 p-4 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-2xl flex-shrink: 0;">
                                🤖
                            </div>
                            <div>
                                <p className="font-bold text-white">উস্তাদ AI</p>
                                <p className="text-gray-400 text-sm">
                                    যেকোনো Islamic প্রশ্ন করো — Quran ও Hadith reference সহ উত্তর
                                </p>
                            </div>
                            <span className="ml-auto text-violet-400 text-xl flex-shrink: 0;">→</span>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Module grid */}
                <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
                    সব Module
                </p>
                <div className="grid grid-cols-1 gap-3">
                    {ISLAMIC_MODULES.map((module, i) => (
                        <motion.div
                            key={module.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Link href={module.href}>
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`rounded-2xl ${module.bg} border ${module.border} p-4 flex items-center gap-4`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${module.color} flex items-center justify-center text-2xl flex-shrink: 0; shadow-lg`}>
                                        {module.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-bold text-white text-sm">{module.title}</p>
                                            <p className="text-white/40 text-sm" style={{ fontFamily: 'serif' }}>
                                                {module.title_ar}
                                            </p>
                                            {module.badge && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${module.badge === 'নতুন'
                                                        ? 'bg-blue-500/30 text-blue-400'
                                                        : module.badge === 'AI'
                                                            ? 'bg-violet-500/30 text-violet-400'
                                                            : 'bg-emerald-500/30 text-emerald-400'
                                                    }`}>
                                                    {module.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-xs truncate">{module.desc}</p>
                                    </div>
                                    <span className="text-gray-500 flex-shrink: 0;">→</span>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <p className="text-gray-600 text-xs">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
                        আল্লাহর নামে শুরু করি
                    </p>
                </motion.div>
            </div>
        </div>
    )
}