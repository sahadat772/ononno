
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const units = [
    {
        id: 1,
        title: 'আলিফ থেকে যাল',
        subtitle: 'ا ب ت ث ج ح خ ذ',
        icon: '🌱',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        lessons: [
            { id: 'arabic-alif', title: 'ا — أسد (সিংহ)', icon: 'ا', unlocked: true, completed: false, xp: 10 },
            { id: 'arabic-ba', title: 'ب — بطة (হাঁস)', icon: 'ب', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-ta', title: 'ت — تفاح (আপেল)', icon: 'ت', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-tha', title: 'ث — ثعلب (শেয়াল)', icon: 'ث', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-jeem', title: 'ج — جمل (উট)', icon: 'ج', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-ha', title: 'ح — حصان (ঘোড়া)', icon: 'ح', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-kha', title: 'خ — خروف (ভেড়া)', icon: 'خ', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-dal', title: 'د — دب (ভালুক)', icon: 'د', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-arabic-1', title: 'ا–د Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 2,
        title: 'রা থেকে দোয়াদ',
        subtitle: 'ر ز س ش ص ض',
        icon: '🌿',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        lessons: [
            { id: 'arabic-ra', title: 'ر — رمانة (ডালিম)', icon: 'ر', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-za', title: 'ز — زرافة (জিরাফ)', icon: 'ز', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-sin', title: 'س — سمكة (মাছ)', icon: 'س', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-shin', title: 'ش — شمس (সূর্য)', icon: 'ش', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-sad', title: 'ص — صقر (বাজপাখি)', icon: 'ص', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-dad', title: 'ض — ضفدع (ব্যাঙ)', icon: 'ض', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-arabic-2', title: 'ر–ض Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 3,
        title: 'তোয়া থেকে গাইন',
        subtitle: 'ط ظ ع غ ف ق',
        icon: '🌳',
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        lessons: [
            { id: 'arabic-ta2', title: 'ط — طاووس (ময়ূর)', icon: 'ط', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-zha', title: 'ظ — ظبي (হরিণ)', icon: 'ظ', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-ain', title: 'ع — عصفور (পাখি)', icon: 'ع', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-ghain', title: 'غ — غزال (গজেল)', icon: 'غ', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-fa', title: 'ف — فيل (হাতি)', icon: 'ف', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-qaf', title: 'ق — قط (বিড়াল)', icon: 'ق', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-arabic-3', title: 'ط–ق Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 4,
        title: 'কাফ থেকে ইয়া',
        subtitle: 'ك ل م ن ه و ي',
        icon: '🏆',
        color: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        lessons: [
            { id: 'arabic-kaf', title: 'ك — كلب (কুকুর)', icon: 'ك', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-lam', title: 'ل — ليمون (লেবু)', icon: 'ل', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-mim', title: 'م — موز (কলা)', icon: 'م', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-nun', title: 'ن — نملة (পিঁপড়া)', icon: 'ن', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-ha2', title: 'ه — هرة (বিড়াল)', icon: 'ه', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-waw', title: 'و — وردة (গোলাপ)', icon: 'و', unlocked: false, completed: false, xp: 10 },
            { id: 'arabic-ya', title: 'ي — يمامة (ঘুঘু)', icon: 'ي', unlocked: false, completed: false, xp: 10 },
        ],
        bossQuiz: { id: 'boss-arabic-4', title: 'ك–ي Boss Quiz', unlocked: false, xp: 50 },
    },
    {
        id: 5,
        title: 'হরকত শিখি',
        subtitle: 'فَتْحَة كَسْرَة ضَمَّة',
        icon: '🌟',
        color: 'from-rose-400 to-pink-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        lessons: [
            { id: 'arabic-fatha', title: 'فَتْحَة — আ স্বর', icon: 'فَ', unlocked: false, completed: false, xp: 15 },
            { id: 'arabic-kasra', title: 'كَسْرَة — ই স্বর', icon: 'فِ', unlocked: false, completed: false, xp: 15 },
            { id: 'arabic-damma', title: 'ضَمَّة — উ স্বর', icon: 'فُ', unlocked: false, completed: false, xp: 15 },
        ],
        bossQuiz: { id: 'boss-arabic-5', title: 'চূড়ান্ত Boss Quiz', unlocked: false, xp: 100 },
    },
]

export default function NurseryArabicPage() {
    const [expandedUnit, setExpandedUnit] = useState<number>(1)

    const totalLessons = units.reduce((sum, u) => sum + u.lessons.length, 0)
    const completedLessons = units.reduce((sum, u) => sum + u.lessons.filter(l => l.completed).length, 0)
    const progressPercent = Math.round((completedLessons / totalLessons) * 100)

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white pb-10">

            <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
                    <Link href="/dashboard/student/kids-zone" className="text-gray-400 hover:text-white transition-colors text-sm">
                        ← Kids Zone
                    </Link>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(h => <span key={h} className="text-xl">❤️</span>)}
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                        <span className="text-sm">⚡</span>
                        <span className="text-amber-400 font-bold text-sm">০ XP</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-5">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-linear-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 p-5 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0"
                            style={{ fontFamily: 'Arial' }}
                        >
                            ا
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white">Arabic হরফ</h1>
                            <p className="text-gray-400 text-sm">আলিফ থেকে ইয়া পর্যন্ত</p>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>{completedLessons}/{totalLessons} lesson</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-2.5 rounded-full bg-linear-to-r from-emerald-400 to-teal-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-3">
                    {units.map((unit, unitIdx) => {
                        const isExpanded = expandedUnit === unit.id
                        const isUnitUnlocked = unitIdx === 0
                        const unitCompleted = unit.lessons.filter(l => l.completed).length

                        return (
                            <motion.div key={unit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: unitIdx * 0.08 }}
                            >
                                <button
                                    onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)}
                                    className={`w-full rounded-2xl border ${unit.border} ${unit.bg} p-4 text-left transition-all ${!isUnitUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${unit.color} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                                            {isUnitUnlocked ? unit.icon : '🔒'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-white text-base">{unit.title}</h3>
                                                {!isUnitUnlocked && (
                                                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">🔒 আগের Unit শেষ করো</span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-xs" style={{ direction: 'rtl' }}>{unit.subtitle}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 bg-white/10 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full bg-linear-to-r ${unit.color}`}
                                                        style={{ width: `${(unitCompleted / unit.lessons.length) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">{unitCompleted}/{unit.lessons.length}</span>
                                            </div>
                                        </div>
                                        <span className="text-gray-500 shrink-0 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </button>

                                {isExpanded && isUnitUnlocked && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2 px-2 space-y-2"
                                    >
                                        {unit.lessons.map((lesson, lessonIdx) => (
                                            <motion.div key={lesson.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: lessonIdx * 0.04 }}
                                                className={`flex items-center gap-3 ${lessonIdx % 2 === 0 ? 'ml-2' : 'ml-10'}`}
                                            >
                                                <Link
                                                    href={lesson.unlocked ? `/dashboard/student/kids-zone/nursery/arabic/${lesson.id}` : '#'}
                                                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg shrink-0 ${lesson.completed
                                                            ? `bg-linear-to-br ${unit.color} text-white`
                                                            : lesson.unlocked
                                                                ? `bg-linear-to-br ${unit.color} text-white ring-4 ring-white/20 animate-pulse`
                                                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                    style={{ fontFamily: 'Arial' }}
                                                >
                                                    {lesson.completed ? '✅' : lesson.unlocked ? lesson.icon : '🔒'}
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${lesson.unlocked ? 'text-white' : 'text-gray-500'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <p className="text-xs text-amber-400">⚡ {lesson.xp} XP</p>
                                                </div>
                                                {lesson.completed && (
                                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                                                        সম্পন্ন
                                                    </span>
                                                )}
                                            </motion.div>
                                        ))}

                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: unit.lessons.length * 0.04 }}
                                            className="mt-3"
                                        >
                                            <div className={`rounded-2xl border-2 border-dashed p-4 flex items-center gap-3 ${unit.bossQuiz.unlocked ? 'border-amber-500/50 bg-amber-500/10' : 'border-gray-600 bg-gray-800/30 opacity-50'}`}>
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shrink-0">
                                                    {unit.bossQuiz.unlocked ? '👑' : '🔒'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-sm">{unit.bossQuiz.title}</p>
                                                    <p className="text-xs text-gray-400">সব lesson শেষ করলে unlock হবে</p>
                                                </div>
                                                <span className="text-xs text-amber-400 font-bold shrink-0">⚡ {unit.bossQuiz.xp} XP</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
                >
                    <p className="text-2xl text-emerald-300 mb-1">بِسْمِ اللَّهِ</p>
                    <p className="text-gray-400 text-sm">আল্লাহর নামে শুরু করি! 📖</p>
                </motion.div>
            </div>
        </div>
    )
}