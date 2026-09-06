'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const units = [
    {
        id: 1,
        title: 'স্বরবর্ণ',
        subtitle: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ',
        icon: '🌱',
        color: 'from-blue-400 to-cyan-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        lessons: [
            { id: 'swarabarna-a', title: 'অ — অজগর', icon: 'অ', xp: 10 },
            { id: 'swarabarna-aa', title: 'আ — আম', icon: 'আ', xp: 10 },
            { id: 'swarabarna-i', title: 'ই — ইলিশ', icon: 'ই', xp: 10 },
            { id: 'swarabarna-ii', title: 'ঈ — ঈগল', icon: 'ঈ', xp: 10 },
            { id: 'swarabarna-u', title: 'উ — উট', icon: 'উ', xp: 10 },
            { id: 'swarabarna-uu', title: 'ঊ — ঊষা', icon: 'ঊ', xp: 10 },
            { id: 'swarabarna-ri', title: 'ঋ — ঋষি', icon: 'ঋ', xp: 10 },
            { id: 'swarabarna-e', title: 'এ — একতারা', icon: 'এ', xp: 10 },
            { id: 'swarabarna-oi', title: 'ঐ — ঐরাবত', icon: 'ঐ', xp: 10 },
            { id: 'swarabarna-o', title: 'ও — ওল', icon: 'ও', xp: 10 },
            { id: 'swarabarna-ou', title: 'ঔ — ঔষধ', icon: 'ঔ', xp: 10 },
        ],
        bossQuiz: { id: 'boss-swarabarna', title: 'স্বরবর্ণ Boss Quiz', xp: 50 },
    },
    {
        id: 2,
        title: 'ব্যঞ্জনবর্ণ — Part 1',
        subtitle: 'ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ',
        icon: '🌿',
        color: 'from-violet-400 to-purple-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30',
        lessons: [
            { id: 'banjanbarna-ka', title: 'ক — কলা', icon: 'ক', xp: 10 },
            { id: 'banjanbarna-kha', title: 'খ — খরগোশ', icon: 'খ', xp: 10 },
            { id: 'banjanbarna-ga', title: 'গ — গরু', icon: 'গ', xp: 10 },
            { id: 'banjanbarna-gha', title: 'ঘ — ঘড়ি', icon: 'ঘ', xp: 10 },
            { id: 'banjanbarna-nga', title: 'ঙ — বাংলা', icon: 'ঙ', xp: 10 },
            { id: 'banjanbarna-cha', title: 'চ — চাঁদ', icon: 'চ', xp: 10 },
            { id: 'banjanbarna-chha', title: 'ছ — ছাগল', icon: 'ছ', xp: 10 },
            { id: 'banjanbarna-ja', title: 'জ — জাম', icon: 'জ', xp: 10 },
            { id: 'banjanbarna-jha', title: 'ঝ — ঝড়', icon: 'ঝ', xp: 10 },
            { id: 'banjanbarna-nya', title: 'ঞ — মিঞা', icon: 'ঞ', xp: 10 },
            { id: 'banjanbarna-ta', title: 'ট — টমেটো', icon: 'ট', xp: 10 },
            { id: 'banjanbarna-tha', title: 'ঠ — ঠোঁট', icon: 'ঠ', xp: 10 },
            { id: 'banjanbarna-da', title: 'ড — ডাব', icon: 'ড', xp: 10 },
            { id: 'banjanbarna-dha', title: 'ঢ — ঢোল', icon: 'ঢ', xp: 10 },
            { id: 'banjanbarna-na', title: 'ণ — মণি', icon: 'ণ', xp: 10 },
        ],
        bossQuiz: { id: 'boss-banjanbarna-1', title: 'ব্যঞ্জনবর্ণ Part 1 Boss Quiz', xp: 50 },
    },
    {
        id: 3,
        title: 'ব্যঞ্জনবর্ণ — Part 2',
        subtitle: 'ত থ দ ধ ন প ফ ব ভ ম ',
        icon: '🌳',
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        lessons: [
            { id: 'banjanbarna2-ta', title: 'ত — তরমুজ', icon: 'ত', xp: 10 },
            { id: 'banjanbarna2-da', title: 'থ — থালা', icon: 'থ', xp: 10 },
            { id: 'banjanbarna2-dha', title: 'দ — দরজা', icon: 'দ', xp: 10 },
            { id: 'banjanbarna2-dhha', title: 'ধ — ধান', icon: 'ধ', xp: 10 },
            { id: 'banjanbarna2-na', title: 'ন — নৌকা', icon: 'ন', xp: 10 },
            { id: 'banjanbarna2-pa', title: 'প — পাখি', icon: 'প', xp: 10 },
            { id: 'banjanbarna2-pha', title: 'ফ — ফুল', icon: 'ফ', xp: 10 },
            { id: 'banjanbarna2-ba', title: 'ব — বাঘ', icon: 'ব', xp: 10 },
            { id: 'banjanbarna2-bha', title: 'ভ — ভালুক', icon: 'ভ', xp: 10 },
            { id: 'banjanbarna2-ma', title: 'ম — মাছ', icon: 'ম', xp: 10 },
        ],
        bossQuiz: { id: 'boss-banjanbarna-2', title: 'ব্যঞ্জনবর্ণ Part 2 Boss Quiz', xp: 50 },
    },
    {
        id: 4,
        title: 'ব্যঞ্জনবর্ণ — Part 3',
        subtitle: 'য র ল ষ শ স হ ড় ঢ় য় ৎ',
        icon: '🏆',
        color: 'from-rose-400 to-pink-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        lessons: [
            { id: 'banjanbarna3-ya', title: 'য — যাত্রী', icon: 'য', xp: 10 },
            { id: 'banjanbarna3-ra', title: 'র — রকেট', icon: 'র', xp: 10 },
            { id: 'banjanbarna3-la', title: 'ল — লাল', icon: 'ল', xp: 10 },
            { id: 'banjanbarna3-sha2', title: 'ষ — ষাঁড়', icon: 'ষ', xp: 10 },
            { id: 'banjanbarna3-sha', title: 'শ — শাপলা', icon: 'শ', xp: 10 },
            { id: 'banjanbarna3-sa', title: 'স — সাপ', icon: 'স', xp: 10 },
            { id: 'banjanbarna3-ha', title: 'হ — হাতি', icon: 'হ', xp: 10 },
            { id: 'banjanbarna3-rra', title: 'ড় — গাড়ি', icon: 'ড়', xp: 10 },
            { id: 'banjanbarna3-rha', title: 'ঢ় — ঢেঁড়স', icon: 'ঢ়', xp: 10 },
            { id: 'banjanbarna3-yya', title: 'য় — যায়', icon: 'য়', xp: 10 },
            { id: 'banjanbarna3-kha', title: 'ৎ — উৎস', icon: 'ৎ', xp: 10 },
        ],
        bossQuiz: { id: 'boss-banjanbarna-3', title: 'ব্যঞ্জনবর্ণ Part 3 Boss Quiz', xp: 50 },
    },
    {
        id: 5,
        title: 'যুক্তবর্ণ',
        subtitle: 'ক্ষ জ্ঞ ত্র শ্র ং ঃ  ঁ',
        icon: '🌟',
        color: 'from-emerald-400 to-teal-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        lessons: [
            { id: 'bishesh-anuswara', title: 'ং — বাংলা', icon: 'ং', xp: 10 },
            { id: 'bishesh-visarga', title: 'ঃ — দুঃখ', icon: 'ঃ', xp: 10 },
            { id: 'bishesh-chandrabindu', title: 'ঁ — চাঁদ', icon: 'ঁ', xp: 10 },
            { id: 'jukta-ksha', title: 'ক্ষ — ক্ষমা', icon: 'ক্ষ', xp: 15 },
            { id: 'jukta-gya', title: 'জ্ঞ — জ্ঞান', icon: 'জ্ঞ', xp: 15 },
            { id: 'jukta-tra', title: 'ত্র — ত্রিকোণ', icon: 'ত্র', xp: 15 },
            { id: 'jukta-shra', title: 'শ্র — শ্রম', icon: 'শ্র', xp: 15 },
            { id: 'jukta-review', title: 'সব বর্ণ রিভিশন', icon: '🔄', xp: 20 },
        ],
        bossQuiz: { id: 'boss-jukta', title: 'চূড়ান্ত Boss Quiz', xp: 100 },
    },
]

type Progress = Record<string, { completed: boolean; stars: number }>

export default function NurseryBanglaPage() {
    const [expandedUnit, setExpandedUnit] = useState<number>(1)
    const [progress, setProgress] = useState<Progress>({})
    const [totalXp, setTotalXp] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProgress() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data } = await supabase
                    .from('learning_progress')
                    .select('lesson_id, completed, stars, score')
                    .eq('user_id', user.id)
                if (data) {
                    const progressMap: Progress = {}
                    let xpTotal = 0
                    data.forEach((row) => {
                        progressMap[row.lesson_id] = { completed: row.completed, stars: row.stars || 0 }
                        xpTotal += row.score || 0
                    })
                    setProgress(progressMap)
                    setTotalXp(xpTotal)
                }
            } catch (e) {
                console.error('Progress load failed:', e)
            } finally {
                setLoading(false)
            }
        }
        void loadProgress()
    }, [])

    function isLessonUnlocked(unitIdx: number, lessonIdx: number): boolean {
        if (unitIdx === 0 && lessonIdx === 0) return true
        if (lessonIdx > 0) {
            const prevLesson = units[unitIdx].lessons[lessonIdx - 1]
            return progress[prevLesson.id]?.completed === true
        }
        if (unitIdx > 0) {
            const prevUnit = units[unitIdx - 1]
            const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1]
            return progress[lastLesson.id]?.completed === true
        }
        return false
    }

    const totalLessons = units.reduce((sum, u) => sum + u.lessons.length, 0)
    const completedLessons = Object.values(progress).filter(p => p.completed).length
    const progressPercent = Math.round((completedLessons / totalLessons) * 100)

    return (
        <KidsZoneShell title="বাংলা" subtitle="বর্ণমালা শিখি" emoji="🔤" stars={totalXp}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-5 mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0">অ</div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white">বাংলা বর্ণমালা</h1>
                            <p className="text-gray-400 text-sm">স্বরবর্ণ থেকে যুক্তবর্ণ</p>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>{completedLessons}/{totalLessons} lesson</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {units.map((unit, unitIdx) => {
                            const isExpanded = expandedUnit === unit.id
                            const isUnitUnlocked = isLessonUnlocked(unitIdx, 0)
                            const unitCompleted = unit.lessons.filter(l => progress[l.id]?.completed).length
                            return (
                                <div key={unit.id}>
                                    <button
                                        type="button"
                                        onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)}
                                        className={`w-full rounded-2xl border ${unit.border} ${unit.bg} p-4 text-left ${!isUnitUnlocked ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${unit.color} flex items-center justify-center text-2xl shrink-0`}>
                                                {isUnitUnlocked ? unit.icon : '🔒'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white">{unit.title}</h3>
                                                <p className="text-gray-400 text-xs truncate">{unit.subtitle}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full bg-gradient-to-r ${unit.color}`} style={{ width: `${(unitCompleted / unit.lessons.length) * 100}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-400">{unitCompleted}/{unit.lessons.length}</span>
                                                </div>
                                            </div>
                                            <span className="text-gray-500 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </button>
                                    {isExpanded && isUnitUnlocked && (
                                        <div className="mt-2 px-2 space-y-2">
                                            {unit.lessons.map((lesson, lessonIdx) => {
                                                const isCompleted = progress[lesson.id]?.completed === true
                                                const isUnlocked = isLessonUnlocked(unitIdx, lessonIdx)
                                                const stars = progress[lesson.id]?.stars || 0
                                                return (
                                                    <div key={lesson.id} className={`flex items-center gap-3 ${lessonIdx % 2 === 0 ? 'ml-2' : 'ml-8'}`}>
                                                        <Link
                                                            href={isUnlocked ? `/dashboard/student/kids-zone/nursery/bangla/${lesson.id}` : '#'}
                                                            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${
                                                                isCompleted ? `bg-gradient-to-br ${unit.color} text-white`
                                                                : isUnlocked ? `bg-gradient-to-br ${unit.color} text-white ring-4 ring-white/20`
                                                                : 'bg-gray-700/50 text-gray-500'
                                                            }`}
                                                        >
                                                            {isCompleted ? '✅' : isUnlocked ? lesson.icon : '🔒'}
                                                        </Link>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{lesson.title}</p>
                                                            <p className="text-xs text-amber-400">⚡ {lesson.xp} XP{stars > 0 ? ` · ${'⭐'.repeat(stars)}` : ''}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                    <p className="text-emerald-300 font-semibold mb-1">💡 মনে রেখো!</p>
                    <p className="text-gray-400 text-sm">একটা lesson শেষ করলে পরেরটা unlock হবে।</p>
                </div>
        </KidsZoneShell>
    )
}
