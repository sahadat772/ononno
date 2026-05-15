'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProgressChart from '@/components/teacher/ProgressChart'
import SessionTimeline from '@/components/teacher/SessionTimeline'
import { useRealtimeProgress } from '@/hooks/useRealtimeProgress'

interface Student {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    class_level: string
}

interface Session {
    id: string
    login_at: string
    logout_at: string | null
    duration_minutes: number | null
    device_info: string | null
}

interface ProgressPageClientProps {
    student: Student
    teacherId: string
}

export default function ProgressPageClient({
    student,
}: ProgressPageClientProps) {
    const router = useRouter()
    const { progress, recentActivity, isLoading } = useRealtimeProgress(student.id)
    const [sessions, setSessions] = useState<Session[]>([])
    const [sessionsLoading, setSessionsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'progress' | 'sessions' | 'activity'>('progress')
    // এটা দিয়ে replace করো
    const weeklyData = useMemo(() => {
        const days = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র']
        return days.map((day, index) => {
            const date = new Date()
            const dayOfWeek = date.getDay()
            const diff = index - dayOfWeek
            date.setDate(date.getDate() + diff)
            date.setHours(0, 0, 0, 0)
            const nextDate = new Date(date)
            nextDate.setDate(nextDate.getDate() + 1)
            const dayLessons = recentActivity.filter((a) => {
                const actDate = new Date(a.created_at)
                return actDate >= date && actDate < nextDate && a.action === 'lesson_complete'
            }).length
            return { day, lessons: dayLessons, minutes: 0 }
        })
    }, [recentActivity])

    const subjectData = useMemo(() => {
        const breakdown: Record<string, { total: number; completed: number }> = {}
        progress.forEach((p) => {
            const subject = (p as { class_lessons?: { chapters?: { subjects?: { name?: string } } } }).class_lessons?.chapters?.subjects?.name
            if (subject) {
                if (!breakdown[subject]) breakdown[subject] = { total: 0, completed: 0 }
                breakdown[subject].total++
                if (p.status === 'completed') breakdown[subject].completed++
            }
        })
        return Object.entries(breakdown).map(([subject, data]) => ({ subject, ...data }))
    }, [progress])

    // Sessions fetch
    useEffect(() => {
        const loadSessions = async () => {
            setSessionsLoading(true)
            const res = await fetch(`/api/student/${student.id}/sessions?limit=20`)
            const data = await res.json()
            if (data.sessions) {
                setSessions(data.sessions)
            }
            setSessionsLoading(false)
        }
        void loadSessions()
    }, [student.id])


    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

    const completedCount = progress.filter((p) => p.status === 'completed').length
    const totalCount = progress.length
    const progressPercent = totalCount > 0
        ? Math.round((completedCount / totalCount) * 100)
        : 0

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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center font-bold text-sm">
                            {student.avatar_url ? (
                                <Image
                                    src={student.avatar_url ?? ''}
                                    alt={student.full_name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                getInitials(student.full_name)
                            )}
                        </div>
                        <div>
                            <h1 className="text-white font-bold">{student.full_name}</h1>
                            <p className="text-white/40 text-xs">{student.class_level}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'মোট Lesson', value: totalCount, icon: '📚' },
                        { label: 'সম্পন্ন', value: completedCount, icon: '✅' },
                        { label: 'অগ্রগতি', value: `${progressPercent}%`, icon: '📈' },
                    ].map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                        >
                            <p className="text-2xl mb-1">{card.icon}</p>
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                            <p className="text-white/40 text-xs">{card.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
                    {[
                        { key: 'progress', label: '📊 Progress' },
                        { key: 'sessions', label: '🕐 Sessions' },
                        { key: 'activity', label: '📝 Activity' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab.key
                                ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white'
                                : 'text-white/50 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'progress' && (
                        <ProgressChart
                            weeklyData={weeklyData}
                            subjectData={subjectData}
                            isLoading={isLoading}
                        />
                    )}

                    {activeTab === 'sessions' && (
                        <SessionTimeline
                            sessions={sessions}
                            isLoading={sessionsLoading}
                        />
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse h-16"
                                    />
                                ))
                            ) : recentActivity.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                    <p className="text-4xl mb-3">📭</p>
                                    <p className="text-white/40">কোনো activity নেই</p>
                                </div>
                            ) : (
                                recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                                    >
                                        <span className="text-2xl">
                                            {activity.action === 'lesson_complete' ? '✅' :
                                                activity.action === 'lesson_start' ? '▶️' :
                                                    activity.action === 'quiz_attempt' ? '📝' : '📌'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">
                                                {activity.action === 'lesson_complete' ? 'Lesson সম্পন্ন' :
                                                    activity.action === 'lesson_start' ? 'Lesson শুরু' :
                                                        activity.action === 'quiz_attempt' ? 'Quiz দিয়েছে' :
                                                            activity.action}
                                            </p>
                                            <p className="text-white/40 text-xs">
                                                {new Date(activity.created_at).toLocaleString('bn-BD')}
                                            </p>
                                        </div>
                                        {activity.metadata?.score !== undefined && (
                                            <span className="text-violet-300 font-bold">
                                                {String(activity.metadata.score)}%
                                            </span>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}