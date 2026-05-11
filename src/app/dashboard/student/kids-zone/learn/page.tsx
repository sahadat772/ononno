'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const subjects = [
    {
        id: 'bangla',
        name: 'বাংলা বর্ণমালা',
        subtitle: 'অ আ ই ঈ উ...',
        icon: '🔤',
        color: 'from-red-400 to-rose-500',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        href: '/dashboard/student/kids-zone/learn/bangla',
        totalLessons: 12,
        completedLessons: 0,
        character: '🐍',
        description: 'বাংলা স্বরবর্ণ ও ব্যঞ্জনবর্ণ শিখি',
        available: true,
    },
    {
        id: 'english',
        name: 'English ABC',
        subtitle: 'A B C D E...',
        icon: '🔡',
        color: 'from-blue-400 to-cyan-500',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        href: '/dashboard/student/kids-zone/learn/english',
        totalLessons: 10,
        completedLessons: 0,
        character: '🦁',
        description: 'English letters and simple words',
        available: true,
    },
    {
        id: 'numbers',
        name: 'সংখ্যা শিখি',
        subtitle: '১ ২ ৩ ৪ ৫...',
        icon: '🔢',
        color: 'from-green-400 to-emerald-500',
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        href: '/dashboard/student/kids-zone/learn/numbers',
        totalLessons: 8,
        completedLessons: 0,
        character: '🍎',
        description: 'সংখ্যা গণনা ও যোগ-বিয়োগ শিখি',
        available: true,
    },
    {
        id: 'world',
        name: 'বিশ্ব পরিচয়',
        subtitle: 'প্রাণী, ফল, সবজি...',
        icon: '🌍',
        color: 'from-amber-400 to-yellow-500',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        href: '/dashboard/student/kids-zone/learn/world',
        totalLessons: 10,
        completedLessons: 0,
        character: '🦒',
        description: 'প্রাণী জগৎ, ফল ও সবজি চেনো',
        available: false,
    },
    {
        id: 'stories',
        name: 'গল্পের জগৎ',
        subtitle: 'ছড়া ও গল্প...',
        icon: '📖',
        color: 'from-purple-400 to-violet-500',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        href: '/dashboard/student/kids-zone/learn/stories',
        totalLessons: 8,
        completedLessons: 0,
        character: '🦉',
        description: 'মজার ছড়া ও গল্প পড়ি',
        available: false,
    },
]

export default function LearnZonePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white p-4 md:p-6">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <Link
                    href="/dashboard/student/kids-zone"
                    className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-2 mb-4 transition-colors"
                >
                    ← Kids Zone এ ফিরে যাও
                </Link>

                <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 relative overflow-hidden">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-7xl"
                        >
                            📚
                        </motion.div>
                    </div>
                    <div className="relative pr-20">
                        <h1 className="text-3xl font-bold text-white mb-1">শেখার জগৎ! 🌟</h1>
                        <p className="text-blue-100 text-sm">বর্ণমালা, সংখ্যা ও আরো অনেক কিছু শিখি</p>

                        {/* Overall Progress */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-blue-200 mb-1">
                                <span>সামগ্রিক অগ্রগতি</span>
                                <span>০%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3">
                                <div className="bg-white/60 h-3 rounded-full w-0 transition-all" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Subject Cards */}
            <div className="space-y-4">
                {subjects.map((subject, i) => (
                    <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        {subject.available ? (
                            <Link href={subject.href}>
                                <SubjectCard subject={subject} />
                            </Link>
                        ) : (
                            <div className="opacity-50 cursor-not-allowed">
                                <SubjectCard subject={subject} locked />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function SubjectCard({ subject, locked }: { subject: typeof subjects[0]; locked?: boolean }) {
    const progress = subject.totalLessons > 0
        ? Math.round((subject.completedLessons / subject.totalLessons) * 100)
        : 0

    return (
        <motion.div
            whileHover={!locked ? { x: 4, scale: 1.01 } : {}}
            className={`rounded-3xl border ${subject.border} ${subject.bg} p-5 transition-all relative overflow-hidden`}
        >
            {locked && (
                <div className="absolute top-4 right-4 bg-gray-800/80 rounded-full px-3 py-1 text-xs text-gray-400">
                    🔒 শীঘ্রই
                </div>
            )}

            <div className="flex items-center gap-4">
                {/* Icon */}
                <motion.div
                    animate={!locked ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-4xl shadow-lg flex-shrink-0 relative`}
                >
                    {subject.icon}
                    {/* Character */}
                    <div className="absolute -bottom-1 -right-1 text-xl">
                        {subject.character}
                    </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-xl mb-0.5">{subject.name}</h3>
                    <p className="text-gray-400 text-sm mb-1">{subject.description}</p>
                    <p className={`text-xs font-semibold bg-gradient-to-r ${subject.color} bg-clip-text text-transparent mb-3`}>
                        {subject.subtitle}
                    </p>

                    {/* Progress */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{subject.completedLessons}/{subject.totalLessons} lesson</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className={`bg-gradient-to-r ${subject.color} h-2.5 rounded-full`}
                            />
                        </div>
                    </div>
                </div>

                {!locked && (
                    <div className="text-2xl flex-shrink-0">→</div>
                )}
            </div>
        </motion.div>
    )
}