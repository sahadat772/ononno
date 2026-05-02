'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import AnimatedCard from '@/components/ui/AnimatedCard'

const modules = [
    {
        id: 'quran',
        title: 'কুরআন তিলাওয়াত',
        subtitle: 'নূরানী পদ্ধতিতে শিখো',
        icon: '📖',
        gradient: 'from-green-500 to-emerald-600',
        bg: 'from-green-50 to-emerald-50',
        shadow: 'shadow-green-200',
        lessons: 30,
        completed: 0,
        description: 'আলিফ থেকে শুরু করে সম্পূর্ণ কুরআন তিলাওয়াত। AI দিয়ে তোমার উচ্চারণ check হবে।',
        href: '/dashboard/student/islamic/quran',
    },
    {
        id: 'hadith',
        title: 'হাদিস শিক্ষা',
        subtitle: 'সহীহ হাদিস সংকলন',
        icon: '📜',
        gradient: 'from-amber-500 to-orange-600',
        bg: 'from-amber-50 to-orange-50',
        shadow: 'shadow-amber-200',
        lessons: 20,
        completed: 0,
        description: 'বুখারী, মুসলিম সহ বিভিন্ন হাদিস গ্রন্থ থেকে গুরুত্বপূর্ণ হাদিস শিখো।',
        href: '/dashboard/student/islamic/hadith',
    },
    {
        id: 'fiqh',
        title: 'ফিকহ ও আমল',
        subtitle: 'ইসলামী বিধিবিধান',
        icon: '☪️',
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'from-blue-50 to-indigo-50',
        shadow: 'shadow-blue-200',
        lessons: 15,
        completed: 0,
        description: 'নামাজ, রোজা, যাকাত সহ দৈনন্দিন জীবনের ইসলামী বিধান শিখো।',
        href: '/dashboard/student/islamic/fiqh',
    },
    {
        id: 'tafsir',
        title: 'তাফসির',
        subtitle: 'কুরআনের ব্যাখ্যা',
        icon: '🌙',
        gradient: 'from-purple-500 to-violet-600',
        bg: 'from-purple-50 to-violet-50',
        shadow: 'shadow-purple-200',
        lessons: 10,
        completed: 0,
        description: 'কুরআনের আয়াতের অর্থ ও ব্যাখ্যা সহজ বাংলায় বোঝো।',
        href: '/dashboard/student/islamic/tafsir',
    },
    {
        id: 'sirah',
        title: 'সীরাতুন নবী ﷺ',
        subtitle: 'নবীজির জীবনী',
        icon: '⭐',
        gradient: 'from-rose-500 to-pink-600',
        bg: 'from-rose-50 to-pink-50',
        shadow: 'shadow-rose-200',
        lessons: 25,
        completed: 0,
        description: 'রাসূলুল্লাহ ﷺ এর জীবন, চরিত্র ও আদর্শ থেকে শিখো।',
        href: '/dashboard/student/islamic/sirah',
    },
    {
        id: 'dua',
        title: 'দোয়া ও যিকর',
        subtitle: 'দৈনন্দিন দোয়া',
        icon: '🤲',
        gradient: 'from-teal-500 to-cyan-600',
        bg: 'from-teal-50 to-cyan-50',
        shadow: 'shadow-teal-200',
        lessons: 12,
        completed: 0,
        description: 'সকাল-সন্ধ্যার দোয়া, খাওয়ার দোয়া সহ গুরুত্বপূর্ণ দোয়া মুখস্থ করো।',
        href: '/dashboard/student/islamic/dua',
    },
]

export default function IslamicStudyPage() {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons, 0)
    const totalCompleted = modules.reduce((acc, m) => acc + m.completed, 0)
    const overallProgress = Math.round((totalCompleted / totalLessons) * 100)

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/student"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ←
                        </Link>
                        <div className="text-lg font-bold text-gradient-primary">ইসলামিক শিক্ষা</div>
                    </div>
                    <div className="text-sm text-gray-500">
                        {totalCompleted}/{totalLessons} সম্পন্ন
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10">
                            <div className="text-4xl mb-3">🕌</div>
                            <h1 className="text-2xl font-bold mb-2">ইসলামিক শিক্ষা</h1>
                            <p className="text-green-100 text-sm mb-6">
                                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم — আল্লাহর নামে শুরু করি
                            </p>
                            <div className="bg-white/20 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">সামগ্রিক অগ্রগতি</span>
                                    <span className="text-sm font-bold">{overallProgress}%</span>
                                </div>
                                <div className="w-full bg-white/30 rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallProgress}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="bg-white h-2 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Daily reminder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-center gap-4"
                >
                    <div className="text-3xl">⏰</div>
                    <div>
                        <div className="font-semibold text-amber-800 text-sm">আজকের লক্ষ্য</div>
                        <div className="text-amber-600 text-sm">কুরআন তিলাওয়াত ১ পৃষ্ঠা + ১টি হাদিস পড়ো</div>
                    </div>
                    <div className="ml-auto">
                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-lg">🎯</div>
                    </div>
                </motion.div>

                {/* Modules */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, i) => (
                        <AnimatedCard key={module.id} delay={i * 0.08} className="overflow-hidden">
                            <Link href={module.href}>
                                <div className={`bg-gradient-to-br ${module.bg} p-6 h-full`}>
                                    {/* Icon & title */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg ${module.shadow}`}>
                                            {module.icon}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">{module.completed}/{module.lessons}</div>
                                            <div className="text-xs text-gray-400">লেসন</div>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{module.title}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{module.subtitle}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{module.description}</p>

                                    {/* Progress bar */}
                                    <div className="w-full bg-white/60 rounded-full h-1.5 mb-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(module.completed / module.lessons) * 100}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className={`bg-gradient-to-r ${module.gradient} h-1.5 rounded-full`}
                                        />
                                    </div>

                                    <div className={`w-full text-center bg-gradient-to-r ${module.gradient} text-white py-2.5 rounded-xl text-sm font-semibold shadow-md ${module.shadow}`}>
                                        শুরু করো →
                                    </div>
                                </div>
                            </Link>
                        </AnimatedCard>
                    ))}
                </div>

                {/* AI Islamic tutor */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                        <div>
                            <div className="text-3xl mb-3">🤖</div>
                            <h3 className="text-xl font-bold mb-2">Islamic AI শিক্ষক</h3>
                            <p className="text-gray-400 text-sm max-w-md">
                                কুরআন, হাদিস, ফিকহ — যেকোনো ইসলামিক প্রশ্ন করো। AI কুরআন ও সহীহ হাদিসের আলোকে উত্তর দেবে।
                            </p>
                        </div>
                        <Link
                            href="/dashboard/student/ai-tutor?topic=islamic"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-green-900/30"
                        >
                            প্রশ্ন করো →
                        </Link>
                    </div>
                </motion.div>

            </div>
        </main>
    )
}