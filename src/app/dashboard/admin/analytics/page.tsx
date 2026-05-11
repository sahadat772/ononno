'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalConversations: 0,
        totalQuizAttempts: 0,
        totalProgress: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient()
            try {
                const [users, conversations, quizzes, progress] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('ai_conversations').select('*', { count: 'exact', head: true }),
                    supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
                    supabase.from('student_progress').select('*', { count: 'exact', head: true }),
                ])

                setStats({
                    totalUsers: users.count || 0,
                    totalStudents: 0,
                    totalTeachers: 0,
                    totalConversations: conversations.count || 0,
                    totalQuizAttempts: quizzes.count || 0,
                    totalProgress: progress.count || 0,
                })
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const metrics = [
        { label: 'মোট ব্যবহারকারী', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-cyan-500', desc: 'নিবন্ধিত সদস্য' },
        { label: 'AI কথোপকথন', value: stats.totalConversations, icon: '🤖', color: 'from-violet-500 to-purple-500', desc: 'AI Tutor ব্যবহার' },
        { label: 'কুইজ attempt', value: stats.totalQuizAttempts, icon: '📝', color: 'from-amber-500 to-yellow-500', desc: 'মোট পরীক্ষা' },
        { label: 'অগ্রগতি রেকর্ড', value: stats.totalProgress, icon: '📈', color: 'from-emerald-500 to-teal-500', desc: 'লেসন সম্পন্ন' },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/admin" className="text-rose-400 hover:text-rose-300 text-sm mb-4 inline-flex items-center gap-2">
                    ← Admin Panel এ ফিরে যাও
                </Link>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg">
                        🧠
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                            AI Analytics
                        </h1>
                        <p className="text-gray-400 mt-1">Platform এর সামগ্রিক পরিসংখ্যান</p>
                    </div>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {metrics.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-3xl mb-3">{m.icon}</div>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
                            {loading ? '...' : m.value}
                        </p>
                        <p className="text-white font-semibold mt-1">{m.label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{m.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Coming Soon Features */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
                <h2 className="text-xl font-bold text-white mb-4">🚀 শীঘ্রই আসছে</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { icon: '📊', title: 'Learning Progress Chart', desc: 'শিক্ষার্থীদের অগ্রগতির গ্রাফ' },
                        { icon: '🤖', title: 'AI Usage Analytics', desc: 'AI Tutor ব্যবহারের বিশ্লেষণ' },
                        { icon: '📈', title: 'Revenue Graph', desc: 'মাসিক আয়ের চার্ট' },
                        { icon: '🌍', title: 'Geographic Distribution', desc: 'ব্যবহারকারীদের অবস্থান' },
                        { icon: '⭐', title: 'Top Performers', desc: 'সেরা শিক্ষার্থীদের তালিকা' },
                        { icon: '📱', title: 'Device Analytics', desc: 'কোন device থেকে ব্যবহার' },
                    ].map((f, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                            <span className="text-2xl">{f.icon}</span>
                            <div>
                                <p className="font-semibold text-white text-sm">{f.title}</p>
                                <p className="text-gray-400 text-xs">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}