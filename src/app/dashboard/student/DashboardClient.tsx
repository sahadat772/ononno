'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import AnimatedCard from '@/components/ui/AnimatedCard'

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

const stagger = {
    animate: { transition: { staggerChildren: 0.08 } },
}

interface Props {
    profile: Record<string, string> | null
    studentProfile: Record<string, string> | null
}

export default function DashboardClient({ profile, studentProfile }: Props) {
    const classLevel = studentProfile?.class_level?.replace('_', ' ').toUpperCase() || 'General'
    const isCareerAvailable = ['class_9', 'class_10', 'class_11', 'class_12', 'university', 'masters']
        .includes(studentProfile?.class_level || '')
    const isTrainingAvailable = ['class_11', 'class_12', 'university', 'masters']
        .includes(studentProfile?.class_level || '')

    return (
        <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
        >
            {/* Welcome */}
            <motion.div variants={fadeUp} className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    আস-সালামু আলাইকুম,{' '}
                    <span className="text-gradient-primary">{profile?.full_name}</span> 👋
                </h1>
                <p className="text-gray-500 mt-1">
                    {classLevel} · আজকের পড়াশোনা শুরু করো
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div
                variants={stagger}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
                {[
                    { label: 'আজকের লেসন', value: '০', icon: '📚', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
                    { label: 'ইসলামিক পড়া', value: '০', icon: '🕌', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50' },
                    { label: 'Quiz score', value: '০%', icon: '✅', gradient: 'from-purple-500 to-violet-500', bg: 'from-purple-50 to-violet-50' },
                    { label: 'Streak', value: '১ দিন', icon: '🔥', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        variants={fadeUp}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 border border-white shadow-sm`}
                    >
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-xl mb-3 shadow-md`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main modules */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">

                {/* Islamic Study */}
                <AnimatedCard delay={0.1} className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-green-200">
                            🕌
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">ইসলামিক শিক্ষা</h2>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                বাধ্যতামূলক
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2 mb-5">
                        {[
                            { name: 'কুরআন তিলাওয়াত', progress: 0, icon: '📖' },
                            { name: 'হাদিস শিক্ষা', progress: 0, icon: '📜' },
                            { name: 'ফিকহ', progress: 0, icon: '☪️' },
                        ].map((item) => (
                            <div key={item.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <span className="text-lg">{item.icon}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">{item.name}</div>
                                    <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                        <div className="bg-green-500 h-1 rounded-full" style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-green-500 transition-colors">→</span>
                            </div>
                        ))}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/dashboard/student/islamic"
                            className="block w-full text-center gradient-primary text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-200 hover:shadow-green-300 transition-shadow"
                        >
                            পড়া শুরু করো
                        </Link>
                    </motion.div>
                </AnimatedCard>

                {/* Academic */}
                <AnimatedCard delay={0.2} className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-200">
                            📚
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">একাডেমিক</h2>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {classLevel}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2 mb-5">
                        {[
                            { name: 'বাংলা', progress: 0, icon: '🔤' },
                            { name: 'ইংরেজি', progress: 0, icon: '🔡' },
                            { name: 'গণিত', progress: 0, icon: '🔢' },
                            { name: 'বিজ্ঞান', progress: 0, icon: '🔬' },
                        ].map((item) => (
                            <div key={item.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <span className="text-lg">{item.icon}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">{item.name}</div>
                                    <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-blue-500 transition-colors">→</span>
                            </div>
                        ))}
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/dashboard/student/academic"
                            className="block w-full text-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-shadow"
                        >
                            পড়া শুরু করো
                        </Link>
                    </motion.div>
                </AnimatedCard>

                {/* AI Tutor */}
                <AnimatedCard delay={0.3} className="p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-200">
                                🤖
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">AI শিক্ষক</h2>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                    Groq AI চালিত
                                </span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 mb-5 border border-purple-100">
                            <div className="flex items-start gap-2">
                                <div className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center text-sm shrink-0">🤖</div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    আস-সালামু আলাইকুম! আমি তোমার AI শিক্ষক। যেকোনো প্রশ্ন করো — বাংলায় উত্তর দেবো।
                                </p>
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/dashboard/student/ai-tutor"
                                className="block w-full text-center gradient-secondary text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-shadow"
                            >
                                AI এর সাথে কথা বলো
                            </Link>
                        </motion.div>
                    </div>
                </AnimatedCard>
            </div>

            {/* Career path */}
            {isCareerAvailable && (
                <AnimatedCard delay={0.4} className="p-6 mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-200">
                                🧭
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-lg">ক্যারিয়ার পাথ AI</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    তোমার আগ্রহ ও দক্ষতা বিশ্লেষণ করে সেরা ক্যারিয়ার suggest করবে
                                </p>
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/dashboard/student/career"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-amber-200"
                            >
                                শুরু করো →
                            </Link>
                        </motion.div>
                    </div>
                </AnimatedCard>
            )}

            {/* Training */}
            {isTrainingAvailable && (
                <AnimatedCard delay={0.5} className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-0">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-cyan-200">
                                💡
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-lg">Skill Training</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Stock market, Tech, Business — সব training এক জায়গায়
                                </p>
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/dashboard/student/training"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-cyan-200"
                            >
                                Training শুরু করো →
                            </Link>
                        </motion.div>
                    </div>
                </AnimatedCard>
            )}
        </motion.div>
    )
}