'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/shared/LogoutButton'
import NurseryDashboard from './levels/NurseryDashboard'
import GeneralDashboard from './levels/GeneralDashboard'
import PushPermission from '@/components/notification/PushPermission'
import { useEffect, useState } from 'react'

interface Props {
    profile: Record<string, string> | null
    studentProfile: Record<string, string> | null
}

export default function DashboardClient({ profile, studentProfile }: Props) {
    const classLevel = studentProfile?.class_level || 'general'
    const isNurseryLevel = ['nursery', 'kg', 'class_1', 'class_2'].includes(classLevel)
    const [announcements, setAnnouncements] = useState<{ id: string; title: string; message: string }[]>([])

    useEffect(() => {
        fetch('/api/announcements')
            .then(r => r.json())
            .then(d => setAnnouncements(d.announcements || []))
            .catch(() => { })
    }, [])

    return (
        <main className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2 min-w-0">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-xl shrink-0"
                        >
                            {isNurseryLevel ? '🌟' : '📚'}
                        </motion.div>
                        <span className="font-bold text-white text-base md:text-lg">অনন্য</span>
                        {isNurseryLevel && (
                            <span className="hidden sm:inline text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                                ছোটদের শিক্ষা
                            </span>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <span className="hidden md:block text-sm text-gray-300 truncate max-width: 120px;">
                            👋 {profile?.full_name}
                        </span>
                        <Link
                            href="/dashboard/student/learning-path"
                            className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 transition text-xs"
                        >
                            🤖 <span className="hidden sm:inline">আজকের Plan</span>
                        </Link>
                        <Link
                            href="/dashboard/student/profile"
                            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all shrink-0"
                        >
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                    {profile?.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                        </Link>
                        <Link
                            href="/free-access"
                            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition text-xs"
                        >
                            🤲 Free Access
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            {/* Push Notification Permission */}
            <div className="max-w-6xl mx-auto px-4 pt-16 pb-2">
                <PushPermission />
            </div>

            {announcements.length > 0 && (
                <div className="mb-4 space-y-2">
                    {announcements.map(ann => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 flex items-start gap-3"
                        >
                            <span className="text-xl shrink-0">📢</span>
                            <div>
                                <p className="font-bold text-amber-300 text-sm">{ann.title}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{ann.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Dashboard Content */}
            <div className="pt-14">
                {isNurseryLevel ? (
                    <NurseryDashboard profile={profile} studentProfile={studentProfile} />
                ) : (
                    <GeneralDashboard profile={profile} studentProfile={studentProfile} />
                )}
            </div>
        </main>
    )
}