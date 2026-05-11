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

const planColors: Record<string, string> = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    enterprise: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    family: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
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
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'list'>('overview')

    useEffect(() => {


        const fetchSubscriptions = async () => {
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
        fetchSubscriptions()
    }, [])

    const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)
    const activeCount = subscriptions.filter(s => s.status === 'active').length

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/admin" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-flex items-center gap-2">
                    ← Admin Panel এ ফিরে যাও
                </Link>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
                        💳
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            সাবস্ক্রিপশন
                        </h1>
                        <p className="text-gray-400 mt-1">Subscription ও Payment ব্যবস্থাপনা</p>
                    </div>
                </div>
            </motion.div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'মোট রাজস্ব', value: `৳${totalRevenue.toLocaleString('bn-BD')}`, icon: '💰', color: 'from-amber-500 to-yellow-500' },
                    { label: 'সক্রিয় সদস্য', value: activeCount, icon: '✅', color: 'from-emerald-500 to-teal-500' },
                    { label: 'মোট সদস্য', value: subscriptions.length, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{s.icon}</span>
                            <div>
                                <p className="text-xs text-gray-400">{s.label}</p>
                                <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                                    {s.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                    📊 প্ল্যান তালিকা
                </button>
                <button onClick={() => setActiveTab('list')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-amber-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400'}`}>
                    👥 সদস্য তালিকা
                </button>
            </div>

            {/* Plans Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan, i) => (
                        <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                                {plan.icon}
                            </div>
                            <h3 className="font-bold text-white mb-1">{plan.name}</h3>
                            <p className={`text-2xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
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
                        <p className="text-xs mt-2">Payment system যোগ হলে এখানে দেখাবে</p>
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
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${planColors[sub.plan_type] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {sub.plan_type}
                                        </span>
                                        <p className="text-emerald-400 font-bold mt-1">৳{sub.amount}</p>
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