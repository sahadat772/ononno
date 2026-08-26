'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { useAccess } from '@/hooks/useAccess'
import LockOverlay from '@/components/shared/LockOverlay'

interface Lesson {
    id: string
    title: string
    content: string
    lesson_type: string
    duration_minutes: number
    xp_reward: number
    order_index: number
}

interface Question {
    question: string
    options: string[]
    correct: number
    explanation: string
}

export default function LessonContentPage() {
    const params = useParams()
    const { isPaid, canDoLesson, loading: accessLoading } = useAccess()
    const router = useRouter()
    const classSlug = params.classSlug as string
    const subjectId = params.subjectId as string
    const chapterId = params.chapterId as string
    const lessonId = params.lessonId as string

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [loading, setLoading] = useState(true)
    const [phase, setPhase] = useState<'intro' | 'learn' | 'quiz' | 'result'>('intro')
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [score, setScore] = useState(0)
    const [hearts, setHearts] = useState(3)
    const [showExplanation, setShowExplanation] = useState(false)
    const [xpEarned, setXpEarned] = useState(0)
    const [aiContent, setAiContent] = useState<string>('')
    const [loadingAI, setLoadingAI] = useState(false)
    const [questions, setQuestions] = useState<Question[]>([])

    useEffect(() => {
        const fetchLesson = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('curriculum_lessons')
                .select('*, lesson_contents(main_content, overview, ai_explanation)')
                .eq('id', lessonId)
                .eq('is_published', true)
                .single()
            if (data) { const stored = data.lesson_contents as { main_content?: string; overview?: string; ai_explanation?: string } | null; setLesson({ ...data, lesson_type: "text", content: [stored?.overview, stored?.main_content, stored?.ai_explanation].filter(Boolean).join("\\n\\n") }); }
            setLoading(false)
        }
        fetchLesson()
    }, [lessonId])

    // AI দিয়ে lesson content এবং quiz generate করো
    useEffect(() => {
        if (!lesson || phase !== 'learn') return

        const generateAIContent = async () => {
            setLoadingAI(true)
            try {
                const res = await fetch('/api/lesson-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonTitle: lesson.title,
                        lessonContent: lesson.content,
                        lessonType: lesson.lesson_type,
                    }),
                })
                const data = await res.json()
                if (data.content) setAiContent(data.content)
                if (data.questions) setQuestions(data.questions)
            } catch {
                setAiContent(lesson.content || '')
            } finally {
                setLoadingAI(false)
            }
        }

        generateAIContent()
    }, [lesson, phase])

    const handleAnswer = (optionIndex: number) => {
        if (selectedAnswer !== null) return
        setSelectedAnswer(optionIndex)

        const correct = optionIndex === questions[currentQuestion]?.correct
        setIsCorrect(correct)
        setShowExplanation(true)

        if (correct) {
            setScore(s => s + 1)
        } else {
            setHearts(h => h - 1)
        }
    }

    const handleNext = () => {
        setSelectedAnswer(null)
        setIsCorrect(null)
        setShowExplanation(false)

        if (hearts <= 0) {
            setPhase('result')
            return
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(c => c + 1)
        } else {
            setPhase('result')
            const earned = Math.round((score / questions.length) * (lesson?.xp_reward || 10))
            setXpEarned(earned)
            saveProgress(earned)
        }
    }

    const saveProgress = async (xp: number) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !lesson) return

        const finalScore = Math.round((score / Math.max(questions.length, 1)) * 100)

        await supabase.from('learning_progress').upsert({
            user_id: user.id,
            lesson_id: lessonId,
            chapter_id: chapterId,
            subject_id: subjectId,
            status: finalScore >= 60 ? 'completed' : 'in_progress',
            score: finalScore,
            xp_earned: xp,
            completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' })

        // XP update
        try {
            await supabase.rpc('increment_xp', {
                user_id_input: user.id,
                xp_amount: xp,
            })
        } catch {
            await supabase.from('student_stats').upsert({
                user_id: user.id,
                total_xp: xp,
                current_streak: 1,
                last_activity_date: new Date().toISOString().split('T')[0],
            }, { onConflict: 'user_id' })
        }
    }

    const finalScore = questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : 0

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-5xl"
                >
                    ⚙️
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {!accessLoading && !isPaid && !canDoLesson && (
                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="max-w-md w-full">
                        <LockOverlay type="daily_limit" />
                    </div>
                </div>
            )}
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-2 md:gap-4">
                    <Link
                        href={`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </Link>

                    {/* Progress Bar */}
                    {phase === 'quiz' && (
                        <div className="flex-1">
                            <div className="w-full bg-white/10 rounded-full h-3">
                                <motion.div
                                    animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                                    className="bg-linear-to-r from-violet-500 to-purple-500 h-3 rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Hearts */}
                    {phase === 'quiz' && (
                        <div className="flex gap-1 flex-shrink: 0;">
                            {[...Array(3)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    animate={i >= hearts ? { scale: [1, 1.3, 1] } : {}}
                                    className={`text-xl ${i < hearts ? 'opacity-100' : 'opacity-20'}`}
                                >
                                    ❤️
                                </motion.span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* ========== INTRO PHASE ========== */}
                <AnimatePresence mode="wait">
                    {phase === 'intro' && lesson && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-8xl mb-6"
                            >
                                📖
                            </motion.div>

                            <h1 className="text-3xl font-bold text-white mb-3">{lesson.title}</h1>

                            <div className="flex items-center justify-center gap-4 mb-8 text-sm text-gray-400">
                                <span>⏱️ {lesson.duration_minutes} মিনিট</span>
                                <span>⚡ +{lesson.xp_reward} XP</span>
                                <span>🎯 {lesson.lesson_type}</span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-left">
                                <p className="text-gray-300 leading-relaxed">
                                    এই lesson এ তুমি শিখবে:
                                </p>
                                <div className="mt-3 space-y-2">
                                    {[
                                        'মূল বিষয়বস্তু ভালোভাবে বোঝা',
                                        'AI এর সাহায্যে গভীরভাবে শেখা',
                                        'Quiz দিয়ে নিজেকে যাচাই করা',
                                        `${lesson.xp_reward} XP অর্জন করা`,
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                                            <span className="text-emerald-400">✓</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPhase('learn')}
                                className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold text-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                            >
                                শুরু করি! 🚀
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ========== LEARN PHASE ========== */}
                    {phase === 'learn' && (
                        <motion.div
                            key="learn"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">
                                📖 {lesson?.title}
                            </h2>

                            {loadingAI ? (
                                <div className="text-center py-16">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        className="text-5xl mb-4 inline-block"
                                    >
                                        🤖
                                    </motion.div>
                                    <p className="text-gray-400">AI তোমার জন্য lesson তৈরি করছে...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Content */}
                                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                                        <div className="prose prose-invert max-w-none">
                                            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                                                {aiContent || lesson?.content || 'Content লোড হচ্ছে...'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Points */}
                                    <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-5">
                                        <p className="text-emerald-400 font-bold mb-3">💡 মূল বিষয়</p>
                                        <div className="space-y-2">
                                            {(lesson?.content || '').split('\n').filter(l => l.trim()).slice(0, 3).map((point, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="text-emerald-400 mt-0.5">▸</span>
                                                    <p className="text-gray-300 text-sm">{point}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            if (questions.length > 0) {
                                                setPhase('quiz')
                                            } else {
                                                setPhase('result')
                                                setXpEarned(lesson?.xp_reward || 10)
                                                saveProgress(lesson?.xp_reward || 10)
                                            }
                                        }}
                                        className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-violet-500/30 transition-all"
                                    >
                                        {questions.length > 0 ? 'Quiz শুরু করো! 🎯' : 'সম্পন্ন করো! ✅'}
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ========== QUIZ PHASE ========== */}
                    {phase === 'quiz' && questions.length > 0 && (
                        <motion.div
                            key={`quiz-${currentQuestion}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            {/* Question Counter */}
                            <p className="text-gray-400 text-sm mb-2 text-center">
                                প্রশ্ন {currentQuestion + 1} / {questions.length}
                            </p>

                            {/* Question */}
                            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 mb-6">
                                <p className="text-white text-xl font-bold leading-relaxed">
                                    {questions[currentQuestion]?.question}
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-6">
                                {questions[currentQuestion]?.options.map((option, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                        onClick={() => handleAnswer(i)}
                                        className={`w-full p-4 rounded-2xl border text-left font-semibold transition-all ${selectedAnswer === null
                                            ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white'
                                            : selectedAnswer === i
                                                ? isCorrect
                                                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                                                    : 'border-red-500 bg-red-500/20 text-red-300'
                                                : i === questions[currentQuestion]?.correct && selectedAnswer !== null
                                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                                    : 'border-white/5 bg-white/[0.02] text-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold flex-shrink-0 ${selectedAnswer === null
                                                ? 'border-white/20 text-gray-400'
                                                : selectedAnswer === i
                                                    ? isCorrect ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'
                                                    : 'border-white/10 text-gray-600'
                                                }`}>
                                                {selectedAnswer !== null && selectedAnswer === i
                                                    ? isCorrect ? '✓' : '✗'
                                                    : selectedAnswer !== null && i === questions[currentQuestion]?.correct
                                                        ? '✓'
                                                        : ['A', 'B', 'C', 'D'][i]}
                                            </span>
                                            {option}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Explanation */}
                            <AnimatePresence>
                                {showExplanation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded-2xl p-4 mb-4 ${isCorrect
                                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                                            : 'bg-red-500/10 border border-red-500/20'
                                            }`}
                                    >
                                        <p className={`font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isCorrect ? '🎉 চমৎকার! সঠিক উত্তর!' : '😔 ভুল হয়েছে!'}
                                        </p>
                                        <p className="text-gray-300 text-sm">
                                            {questions[currentQuestion]?.explanation}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Next Button */}
                            {selectedAnswer !== null && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all ${isCorrect
                                        ? 'bg-linear-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                                        : hearts <= 1
                                            ? 'bg-linear-to-r from-red-500 to-rose-500'
                                            : 'bg-linear-to-r from-violet-500 to-purple-500'
                                        }`}
                                >
                                    {currentQuestion < questions.length - 1 ? 'পরের প্রশ্ন →' : 'ফলাফল দেখো 🏆'}
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {/* ========== RESULT PHASE ========== */}
                    {phase === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            {/* Result Icon */}
                            <motion.div
                                animate={{
                                    rotate: finalScore >= 60 ? [0, -10, 10, -10, 0] : [0, 0],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{ duration: 0.5 }}
                                className="text-7xl md:text-9xl mb-4 md:mb-6"
                            >
                                {hearts <= 0 ? '💔' : finalScore >= 80 ? '🏆' : finalScore >= 60 ? '⭐' : '😔'}
                            </motion.div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {hearts <= 0
                                    ? 'আবার চেষ্টা করো!'
                                    : finalScore >= 80
                                        ? 'অসাধারণ!'
                                        : finalScore >= 60
                                            ? 'ভালো করেছো!'
                                            : 'আরো পড়তে হবে!'}
                            </h2>

                            {/* Score */}
                            <div className="grid grid-cols-3 gap-2 md:gap-4 my-6 md:my-8">
                                {[
                                    { label: 'স্কোর', value: `${finalScore}%`, icon: '🎯', color: finalScore >= 60 ? 'text-emerald-400' : 'text-red-400' },
                                    { label: 'সঠিক', value: `${score}/${questions.length}`, icon: '✅', color: 'text-blue-400' },
                                    { label: 'XP অর্জিত', value: `+${xpEarned}`, icon: '⚡', color: 'text-violet-400' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-2xl bg-white/5 border border-white/10 p-4"
                                    >
                                        <div className="text-2xl mb-1">{stat.icon}</div>
                                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                        <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3">
                                {finalScore >= 60 ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push(`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`)}
                                        className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30"
                                    >
                                        পরের Lesson এ যাও →
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setPhase('intro')
                                            setCurrentQuestion(0)
                                            setSelectedAnswer(null)
                                            setIsCorrect(null)
                                            setScore(0)
                                            setHearts(3)
                                            setShowExplanation(false)
                                        }}
                                        className="w-full py-4 rounded-2xl bg-linear-to-r from-violet-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-violet-500/30"
                                    >
                                        🔄 আবার চেষ্টা করো
                                    </motion.button>
                                )}

                                <button
                                    onClick={() => router.push(`/dashboard/student/academic/learn/${classSlug}/${subjectId}/${chapterId}`)}
                                    className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all text-sm"
                                >
                                    অধ্যায়ে ফিরে যাও
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
