'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
import NotificationBell from '@/components/teacher/NotificationBell'
import { createClient } from '@/lib/supabase'
import ParentSoftLaunchCard from '@/components/parent/ParentSoftLaunchCard'

const stagger = {
    animate: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

interface ChildProfile {
    full_name: string
    email: string
    avatar_url: string | null
}

interface Child {
    id: string
    child_id: string
    class_level: string
    profiles: ChildProfile
    lastSession?: {
        login_at: string
        logout_at: string | null
        duration_minutes: number | null
    } | null
    completedLessons: number
    totalLessons: number
}

interface Props {
    profile: Record<string, string> | null
    childrenData: Child[]
}

export default function ParentClient({ profile, childrenData }: Props) {
    const [showAddChild, setShowAddChild] = useState(false)
    const [childEmail, setChildEmail] = useState('')
    const [adding, setAdding] = useState(false)
    const [addError, setAddError] = useState('')
    const [addSuccess, setAddSuccess] = useState('')
    const [activeChild, setActiveChild] = useState<number | null>(null)
    const [showProfile, setShowProfile] = useState(false)

    const handleAddChild = async () => {
        if (!childEmail.trim()) return
        setAdding(true)
        setAddError('')
        setAddSuccess('')

        try {
            const supabase = createClient()

            const { data: childProfile } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('email', childEmail.trim())
                .single()

            if (!childProfile) {
                setAddError('এই email এ কোনো account পাওয়া যায়নি।')
                return
            }

            if (childProfile.role !== 'student') {
                setAddError('এই account টি student account নয়।')
                return
            }

            const { error } = await supabase
                .from('parent_children')
                .insert({
                    parent_id: profile?.id,
                    child_id: childProfile.id,
                })

            if (error) {
                if (error.code === '23505') {
                    setAddError('এই সন্তান আগে থেকেই যোগ করা আছে।')
                } else {
                    setAddError('সমস্যা হয়েছে। আবার চেষ্টা করো।')
                }
                return
            }

            setAddSuccess(`${childProfile.full_name} সফলভাবে যোগ করা হয়েছে! Page refresh করো।`)
            setChildEmail('')
        } catch {
            setAddError('সমস্যা হয়েছে। আবার চেষ্টা করো।')
        } finally {
            setAdding(false)
        }
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('bn-BD', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <main className="min-h-screen bg-[#0a0a1a] text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                            প
                        </div>
                        <span className="font-bold text-white">Ononno</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                            Parent
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/parent/create-child"
                            className="flex items-center gap-1.5 px-2 md:px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-xs md:text-sm font-semibold"
                        >
                            ➕ <span className="hidden sm:inline">নতুন Child</span>
                        </Link>

                        {profile?.id && (
                            <NotificationBell userId={profile.id} />
                        )}
                        <Link
                            href="/dashboard/parent/profile"
                            title="Profile"
                            aria-label="Profile"
                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
                        >
                            👤
                        </Link>

                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-all"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                                {profile?.full_name?.charAt(0) || 'প'}
                            </div>
                            <span className="text-sm text-white hidden md:block">
                                {profile?.full_name}
                            </span>
                        </button>
                        <LogoutButton />
                    </div>
                </div>

                <AnimatePresence>
                    {showProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-16 right-6 w-64 rounded-2xl border border-white/10 bg-[#0f0f2a] shadow-2xl p-4 z-50"
                        >
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl font-bold">
                                    {profile?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{profile?.full_name}</p>
                                    <p className="text-gray-400 text-xs">{profile?.email}</p>
                                    <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        👨‍👩‍👧 অভিভাবক
                                    </span>
                                </div>
                            </div>
                            <Link
                                href="/dashboard/parent/create-child"
                                className="block w-full text-center py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-sm mb-2"
                            >
                                ➕ নতুন Child Account বানাও
                            </Link>
                            <button
                                onClick={() => { setShowProfile(false); setShowAddChild(true) }}
                                className="w-full text-center py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm"
                            >
                                🔗 Email দিয়ে Child যোগ করো
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AnimatePresence>
                {showAddChild && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddChild(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f0f2a] border border-purple-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl">
                                    👨‍👩‍👧
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">সন্তান যোগ করো</h2>
                                    <p className="text-gray-400 text-sm">সন্তানের email দিয়ে connect করো</p>
                                </div>
                            </div>

                            {addError && (
                                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
                                    ⚠️ {addError}
                                </div>
                            )}
                            {addSuccess && (
                                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-sm">
                                    ✅ {addSuccess}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="text-sm text-gray-400 mb-2 block">
                                    সন্তানের Email
                                </label>
                                <input
                                    type="email"
                                    value={childEmail}
                                    onChange={(e) => setChildEmail(e.target.value)}
                                    placeholder="child@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddChild(false)
                                        setAddError('')
                                        setAddSuccess('')
                                        setChildEmail('')
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all text-sm"
                                >
                                    বাতিল
                                </button>
                                <button
                                    onClick={handleAddChild}
                                    disabled={adding || !childEmail}
                                    className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all text-sm disabled:opacity-50"
                                >
                                    {adding ? '⏳ যোগ হচ্ছে...' : '➕ যোগ করো'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-12">
                <ParentSoftLaunchCard />
                <motion.div variants={stagger} initial="initial" animate="animate">
                    <motion.div variants={fadeUp} className="mb-8">
                        <div className="rounded-3xl bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 border border-purple-500/20 p-6 md:p-8">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        আস-সালামু আলাইকুম, {profile?.full_name?.split(' ')[0]}! 👋
                                    </h1>
                                    <p className="text-gray-400 mt-1">
                                        আপনার সন্তানদের শিক্ষার অগ্রগতি দেখুন
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/parent/create-child"
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/30"
                                >
                                    ➕ নতুন Child Account
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {[
                            { label: 'মোট সন্তান', value: childrenData.length, icon: '👨‍👩‍👧', color: 'from-purple-500 to-violet-500' },
                            { label: 'আজ Active', value: childrenData.filter((c) => c.lastSession && new Date(c.lastSession.login_at) >= new Date(new Date().setHours(0, 0, 0, 0))).length, icon: '🟢', color: 'from-emerald-500 to-teal-500' },
                            { label: 'মোট Lesson', value: childrenData.reduce((acc, c) => acc + (c.totalLessons || 0), 0), icon: '📚', color: 'from-blue-500 to-cyan-500' },
                            { label: 'সম্পন্ন Lesson', value: childrenData.reduce((acc, c) => acc + (c.completedLessons || 0), 0), icon: '✅', color: 'from-amber-500 to-yellow-500' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-2xl border border-white/10 bg-white/5 p-5"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 shadow-md`}>
                                    {stat.icon}
                                </div>
                                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={fadeUp} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white text-xl">সন্তানদের তথ্য</h2>
                        </div>

                        {childrenData.length === 0 ? (
                            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-12 text-center">
                                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                                <h3 className="font-bold text-white text-xl mb-2">
                                    এখনো কোনো সন্তান যোগ করা হয়নি
                                </h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    নতুন account বানাও অথবা email দিয়ে connect করো
                                </p>
                                <div className="flex gap-3 justify-center flex-wrap">
                                    <Link
                                        href="/dashboard/parent/create-child"
                                        className="inline-flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-all"
                                    >
                                        ➕ নতুন Account বানাও
                                    </Link>
                                    <button
                                        onClick={() => setShowAddChild(true)}
                                        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
                                    >
                                        🔗 Email দিয়ে যোগ করো
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {childrenData.map((child, index) => (
                                    <motion.div
                                        key={child.id}
                                        variants={fadeUp}
                                        className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-purple-500/30 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-lg font-bold shrink-0">
                                                    {child.profiles.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white truncate">{child.profiles.full_name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{child.profiles.email}</p>
                                                    <p className="text-xs text-purple-300 mt-1">{child.class_level}</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/dashboard/parent/child/${child.child_id}`}
                                                className="text-xs font-semibold text-purple-300 hover:underline shrink-0"
                                            >
                                                দেখো →
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                                <p className="text-gray-500">সম্পন্ন</p>
                                                <p className="text-lg font-bold text-emerald-400">{child.completedLessons}</p>
                                            </div>
                                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                                <p className="text-gray-500">Tracked</p>
                                                <p className="text-lg font-bold text-blue-400">{child.totalLessons}</p>
                                            </div>
                                        </div>
                                        {child.lastSession && (
                                            <p className="mt-3 text-[11px] text-gray-500">
                                                Last: {formatTime(child.lastSession.login_at)}
                                                {child.lastSession.duration_minutes != null &&
                                                    ` · ${child.lastSession.duration_minutes} মিনিট`}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </main>
    )
}
