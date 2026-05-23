'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────
type DailyTracker = {
    quran_ayahs_read: number
    duas_recited: number
    hadith_read: number
    tajweed_practiced: boolean
    memorization_done: boolean
    daily_streak: number
}

// ── Data ──────────────────────────────────────────────────
const islamicModules = [
    {
        title: 'কুরআন শরীফ',
        description: 'তিলাওয়াত, অর্থ ও তাজবিদ শিক্ষা',
        icon: '📖',
        color: 'from-emerald-500 to-teal-500',
        borderColor: 'hover:border-emerald-500/50',
        glowColor: 'hover:shadow-emerald-500/20',
        href: '/dashboard/student/islamic/quran',
        available: true,
        badge: null,
        isNew: false,
    },
    {
        title: 'Tajweed AI',
        description: 'AI voice check — ৬টি Tajweed rules practice',
        icon: '🎵',
        color: 'from-blue-500 to-indigo-500',
        borderColor: 'hover:border-blue-500/50',
        glowColor: 'hover:shadow-blue-500/20',
        href: '/dashboard/student/islamic/tajweed',
        available: true,
        badge: 'AI',
        isNew: true,
    },
    {
        title: 'হিফজ Tracker',
        description: 'Spaced Repetition + AI revision plan',
        icon: '📚',
        color: 'from-violet-500 to-purple-500',
        borderColor: 'hover:border-violet-500/50',
        glowColor: 'hover:shadow-violet-500/20',
        href: '/dashboard/student/islamic/memorization',
        available: true,
        badge: 'AI',
        isNew: true,
    },
    {
        title: 'উস্তাদ AI',
        description: 'Quran ও Hadith reference সহ Islamic Q&A',
        icon: '🤖',
        color: 'from-teal-500 to-emerald-500',
        borderColor: 'hover:border-teal-500/50',
        glowColor: 'hover:shadow-teal-500/20',
        href: '/dashboard/student/islamic/chat',
        available: true,
        badge: 'AI',
        isNew: true,
    },
    {
        title: 'হাদিস শরীফ',
        description: 'সহিহ হাদিস সংকলন ও AI ব্যাখ্যা',
        icon: '📜',
        color: 'from-amber-500 to-yellow-500',
        borderColor: 'hover:border-amber-500/50',
        glowColor: 'hover:shadow-amber-500/20',
        href: '/dashboard/student/islamic/hadith',
        available: true,
        badge: null,
        isNew: false,
    },
    {
        title: 'দোয়া সমূহ',
        description: 'AI Situation-based দোয়া recommender',
        icon: '🤲',
        color: 'from-rose-500 to-pink-500',
        borderColor: 'hover:border-rose-500/50',
        glowColor: 'hover:shadow-rose-500/20',
        href: '/dashboard/student/islamic/dua',
        available: true,
        badge: 'AI',
        isNew: false,
    },
    {
        title: 'ফিকহ',
        description: 'ইসলামি আইন ও বিধিবিধান',
        icon: '⚖️',
        color: 'from-cyan-500 to-sky-500',
        borderColor: 'hover:border-cyan-500/50',
        glowColor: 'hover:shadow-cyan-500/20',
        href: '/dashboard/student/islamic/fiqh',
        available: true,
        badge: null,
        isNew: false,
    },
    {
        title: 'তাফসির',
        description: 'কুরআনের আয়াতের ব্যাখ্যা ও বিশ্লেষণ',
        icon: '🔍',
        color: 'from-orange-500 to-amber-500',
        borderColor: 'hover:border-orange-500/50',
        glowColor: 'hover:shadow-orange-500/20',
        href: '/dashboard/student/islamic/tafsir',
        available: true,
        badge: null,
        isNew: false,
    },
    {
        title: 'সিরাতুন নবী ﷺ',
        description: 'মহানবীর জীবনী ও ইতিহাস',
        icon: '🌙',
        color: 'from-violet-500 to-purple-500',
        borderColor: 'hover:border-violet-500/50',
        glowColor: 'hover:shadow-violet-500/20',
        href: '/dashboard/student/islamic/sirah',
        available: true,
        badge: null,
        isNew: false,
    },
    {
        title: 'Weekly Progress',
        description: 'ML analysis + Parent report',
        icon: '📊',
        color: 'from-gray-500 to-slate-500',
        borderColor: 'hover:border-gray-500/50',
        glowColor: 'hover:shadow-gray-500/20',
        href: '/dashboard/student/islamic/progress',
        available: true,
        badge: 'ML',
        isNew: true,
    },
    {
        title: 'আকিদা',
        description: 'ইসলামের মূল বিশ্বাস ও আদর্শ',
        icon: '☝️',
        color: 'from-cyan-500 to-sky-500',
        borderColor: 'hover:border-cyan-500/50',
        glowColor: 'hover:shadow-cyan-500/20',
        href: '#',
        available: false,
        badge: 'শীঘ্রই',
        isNew: false,
    },
    {
        title: 'ইসলামিক ইতিহাস',
        description: 'খুলাফায়ে রাশেদিন ও ইসলামের ইতিহাস',
        icon: '🏛️',
        color: 'from-teal-500 to-emerald-500',
        borderColor: 'hover:border-teal-500/50',
        glowColor: 'hover:shadow-teal-500/20',
        href: '#',
        available: false,
        badge: 'শীঘ্রই',
        isNew: false,
    },
]

const stats = [
    { label: 'সূরা', value: '১১৪', icon: '📖' },
    { label: 'হাদিস গ্রন্থ', value: '৬+', icon: '📜' },
    { label: 'দোয়া', value: '৫০+', icon: '🤲' },
    { label: 'AI Features', value: '৬টি', icon: '🤖' },
]

// ── Module Card ───────────────────────────────────────────
function ModuleCard({ module }: { module: typeof islamicModules[0] }) {
    return (
        <>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${module.color} flex items-center justify-center text-2xl shadow-md`}>
                    {module.icon}
                </div>
                <div className="flex gap-1.5">
                    {module.isNew && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            নতুন
                        </span>
                    )}
                    {module.badge && (
                        <span className={`text-xs px-2 py-1 rounded-full ${module.badge === 'শীঘ্রই'
                            ? 'bg-gray-500/20 text-gray-400'
                            : module.badge === 'AI'
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : module.badge === 'ML'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {module.badge}
                        </span>
                    )}
                </div>
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors mb-1">
                {module.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
            {module.available && (
                <div className="mt-3 text-emerald-400 text-sm flex items-center gap-1">
                    শুরু করো <span>→</span>
                </div>
            )}
        </>
    )
}

// ── Main Page ─────────────────────────────────────────────
export default function IslamicPage() {
    const [tracker, setTracker] = useState<DailyTracker | null>(null)
    const [dueCount, setDueCount] = useState(0)
    const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'new'>('all')

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user || cancelled) return

                const today = new Date().toISOString().split('T')[0]

                // Daily tracker fetch
                const { data: trackerData } = await supabase
                    .from('daily_islamic_tracker')
                    .select('*')
                    .eq('student_id', user.id)
                    .eq('date', today)
                    .single()

                // Due revisions count
                const { data: dueData } = await supabase
                    .from('quran_memorization')
                    .select('id')
                    .eq('student_id', user.id)
                    .lte('next_revision_at', new Date().toISOString())

                if (!cancelled) {
                    setTracker(trackerData)
                    setDueCount(dueData?.length || 0)
                }
            } catch {
                console.error('Islamic page data fetch error')
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const filteredModules = islamicModules.filter(m => {
        if (activeFilter === 'ai') return m.badge === 'AI' || m.badge === 'ML'
        if (activeFilter === 'new') return m.isNew
        return true
    })

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    href="/dashboard/student"
                    className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-flex items-center gap-2 transition-colors"
                >
                    ← ড্যাশবোর্ডে ফিরে যাও
                </Link>

                {/* Hero */}
                <div className="mt-4 rounded-3xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30">
                            🕌
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                ইসলামিক স্টাডি
                            </h1>
                            <p className="text-gray-400 mt-1">AI-powered সম্পূর্ণ ইসলামিক শিক্ষার প্ল্যাটফর্ম</p>
                        </div>
                    </div>

                    {/* Arabic */}
                    <div className="text-center py-4 border-y border-emerald-500/20 my-4">
                        <p className="text-2xl text-emerald-300 leading-loose">
                            اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            পড়ো তোমার রবের নামে যিনি সৃষ্টি করেছেন। — সূরা আলাক: ১
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 rounded-xl p-3 text-center"
                            >
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className="text-xl font-bold text-emerald-400">{stat.value}</div>
                                <div className="text-xs text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Daily Tracker */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <p className="text-emerald-400 font-bold text-sm">📅 আজকের অগ্রগতি</p>
                    <div className="flex items-center gap-2">
                        {dueCount > 0 && (
                            <Link href="/dashboard/student/islamic/memorization">
                                <span className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-1 rounded-full animate-pulse">
                                    📚 {dueCount}টি revision বাকি
                                </span>
                            </Link>
                        )}
                        <Link href="/dashboard/student/islamic/progress">
                            <span className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                                Weekly Report →
                            </span>
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { icon: '📖', label: 'আয়াত', value: tracker?.quran_ayahs_read || 0, done: (tracker?.quran_ayahs_read || 0) > 0 },
                        { icon: '🤲', label: 'দোয়া', value: tracker?.duas_recited || 0, done: (tracker?.duas_recited || 0) > 0 },
                        { icon: '📜', label: 'হাদিস', value: tracker?.hadith_read || 0, done: (tracker?.hadith_read || 0) > 0 },
                        { icon: '🎵', label: 'Tajweed', value: tracker?.tajweed_practiced ? '✅' : '—', done: tracker?.tajweed_practiced || false },
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
                {(tracker?.daily_streak || 0) > 0 && (
                    <p className="text-center text-xs text-orange-400 mt-2">
                        🔥 {tracker?.daily_streak} দিনের streak চলছে!
                    </p>
                )}
            </motion.div>

            {/* Ustaz AI Quick Link */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <Link href="/dashboard/student/islamic/chat">
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="rounded-2xl bg-linear-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 p-4 flex items-center gap-4 cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                            🤖
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-white">উস্তাদ AI</p>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs text-emerald-400">Online</span>
                            </div>
                            <p className="text-gray-400 text-sm">যেকোনো Islamic প্রশ্ন করো — Quran ও Hadith reference সহ উত্তর</p>
                        </div>
                        <span className="text-violet-400 text-xl flex-shrink-0">→</span>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Filter tabs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-white">📚 সকল বিভাগ</h2>
                    <div className="flex gap-1.5 bg-white/5 rounded-xl p-1">
                        {[
                            { key: 'all', label: 'সব' },
                            { key: 'ai', label: '🤖 AI' },
                            { key: 'new', label: '✨ নতুন' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key as typeof activeFilter)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilter === f.key
                                    ? 'bg-emerald-500 text-white shadow'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modules Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {filteredModules.map((module, i) => (
                            <motion.div
                                key={module.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                {module.available ? (
                                    <Link href={module.href}>
                                        <div className={`group rounded-2xl border border-white/10 bg-white/5 ${module.borderColor} ${module.glowColor} hover:shadow-xl p-5 transition-all duration-300 cursor-pointer h-full`}>
                                            <ModuleCard module={module} />
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 opacity-60 cursor-not-allowed h-full">
                                        <ModuleCard module={module} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Daily Reminder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 rounded-2xl bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 text-center"
            >
                <p className="text-amber-300 text-lg mb-1">💡 আজকের অনুপ্রেরণা</p>
                <p className="text-2xl text-white leading-loose">
                    طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    জ্ঞান অর্জন করা প্রতিটি মুসলিমের উপর ফরজ। — ইবনে মাজাহ
                </p>
            </motion.div>
        </div>
    )
}