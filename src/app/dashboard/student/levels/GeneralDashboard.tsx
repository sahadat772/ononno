'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AdWrapper from '@/components/shared/AdWrapper'

interface Props {
    profile: Record<string, string> | null
    studentProfile: Record<string, string> | null
}

const classNames: Record<string, string> = {
    class_3: 'তৃতীয় শ্রেণী',
    class_4: 'চতুর্থ শ্রেণী',
    class_5: 'পঞ্চম শ্রেণী',
    class_6: 'ষষ্ঠ শ্রেণী',
    class_7: 'সপ্তম শ্রেণী',
    class_8: 'অষ্টম শ্রেণী',
    class_9: 'নবম শ্রেণী',
    class_10: 'দশম শ্রেণী',
    class_11: 'একাদশ শ্রেণী',
    class_12: 'দ্বাদশ শ্রেণী',
    university: 'বিশ্ববিদ্যালয়',
    masters: 'মাস্টার্স',
    general: 'সাধারণ',
}

export default function GeneralDashboard({ profile, studentProfile }: Props) {
    const [realStats, setRealStats] = useState({ lessons: 0, quizScore: 0 })

    useEffect(() => {
        async function loadStats() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('learning_progress')
                    .select('completed, score')
                    .eq('user_id', user.id)

                if (data) {
                    const completedLessons = data.filter(r => r.completed).length
                    const avgScore = data.length > 0
                        ? Math.round(data.reduce((sum, r) => sum + (r.score || 0), 0) / data.length)
                        : 0
                    setRealStats({ lessons: completedLessons, quizScore: avgScore })
                }
            } catch (e) {
                console.error('Stats load failed:', e)
            }
        }
        void loadStats()
    }, [])

    const classLevel = studentProfile?.class_level || 'general'
    const className = classNames[classLevel] || classLevel
    const firstName = profile?.full_name?.split(' ')[0] || 'বন্ধু'

    const isCareerAvailable = ['class_9', 'class_10', 'class_11', 'class_12', 'university', 'masters'].includes(classLevel)
    const isTrainingAvailable = ['class_11', 'class_12', 'university', 'masters'].includes(classLevel)

    const modules = [
        {
            title: 'ইসলামিক শিক্ষা',
            desc: 'কুরআন, হাদিস, ফিকহ, দোয়া',
            icon: '🕌',
            color: 'from-emerald-500 to-teal-500',
            border: 'border-emerald-500/20',
            href: '/dashboard/student/islamic',
            badge: 'বাধ্যতামূলক',
            badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            items: ['কুরআন তিলাওয়াত', 'Tajweed AI', 'হিফজ Tracker', 'উস্তাদ AI Chat'],
        },
        {
            title: 'একাডেমিক',
            desc: className + ' এর পাঠ্যক্রম',
            icon: '📚',
            color: 'from-blue-500 to-cyan-500',
            border: 'border-blue-500/20',
            href: '/dashboard/student/academic',
            badge: className,
            badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            items: ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান'],
        },
        {
            title: 'AI শিক্ষক',
            desc: 'যেকোনো প্রশ্নের উত্তর পাও',
            icon: '🤖',
            color: 'from-violet-500 to-purple-500',
            border: 'border-violet-500/20',
            href: '/dashboard/student/ai-tutor',
            badge: 'Groq AI',
            badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
            items: ['বাংলায় উত্তর', 'যেকোনো বিষয়', '২৪/৭ সাহায্য'],
        },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-8">
            {/* Top Ad */}
            <AdWrapper position="top" className="mb-4" />

            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="rounded-3xl bg-linear-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 border border-blue-500/20 p-4 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl md:text-3xl font-bold text-white leading-tight">
                                আস-সালামু আলাইকুম, {firstName}! 👋
                            </h1>
                            <p className="text-gray-400 mt-1 text-sm">আজকের পড়াশোনা শুরু করো</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-1 rounded-full">
                                    🏫 {className}
                                </span>
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-1 rounded-full">
                                    🔥 ১ দিনের streak
                                </span>
                            </div>
                        </div>
                        <div className="text-5xl md:text-6xl shrink-0">
                            {classLevel.startsWith('university') || classLevel === 'masters' ? '🎓' : '📖'}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4">
                        {[
                            { label: 'সম্পন্ন লেসন', value: `${realStats.lessons}`, icon: '📚', color: 'from-blue-500 to-cyan-500' },
                            { label: 'ইসলামিক', value: '০%', icon: '🕌', color: 'from-emerald-500 to-teal-500' },
                            { label: 'Quiz score', value: `${realStats.quizScore}%`, icon: '✅', color: 'from-violet-500 to-purple-500' },
                            { label: 'Streak', value: '১ দিন', icon: '🔥', color: 'from-amber-500 to-orange-500' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 rounded-2xl p-3 text-center"
                            >
                                <div className="text-xl mb-1">{stat.icon}</div>
                                <div className={`text-base md:text-lg font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Main Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                {modules.map((module, i) => (
                    <motion.div
                        key={module.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                    >
                        <Link href={module.href}>
                            <div className={`rounded-2xl border ${module.border} bg-white/5 hover:bg-white/10 p-4 md:p-5 transition-all h-full cursor-pointer`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl bg-linear-to-br ${module.color} flex items-center justify-center text-2xl shadow-md`}>
                                        {module.icon}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${module.badgeColor} max-width: 120px; text-center leading-tight`}>
                                        {module.badge}
                                    </span>
                                </div>
                                <h3 className="font-bold text-white text-base md:text-lg mb-1">{module.title}</h3>
                                <p className="text-gray-400 text-sm mb-3">{module.desc}</p>
                                <div className="space-y-1">
                                    {module.items.map((item, j) => (
                                        <div key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                                            <span className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${module.color} shrink-0`} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <div className={`mt-3 text-sm font-semibold bg-linear-to-r ${module.color} bg-clip-text text-transparent`}>
                                    শুরু করো →
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
            {/* Islamic Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-4"
            >
                <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                    🕌 Islamic — নতুন features
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { href: '/dashboard/student/islamic/tajweed', icon: '🎵', label: 'Tajweed AI', color: 'from-blue-500 to-indigo-600' },
                        { href: '/dashboard/student/islamic/memorization', icon: '📚', label: 'হিফজ Tracker', color: 'from-violet-500 to-purple-600' },
                        { href: '/dashboard/student/islamic/chat', icon: '🤖', label: 'উস্তাদ AI', color: 'from-emerald-500 to-teal-600' },
                        { href: '/dashboard/student/islamic/progress', icon: '📊', label: 'Weekly Report', color: 'from-amber-500 to-orange-600' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 flex items-center gap-3 transition-all"
                            >
                                <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${item.color} flex items-center justify-center text-lg flex-shrink-0`}>
                                    {item.icon}
                                </div>
                                <p className="text-white text-sm font-semibold">{item.label}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Career Path */}
            {isCareerAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3"
                >
                    <Link href="/dashboard/student/career">
                        <div className="rounded-2xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 to-orange-500/10 p-4 md:p-5 hover:bg-amber-500/20 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl md:text-3xl shadow-md shrink-0">
                                    🧭
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-base md:text-lg">ক্যারিয়ার পাথ AI</h3>
                                    <p className="text-gray-400 text-sm truncate">তোমার আগ্রহ অনুযায়ী সেরা ক্যারিয়ার খুঁজে নাও</p>
                                </div>
                                <span className="bg-amber-500 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold text-sm shrink-0">
                                    শুরু →
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )}

            {/* Skill Training */}
            {isTrainingAvailable && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="/dashboard/student/training">
                        <div className="rounded-2xl border border-cyan-500/20 bg-linear-to-r from-cyan-500/10 to-blue-500/10 p-4 md:p-5 hover:bg-cyan-500/20 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl md:text-3xl shadow-md shrink-0">
                                    💡
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-base md:text-lg">Skill Training</h3>
                                    <p className="text-gray-400 text-sm truncate">Stock market, Tech, Business — সব training এক জায়গায়</p>
                                </div>
                                <span className="bg-cyan-500 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold text-sm shrink-0">
                                    শুরু →
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )}

            {/* Bottom Ad */}
            <AdWrapper position="bottom" className="mt-6" />
        </div>
    )
}