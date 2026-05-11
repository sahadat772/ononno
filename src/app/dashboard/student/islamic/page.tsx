'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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
    },
    {
        title: 'হাদিস শরীফ',
        description: 'সহিহ হাদিস সংকলন ও ব্যাখ্যা',
        icon: '📜',
        color: 'from-amber-500 to-yellow-500',
        borderColor: 'hover:border-amber-500/50',
        glowColor: 'hover:shadow-amber-500/20',
        href: '/dashboard/student/islamic/hadith',
        available: true,
        badge: null,
    },
    {
        title: 'ফিকহ',
        description: 'ইসলামি আইন ও বিধিবিধান',
        icon: '⚖️',
        color: 'from-blue-500 to-indigo-500',
        borderColor: 'hover:border-blue-500/50',
        glowColor: 'hover:shadow-blue-500/20',
        href: '/dashboard/student/islamic/fiqh',
        available: true,
        badge: 'নতুন',
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
        badge: 'নতুন',
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
        badge: 'নতুন',
    },
    {
        title: 'দোয়া সমূহ',
        description: 'কুরআন ও হাদিস থেকে প্রামাণিক দোয়া',
        icon: '🤲',
        color: 'from-rose-500 to-pink-500',
        borderColor: 'hover:border-rose-500/50',
        glowColor: 'hover:shadow-rose-500/20',
        href: '/dashboard/student/islamic/dua',
        available: true,
        badge: 'নতুন',
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
    },
];

const stats = [
    { label: 'সূরা', value: '১১৪', icon: '📖' },
    { label: 'হাদিস গ্রন্থ', value: '৬+', icon: '📜' },
    { label: 'দোয়া', value: '৫০+', icon: '🤲' },
    { label: 'বিষয়', value: '৮টি', icon: '📚' },
];

export default function IslamicPage() {
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
                <div className="mt-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30">
                            🕌
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                ইসলামিক স্টাডি
                            </h1>
                            <p className="text-gray-400 mt-1">সম্পূর্ণ ইসলামিক শিক্ষার প্ল্যাটফর্ম</p>
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

            {/* Modules Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-bold text-white mb-4">📚 সকল বিভাগ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {islamicModules.map((module, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
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
                </div>
            </motion.div>

            {/* Daily Reminder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 text-center"
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
    );
}

function ModuleCard({ module }: { module: typeof islamicModules[0] }) {
    return (
        <>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl shadow-md`}>
                    {module.icon}
                </div>
                {module.badge && (
                    <span className={`text-xs px-2 py-1 rounded-full ${module.badge === 'শীঘ্রই'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        {module.badge}
                    </span>
                )}
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
    );
}