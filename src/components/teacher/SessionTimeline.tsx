'use client'

import { motion } from 'framer-motion'

interface Session {
    id: string
    login_at: string
    logout_at: string | null
    duration_minutes: number | null
    device_info: string | null
}

interface SessionTimelineProps {
    sessions: Session[]
    isLoading?: boolean
}

export default function SessionTimeline({
    sessions,
    isLoading = false,
}: SessionTimelineProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('bn-BD', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'অজানা'
        if (minutes < 60) return `${minutes} মিনিট`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours} ঘণ্টা ${mins} মিনিট`
    }

    const getDeviceIcon = (deviceInfo: string | null) => {
        if (!deviceInfo) return '💻'
        const lower = deviceInfo.toLowerCase()
        if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return '📱'
        if (lower.includes('tablet') || lower.includes('ipad')) return '📱'
        return '💻'
    }

    const isActive = (session: Session) => !session.logout_at

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse"
                    >
                        <div className="h-3 bg-white/10 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                ))}
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-white/40">এখনো কোনো session নেই</p>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-3">
                {sessions.map((session, index) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-14"
                    >
                        {/* Timeline dot */}
                        <div
                            className={`absolute left-4 top-4 w-4 h-4 rounded-full border-2 ${isActive(session)
                                    ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                                    : 'bg-white/20 border-white/30'
                                }`}
                        />

                        {/* Session Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    {/* Status */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">
                                            {getDeviceIcon(session.device_info)}
                                        </span>
                                        {isActive(session) ? (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                                এখন Active
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">
                                                Completed
                                            </span>
                                        )}
                                    </div>

                                    {/* Login time */}
                                    <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
                                        <span className="text-green-400">▶</span>
                                        <span>Login: {formatDate(session.login_at)}</span>
                                    </div>

                                    {/* Logout time */}
                                    {session.logout_at ? (
                                        <div className="flex items-center gap-2 text-xs text-white/60">
                                            <span className="text-red-400">■</span>
                                            <span>Logout: {formatDate(session.logout_at)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <span>■</span>
                                            <span>এখনো active</span>
                                        </div>
                                    )}
                                </div>

                                {/* Duration */}
                                <div className="text-right flex-shrink:0">
                                    <p className="text-white/30 text-xs mb-1">সময়কাল</p>
                                    <p className="text-violet-300 text-sm font-semibold">
                                        {isActive(session)
                                            ? 'চলছে...'
                                            : formatDuration(session.duration_minutes)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}