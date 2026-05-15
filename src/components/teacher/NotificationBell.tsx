'use client'

import { useState, useEffect, useRef,} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'

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

interface NotificationBellProps {
    userId: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const supabase = createClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch notifications
    // const fetchNotifications = useCallback(async () => {
    //     const res = await fetch(`/api/notifications/${userId}?limit=15`)
    //     const data = await res.json()
    //     if (data.notifications) {
    //         setNotifications(data.notifications)
    //         setUnreadCount(data.unreadCount)
    //     }
    //     setIsLoading(false)
    // }, [userId])

    // Mark all as read
    const markAllRead = async () => {
        await fetch(`/api/notifications/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mark_all: true }),
        })
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    // Mark single as read
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

    // Realtime subscription আলাদা useEffect এ
    // এটা দিয়ে replace করো
    useEffect(() => {
        const loadAndSubscribe = async () => {
            // Initial fetch
            const res = await fetch(`/api/notifications/${userId}?limit=15`)
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
            setIsLoading(false)
        }

        void loadAndSubscribe()

        // Realtime subscription
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications((prev) => [newNotif, ...prev.slice(0, 14)])
                    setUnreadCount((prev) => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    // Outside click close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition"
            >
                🔔
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-80 bg-[#0a0a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <h3 className="text-white font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-violet-400 text-xs hover:text-violet-300 transition"
                                >
                                    সব পড়া হয়েছে
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink: 0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-white/10 rounded w-3/4" />
                                                <div className="h-3 bg-white/10 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-3xl mb-2">📭</p>
                                    <p className="text-white/40 text-sm">কোনো notification নেই</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => !notif.is_read && markOneRead(notif.id)}
                                        className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${!notif.is_read ? 'bg-violet-500/5' : ''
                                            }`}
                                    >
                                        <span className="text-xl flex-shrink: 0">
                                            {getTypeIcon(notif.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink:0 mt-1" />
                                                )}
                                            </div>
                                            {notif.body && (
                                                <p className="text-white/40 text-xs mt-0.5 line-clamp-2">
                                                    {notif.body}
                                                </p>
                                            )}
                                            <p className="text-white/20 text-xs mt-1">
                                                {formatTime(notif.created_at)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}