'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const islamicModules = [
    {
        id: 'arabic',
        name: 'Arabic Letters',
        arabic: 'الحروف العربية',
        desc: 'আরবি হরফ শিখি',
        icon: '✍️',
        color: 'from-emerald-400 to-teal-500',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        href: '/dashboard/student/kids-zone/islamic/arabic',
        lessons: 28,
        available: true,
    },
    {
        id: 'kalima',
        name: 'কালিমা শিখি',
        arabic: 'الكلمة',
        desc: 'ইসলামের মূল কালিমাসমূহ',
        icon: '☝️',
        color: 'from-blue-400 to-indigo-500',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        href: '/dashboard/student/kids-zone/islamic/kalima',
        lessons: 6,
        available: true,
    },
    {
        id: 'dua',
        name: 'দোয়া শিখি',
        arabic: 'الدعاء',
        desc: 'দৈনন্দিন দোয়া মুখস্থ করি',
        icon: '🤲',
        color: 'from-violet-400 to-purple-500',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        href: '/dashboard/student/kids-zone/islamic/dua',
        lessons: 10,
        available: true,
    },
    {
        id: 'surah',
        name: 'সূরা শিখি',
        arabic: 'السورة',
        desc: 'ছোট সূরা মুখস্থ করি',
        icon: '📖',
        color: 'from-amber-400 to-orange-500',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        href: '/dashboard/student/kids-zone/islamic/surah',
        lessons: 8,
        available: true,
    },
    {
        id: 'namaz',
        name: 'নামাজ শিখি',
        arabic: 'الصلاة',
        desc: 'নামাজের নিয়ম শিখি',
        icon: '🕌',
        color: 'from-teal-400 to-cyan-500',
        border: 'border-teal-500/30',
        bg: 'bg-teal-500/10',
        href: '/dashboard/student/kids-zone/islamic/namaz',
        lessons: 5,
        available: false,
    },
    {
        id: 'nabi',
        name: 'নবীর গল্প',
        arabic: 'قصص الأنبياء',
        desc: 'নবী-রাসূলদের গল্প',
        icon: '🌙',
        color: 'from-rose-400 to-pink-500',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        href: '/dashboard/student/kids-zone/islamic/stories',
        lessons: 10,
        available: false,
    },
]

export default function IslamicZonePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white p-4 md:p-6">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <Link href="/dashboard/student/kids-zone"
                    className="text-emerald-400 hover:text-emerald-300 text-sm inline-flex items-center gap-2 mb-4">
                    ← Kids Zone এ ফিরে যাও
                </Link>

                {/* Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(10)].map((_, i) => (
                            <motion.div key={i}
                                className="absolute text-white/10 text-4xl"
                                style={{ left: `${i * 10}%`, top: `${(i % 3) * 30}%` }}
                                animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
                            >
                                ☪️
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-emerald-200 text-sm mb-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                            <h1 className="text-3xl font-bold text-white mb-1">ইসলামিক জগৎ 🕌</h1>
                            <p className="text-emerald-100 text-sm">আরবি শিখি, কুরআন পড়ি, দোয়া মুখস্থ করি</p>
                        </div>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-7xl"
                        >
                            🌙
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {islamicModules.map((module, i) => (
                    <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={module.available ? { y: -4, scale: 1.02 } : {}}
                    >
                        {module.available ? (
                            <Link href={module.href}>
                                <ModuleCard module={module} />
                            </Link>
                        ) : (
                            <div className="opacity-50 cursor-not-allowed">
                                <ModuleCard module={module} locked />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Daily Reminder */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center"
            >
                <p className="text-2xl text-emerald-300 leading-loose mb-2">
                    طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
                </p>
                <p className="text-gray-400 text-sm">"জ্ঞান অর্জন করা প্রতিটি মুসলিমের উপর ফরজ।"</p>
            </motion.div>
        </div>
    )
}

function ModuleCard({ module, locked }: { module: typeof islamicModules[0]; locked?: boolean }) {
    return (
        <div className={`rounded-3xl border ${module.border} ${module.bg} p-5 relative overflow-hidden transition-all`}>
            {locked && (
                <div className="absolute top-3 right-3 bg-gray-800/80 rounded-full px-2 py-1 text-xs text-gray-400">
                    🔒 শীঘ্রই
                </div>
            )}
            <div className="flex items-start gap-4">
                <motion.div
                    animate={!locked ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
                >
                    {module.icon}
                </motion.div>
                <div className="flex-1">
                    <p className="text-lg text-right text-white/60 mb-0.5">{module.arabic}</p>
                    <h3 className="font-bold text-white text-lg mb-0.5">{module.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{module.desc}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{module.lessons}টি lesson</span>
                        {!locked && (
                            <span className={`text-sm font-bold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                                শুরু করো →
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}