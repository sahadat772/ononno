'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Chapter {
    id: string
    title: string
    title_bn?: string
    chapter_number: number
    description: string
    order_index: number
}

interface Subject {
    id: string
    name: string
    name_bn?: string
    icon: string
    color: string
}

interface LessonProgress {
    chapter_id: string
    status: string
    score: number
}

export default function ChapterListPage() {
    const params = useParams()
    const classSlug = params.classSlug as string
    const subjectId = params.subjectId as string

    const [subject, setSubject] = useState<Subject | null>(null)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [progress, setProgress] = useState<LessonProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [totalXP, setTotalXP] = useState(0)
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            const { data: sub } = await supabase
                .from('curriculum_subjects')
                .select('*')
                .eq('id', subjectId)
                .single()
            if (sub) setSubject(sub)

            // Chapters that have at least one published lesson (or active chapters)
            const { data: publishedLessons } = await supabase
                .from('curriculum_lessons')
                .select('chapter_id')
                .eq('subject_id', subjectId)
                .eq('is_active', true)
                .eq('is_published', true)

            const chapterIds = [
                ...new Set((publishedLessons ?? []).map((l) => l.chapter_id).filter(Boolean)),
            ]

            if (chapterIds.length > 0) {
                const { data: chaps } = await supabase
                    .from('curriculum_chapters')
                    .select('*')
                    .in('id', chapterIds)
                    .eq('is_active', true)
                    .order('order_index')
                if (chaps) setChapters(chaps)
            } else {
                setChapters([])
            }

            if (user) {
                const { data: prog } = await supabase
                    .from('learning_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('subject_id', subjectId)
                if (prog) setProgress(prog)

                const { data: stats } = await supabase
                    .from('student_stats')
                    .select('total_xp, current_streak')
                    .eq('user_id', user.id)
                    .single()
                if (stats) {
                    setTotalXP(stats.total_xp)
                    setStreak(stats.current_streak)
                }
            }

            setLoading(false)
        }
        fetchData()
    }, [subjectId])

    const getChapterProgress = (chapterId: string) => {
        const chapterProgress = progress.filter(p => p.chapter_id === chapterId)
        if (chapterProgress.length === 0) return 0
        const completed = chapterProgress.filter(p => p.status === 'completed').length
        return Math.round((completed / chapterProgress.length) * 100)
    }

    const isChapterUnlocked = (index: number) => {
        if (index === 0) return true
        const prevChapter = chapters[index - 1]
        if (!prevChapter) return false
        return getChapterProgress(prevChapter.id) >= 60
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link
                        href={`/dashboard/student/academic/learn/${classSlug}`}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                            <span>🔥</span>
                            <span className="text-amber-400 font-bold text-sm">{streak}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full px-3 py-1">
                            <span>⚡</span>
                            <span className="text-violet-400 font-bold text-sm">{totalXP} XP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {subject && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className={`w-24 h-24 rounded-3xl bg-linear-to-br ${subject.color || 'from-violet-500 to-purple-600'} flex items-center justify-center text-5xl mx-auto mb-4 shadow-2xl`}
                        >
                            {subject.icon || '📚'}
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">{subject.name_bn || subject.name}</h1>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-gray-400 text-sm">{chapters.length}টি অধ্যায়</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 text-sm">
                                {progress.filter(p => p.status === 'completed').length} সম্পন্ন
                            </span>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="space-y-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-3xl bg-white/5 p-6 animate-pulse h-28" />
                        ))}
                    </div>
                ) : chapters.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-white font-bold text-xl mb-2">অধ্যায় শীঘ্রই আসছে</h3>
                        <p className="text-gray-400 text-sm">Admin এখনো published lesson যোগ করেননি</p>
                        <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left max-w-sm mx-auto">
                            <p className="text-blue-400 text-sm font-semibold mb-2">💡 Admin workflow:</p>
                            <p className="text-gray-400 text-xs">
                                Lessons → Review → Generate (1) → Approve → Publish
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-white/20 via-white/10 to-transparent -translate-x-1/2 hidden md:block" />

                        <div className="space-y-6">
                            {chapters.map((chapter, index) => {
                                const chapterProg = getChapterProgress(chapter.id)
                                const unlocked = isChapterUnlocked(index)
                                const completed = chapterProg >= 100
                                const inProgress = chapterProg > 0 && chapterProg < 100

                                return (
                                    <motion.div
                                        key={chapter.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative ${index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2'}`}
                                    >
                                        <Link
                                            href={unlocked ? `/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapter.id}` : '#'}
                                        >
                                            <motion.div
                                                whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                                                whileTap={unlocked ? { scale: 0.97 } : {}}
                                                className={`rounded-3xl border p-5 transition-all duration-300 ${!unlocked
                                                        ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                                                        : completed
                                                            ? 'border-emerald-500/40 bg-emerald-500/10 cursor-pointer'
                                                            : inProgress
                                                                ? 'border-blue-500/40 bg-blue-500/10 cursor-pointer'
                                                                : 'border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg ${!unlocked
                                                            ? 'bg-white/5 text-gray-600'
                                                            : completed
                                                                ? 'bg-linear-to-br from-emerald-500 to-teal-500'
                                                                : inProgress
                                                                    ? 'bg-linear-to-br from-blue-500 to-cyan-500'
                                                                    : 'bg-linear-to-br from-violet-500 to-purple-500'
                                                        }`}>
                                                        {!unlocked ? '🔒' : completed ? '✅' : inProgress ? '📖' : chapter.chapter_number}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className="text-xs text-gray-500">
                                                                অধ্যায় {chapter.chapter_number}
                                                            </span>
                                                            {completed && (
                                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                                                    ✅ সম্পন্ন
                                                                </span>
                                                            )}
                                                            {inProgress && (
                                                                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                                                                    📖 চলছে
                                                                </span>
                                                            )}
                                                            {!unlocked && (
                                                                <span className="text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded-full">
                                                                    🔒 locked
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className={`font-bold text-lg mb-1 ${!unlocked ? 'text-gray-600' : 'text-white'}`}>
                                                            {chapter.title_bn || chapter.title}
                                                        </h3>
                                                        {chapter.description && (
                                                            <p className="text-gray-400 text-sm truncate">{chapter.description}</p>
                                                        )}

                                                        {unlocked && (
                                                            <div className="mt-2">
                                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                    <span>অগ্রগতি</span>
                                                                    <span>{chapterProg}%</span>
                                                                </div>
                                                                <div className="w-full bg-white/10 rounded-full h-2">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${chapterProg}%` }}
                                                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                                                        className={`h-2 rounded-full ${completed
                                                                                ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                                                                                : 'bg-linear-to-r from-blue-500 to-cyan-500'
                                                                            }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {unlocked && (
                                                        <span className="text-gray-400 text-xl flex-shrink-0">→</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </Link>

                                        {!unlocked && index > 0 && (
                                            <p className="text-center text-xs text-gray-600 mt-2">
                                                আগের অধ্যায়ে ৬০% পেলে unlock হবে
                                            </p>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
