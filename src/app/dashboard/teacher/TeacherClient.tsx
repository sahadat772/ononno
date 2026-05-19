'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import StudentCard from '@/components/teacher/StudentCard'
import NotificationBell from '@/components/teacher/NotificationBell'
import CreateAccountForm from '@/components/shared/CreateAccountForm'

interface Teacher {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
}

interface Student {
    id: string
    full_name: string
    email: string
    class_level: string
    avatar_url: string | null
    lastSession?: {
        login_at: string
        duration_minutes: number | null
    } | null
    completedLessons?: number
    totalLessons?: number
}

interface Stats {
    totalStudents: number
    activeToday: number
    totalLessonsCompleted: number
    avgDuration: number
}

interface TeacherClientProps {
    teacher: Teacher
}

export default function TeacherClient({ teacher }: TeacherClientProps) {
    const supabase = createClient()
    const router = useRouter()
    const [students, setStudents] = useState<Student[]>([])
    const [stats, setStats] = useState<Stats>({
        totalStudents: 0,
        activeToday: 0,
        totalLessonsCompleted: 0,
        avgDuration: 0,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'create'>('overview')

    useEffect(() => {
        const loadStudents = async () => {
            setIsLoading(true)

            // Step 1: student_id গুলো আনো
            const { data: teacherStudents } = await supabase
                .from('teacher_students')
                .select('student_id')
                .eq('teacher_id', teacher.id)

            if (!teacherStudents || teacherStudents.length === 0) {
                setIsLoading(false)
                return
            }

            const studentIds = teacherStudents.map((ts) => ts.student_id)

            // Step 2: profiles fetch
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url')
                .in('id', studentIds)

            if (!profilesData || profilesData.length === 0) {
                setIsLoading(false)
                return
            }

            // Step 3: প্রতিটি student এর data fetch
            const studentsWithData = await Promise.all(
                profilesData.map(async (profile) => {
                    const { data: lastSession } = await supabase
                        .from('user_sessions')
                        .select('login_at, duration_minutes')
                        .eq('user_id', profile.id)
                        .order('login_at', { ascending: false })
                        .limit(1)
                        .single()

                    const { data: studentProfile } = await supabase
                        .from('student_profiles')
                        .select('class_level')
                        .eq('user_id', profile.id)
                        .single()

                    const { count: completedCount } = await supabase
                        .from('learning_progress')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', profile.id)
                        .eq('status', 'completed')

                    const { count: totalCount } = await supabase
                        .from('learning_progress')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', profile.id)

                    return {
                        id: profile.id,
                        full_name: profile.full_name,
                        email: profile.email,
                        avatar_url: profile.avatar_url,
                        class_level: studentProfile?.class_level || 'Unknown',
                        lastSession: lastSession || null,
                        completedLessons: completedCount || 0,
                        totalLessons: totalCount || 0,
                    }
                })
            )

            setStudents(studentsWithData)

            // Stats calculate
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)

            let activeToday = 0
            let totalCompleted = 0
            let totalDuration = 0
            let durationCount = 0

            studentsWithData.forEach((s) => {
                if (s.lastSession && new Date(s.lastSession.login_at) >= todayStart) {
                    activeToday++
                }
                totalCompleted += s.completedLessons || 0
                if (s.lastSession?.duration_minutes) {
                    totalDuration += s.lastSession.duration_minutes
                    durationCount++
                }
            })

            setStats({
                totalStudents: studentsWithData.length,
                activeToday,
                totalLessonsCompleted: totalCompleted,
                avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
            })

            setIsLoading(false)
        }

        void loadStudents()
    }, [teacher.id, supabase])

    const handleStudentCreated = () => {
        setActiveTab('students')
        router.refresh()
    }

    const statCards = [
        {
            label: 'মোট Students',
            value: stats.totalStudents,
            icon: '👨‍🎓',
            color: 'from-violet-600 to-purple-600',
        },
        {
            label: 'আজ Active',
            value: stats.activeToday,
            icon: '🟢',
            color: 'from-green-600 to-emerald-600',
        },
        {
            label: 'Lesson সম্পন্ন',
            value: stats.totalLessonsCompleted,
            icon: '📚',
            color: 'from-blue-600 to-cyan-600',
        },
        {
            label: 'গড় সময় (মিনিট)',
            value: stats.avgDuration,
            icon: '⏱️',
            color: 'from-orange-600 to-amber-600',
        },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-lg">
                            👨‍🏫
                        </div>
                        <div>
                            <h1 className="text-white font-bold">{teacher.full_name}</h1>
                            <p className="text-white/40 text-xs">Teacher Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/dashboard/teacher/ai-assistant')}
                            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 transition text-sm"
                        >
                            🤖 AI Assistant
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/dashboard/teacher/weakness-report')}
                            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition text-sm"
                        >
                            📊 Weakness
                        </motion.button>
                        <NotificationBell userId={teacher.id} />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/dashboard/teacher/profile')}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
                        >
                            👤
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{card.icon}</span>
                                <span className="text-white/50 text-sm">{card.label}</span>
                            </div>
                            <p className={`text-3xl font-bold bg-linear-to-r ${card.color} bg-clip-text text-transparent`}>
                                {isLoading ? '...' : card.value}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
                    {[
                        { key: 'overview', label: '📊 Overview' },
                        { key: 'students', label: '👨‍🎓 Students' },
                        { key: 'create', label: '➕ নতুন Student' },
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
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <h2 className="text-white font-semibold text-lg">সাম্প্রতিক কার্যক্রম</h2>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse h-20" />
                                    ))}
                                </div>
                            ) : students.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                    <p className="text-4xl mb-3">👨‍🎓</p>
                                    <p className="text-white/40 mb-4">এখনো কোনো student নেই</p>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm"
                                    >
                                        প্রথম Student যোগ করো
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.slice(0, 6).map((student) => (
                                        <StudentCard
                                            key={student.id}
                                            student={student}
                                            lastSession={student.lastSession}
                                            completedLessons={student.completedLessons}
                                            totalLessons={student.totalLessons}
                                            onViewProgress={(id) => router.push(`/dashboard/teacher/progress/${id}`)}
                                            onViewSessions={(id) => router.push(`/dashboard/teacher/sessions?studentId=${id}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-white font-semibold text-lg">
                                    সকল Students ({stats.totalStudents})
                                </h2>
                            </div>
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse h-48" />
                                    ))}
                                </div>
                            ) : students.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                    <p className="text-4xl mb-3">👨‍🎓</p>
                                    <p className="text-white/40">এখনো কোনো student নেই</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.map((student) => (
                                        <StudentCard
                                            key={student.id}
                                            student={student}
                                            lastSession={student.lastSession}
                                            completedLessons={student.completedLessons}
                                            totalLessons={student.totalLessons}
                                            onViewProgress={(id) => router.push(`/dashboard/teacher/progress/${id}`)}
                                            onViewSessions={(id) => router.push(`/dashboard/teacher/sessions?studentId=${id}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create Tab */}
                    {activeTab === 'create' && (
                        <div className="max-w-md mx-auto">
                            <CreateAccountForm
                                role="teacher"
                                creatorId={teacher.id}
                                onSuccess={handleStudentCreated}
                            />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}