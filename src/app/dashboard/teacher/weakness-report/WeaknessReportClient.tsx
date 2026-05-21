'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Student {
    id: string
    full_name: string
    email: string
}

interface WeaknessAnalysis {
    weak_topics: string[]
    strong_topics: string[]
    weak_subjects: string[]
    strong_subjects: string[]
    ai_suggestion: string
    predicted_next_score: string
    study_plan: string[]
    priority_lessons: string[]
}

interface WeaknessReportClientProps {
    students: Student[]
}

export default function WeaknessReportClient({
    students,
}: WeaknessReportClientProps) {
    const router = useRouter()
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const analyzeStudent = async (student: Student) => {
        setSelectedStudent(student)
        setAnalysis(null)
        setError(null)
        setIsLoading(true)

        try {
            const res = await fetch('/api/ml/analyze-weakness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: student.id }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'বিশ্লেষণ করতে সমস্যা হয়েছে')
                return
            }

            setAnalysis(data.analysis)
        } catch {
            setError('Server এ সমস্যা হয়েছে')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/teacher')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div>
                        <h1 className="text-white font-bold text-sm md:text-base">Weakness Report</h1>
                        <p className="text-white/40 text-xs hidden sm:block">AI দিয়ে student এর দুর্বলতা বিশ্লেষণ</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Student List */}
                    <div className="space-y-3">
                        <h2 className="text-white font-semibold mb-4">Students</h2>
                        {students.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <p className="text-4xl mb-2">👨‍🎓</p>
                                <p className="text-white/40 text-sm">কোনো student নেই</p>
                            </div>
                        ) : (
                            students.map((student) => (
                                <motion.button
                                    key={student.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => void analyzeStudent(student)}
                                    className={`w-full text-left p-4 rounded-2xl border transition ${selectedStudent?.id === student.id
                                        ? 'bg-violet-600/20 border-violet-500/50'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink:0">
                                            {student.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {student.full_name}
                                            </p>
                                            <p className="text-white/40 text-xs truncate">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>

                    {/* Analysis Panel */}
                    <div className="md:col-span-2">
                        {!selectedStudent ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                                <p className="text-4xl mb-3">👈</p>
                                <p className="text-white/40">
                                    বাম দিক থেকে একজন student বেছে নাও
                                </p>
                            </div>
                        ) : isLoading ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-12 h-12 rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-4"
                                />
                                <p className="text-white/60">
                                    AI বিশ্লেষণ করছে...
                                </p>
                                <p className="text-white/30 text-sm mt-1">
                                    {selectedStudent.full_name} এর data দেখছি
                                </p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                                <p className="text-4xl mb-3">❌</p>
                                <p className="text-red-400">{error}</p>
                            </div>
                        ) : analysis ? (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Student Header */}
                                    <div className="bg-linear-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center font-bold">
                                            {selectedStudent.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">
                                                {selectedStudent.full_name}
                                            </h3>
                                            <p className="text-violet-300 text-sm">
                                                পূর্বাভাসিত পরবর্তী স্কোর: {analysis.predicted_next_score}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Weak & Strong Topics */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                            <h4 className="text-red-400 font-semibold mb-3">
                                                ⚠️ দুর্বল বিষয়
                                            </h4>
                                            <div className="space-y-2">
                                                {analysis.weak_topics.map((topic, i) => (
                                                    <p key={i} className="text-white/70 text-sm flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink:0" />
                                                        {topic}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                            <h4 className="text-green-400 font-semibold mb-3">
                                                ✅ শক্তিশালী বিষয়
                                            </h4>
                                            <div className="space-y-2">
                                                {analysis.strong_topics.map((topic, i) => (
                                                    <p key={i} className="text-white/70 text-sm flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink:0" />
                                                        {topic}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Suggestion */}
                                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
                                        <h4 className="text-violet-300 font-semibold mb-2">
                                            🤖 AI পরামর্শ
                                        </h4>
                                        <p className="text-white/70 text-sm">{analysis.ai_suggestion}</p>
                                    </div>

                                    {/* Study Plan */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <h4 className="text-white font-semibold mb-3">
                                            📅 Study Plan
                                        </h4>
                                        <div className="space-y-2">
                                            {analysis.study_plan.map((plan, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 text-xs flex items-center justify-center flex-shrink:0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-white/70 text-sm">{plan}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Priority Lessons */}
                                    {analysis.priority_lessons.length > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                            <h4 className="text-amber-300 font-semibold mb-3">
                                                🎯 Priority Lessons
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.priority_lessons.map((lesson, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                    >
                                                        {lesson}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}