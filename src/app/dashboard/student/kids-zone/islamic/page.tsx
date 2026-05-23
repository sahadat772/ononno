'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const ISLAMIC_ITEMS = [
    {
        href: '/dashboard/student/kids-zone/islamic/kalima',
        icon: '☝️',
        title: 'কালিমা',
        title_ar: 'الكلمة',
        desc: 'ইসলামের মূল কালিমাসমূহ শিখি',
        color: 'from-blue-500 to-indigo-600',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
    },
    {
        href: '/dashboard/student/kids-zone/islamic/dua',
        icon: '🤲',
        title: 'দোয়া',
        title_ar: 'الدعاء',
        desc: 'দৈনন্দিন দোয়া মুখস্থ করি',
        color: 'from-violet-500 to-purple-600',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
    },
    {
        href: '/dashboard/student/kids-zone/islamic/surah',
        icon: '📖',
        title: 'সূরা',
        title_ar: 'السورة',
        desc: 'ছোট সূরা মুখস্থ করি',
        color: 'from-amber-500 to-orange-600',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
    },
    {
        href: '/dashboard/student/kids-zone/islamic/arabic',
        icon: '🔤',
        title: 'আরবি',
        title_ar: 'العربية',
        desc: 'আরবি হরফ চিনি ও লিখি',
        color: 'from-emerald-500 to-teal-600',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
    },
]

export default function KidsIslamicPage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto">
                    <Link href="/dashboard/student/kids-zone"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Kids Zone এ ফিরে যাও
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="text-5xl mb-3"
                    >🕌</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">Islamic পড়া</h1>
                    <p className="text-2xl text-emerald-300 mb-2">التعليم الإسلامي</p>
                    <p className="text-gray-400 text-sm">কুরআন, দোয়া ও ইসলামিক শিক্ষা</p>
                </motion.div>

                {/* Items */}
                <div className="grid grid-cols-1 gap-4">
                    {ISLAMIC_ITEMS.map((item, i) => (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={item.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`rounded-2xl ${item.bg} border ${item.border} p-5 flex items-center gap-4`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center text-3xl shadow-lg flex-shrink: 0;`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-white text-lg">{item.title}</p>
                                            <p className="text-white/40" style={{ fontFamily: 'serif' }}>
                                                {item.title_ar}
                                            </p>
                                        </div>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                    <span className="text-gray-500 text-xl flex-shrink: 0;">→</span>
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
                    <p className="text-gray-600 text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                    <p className="text-gray-700 text-xs mt-1">আল্লাহর নামে শুরু করি</p>
                </motion.div>
            </div>
        </div>
    )
}