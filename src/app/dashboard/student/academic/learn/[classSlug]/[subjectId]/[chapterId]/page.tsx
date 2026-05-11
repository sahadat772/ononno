'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Lesson {
    id: string
    title: string
    lesson_type: string
    duration_minutes: number
    xp_reward: number
    order_index: number
}

interface Chapter {
    id: string
    title: string
    chapter_number: number
}

interface LessonProgress {
    lesson_id: string
    status: string
    score: number
    xp_earned: number
}

const lessonTypeIcons: Record<string, string> = {
    text: '📖',
    video: '🎥',
    quiz: '🧪',
    exercise: '✏️',
    revision: '🔄',
    game: '🎮',
}

const lessonTypeLabels: Record<string, string> = {
    text: 'পাঠ',
    video: 'ভিডিও',
    quiz: 'কুইজ',
    exercise: 'অনুশীলন',
    revision: 'রিভিশন',
    game: 'গেম',
}

export default function LessonListPage() {
    const params = useParams()
    const classSlug = params.classSlug as string
    const subjectId = params.subjectId as string
    const chapterId = params.chapterId as string

    const [chapter, setChapter] = useState<Chapter | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [progress, setProgress] = useState<LessonProgress[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // Chapter আনো
            const { data: chap } = await supabase
                .from('chapters')
                .select('*')
                .eq('id', chapterId)
                .single()
            if (chap) setChapter(chap)

            // Lessons আনো
            const { data: lsns } = await supabase
                .from('class_lessons')
                .select('*')
                .eq('chapter_id', chapterId)
                .eq('is_active', true)
                .order('order_index')
            if (lsns) setLessons(lsns)

            // Progress আনো
            if (user) {
                const { data: prog } = await supabase
                    .from('learning_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('chapter_id', chapterId)
                if (prog) setProgress(prog)
            }

            setLoading(false)
        }
        fetchData()
    }, [chapterId])

    const getLessonProgress = (lessonId: string) => {
        return progress.find(p => p.lesson_id === lessonId)
    }

    const isLessonUnlocked = (index: number) => {
        if (index === 0) return true
        const prevLesson = lessons[index - 1]
        if (!prevLesson) return false
        const prevProgress = getLessonProgress(prevLesson.id)
        return prevProgress?.status === 'completed'
    }

    const completedCount = progress.filter(p => p.status === 'completed').length
    const totalXPEarned = progress.reduce((sum, p) => sum + (p.xp_earned || 0), 0)

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link
                        href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}`}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        ← ফিরে যাও
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-full">
                            ⚡ {totalXPEarned} XP অর্জিত
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Chapter Header */}
                {chapter && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="rounded-3xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-6">
                            <p className="text-gray-400 text-sm mb-1">অধ্যায় {chapter.chapter_number}</p>
                            <h1 className="text-2xl font-bold text-white mb-4">{chapter.title}</h1>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'মোট lesson', value: lessons.length, icon: '📚' },
                                    { label: 'সম্পন্ন', value: completedCount, icon: '✅' },
                                    { label: 'XP অর্জিত', value: totalXPEarned, icon: '⚡' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-3 text-center">
                                        <div className="text-xl mb-1">{stat.icon}</div>
                                        <div className="text-white font-bold">{stat.value}</div>
                                        <div className="text-gray-500 text-xs">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Overall Progress */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>অগ্রগতি</span>
                                    <span>{lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Lessons — Duolingo Style */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white/5 p-5 animate-pulse h-24" />
                        ))}
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-white font-bold text-xl mb-2">Lesson শীঘ্রই আসছে</h3>
                        <p className="text-gray-400 text-sm">Admin এখনো lesson যোগ করেননি</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lessons.map((lesson, index) => {
                            const lessonProg = getLessonProgress(lesson.id)
                            const unlocked = isLessonUnlocked(index)
                            const completed = lessonProg?.status === 'completed'
                            const inProgress = lessonProg?.status === 'in_progress'

                            return (
                                <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={unlocked
                                            ? `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/${lesson.id}`
                                            : '#'
                                        }
                                    >
                                        <motion.div
                                            whileHover={unlocked ? { x: 4 } : {}}
                                            whileTap={unlocked ? { scale: 0.98 } : {}}
                                            className={`rounded-2xl border p-4 transition-all flex items-center gap-4 ${!unlocked
                                                    ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                                                    : completed
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20'
                                                        : inProgress
                                                            ? 'border-blue-500/30 bg-blue-500/10 cursor-pointer hover:bg-blue-500/20'
                                                            : 'border-white/10 bg-white/5 cursor-pointer hover:bg-white/10'
                                                }`}
                                        >
                                            {/* Status Icon */}
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${!unlocked
                                                    ? 'bg-white/5'
                                                    : completed
                                                        ? 'bg-emerald-500/20'
                                                        : inProgress
                                                            ? 'bg-blue-500/20'
                                                            : 'bg-white/10'
                                                }`}>
                                                {!unlocked ? '🔒' : completed ? '⭐' : lessonTypeIcons[lesson.lesson_type] || '📖'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${completed
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-white/10 text-gray-400'
                                                        }`}>
                                                        {lessonTypeLabels[lesson.lesson_type] || 'পাঠ'}
                                                    </span>
                                                    {completed && lessonProg?.score && (
                                                        <span className="text-xs text-amber-400">
                                                            ⭐ {lessonProg.score}%
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold ${!unlocked ? 'text-gray-600' : 'text-white'}`}>
                                                    {lesson.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        ⏱️ {lesson.duration_minutes} মিনিট
                                                    </span>
                                                    <span className="text-xs text-violet-400">
                                                        ⚡ +{lesson.xp_reward} XP
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Arrow/Status */}
                                            {unlocked && (
                                                <div className="flex-shrink-0">
                                                    {completed ? (
                                                        <span className="text-2xl">✅</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xl">→</span>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            )
                        })}

                        {/* Revision & Exam at the end */}
                        {completedCount === lessons.length && lessons.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-6 space-y-3"
                            >
                                {/* Revision */}
                                <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/revision`}>
                                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-4 cursor-pointer hover:bg-amber-500/20 transition-all">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
                                            🔄
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">রিভিশন</h3>
                                            <p className="text-amber-300/70 text-sm">সব lesson এর সারসংক্ষেপ</p>
                                        </div>
                                        <span className="text-amber-400">→</span>
                                    </div>
                                </Link>

                                {/* Chapter Exam */}
                                <Link href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}/exam`}>
                                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-4 cursor-pointer hover:bg-rose-500/20 transition-all">
                                        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-2xl">
                                            📝
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">অধ্যায় পরীক্ষা</h3>
                                            <p className="text-rose-300/70 text-sm">এই অধ্যায়ের পরীক্ষা দাও</p>
                                        </div>
                                        <span className="text-rose-400">→</span>
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}