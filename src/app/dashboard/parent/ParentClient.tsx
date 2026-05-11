'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'
import { createClient } from '@/lib/supabase'

const stagger = {
    animate: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

interface Props {
    profile: Record<string, string> | null
    childrenData: Record<string, unknown>[]
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

            // Email দিয়ে child খুঁজি
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

            // Parent-child relation যোগ করি
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

    return (
        <main className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Navbar */}
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
                        <button
                            onClick={() => setShowAddChild(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-semibold"
                        >
                            ➕ সন্তান যোগ
                        </button>
                        <Link
                            href="/dashboard/parent/profile"
                            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all"
                        >
                            {profile?.avatar_url ? (
                                <img src={String(profile.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                                    {profile?.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                        </Link>

                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-all"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                                {profile?.full_name?.charAt(0) || 'প'}
                            </div>
                            <span className="text-sm text-white hidden md:block">{profile?.full_name}</span>
                        </button>
                        <LogoutButton />
                    </div>
                </div>

                {/* Profile Dropdown */}
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
                            <button
                                onClick={() => { setShowProfile(false); setShowAddChild(true) }}
                                className="w-full text-center py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-sm mb-2"
                            >
                                ➕ সন্তান যোগ করো
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Add Child Modal */}
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
                            onClick={e => e.stopPropagation()}
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

                            {/* Error/Success */}
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

                            {/* Input */}
                            <div className="mb-4">
                                <label className="text-sm text-gray-400 mb-2 block">সন্তানের Email</label>
                                <input
                                    type="email"
                                    value={childEmail}
                                    onChange={e => setChildEmail(e.target.value)}
                                    placeholder="child@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                />
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                                <p className="text-amber-300 text-xs">
                                    💡 সন্তানের Ononno account এ register করা email দাও। তার account এ student role থাকতে হবে।
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowAddChild(false); setAddError(''); setAddSuccess(''); setChildEmail('') }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all text-sm"
                                >
                                    বাতিল
                                </button>
                                <button
                                    onClick={handleAddChild}
                                    disabled={adding || !childEmail}
                                    className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {adding ? '⏳ যোগ হচ্ছে...' : '➕ যোগ করো'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-12">
                <motion.div variants={stagger} initial="initial" animate="animate">

                    {/* Welcome */}
                    <motion.div variants={fadeUp} className="mb-8">
                        <div className="rounded-3xl bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 border border-purple-500/20 p-6 md:p-8">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                                        আস-সালামু আলাইকুম, {profile?.full_name?.split(' ')[0]}! 👋
                                    </h1>
                                    <p className="text-gray-400 mt-1">আপনার সন্তানদের শিক্ষার অগ্রগতি দেখুন</p>
                                </div>
                                <button
                                    onClick={() => setShowAddChild(true)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/30"
                                >
                                    ➕ সন্তান যোগ করো
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'মোট সন্তান', value: childrenData.length, icon: '👨‍👩‍👧', color: 'from-purple-500 to-violet-500' },
                            { label: 'Islamic সম্পন্ন', value: '০%', icon: '🕌', color: 'from-emerald-500 to-teal-500' },
                            { label: 'একাডেমিক', value: '০%', icon: '📚', color: 'from-blue-500 to-cyan-500' },
                            { label: 'এই মাসে', value: '০ দিন', icon: '📅', color: 'from-amber-500 to-yellow-500' },
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

                    {/* Children List */}
                    <motion.div variants={fadeUp} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white text-xl">সন্তানদের তথ্য</h2>
                        </div>

                        {childrenData.length === 0 ? (
                            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-12 text-center">
                                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                                <h3 className="font-bold text-white text-xl mb-2">এখনো কোনো সন্তান যোগ করা হয়নি</h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    সন্তানের Ononno account এর সাথে connect করো
                                </p>
                                <button
                                    onClick={() => setShowAddChild(true)}
                                    className="inline-flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/30"
                                >
                                    ➕ সন্তান যোগ করো
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {childrenData.map((child, i) => {
                                    const childProfile = child.profiles as Record<string, string>
                                    const studentData = child as Record<string, string>
                                    const isActive = activeChild === i

                                    return (
                                        <motion.div
                                            key={String(child.id)}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                                        >
                                            {/* Child Header */}
                                            <div className="p-5">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                        {childProfile?.full_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white text-lg">{childProfile?.full_name}</h3>
                                                        <p className="text-gray-400 text-sm">
                                                            {studentData?.class_level?.replace('_', ' ').toUpperCase() || 'শ্রেণী অজানা'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full">
                                                        🟢 সক্রিয়
                                                    </span>
                                                </div>

                                                {/* Progress Bars */}
                                                <div className="space-y-3 mb-4">
                                                    {[
                                                        { label: 'ইসলামিক শিক্ষা', progress: 0, color: 'from-emerald-500 to-teal-500' },
                                                        { label: 'একাডেমিক', progress: 0, color: 'from-blue-500 to-cyan-500' },
                                                        { label: 'Quiz Performance', progress: 0, color: 'from-violet-500 to-purple-500' },
                                                    ].map((item) => (
                                                        <div key={item.label}>
                                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                                <span>{item.label}</span>
                                                                <span>{item.progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${item.progress}%` }}
                                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                                    className={`bg-gradient-to-r ${item.color} h-2 rounded-full`}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Islamic Daily */}
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4">
                                                    <p className="text-xs font-semibold text-emerald-400 mb-1">আজকের ইসলামিক পড়া</p>
                                                    <p className="text-xs text-gray-400">কুরআন তিলাওয়াত: সম্পন্ন হয়নি</p>
                                                </div>

                                                {/* Expand Button */}
                                                <button
                                                    onClick={() => setActiveChild(isActive ? null : i)}
                                                    className="w-full py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-semibold"
                                                >
                                                    {isActive ? '▲ কম দেখাও' : '▼ বিস্তারিত দেখো'}
                                                </button>
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="border-t border-white/10"
                                                    >
                                                        <div className="p-5 space-y-4">
                                                            {/* Activity */}
                                                            <div>
                                                                <p className="text-sm font-semibold text-white mb-3">📊 সাম্প্রতিক কার্যক্রম</p>
                                                                <div className="space-y-2">
                                                                    {[
                                                                        { icon: '📖', text: 'কুরআন পাঠ — আজ সম্পন্ন হয়নি', time: 'আজ' },
                                                                        { icon: '🤖', text: 'AI Tutor ব্যবহার করেছে', time: 'গতকাল' },
                                                                        { icon: '📝', text: 'Quiz attempt করেছে', time: '২ দিন আগে' },
                                                                    ].map((act, j) => (
                                                                        <div key={j} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                                                            <span className="text-lg">{act.icon}</span>
                                                                            <p className="text-gray-300 text-sm flex-1">{act.text}</p>
                                                                            <span className="text-xs text-gray-500">{act.time}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Quick Info */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {[
                                                                    { label: 'মোট lesson', value: '০', icon: '📚' },
                                                                    { label: 'Quiz সম্পন্ন', value: '০', icon: '✅' },
                                                                    { label: 'AI chat', value: '০', icon: '🤖' },
                                                                    { label: 'streak', value: '০ দিন', icon: '🔥' },
                                                                ].map((info, j) => (
                                                                    <div key={j} className="bg-white/5 rounded-xl p-3 text-center">
                                                                        <p className="text-xl mb-1">{info.icon}</p>
                                                                        <p className="text-white font-bold">{info.value}</p>
                                                                        <p className="text-gray-500 text-xs">{info.label}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <Link
                                                                href={`/dashboard/parent/child/${child.id}`}
                                                                className="block w-full text-center bg-purple-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-600 transition-all"
                                                            >
                                                                সম্পূর্ণ রিপোর্ট দেখো →
                                                            </Link>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* Notifications */}
                    <motion.div variants={fadeUp}>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <h2 className="font-bold text-white mb-4">🔔 সাম্প্রতিক আপডেট</h2>
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">🔔</div>
                                <p className="text-sm">এখনো কোনো আপডেট নেই</p>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </main>
    )
}