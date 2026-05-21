'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type WeeklyAnalysis = {
    student_id: string
    student_name: string
    week_start: string
    week_end: string
    weekly_totals: {
        quran_ayahs: number
        duas: number
        hadith: number
    }
    tajweed_avg_score: number
    weak_tajweed_rules: string[]
    memorization_levels: Record<string, number>
    daily_streak: number
    progress_summary: {
        completed: number
        in_progress: number
        total: number
    }
    topic_breakdown: Record<string, number>
    ai_analysis: {
        overall_score: number
        grade: string
        strengths: string[]
        improvements_needed: string[]
        ai_recommendations: string[]
        next_week_goals: string[]
        parent_report: string
        student_message: string
    } | null
}

const RULE_NAMES: Record<string, string> = {
    ghunna: 'গুন্নাহ',
    ikhfa: 'ইখফা',
    idgham: 'ইদগাম',
    iqlab: 'ইকলাব',
    madd: 'মাদ্দ',
    qalqalah: 'কালকালাহ',
}

const TOPIC_NAMES: Record<string, string> = {
    fiqh: 'ফিকহ',
    aqeedah: 'আকীদা',
    quran: 'কুরআন',
    hadith: 'হাদিস',
    seerah: 'সিরাহ',
    dua: 'দোয়া',
    general: 'সাধারণ',
}

const GRADE_COLOR: Record<string, string> = {
    'A+': 'text-emerald-400',
    'A': 'text-teal-400',
    'B+': 'text-blue-400',
    'B': 'text-indigo-400',
    'C': 'text-amber-400',
}

export default function IslamicProgressPage() {
    const [data, setData] = useState<WeeklyAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'tajweed' | 'ai' | 'parent'>('overview')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch('/api/islamic/weekly-analysis')
                const json = await res.json()
                if (!cancelled) setData(json)
            } catch {
                console.error('Progress fetch error')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const handleCopyReport = async () => {
        if (!data?.ai_analysis?.parent_report) return
        await navigator.clipboard.writeText(data.ai_analysis.parent_report)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="text-4xl mb-3 inline-block"
                >📊</motion.div>
                <p className="text-emerald-400">AI analysis চলছে...</p>
                <p className="text-gray-500 text-sm mt-1">গত ৭ দিনের data বিশ্লেষণ হচ্ছে</p>
            </div>
        </div>
    )

    const ai = data?.ai_analysis

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/islamic"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Islamic এ ফিরে যাও
                    </Link>
                    {ai && (
                        <span className={`text-sm font-bold px-3 py-1 rounded-full bg-white/10 ${GRADE_COLOR[ai.grade] || 'text-white'}`}>
                            Grade: {ai.grade}
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <p className="text-gray-400 text-sm mb-1">
                        {data?.week_start} — {data?.week_end}
                    </p>
                    <h1 className="text-3xl font-bold text-white mb-1">Islamic Progress</h1>
                    <p className="text-emerald-300 text-sm">সাপ্তাহিক ML বিশ্লেষণ</p>
                </motion.div>

                {/* Overall Score */}
                {ai && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 rounded-3xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                            className={`text-7xl font-bold mb-2 ${GRADE_COLOR[ai.grade] || 'text-white'}`}
                        >
                            {ai.overall_score}
                        </motion.div>
                        <p className="text-gray-400 text-sm mb-3">/ 100 — এই সপ্তাহের score</p>

                        {/* Score bar */}
                        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${ai.overall_score}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                                className="h-3 rounded-full bg-linear-to-r from-emerald-400 to-teal-500"
                            />
                        </div>

                        {/* Student message */}
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                            <p className="text-emerald-300 text-sm leading-relaxed">
                                💚 {ai.student_message}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
                    {[
                        { key: 'overview', label: '📊 Overview' },
                        { key: 'tajweed', label: '🎵 Tajweed' },
                        { key: 'ai', label: '🤖 AI Plan' },
                        { key: 'parent', label: '👨‍👩‍👧 Parent' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                                    ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Overview */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Weekly totals */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { label: 'আয়াত পড়া', value: data?.weekly_totals.quran_ayahs || 0, icon: '📖', color: 'text-emerald-400' },
                                    { label: 'দোয়া', value: data?.weekly_totals.duas || 0, icon: '🤲', color: 'text-violet-400' },
                                    { label: 'হাদিস', value: data?.weekly_totals.hadith || 0, icon: '📜', color: 'text-amber-400' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center"
                                    >
                                        <p className="text-2xl mb-1">{stat.icon}</p>
                                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                        <p className="text-gray-400 text-xs">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Daily streak */}
                            <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-400 font-bold">🔥 Daily Streak</p>
                                        <p className="text-gray-400 text-sm">এই সপ্তাহে কতদিন active ছিলে</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-orange-400">{data?.daily_streak || 0}</p>
                                        <p className="text-gray-500 text-xs">/ 7 দিন</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 mt-3">
                                    {[...Array(7)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 h-2 rounded-full ${i < (data?.daily_streak || 0)
                                                    ? 'bg-orange-400'
                                                    : 'bg-white/10'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Progress summary */}
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
                                <p className="text-gray-400 text-xs font-semibold mb-3">
                                    📈 Islamic Progress Summary
                                </p>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Completed', value: data?.progress_summary.completed || 0, color: 'bg-emerald-400' },
                                        { label: 'In Progress', value: data?.progress_summary.in_progress || 0, color: 'bg-amber-400' },
                                    ].map((item, i) => {
                                        const total = data?.progress_summary.total || 1
                                        const pct = Math.round((item.value / total) * 100)
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>{item.label}</span>
                                                    <span>{item.value} ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 1, delay: i * 0.2 }}
                                                        className={`h-2 rounded-full ${item.color}`}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Topic breakdown */}
                            {data?.topic_breakdown && Object.keys(data.topic_breakdown).length > 0 && (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                    <p className="text-gray-400 text-xs font-semibold mb-3">
                                        💬 Islamic Chatbot — কোন topic এ প্রশ্ন করেছো
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(data.topic_breakdown).map(([topic, count]) => (
                                            <span
                                                key={topic}
                                                className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full"
                                            >
                                                {TOPIC_NAMES[topic] || topic}: {count}টি
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Tab: Tajweed */}
                    {activeTab === 'tajweed' && (
                        <motion.div
                            key="tajweed"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Avg score */}
                            <div className="rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 mb-4 text-center">
                                <p className="text-gray-400 text-sm mb-2">সাপ্তাহিক গড় Tajweed Score</p>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.4 }}
                                    className={`text-6xl font-bold mb-2 ${(data?.tajweed_avg_score || 0) >= 80 ? 'text-emerald-400' :
                                            (data?.tajweed_avg_score || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                                        }`}
                                >
                                    {data?.tajweed_avg_score || 0}%
                                </motion.div>
                                <div className="w-full bg-white/10 rounded-full h-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data?.tajweed_avg_score || 0}%` }}
                                        transition={{ duration: 1.2 }}
                                        className="h-3 rounded-full bg-linear-to-r from-emerald-400 to-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Weak rules */}
                            {data?.weak_tajweed_rules && data.weak_tajweed_rules.length > 0 && (
                                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 mb-4">
                                    <p className="text-rose-400 font-semibold text-sm mb-3">
                                        ⚠️ এই rules এ আরো practice দরকার
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {data.weak_tajweed_rules.map(rule => (
                                            <Link
                                                key={rule}
                                                href={`/dashboard/student/islamic/tajweed/practice?rule=${rule}`}
                                            >
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-block text-sm bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-2 rounded-xl cursor-pointer hover:bg-rose-500/30"
                                                >
                                                    {RULE_NAMES[rule] || rule} — Practice করো →
                                                </motion.span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data?.weak_tajweed_rules?.length === 0 && (
                                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
                                    <p className="text-3xl mb-2">🎉</p>
                                    <p className="text-emerald-400 font-bold">মাশাআল্লাহ! সব Tajweed rules এ ভালো করছো!</p>
                                </div>
                            )}

                            {/* Memorization levels */}
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                                <p className="text-gray-400 text-xs font-semibold mb-3">
                                    📚 হিফজ Level Distribution
                                </p>
                                <div className="space-y-2">
                                    {[
                                        { level: '5', label: 'পারফেক্ট', color: 'bg-violet-400' },
                                        { level: '4', label: 'শক্তিশালী', color: 'bg-teal-400' },
                                        { level: '3', label: 'ভালো', color: 'bg-emerald-400' },
                                        { level: '2', label: 'Revision দরকার', color: 'bg-amber-400' },
                                        { level: '1', label: 'নতুন', color: 'bg-blue-400' },
                                    ].map(item => {
                                        const count = data?.memorization_levels[item.level] || 0
                                        const total = Object.values(data?.memorization_levels || {}).reduce((a, b) => a + b, 0) || 1
                                        const pct = Math.round((count / total) * 100)
                                        return (
                                            <div key={item.level}>
                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>{item.label}</span>
                                                    <span>{count} টি ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-2">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8 }}
                                                        className={`h-2 rounded-full ${item.color}`}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Tab: AI Plan */}
                    {activeTab === 'ai' && (
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {!ai ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">AI analysis এর জন্য কিছু data দরকার।</p>
                                    <p className="text-gray-500 text-sm mt-1">কিছুদিন practice করো, তারপর দেখো।</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Strengths */}
                                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                                        <p className="text-emerald-400 font-semibold text-sm mb-3">
                                            ✅ ভালো দিক
                                        </p>
                                        <div className="space-y-2">
                                            {ai.strengths.map((s, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="text-emerald-400 mt-0.5">→</span>
                                                    <p className="text-gray-300 text-sm">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Improvements */}
                                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                                        <p className="text-amber-400 font-semibold text-sm mb-3">
                                            ⚠️ উন্নতি দরকার
                                        </p>
                                        <div className="space-y-2">
                                            {ai.improvements_needed.map((s, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="text-amber-400 mt-0.5">→</span>
                                                    <p className="text-gray-300 text-sm">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
                                        <p className="text-blue-400 font-semibold text-sm mb-3">
                                            🤖 AI সুপারিশ
                                        </p>
                                        <div className="space-y-2">
                                            {ai.ai_recommendations.map((s, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="text-blue-400 text-xs mt-1 font-bold">{i + 1}.</span>
                                                    <p className="text-gray-300 text-sm">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next week goals */}
                                    <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4">
                                        <p className="text-violet-400 font-semibold text-sm mb-3">
                                            🎯 আগামী সপ্তাহের লক্ষ্য
                                        </p>
                                        <div className="space-y-2">
                                            {ai.next_week_goals.map((s, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="text-violet-400 mt-0.5">→</span>
                                                    <p className="text-gray-300 text-sm">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Tab: Parent Report */}
                    {activeTab === 'parent' && (
                        <motion.div
                            key="parent"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {!ai ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">Parent report এর জন্য AI analysis দরকার।</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-linear-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">👨‍👩‍👧</span>
                                            <p className="text-teal-400 font-bold">Parent এর জন্য Weekly Report</p>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                            {ai.parent_report}
                                        </p>

                                        {/* Summary stats for parent */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {[
                                                { label: 'সাপ্তাহিক Score', value: `${ai.overall_score}/100`, color: 'text-emerald-400' },
                                                { label: 'Grade', value: ai.grade, color: GRADE_COLOR[ai.grade] || 'text-white' },
                                                { label: 'Active দিন', value: `${data?.daily_streak || 0}/7`, color: 'text-orange-400' },
                                                { label: 'Tajweed Score', value: `${data?.tajweed_avg_score || 0}%`, color: 'text-blue-400' },
                                            ].map((stat, i) => (
                                                <div key={i} className="rounded-xl bg-white/5 p-3 text-center">
                                                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-gray-400 text-xs">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Copy button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCopyReport}
                                            className="w-full py-3 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg text-sm"
                                        >
                                            {copied ? '✅ Copied!' : '📋 Report Copy করো'}
                                        </motion.button>
                                    </div>

                                    {/* Weak areas for parent */}
                                    {data?.weak_tajweed_rules && data.weak_tajweed_rules.length > 0 && (
                                        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                                            <p className="text-amber-400 font-semibold text-sm mb-2">
                                                👨‍👩‍👧 Parent কে জানানো দরকার
                                            </p>
                                            <p className="text-gray-300 text-sm">
                                                এই Tajweed rules এ আরো মনোযোগ দরকার:{' '}
                                                {data.weak_tajweed_rules.map(r => RULE_NAMES[r] || r).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}