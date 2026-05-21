'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import SessionTimeline from '@/components/teacher/SessionTimeline'

interface Student {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
}

interface Session {
    id: string
    login_at: string
    logout_at: string | null
    duration_minutes: number | null
    device_info: string | null
}

interface Summary {
    totalDuration: number
    todayDuration: number
    totalSessions: number
    todaySessionCount: number
}

interface SessionsPageClientProps {
    teacherId: string
    students: Student[]
    selectedStudent: (Student & { class_level: string }) | null
}

export default function SessionsPageClient({
    students,
    selectedStudent,
}: SessionsPageClientProps) {
    const router = useRouter()
    const [currentStudent, setCurrentStudent] = useState<Student | null>(
        selectedStudent
    )
    const [sessions, setSessions] = useState<Session[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        if (!currentStudent) return

        const loadSessions = async () => {
            setIsLoading(true)
            const res = await fetch(
                `/api/student/${currentStudent.id}/sessions?limit=10&page=${page}`
            )
            const data = await res.json()
            if (data.sessions) {
                setSessions(data.sessions)
                setSummary(data.summary)
                setTotalPages(data.pagination.totalPages)
            }
            setIsLoading(false)
        }

        void loadSessions()
    }, [currentStudent, page])

    const handleStudentChange = (studentId: string) => {
        const found = students.find((s) => s.id === studentId) || null
        setCurrentStudent(found)
        setPage(1)
        router.push(`/dashboard/teacher/sessions?studentId=${studentId}`)
    }

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div>
                        <h1 className="text-white font-bold text-sm md:text-base">Session History</h1>
                        <p className="text-white/40 text-xs hidden sm:block">Student এর login/logout tracking</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Student Selector */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <label className="text-white/50 text-sm mb-2 block">
                        Student বেছে নাও
                    </label>
                    <select
                        title="Student বেছে নাও"
                        aria-label="Student বেছে নাও"
                        value={currentStudent?.id || ''}
                        onChange={(e) => handleStudentChange(e.target.value)}
                        className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition"
                    >
                        <option value="">Student বেছে নাও</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.full_name} — {student.email}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Student Info */}
                {currentStudent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center font-bold">
                            {getInitials(currentStudent.full_name)}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white font-semibold">
                                {currentStudent.full_name}
                            </h2>
                            <p className="text-white/40 text-sm">{currentStudent.email}</p>
                        </div>

                        {/* Summary */}
                        {summary && (
                            <div className="flex gap-2 md:gap-4 text-center">
                                <div>
                                    <p className="text-violet-300 font-bold text-sm md:text-base">
                                        {summary.todaySessionCount}
                                    </p>
                                    <p className="text-white/40 text-xs">আজ</p>
                                </div>
                                <div>
                                    <p className="text-violet-300 font-bold text-sm md:text-base">
                                        {summary.totalSessions}
                                    </p>
                                    <p className="text-white/40 text-xs">মোট</p>
                                </div>
                                <div>
                                    <p className="text-violet-300 font-bold text-sm md:text-base">
                                        {summary.todayDuration}
                                    </p>
                                    <p className="text-white/40 text-xs">মিনিট</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Sessions Timeline */}
                {currentStudent ? (
                    <>
                        <SessionTimeline sessions={sessions} isLoading={isLoading} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 disabled:opacity-30 hover:bg-white/10 transition"
                                >
                                    ← আগে
                                </motion.button>
                                <span className="text-white/40 text-sm">
                                    {page} / {totalPages}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 disabled:opacity-30 hover:bg-white/10 transition"
                                >
                                    পরে →
                                </motion.button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                        <p className="text-4xl mb-3">👆</p>
                        <p className="text-white/40">
                            উপরে থেকে একজন Student বেছে নাও
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}