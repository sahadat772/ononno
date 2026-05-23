'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Announcement {
    id: string
    title: string
    message: string
    target_role: string
    is_published: boolean
    expires_at: string | null
    created_at: string
}

const targetLabels: Record<string, string> = {
    all: '👥 সবাই',
    student: '🎓 শুধু Students',
    teacher: '👨‍🏫 শুধু Teachers',
    parent: '👨‍👩‍👧 শুধু Parents',
}

const targetColors: Record<string, string> = {
    all: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    teacher: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    parent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function AnnouncementsClient() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [form, setForm] = useState({
        title: '',
        message: '',
        target_role: 'all',
        expires_at: '',
    })

    function showToast(msg: string, type: 'success' | 'error' = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }


    const [initialized, setInitialized] = useState(false)

    async function fetchAnnouncements() {
        try {
            const res = await fetch('/api/announcements')
            const data = await res.json()
            setAnnouncements(data.announcements || [])
        } catch {
            showToast('Load হয়নি!', 'error')
        } finally {
            setLoading(false)
            setInitialized(true)
        }
    }

    if (typeof window !== 'undefined' && !initialized && loading) {
        fetchAnnouncements()
    }

    async function createAnnouncement() {
        if (!form.title || !form.message) {
            showToast('Title ও Message দাও!', 'error')
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    expires_at: form.expires_at || null,
                }),
            })
            const data = await res.json()
            if (data.announcement) {
                showToast('ঘোষণা তৈরি হয়েছে! ✅')
                setForm({ title: '', message: '', target_role: 'all', expires_at: '' })
                setShowForm(false)
                fetchAnnouncements()
            } else {
                showToast(data.error || 'সমস্যা হয়েছে!', 'error')
            }
        } catch {
            showToast('সমস্যা হয়েছে!', 'error')
        } finally {
            setSaving(false)
        }
    }

    async function togglePublish(announcement: Announcement) {
        try {
            const res = await fetch(`/api/announcements/${announcement.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_published: !announcement.is_published,
                    target_role: announcement.target_role,
                    title: announcement.title,
                    message: announcement.message,
                }),
            })
            const data = await res.json()
            if (data.announcement) {
                showToast(
                    announcement.is_published
                        ? 'ঘোষণা unpublish হয়েছে'
                        : '📢 ঘোষণা publish হয়েছে! সবাই notification পাবে'
                )
                fetchAnnouncements()
            }
        } catch {
            showToast('সমস্যা হয়েছে!', 'error')
        }
    }

    async function deleteAnnouncement(id: string) {
        if (!confirm('এই ঘোষণা মুছে ফেলবো?')) return
        try {
            await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
            showToast('মুছে ফেলা হয়েছে!')
            fetchAnnouncements()
        } catch {
            showToast('সমস্যা হয়েছে!', 'error')
        }
    }

    const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all placeholder:text-gray-500'

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === 'success'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/20 border-red-500/30 text-red-300'
                            }`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard/admin" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
                    ← Admin Dashboard
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
                            📢
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">ঘোষণা পাতা</h1>
                            <p className="text-gray-400 text-sm mt-1">সব users কে ঘোষণা পাঠাও</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowForm(true)}
                        className="bg-linear-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                    >
                        + নতুন ঘোষণা
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'মোট ঘোষণা', value: announcements.length, icon: '📋', color: 'from-violet-500 to-purple-600' },
                    { label: 'Published', value: announcements.filter(a => a.is_published).length, icon: '✅', color: 'from-emerald-500 to-teal-600' },
                    { label: 'Draft', value: announcements.filter(a => !a.is_published).length, icon: '📝', color: 'from-amber-500 to-orange-600' },
                    { label: 'Expired', value: announcements.filter(a => a.expires_at && new Date(a.expires_at) < new Date()).length, icon: '⏰', color: 'from-red-500 to-rose-600' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center text-xl mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">📢</p>
                    <p className="text-gray-400">এখনো কোনো ঘোষণা নেই</p>
                    <button onClick={() => setShowForm(true)} className="mt-4 text-amber-400 hover:text-amber-300 text-sm">
                        প্রথম ঘোষণা তৈরি করো →
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann, i) => {
                        const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date()
                        return (
                            <motion.div
                                key={ann.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-white/5 border rounded-2xl p-4 md:p-5 transition-all ${ann.is_published && !isExpired
                                    ? 'border-emerald-500/30'
                                    : isExpired
                                        ? 'border-red-500/20 opacity-60'
                                        : 'border-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <h3 className="font-bold text-white text-base">{ann.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${targetColors[ann.target_role]}`}>
                                                {targetLabels[ann.target_role]}
                                            </span>
                                            {ann.is_published && !isExpired && (
                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                                    ✅ Published
                                                </span>
                                            )}
                                            {isExpired && (
                                                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                                                    ⏰ Expired
                                                </span>
                                            )}
                                            {!ann.is_published && !isExpired && (
                                                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                                    📝 Draft
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm line-clamp-2">{ann.message}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span>📅 {new Date(ann.created_at).toLocaleDateString('bn-BD')}</span>
                                            {ann.expires_at && (
                                                <span>⏰ Expires: {new Date(ann.expires_at).toLocaleDateString('bn-BD')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {!isExpired && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => togglePublish(ann)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${ann.is_published
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-linear-to-r from-emerald-600 to-teal-600 text-white'
                                                    }`}
                                            >
                                                {ann.is_published ? '⏸ Unpublish' : '📢 Publish'}
                                            </motion.button>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => deleteAnnouncement(ann.id)}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                                        >
                                            🗑 মুছো
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Create Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0f0f2a] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">📢 নতুন ঘোষণা</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-2xl transition-colors">×</button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">ঘোষণার শিরোনাম *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="যেমন: ঈদুল ফিতর উপলক্ষে ছুটির ঘোষণা"
                                        className={inputCls}
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">বিস্তারিত বার্তা *</label>
                                    <textarea
                                        value={form.message}
                                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        placeholder="ঘোষণার বিস্তারিত লেখো..."
                                        rows={4}
                                        className={inputCls + ' resize-none'}
                                    />
                                </div>

                                {/* Target */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">কাদের জন্য?</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(targetLabels).map(([val, label]) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, target_role: val }))}
                                                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${form.target_role === val
                                                    ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Expires At */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">মেয়াদ শেষ (ঐচ্ছিক)</label>
                                    <input
                                        type="datetime-local"
                                        aria-label="মেয়াদ শেষ"
                                        value={form.expires_at}
                                        onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                                        className={inputCls}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">ফাঁকা রাখলে সবসময় দেখাবে</p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                                    >
                                        বাতিল
                                    </button>
                                    <motion.button
                                        type="button"
                                        onClick={createAnnouncement}
                                        disabled={saving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 bg-linear-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                                    >
                                        {saving ? '⏳ তৈরি হচ্ছে...' : '✅ ঘোষণা তৈরি করো'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}