'use client'

import { motion } from 'framer-motion'

interface StudentCardProps {
    student: {
        id: string
        full_name: string
        email: string
        class_level: string
        avatar_url?: string | null
    }
    lastSession?: {
        login_at: string
        duration_minutes: number | null
    } | null
    totalLessons?: number
    completedLessons?: number
    onViewProgress?: (id: string) => void
    onViewSessions?: (id: string) => void
}

export default function StudentCard({
    student,
    lastSession,
    totalLessons = 0,
    completedLessons = 0,
    onViewProgress,
    onViewSessions,
}: StudentCardProps) {
    const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString('bn-BD', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
        >
            {/* Top Row */}
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink:0">
                    {student.avatar_url ? (
                        <img
                            src={student.avatar_url}
                            alt={student.full_name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        getInitials(student.full_name)
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                        {student.full_name}
                    </h3>
                    <p className="text-white/40 text-xs truncate">{student.email}</p>
                </div>

                {/* Class Badge */}
                <span className="text-xs px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 flex-shrink:0">
                    {student.class_level}
                </span>
            </div>

            {/* Progress Bar */}
            <div>
                <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>অগ্রগতি</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-linear-to-r from-violet-600 to-purple-600 rounded-full"
                    />
                </div>
                <p className="text-white/30 text-xs mt-1">
                    {completedLessons}/{totalLessons} lesson সম্পন্ন
                </p>
            </div>

            {/* Last Session */}
            <div className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-white/40 text-xs mb-0.5">সর্বশেষ Login</p>
                {lastSession ? (
                    <div className="flex justify-between items-center">
                        <p className="text-white/70 text-xs">
                            {formatTime(lastSession.login_at)}
                        </p>
                        {lastSession.duration_minutes && (
                            <span className="text-xs text-violet-300">
                                {lastSession.duration_minutes} মিনিট
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-white/30 text-xs">এখনো login করেনি</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onViewProgress?.(student.id)}
                    className="flex-1 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm hover:bg-violet-600/30 transition"
                >
                    Progress দেখো
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onViewSessions?.(student.id)}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition"
                >
                    Sessions দেখো
                </motion.button>
            </div>
        </motion.div>
    )
}