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
    chapter_id?: string | null
    lesson_id?: string | null
    status: string
    score?: number
    xp_earned?: number
}

export default function ChapterListPage() {
    const params = useParams()
    const classSlug = params.classSlug as string
    const subjectId = params.subjectId as string

    const [subject, setSubject] = useState<Subject | null>(null)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [progress, setProgress] = useState<LessonProgress[]>([])
    /** chapter_id → published lesson ids */
    const [lessonsByChapter, setLessonsByChapter] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(true)
    const [totalXP, setTotalXP] = useState(0)
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            const { data: sub } = await supabase
                .from('curriculum_subjects')
                .select('*')
                .eq('id', subjectId)
                .single()
            if (sub) setSubject(sub)

            const { data: publishedLessons } = await supabase
                .from('curriculum_lessons')
                .select('id, chapter_id')
                .eq('subject_id', subjectId)
                .eq('is_active', true)
                .eq('is_published', true)

            const byChap: Record<string, string[]> = {}
            for (const l of publishedLessons ?? []) {
                if (!l.chapter_id) continue
                const id = String(l.id)
                if (!byChap[l.chapter_id]) byChap[l.chapter_id] = []
                byChap[l.chapter_id].push(id)
            }
            setLessonsByChapter(byChap)

            const chapterIds = Object.keys(byChap)

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

            // Load ALL user progress (do not filter subject_id — often null on older rows)
            if (user) {
                const { data: prog } = await supabase
                    .from('learning_progress')
                    .select('chapter_id, lesson_id, status, score, xp_earned')
                    .eq('user_id', user.id)

                setProgress(
                    (prog ?? []).map((p) => ({
                        ...p,
                        lesson_id: p.lesson_id != null ? String(p.lesson_id) : null,
                        chapter_id: p.chapter_id != null ? String(p.chapter_id) : null,
                    })),
                )

                const { data: stats } = await supabase
                    .from('student_stats')
                    .select('total_xp, current_streak')
                    .eq('user_id', user.id)
                    .maybeSingle()
                if (stats) {
                    setTotalXP(stats.total_xp ?? 0)
                    setStreak(stats.current_streak ?? 0)
                }
            }

            setLoading(false)
        }
        void fetchData()
    }, [subjectId])

    const completedLessonIds = new Set(
        progress
            .filter((p) => p.status === 'completed' && p.lesson_id)
            .map((p) => String(p.lesson_id)),
    )

    const getChapterProgress = (chapterId: string) => {
        const lessonIds = lessonsByChapter[chapterId] || []
        if (lessonIds.length === 0) return 0
        const done = lessonIds.filter((id) => completedLessonIds.has(String(id))).length
        return Math.round((done / lessonIds.length) * 100)
    }

    const isChapterUnlocked = (index: number) => {
        if (index === 0) return true
        const prevChapter = chapters[index - 1]
        if (!prevChapter) return false
        return getChapterProgress(prevChapter.id) >= 60
    }

    const allLessonIds = Object.values(lessonsByChapter).flat()
    const overallCompleted = allLessonIds.filter((id) => completedLessonIds.has(String(id))).length

    // XP from progress rows for this subject's lessons
    const subjectXp = progress
        .filter((p) => p.lesson_id && allLessonIds.includes(String(p.lesson_id)))
        .reduce((s, p) => s + (Number(p.xp_earned) || 0), 0)

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
                            <span className="text-violet-400 font-bold text-sm">
                                {Math.max(totalXP, subjectXp)} XP
                            </span>
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
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {subject.name_bn || subject.name}
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-gray-400 text-sm">{chapters.length}টি অধ্যায়</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 text-sm">
                                {overallCompleted}/{allLessonIds.length} সম্পন্ন
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
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                        <p className="text-4xl mb-3">📖</p>
                        <p className="font-bold text-white">এখনো published chapter নেই</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter, index) => {
                            const unlocked = isChapterUnlocked(index)
                            const chapterProg = getChapterProgress(chapter.id)
                            const completed = chapterProg >= 100
                            const inProgress = chapterProg > 0 && chapterProg < 100
                            const totalLessons = (lessonsByChapter[chapter.id] || []).length

                            return (
                                <motion.div
                                    key={chapter.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                >
                                    {unlocked ? (
                                        <Link
                                            href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapter.id}`}
                                        >
                                            <div className="rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all cursor-pointer">
                                                <div className="flex gap-4">
                                                    <div
                                                        className={`grid size-14 shrink-0 place-items-center rounded-2xl text-2xl ${
                                                            completed
                                                                ? 'bg-emerald-500/20 border border-emerald-400/40'
                                                                : inProgress
                                                                  ? 'bg-sky-500/20 border border-sky-400/40'
                                                                  : 'bg-white/5 border border-white/10'
                                                        }`}
                                                    >
                                                        {completed ? '✅' : inProgress ? '📖' : chapter.chapter_number}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-lg text-white mb-1">
                                                            {chapter.title_bn || chapter.title}
                                                        </h3>
                                                        {chapter.description && (
                                                            <p className="text-gray-400 text-sm truncate">
                                                                {chapter.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                <span>
                                                                    অগ্রগতি · {totalLessons} পাঠ
                                                                </span>
                                                                <span>{chapterProg}%</span>
                                                            </div>
                                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${chapterProg}%` }}
                                                                    transition={{
                                                                        duration: 0.8,
                                                                        delay: index * 0.1,
                                                                    }}
                                                                    className={`h-2 rounded-full ${
                                                                        completed
                                                                            ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                                                                            : 'bg-linear-to-r from-blue-500 to-cyan-500'
                                                                    }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 opacity-60">
                                            <div className="flex gap-4 items-center">
                                                <div className="grid size-14 place-items-center rounded-2xl bg-white/5 text-2xl">
                                                    🔒
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-600">
                                                        {chapter.title_bn || chapter.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        আগের অধ্যায় ৬০% সম্পন্ন করলে আনলক হবে
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
