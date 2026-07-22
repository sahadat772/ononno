'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface FreeAccessRequest {
    id: string
    user_id: string
    category: string
    reason: string
    age: number
    district: string
    class_level: string
    father_name: string
    father_occupation: string
    mother_name: string
    mother_occupation: string
    monthly_income: string
    family_members: number
    chairman_certificate: string
    school_name: string
    student_id: string
    disability_certificate_url: string | null
    disability_photo_url: string | null
    status: string
    created_at: string
    profiles?: { full_name: string; email: string; phone: string }
}

const CATEGORY_NAMES: Record<string, string> = {
    orphan: '🤲 এতিম',
    poor: '💙 দরিদ্র',
    disabled: '♿ প্রতিবন্ধী',
    other: '📋 অন্যান্য',
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminFreeAccessPage() {
    const [requests, setRequests] = useState<FreeAccessRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<FreeAccessRequest | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')


    useEffect(() => {
        let active = true

        void (async () => {
            const supabase = createClient()
            setLoading(true)

            try {
                const { data, error } = await supabase
                    .from('free_access_requests')
                    .select('*, profiles!free_access_requests_user_id_fkey(full_name, email, phone)')
                    .order('created_at', { ascending: false })

                console.log('FREE ACCESS DATA:', data)
                console.log('FREE ACCESS ERROR:', error)

                if (data && active) {
                    setRequests(data)
                }
            } catch (error) {
                console.error('Failed to fetch requests:', error)
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        })()

        return () => {
            active = false
        }
    }, [])

    async function handleAction(request: FreeAccessRequest, action: 'approved' | 'rejected') {
        setActionLoading(request.id)
        setMessage(null)

        try {
            const res = await fetch('/api/payment/free-access/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: request.id,
                    userId: request.user_id,
                    action,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'সমস্যা হয়েছে' })
                return
            }

            setMessage({
                type: 'success',
                text: action === 'approved'
                    ? `${request.profiles?.full_name} এর আবেদন অনুমোদিত হয়েছে!`
                    : `${request.profiles?.full_name} এর আবেদন প্রত্যাখ্যাত হয়েছে`
            })

            // List update করো
            setRequests(prev => prev.map(r =>
                r.id === request.id ? { ...r, status: action } : r
            ))
            setSelectedRequest(null)

        } catch {
            setMessage({ type: 'error', text: 'Server এ সমস্যা হয়েছে' })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredRequests = requests.filter(r =>
        filter === 'all' ? true : r.status === filter
    )

    const pendingCount = requests.filter(r => r.status === 'pending').length

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/admin" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-flex items-center gap-2">
                    ← Admin Panel এ ফিরে যাও
                </Link>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-liner-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg">
                        🤲
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-liner-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            বিনামূল্যে অ্যাক্সেস
                        </h1>
                        <p className="text-gray-400 mt-1">এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের আবেদন</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'মোট আবেদন', value: requests.length, icon: '📋', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Pending', value: pendingCount, icon: '⏳', color: 'from-amber-500 to-orange-500' },
                    { label: 'অনুমোদিত', value: requests.filter(r => r.status === 'approved').length, icon: '✅', color: 'from-emerald-500 to-teal-500' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{s.icon}</span>
                            <div>
                                <p className="text-xs text-gray-400">{s.label}</p>
                                <p className={`text-2xl font-bold bg-liner-to-r ${s.color} bg-clip-text text-transparent`}>
                                    {s.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${filter === f ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400'
                            }`}>
                        {f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✅ অনুমোদিত' : f === 'rejected' ? '❌ প্রত্যাখ্যাত' : '📋 সব'}
                        {f === 'pending' && pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Request List + Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white/5 p-4 animate-pulse h-24" />
                        ))
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-4xl mb-3">🤲</p>
                            <p>কোনো আবেদন নেই</p>
                        </div>
                    ) : (
                        filteredRequests.map((req, i) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedRequest(req)}
                                className={`rounded-2xl border p-4 cursor-pointer transition-all ${selectedRequest?.id === req.id
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-white">
                                            {req.profiles?.full_name}
                                        </p>
                                        <p className="text-gray-400 text-sm">{req.profiles?.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-white/50">
                                                {CATEGORY_NAMES[req.category] || req.category}
                                            </span>
                                            <span className="text-white/20">•</span>
                                            <span className="text-xs text-white/50">{req.district}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[req.status]}`}>
                                            {req.status === 'pending' ? '⏳ Pending' : req.status === 'approved' ? '✅ অনুমোদিত' : '❌ প্রত্যাখ্যাত'}
                                        </span>
                                        <p className="text-gray-600 text-xs mt-1">
                                            {new Date(req.created_at).toLocaleDateString('bn-BD')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Detail Panel */}
                {selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6 h-fit sticky top-6"
                    >
                        <h3 className="text-white font-bold text-lg mb-4">
                            আবেদনের বিস্তারিত
                        </h3>

                        <div className="space-y-3 mb-6">
                            {[
                                { label: 'নাম', value: selectedRequest.profiles?.full_name },
                                { label: 'Email', value: selectedRequest.profiles?.email },
                                { label: 'Phone', value: selectedRequest.profiles?.phone },
                                { label: 'বিভাগ', value: CATEGORY_NAMES[selectedRequest.category] },
                                { label: 'বয়স', value: `${selectedRequest.age} বছর` },
                                { label: 'জেলা', value: selectedRequest.district },
                                { label: 'শ্রেণী', value: selectedRequest.class_level },
                                { label: 'স্কুল', value: selectedRequest.school_name },
                                { label: 'জন্ম সনদ', value: selectedRequest.student_id || 'নেই' },
                                { label: 'পিতা', value: `${selectedRequest.father_name} (${selectedRequest.father_occupation})` },
                                { label: 'মাতা', value: `${selectedRequest.mother_name} (${selectedRequest.mother_occupation})` },
                                { label: 'মাসিক আয়', value: selectedRequest.monthly_income },
                                { label: 'পরিবারের সদস্য', value: `${selectedRequest.family_members} জন` },
                                { label: 'সনদ নম্বর', value: selectedRequest.chairman_certificate || 'নেই' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <span className="text-gray-500 text-sm w-32 shrink-0">{item.label}:</span>
                                    <span className="text-white text-sm">{item.value}</span>
                                </div>
                            ))}

                            {/* Reason */}
                            <div>
                                <p className="text-gray-500 text-sm mb-1">কারণ:</p>
                                <p className="text-white text-sm bg-white/5 rounded-xl p-3">
                                    {selectedRequest.reason}
                                </p>
                            </div>

                            {/* Disability docs */}
                            {selectedRequest.disability_photo_url && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">প্রতিবন্ধী ছবি:</p>
                                    <a
                                        href={`https://jppkmsfdhvtscvxqkiby.supabase.co/storage/v1/object/public/free-access-docs/${selectedRequest.disability_photo_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 text-sm hover:underline"
                                    >
                                        ছবি দেখো →
                                    </a>
                                </div>
                            )}

                            {selectedRequest.disability_certificate_url && (
                                <div>
                                    <p className="text-gray-500 text-sm mb-1">প্রতিবন্ধী সনদ:</p>
                                    <a
                                        href={`https://jppkmsfdhvtscvxqkiby.supabase.co/storage/v1/object/public/free-access-docs/${selectedRequest.disability_certificate_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 text-sm hover:underline"
                                    >
                                        সনদ দেখো →
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {selectedRequest.status === 'pending' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(selectedRequest, 'approved')}
                                    disabled={actionLoading === selectedRequest.id}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                                >
                                    {actionLoading === selectedRequest.id ? '...' : '✅ অনুমোদন করো'}
                                </button>
                                <button
                                    onClick={() => handleAction(selectedRequest, 'rejected')}
                                    disabled={actionLoading === selectedRequest.id}
                                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-bold transition-all disabled:opacity-50"
                                >
                                    {actionLoading === selectedRequest.id ? '...' : '❌ প্রত্যাখ্যান'}
                                </button>
                            </div>
                        )}

                        {selectedRequest.status !== 'pending' && (
                            <div className={`p-3 rounded-xl text-center ${STATUS_COLORS[selectedRequest.status]}`}>
                                {selectedRequest.status === 'approved' ? '✅ অনুমোদিত হয়েছে' : '❌ প্রত্যাখ্যাত হয়েছে'}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}