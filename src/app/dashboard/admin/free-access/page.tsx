'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface FreeRequest {
    id: string
    user_id: string
    reason: string
    category: string
    status: string
    created_at: string
    supporting_docs?: string
    profiles?: { full_name: string; email: string }
}

const categoryLabels: Record<string, string> = {
    orphan: '🤲 এতিম',
    poor: '💙 দরিদ্র',
    disabled: '♿ প্রতিবন্ধী',
    other: '📋 অন্যান্য',
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function FreeAccessPage() {
    const [requests, setRequests] = useState<FreeRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending')
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        const fetchRequests = async () => {
            const supabase = createClient()
            setLoading(true)
            try {
                const { data } = await supabase
                    .from('free_access_requests')
                    .select('*, profiles(full_name, email)')
                    .order('created_at', { ascending: false })
                if (data) setRequests(data)
            } finally {
                setLoading(false)
            }
        }
        fetchRequests()
    }, [])

    // handleAction এর ভেতরে refetch এর জন্য
    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        const supabase = createClient()
        setProcessing(id)
        try {
            await supabase
                .from('free_access_requests')
                .update({ status: action })
                .eq('id', id)

            // Refetch — directly here
            const { data } = await supabase
                .from('free_access_requests')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false })
            if (data) setRequests(data)
        } finally {
            setProcessing(null)
        }
    }

    const filtered = requests.filter(r => filter === 'all' || r.status === filter)

    const stats = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/admin" className="text-emerald-400 hover:text-emerald-300 text-sm mb-4 inline-flex items-center gap-2">
                    ← Admin Panel এ ফিরে যাও
                </Link>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg">
                        🤲
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            বিনামূল্যে অ্যাক্সেস
                        </h1>
                        <p className="text-gray-400 mt-1">এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের আবেদন</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'অপেক্ষমাণ', value: stats.pending, color: 'from-amber-500 to-yellow-500', icon: '⏳' },
                    { label: 'অনুমোদিত', value: stats.approved, color: 'from-emerald-500 to-teal-500', icon: '✅' },
                    { label: 'প্রত্যাখ্যাত', value: stats.rejected, color: 'from-red-500 to-rose-500', icon: '❌' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                        <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {['pending', 'approved', 'rejected', 'all'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                            }`}>
                        {f === 'pending' ? '⏳ অপেক্ষমাণ' : f === 'approved' ? '✅ অনুমোদিত' : f === 'rejected' ? '❌ প্রত্যাখ্যাত' : '🌐 সব'}
                    </button>
                ))}
            </div>

            {/* Requests */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-white/5 p-5 animate-pulse h-32" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-4xl mb-3">📭</p>
                    <p>কোনো আবেদন নেই</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((req, i) => (
                        <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <p className="font-bold text-white">{req.profiles?.full_name || 'অজানা'}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[req.status]}`}>
                                            {req.status === 'pending' ? '⏳ অপেক্ষমাণ' : req.status === 'approved' ? '✅ অনুমোদিত' : '❌ প্রত্যাখ্যাত'}
                                        </span>
                                        <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                                            {categoryLabels[req.category] || req.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-1">{req.profiles?.email}</p>
                                    <p className="text-gray-300 text-sm leading-relaxed">{req.reason}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        আবেদনের তারিখ: {new Date(req.created_at).toLocaleDateString('bn-BD')}
                                    </p>
                                </div>

                                {req.status === 'pending' && (
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleAction(req.id, 'approved')}
                                            disabled={processing === req.id}
                                            className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-semibold disabled:opacity-50"
                                        >
                                            {processing === req.id ? '...' : '✅ অনুমোদন'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, 'rejected')}
                                            disabled={processing === req.id}
                                            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold disabled:opacity-50"
                                        >
                                            {processing === req.id ? '...' : '❌ প্রত্যাখ্যান'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}