'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Subscription {
    id: string
    user_id: string
    plan_type: string
    status: string
    amount: number
    created_at: string
    expires_at: string
    profiles?: { full_name: string; email: string }
}

interface PendingPayment {
    id: string
    user_id: string
    plan_id: string
    amount: number
    payment_method: string
    transaction_id: string
    status: string
    metadata: { user_trx_id: string; submitted_amount: number }
    created_at: string
    profiles?: { full_name: string; email: string }
}

const planColors: Record<string, string> = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    enterprise: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    family: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const PLAN_NAMES: Record<string, string> = {
    monthly: 'মাসিক',
    yearly: 'বার্ষিক',
    family: 'পারিবারিক',
}

const plans = [
    { id: 'nursery', name: 'নার্সারি-২', price: '৳৯৯', icon: '🌱', color: 'from-green-400 to-emerald-500' },
    { id: 'class_3_5', name: 'শ্রেণী ৩-৫', price: '৳১৯৯', icon: '📚', color: 'from-blue-400 to-cyan-500' },
    { id: 'class_6_8', name: 'শ্রেণী ৬-৮', price: '৳২৯৯', icon: '📖', color: 'from-violet-400 to-purple-500' },
    { id: 'class_9_10', name: 'শ্রেণী ৯-১০', price: '৳৩৯৯', icon: '🎯', color: 'from-amber-400 to-orange-500' },
    { id: 'class_11_12', name: 'শ্রেণী ১১-১২', price: '৳৪৯৯', icon: '🏆', color: 'from-rose-400 to-pink-500' },
    { id: 'university', name: 'বিশ্ববিদ্যালয়+', price: '৳৫৯৯', icon: '🎓', color: 'from-indigo-400 to-blue-500' },
    { id: 'skill_basic', name: 'Skill Basic', price: '৳৩৯৯', icon: '⚡', color: 'from-teal-400 to-cyan-500' },
    { id: 'skill_pro', name: 'Skill Pro', price: '৳৭৯৯', icon: '🚀', color: 'from-purple-400 to-violet-500' },
    { id: 'enterprise', name: 'Enterprise', price: '৳১,৯৯৯', icon: '🏢', color: 'from-amber-400 to-yellow-500' },
    { id: 'family', name: 'Family (২৫% ছাড়)', price: 'বিভিন্ন', icon: '👨‍👩‍👧', color: 'from-emerald-400 to-teal-500' },
    { id: 'adult', name: 'Adult Learner', price: '৳৪৯৯', icon: '👤', color: 'from-blue-400 to-indigo-500' },
]

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
    const [loading, setLoading] = useState(true)
    const [pendingLoading, setPendingLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'pending'>('overview')
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchSubscriptions()
        fetchPendingPayments()
    }, [])

    async function fetchSubscriptions() {
        const supabase = createClient()
        setLoading(true)
        try {
            const { data } = await supabase
                .from('subscriptions')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false })
            if (data) setSubscriptions(data)
        } finally {
            setLoading(false)
        }
    }

    async function fetchPendingPayments() {
        const supabase = createClient()
        setPendingLoading(true)
        try {
            const { data } = await supabase
                .from('payment_transactions')
                .select('*, profiles(full_name, email)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
            if (data) setPendingPayments(data)
        } finally {
            setPendingLoading(false)
        }
    }

    async function handleApprove(payment: PendingPayment) {
        setActionLoading(payment.id)
        setMessage(null)

        try {
            const res = await fetch('/api/payment/manual/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: payment.transaction_id,
                    userId: payment.user_id,
                    planId: payment.plan_id,
                    amount: payment.amount,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'সমস্যা হয়েছে' })
                return
            }

            setMessage({ type: 'success', text: `${payment.profiles?.full_name} এর payment approve হয়েছে!` })
            // List থেকে সরাও
            setPendingPayments(prev => prev.filter(p => p.id !== payment.id))
            // Subscription list refresh করো
            fetchSubscriptions()

        } catch {
            setMessage({ type: 'error', text: 'Server এ সমস্যা হয়েছে' })
        } finally {
            setActionLoading(null)
        }
    }

    async function handleReject(payment: PendingPayment) {
        setActionLoading(payment.id)
        setMessage(null)

        try {
            const supabase = createClient()
            await supabase
                .from('payment_transactions')
                .update({ status: 'failed' })
                .eq('id', payment.id)

            setMessage({ type: 'error', text: `${payment.profiles?.full_name} এর payment reject হয়েছে` })
            setPendingPayments(prev => prev.filter(p => p.id !== payment.id))

        } catch {
            setMessage({ type: 'error', text: 'Server এ সমস্যা হয়েছে' })
        } finally {
            setActionLoading(null)
        }
    }

    const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const activeCount = subscriptions.filter(s => s.status === 'active').length

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/admin" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-flex items-center gap-2">
                    ← Admin Panel এ ফিরে যাও
                </Link>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
                        💳
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            সাবস্ক্রিপশন
                        </h1>
                        <p className="text-gray-400 mt-1">Subscription ও Payment ব্যবস্থাপনা</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'মোট রাজস্ব', value: `৳${totalRevenue.toLocaleString('bn-BD')}`, icon: '💰', color: 'from-amber-500 to-yellow-500' },
                    { label: 'সক্রিয় সদস্য', value: activeCount, icon: '✅', color: 'from-emerald-500 to-teal-500' },
                    { label: 'মোট সদস্য', value: subscriptions.length, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Pending Payment', value: pendingPayments.length, icon: '⏳', color: 'from-orange-500 to-red-500' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{s.icon}</span>
                            <div>
                                <p className="text-xs text-gray-400">{s.label}</p>
                                <p className={`text-2xl font-bold bg-linear-to-r ${s.color} bg-clip-text text-transparent`}>
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                    📊 প্ল্যান তালিকা
                </button>
                <button onClick={() => setActiveTab('list')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-amber-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                    👥 সদস্য তালিকা
                </button>
                <button onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${activeTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                    ⏳ Pending Payment
                    {pendingPayments.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                            {pendingPayments.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Plans Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan, i) => (
                        <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${plan.color} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                                {plan.icon}
                            </div>
                            <h3 className="font-bold text-white mb-1">{plan.name}</h3>
                            <p className={`text-2xl font-bold bg-linear-to-r ${plan.color} bg-clip-text text-transparent`}>
                                {plan.price}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">প্রতি মাস</p>
                            <div className="mt-3 pt-3 border-t border-white/10">
                                <p className="text-xs text-gray-400">
                                    সক্রিয় সদস্য: <span className="text-white font-semibold">
                                        {subscriptions.filter(s => s.plan_type === plan.id && s.status === 'active').length}
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Subscriptions List */}
            {activeTab === 'list' && (
                loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => <div key={i} className="rounded-2xl bg-white/5 p-4 animate-pulse h-20" />)}
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-4xl mb-3">💳</p>
                        <p>এখনো কোনো সাবস্ক্রিপশন নেই</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subscriptions.map((sub, i) => (
                            <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-white">{sub.profiles?.full_name}</p>
                                        <p className="text-gray-400 text-sm">{sub.profiles?.email}</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Expires: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('bn-BD') : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${planColors[sub.plan_type] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {sub.plan_type}
                                        </span>
                                        <p className="text-emerald-400 font-bold mt-1">৳{sub.amount}</p>
                                        <p className={`text-xs mt-1 ${sub.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {sub.status === 'active' ? '✅ Active' : '❌ Inactive'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}

            {/* Pending Payments */}
            {activeTab === 'pending' && (
                pendingLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-white/5 p-4 animate-pulse h-32" />)}
                    </div>
                ) : pendingPayments.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-4xl mb-3">✅</p>
                        <p>কোনো Pending Payment নেই</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingPayments.map((payment, i) => (
                            <motion.div key={payment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="font-bold text-white text-lg">
                                            {payment.profiles?.full_name}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {payment.profiles?.email}
                                        </p>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-white/70 text-sm">
                                                📦 Plan: <span className="text-white font-medium">
                                                    {PLAN_NAMES[payment.plan_id] || payment.plan_id}
                                                </span>
                                            </p>
                                            <p className="text-white/70 text-sm">
                                                💳 Method: <span className="text-white font-medium capitalize">
                                                    {payment.payment_method}
                                                </span>
                                            </p>
                                            <p className="text-white/70 text-sm">
                                                💰 Amount: <span className="text-emerald-400 font-bold">
                                                    ৳{payment.amount}
                                                </span>
                                            </p>
                                            <p className="text-white/70 text-sm">
                                                🔢 TrxID: <span className="text-amber-400 font-mono">
                                                    {payment.metadata?.user_trx_id}
                                                </span>
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                📅 {new Date(payment.created_at).toLocaleString('bn-BD')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Approve/Reject Buttons */}
                                    <div className="flex flex-col gap-2 min-w-120px">
                                        <button
                                            onClick={() => handleApprove(payment)}
                                            disabled={actionLoading === payment.id}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
                                        >
                                            {actionLoading === payment.id ? '...' : '✅ Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(payment)}
                                            disabled={actionLoading === payment.id}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold transition-all disabled:opacity-50"
                                        >
                                            {actionLoading === payment.id ? '...' : '❌ Reject'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}