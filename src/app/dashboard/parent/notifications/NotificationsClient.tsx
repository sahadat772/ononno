'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Notification {
    id: string
    type: string
    title: string
    body: string | null
    is_read: boolean
    created_at: string
    sender: {
        full_name: string
        avatar_url: string | null
    } | null
}

interface NotificationsClientProps {
    userId: string
    userName: string
}

export default function NotificationsClient({
    userId,
    userName,
}: NotificationsClientProps) {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        const loadNotifications = async () => {
            setIsLoading(true)
            const url = filter === 'unread'
                ? `/api/notifications/${userId}?limit=50&unread=true`
                : `/api/notifications/${userId}?limit=50`

            const res = await fetch(url)
            const data = await res.json()

            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
            setIsLoading(false)
        }

        void loadNotifications()
    }, [userId, filter])

    const markAllRead = async () => {
        await fetch(`/api/notifications/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mark_all: true }),
        })
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    const markOneRead = async (notifId: string) => {
        await fetch(`/api/notifications/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: notifId }),
        })
        setNotifications((prev) =>
            prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'এইমাত্র'
        if (diffMins < 60) return `${diffMins} মিনিট আগে`
        if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`
        return `${diffDays} দিন আগে`
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'student_login': return '🟢'
            case 'lesson_complete': return '✅'
            case 'low_score': return '⚠️'
            case 'welcome': return '🎉'
            case 'child_created': return '👶'
            default: return '🔔'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'student_login': return 'Login Alert'
            case 'lesson_complete': return 'Lesson সম্পন্ন'
            case 'low_score': return 'কম নম্বর'
            case 'welcome': return 'স্বাগতম'
            case 'child_created': return 'Account তৈরি'
            default: return 'Notification'
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/parent')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div className="flex-1">
                        <h1 className="text-white font-bold">Notifications</h1>
                        <p className="text-white/40 text-xs">{userName} এর সব আপডেট</p>
                    </div>
                    {unreadCount > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={markAllRead}
                            className="text-violet-400 text-sm hover:text-violet-300 transition"
                        >
                            সব পড়া হয়েছে
                        </motion.button>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Filter Tabs */}
                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
                    {[
                        { key: 'all', label: '🔔 সব' },
                        { key: 'unread', label: `📬 অপঠিত (${unreadCount})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as typeof filter)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${filter === tab.key
                                    ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white'
                                    : 'text-white/50 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse h-20"
                            />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-white/40">
                            {filter === 'unread' ? 'কোনো অপঠিত notification নেই' : 'কোনো notification নেই'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => !notif.is_read && markOneRead(notif.id)}
                                className={`bg-white/5 border rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition ${!notif.is_read
                                        ? 'border-violet-500/30 bg-violet-500/5'
                                        : 'border-white/10'
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <span className="text-2xl flex-shrink:0">
                                        {getTypeIcon(notif.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div>
                                                <span className="text-xs text-violet-400 font-medium">
                                                    {getTypeLabel(notif.type)}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm">
                                                    {notif.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink:0">
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                                                )}
                                            </div>
                                        </div>
                                        {notif.body && (
                                            <p className="text-white/50 text-sm mb-2">{notif.body}</p>
                                        )}
                                        <p className="text-white/20 text-xs">
                                            {formatTime(notif.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}