'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface User {
    id: string
    full_name: string
    email: string
    role: string
    created_at: string
    class_level?: string
    is_active?: boolean
}

const roleColors: Record<string, string> = {
    student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    teacher: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    parent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    adult: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const roleLabels: Record<string, string> = {
    student: '🎓 শিক্ষার্থী',
    teacher: '👨‍🏫 শিক্ষক',
    parent: '👨‍👩‍👧 অভিভাবক',
    admin: '⚙️ অ্যাডমিন',
    adult: '👤 প্রাপ্তবয়স্ক',
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [stats, setStats] = useState({
        total: 0, students: 0, teachers: 0, parents: 0, adults: 0,
    })

    useEffect(() => {


        const fetchUsers = async () => {
            const supabase = createClient()
            setLoading(true)
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (data) {
                    setUsers(data)
                    setStats({
                        total: data.length,
                        students: data.filter(u => u.role === 'student').length,
                        teachers: data.filter(u => u.role === 'teacher').length,
                        parents: data.filter(u => u.role === 'parent').length,
                        adults: data.filter(u => u.role === 'adult').length,
                    })
                }
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const filteredUsers = users.filter(u => {
        const matchSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchRole = selectedRole === 'all' || u.role === selectedRole
        return matchSearch && matchRole
    })

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/admin" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-flex items-center gap-2">
                    ← Admin Panel এ ফিরে যাও
                </Link>
                <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-3xl shadow-lg">
                            👥
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                ব্যবহারকারী ব্যবস্থাপনা
                            </h1>
                            <p className="text-gray-400 mt-1">মোট {stats.total} জন ব্যবহারকারী</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {[
                    { label: 'মোট', value: stats.total, icon: '👥', color: 'from-blue-500 to-cyan-500' },
                    { label: 'শিক্ষার্থী', value: stats.students, icon: '🎓', color: 'from-emerald-500 to-teal-500' },
                    { label: 'শিক্ষক', value: stats.teachers, icon: '👨‍🏫', color: 'from-violet-500 to-purple-500' },
                    { label: 'অভিভাবক', value: stats.parents, icon: '👨‍👩‍👧', color: 'from-amber-500 to-yellow-500' },
                    { label: 'প্রাপ্তবয়স্ক', value: stats.adults, icon: '👤', color: 'from-rose-500 to-pink-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                    >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                        </div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <input
                    type="text"
                    placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <div className="flex gap-2 flex-wrap">
                    {['all', 'student', 'teacher', 'parent', 'adult', 'admin'].map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${selectedRole === role
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {role === 'all' ? '🌐 সব' : roleLabels[role] || role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-4 animate-pulse h-16" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-4xl mb-3">🔍</p>
                            <p>কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                        </div>
                    ) : (
                        filteredUsers.map((user, i) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                                className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {user.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-white">{user.full_name || 'নাম নেই'}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {roleLabels[user.role] || user.role}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm truncate">{user.email}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('bn-BD')}
                                        </p>
                                        {user.class_level && (
                                            <p className="text-xs text-blue-400">{user.class_level}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded */}
                                <AnimatePresence>
                                    {selectedUser?.id === user.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-white/10"
                                        >
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                                                    <p className="text-xs text-white font-mono truncate">{user.id}</p>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Role</p>
                                                    <p className="text-xs text-white">{roleLabels[user.role] || user.role}</p>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500 mb-1">যোগ দিয়েছেন</p>
                                                    <p className="text-xs text-white">{new Date(user.created_at).toLocaleDateString('bn-BD')}</p>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-3">
                                                    <p className="text-xs text-gray-500 mb-1">শ্রেণী</p>
                                                    <p className="text-xs text-white">{user.class_level || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}