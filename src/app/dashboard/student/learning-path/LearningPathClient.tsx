'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface LessonPlan {
    type: 'islamic' | 'weak_topic' | 'new' | string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    estimated_minutes: number
}

interface LearningPath {
    today_plan: LessonPlan[]
    ai_analysis: string
    motivational_message: string
    total_study_minutes: number
}

interface LearningPathClientProps {
    studentId: string
    studentName: string
    classLevel: string
}

export default function LearningPathClient({
    studentId,
    studentName,
    classLevel,
}: LearningPathClientProps) {
    const router = useRouter()
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [completedItems, setCompletedItems] = useState<number[]>([])

    useEffect(() => {
        const loadLearningPath = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(
                    `/api/ml/learning-path?student_id=${studentId}`
                )
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || 'Learning path লোড করতে সমস্যা হয়েছে')
                    return
                }

                const path = data.learning_path
                setLearningPath({
                    today_plan: path.recommended_lessons || path.today_plan || [],
                    ai_analysis: path.ai_analysis || '',
                    motivational_message: path.motivational_message || '',
                    total_study_minutes: path.total_study_minutes || 0,
                })
            } catch {
                setError('Server এ সমস্যা হয়েছে')
            } finally {
                setIsLoading(false)
            }
        }

        void loadLearningPath()
    }, [studentId])

    const toggleComplete = (index: number) => {
        setCompletedItems((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        )
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 border-red-500/30 text-red-300'
            case 'medium': return 'bg-amber-500/20 border-amber-500/30 text-amber-300'
            case 'low': return 'bg-green-500/20 border-green-500/30 text-green-300'
            default: return 'bg-white/10 border-white/10 text-white/50'
        }
    }

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'জরুরি'
            case 'medium': return 'মাঝারি'
            case 'low': return 'স্বাভাবিক'
            default: return priority
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'islamic': return '🕌'
            case 'weak_topic': return '⚠️'
            case 'new': return '📚'
            default: return '📖'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'islamic': return 'ইসলামিক'
            case 'weak_topic': return 'দুর্বল বিষয়'
            case 'new': return 'নতুন পাঠ'
            default: return type
        }
    }

    const completedCount = completedItems.length
    const totalCount = learningPath?.today_plan.length || 0
    const progressPercent = totalCount > 0
        ? Math.round((completedCount / totalCount) * 100)
        : 0

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/student')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div className="flex-1">
                        <h1 className="text-white font-bold">আজকের Learning Plan</h1>
                        <p className="text-white/40 text-xs">{classLevel} — AI personalized</p>
                    </div>
                    <div className="text-right">
                        <p className="text-violet-300 font-bold">{progressPercent}%</p>
                        <p className="text-white/30 text-xs">সম্পন্ন</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-12 h-12 rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-4"
                            />
                            <p className="text-white/60">AI আজকের plan তৈরি করছে...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <p className="text-4xl mb-3">❌</p>
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : learningPath ? (
                    <>
                        {/* Welcome Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-linear-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-5"
                        >
                            <p className="text-lg font-bold text-white mb-1">
                                আস-সালামু আলাইকুম, {studentName}! 👋
                            </p>
                            {learningPath.motivational_message && (
                                <p className="text-white/60 text-sm">
                                    {learningPath.motivational_message}
                                </p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full bg-linear-to-r from-violet-600 to-purple-600 rounded-full"
                                    />
                                </div>
                                <span className="text-white/40 text-xs flex-shrink:0">
                                    {completedCount}/{totalCount} সম্পন্ন
                                </span>
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'মোট পাঠ', value: totalCount, icon: '📚' },
                                { label: 'সময় লাগবে', value: `${learningPath.total_study_minutes} মিনিট`, icon: '⏱️' },
                                { label: 'সম্পন্ন', value: completedCount, icon: '✅' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
                                >
                                    <p className="text-xl mb-1">{stat.icon}</p>
                                    <p className="text-white font-bold text-sm">{stat.value}</p>
                                    <p className="text-white/40 text-xs">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* AI Analysis */}
                        {learningPath.ai_analysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4"
                            >
                                <p className="text-violet-300 font-semibold text-sm mb-2">
                                    🤖 AI বিশ্লেষণ
                                </p>
                                <p className="text-white/60 text-sm">{learningPath.ai_analysis}</p>
                            </motion.div>
                        )}

                        {/* Today's Plan */}
                        <div className="space-y-3">
                            <h2 className="text-white font-semibold">আজকের পাঠ্যক্রম</h2>
                            {learningPath.today_plan.map((item, index) => {
                                const isCompleted = completedItems.includes(index)
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`bg-white/5 border rounded-2xl p-4 transition ${isCompleted
                                                ? 'border-green-500/30 bg-green-500/5'
                                                : 'border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Checkbox */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => toggleComplete(index)}
                                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink:0 mt-0.5 transition ${isCompleted
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-white/30'
                                                    }`}
                                            >
                                                {isCompleted && <span className="text-xs">✓</span>}
                                            </motion.button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                                                    <span className="text-white/50 text-xs">
                                                        {getTypeLabel(item.type)}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                                                        {getPriorityLabel(item.priority)}
                                                    </span>
                                                    <span className="text-white/30 text-xs ml-auto">
                                                        ⏱️ {item.estimated_minutes} মিনিট
                                                    </span>
                                                </div>
                                                <h3 className={`font-semibold mb-1 ${isCompleted ? 'line-through text-white/40' : 'text-white'}`}>
                                                    {item.title}
                                                </h3>
                                                <p className="text-white/50 text-sm">{item.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Completed Message */}
                        {completedCount === totalCount && totalCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center"
                            >
                                <p className="text-4xl mb-2">🎉</p>
                                <h3 className="text-green-400 font-bold text-lg mb-1">
                                    মাশাআল্লাহ! আজকের সব পাঠ সম্পন্ন!
                                </h3>
                                <p className="text-white/50 text-sm">
                                    আল্লাহ তোমার জ্ঞান বৃদ্ধি করুন। আমিন।
                                </p>
                            </motion.div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    )
}