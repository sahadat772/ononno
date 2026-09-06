'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
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

export default function NurseryDashboard({ profile, studentProfile }: Props) {
    const [realStats, setRealStats] = useState({ stars: 0, lessons: 0, streak: 1 })
    const [currentTime, setCurrentTime] = useState('')
    const [greeting, setGreeting] = useState('')
    const [showReward, setShowReward] = useState(false)
    const classLevel = studentProfile?.class_level || 'nursery'
    const className = classNames[classLevel] || 'নার্সারি'
    const firstName = profile?.full_name?.split(' ')[0] || 'বন্ধু'
    const academicHref = `/dashboard/student/academic/learn/${String(classLevel).replace(/_/g, '-')}`

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

    useEffect(() => {
        const timer = setTimeout(() => setShowReward(true), 2000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        async function loadStats() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data } = await supabase
                    .from('learning_progress')
                    .select('status, xp_earned')
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                if (data) {
                    setRealStats({
                        stars: data.reduce((s, r) => s + (Number(r.xp_earned) || 0), 0),
                        lessons: data.length,
                        streak: 1,
                    })
                }
            } catch (e) {
                console.error('Stats load failed:', e)
            }
        }
        void loadStats()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#0d1a2e] to-[#0a0a1a] p-4 md:p-6">
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowReward(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 text-6xl">🌟</div>
                            <h2 className="mb-2 text-2xl font-bold text-white">শাবাশ {firstName}!</h2>
                            <p className="mb-4 text-amber-50">আজ পড়াশোনা শুরু করো — NCTB পাঠ অপেক্ষা করছে।</p>
                            <button
                                type="button"
                                onClick={() => setShowReward(false)}
                                className="rounded-2xl bg-white px-8 py-3 text-lg font-bold text-orange-500"
                            >
                                শুরু করি! 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6">
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-white/80">
                                👋 {greeting}! {currentTime}
                            </p>
                            <h1 className="mt-1 text-2xl font-black text-white md:text-3xl">{firstName} বন্ধু!</h1>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white">🏫 {className}</span>
                                <span className="rounded-full bg-amber-400/30 px-3 py-1 text-sm text-amber-100">⭐ {realStats.lessons} পাঠ</span>
                            </div>
                        </div>
                        <div className="text-6xl">🧒</div>
                    </div>
                </div>
            </motion.div>

            <div className="mb-6 grid grid-cols-4 gap-3">
                {[
                    { icon: '⭐', label: 'XP', value: `${realStats.stars}` },
                    { icon: '📚', label: 'লেসন', value: `${realStats.lessons}` },
                    { icon: '✅', label: 'Quiz', value: `${realStats.lessons}` },
                    { icon: '🔥', label: 'Streak', value: `${realStats.streak}` },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                        <div className="text-xl">{stat.icon}</div>
                        <div className="text-lg font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            <Link href={academicHref} className="mb-4 block">
                <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-emerald-600 to-teal-600 p-5">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl">📚</div>
                    <div className="relative pr-16">
                        <p className="text-xs font-semibold text-emerald-100">NCTB Curriculum</p>
                        <h3 className="text-xl font-bold text-white">একাডেমিক পাঠ শুরু করো</h3>
                        <p className="text-sm text-emerald-100">বাংলা · ইংরেজি · গণিত — published lesson + quiz</p>
                    </div>
                </div>
            </Link>

            <Link href="/dashboard/student/kids-zone" className="mb-6 block">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-purple-700 p-5">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl">🗺️</div>
                    <div className="relative pr-16">
                        <p className="text-xs font-semibold text-violet-200">খেলার ছলে</p>
                        <h3 className="text-xl font-bold text-white">Kids Zone</h3>
                        <p className="text-sm text-violet-200">বাংলা, English, গণিত, ইসলাম — fun mode</p>
                    </div>
                </div>
            </Link>

            <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">🕌</span>
                <h2 className="text-lg font-bold text-white">ইসলামিক শিক্ষা</h2>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Link href="/dashboard/student/islamic/quran">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5">
                        <div className="text-3xl">📖</div>
                        <h3 className="mt-2 font-bold text-white">কুরআন শিখি</h3>
                        <p className="text-sm text-emerald-100">সূরা ও দোয়া</p>
                    </div>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/student/islamic/dua">
                        <div className="h-full rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
                            <div className="text-2xl">🤲</div>
                            <h3 className="mt-2 font-bold text-white">দোয়া</h3>
                        </div>
                    </Link>
                    <Link href="/dashboard/student/islamic/fiqh">
                        <div className="h-full rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-4">
                            <div className="text-2xl">🕌</div>
                            <h3 className="mt-2 font-bold text-white">নামাজ</h3>
                        </div>
                    </Link>
                </div>
            </div>

            <Link href="/dashboard/student/ai-tutor" className="block">
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
                    <h3 className="font-bold text-white">🤖 AI শিক্ষক</h3>
                    <p className="text-sm text-slate-400">যেকোনো প্রশ্ন জিজ্ঞাসা করো</p>
                </div>
            </Link>

            <p className="mt-8 text-center text-xs text-slate-500">প্রতিদিন একটু শিখলেই এগোবে — অনন্য</p>
        </div>
    )
}
