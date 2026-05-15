'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Teacher {
    id: string
    full_name: string
    email: string
    phone: string | null
    avatar_url: string | null
    role: string
}

interface TeacherProfileClientProps {
    teacher: Teacher
    totalStudents: number
}

export default function TeacherProfileClient({
    teacher,
    totalStudents,
}: TeacherProfileClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        full_name: teacher.full_name,
        phone: teacher.phone || '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                phone: formData.phone || null,
            })
            .eq('id', teacher.id)

        if (updateError) {
            setError(updateError.message)
        } else {
            setSaveSuccess(true)
            setIsEditing(false)
            setTimeout(() => setSaveSuccess(false), 3000)
        }
        setIsSaving(false)
    }

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/dashboard/teacher')}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                        ←
                    </motion.button>
                    <div>
                        <h1 className="text-white font-bold">Profile</h1>
                        <p className="text-white/40 text-xs">আপনার তথ্য</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Avatar + Name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4"
                >
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-2xl font-bold">
                        {teacher.avatar_url ? (
                            <img
                                src={teacher.avatar_url}
                                alt={teacher.full_name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            getInitials(teacher.full_name)
                        )}
                    </div>
                    <div className="text-center">
                        <h2 className="text-white text-xl font-bold">{teacher.full_name}</h2>
                        <p className="text-white/40 text-sm">{teacher.email}</p>
                        <span className="mt-2 inline-block text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Teacher
                        </span>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-white font-semibold mb-4">পরিসংখ্যান</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white/5 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-violet-300">{totalStudents}</p>
                            <p className="text-white/40 text-sm mt-1">মোট Students</p>
                        </div>
                    </div>
                </motion.div>

                {/* Edit Profile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">তথ্য সম্পাদনা</h3>
                        {!isEditing && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditing(true)}
                                className="text-violet-400 text-sm hover:text-violet-300 transition"
                            >
                                সম্পাদনা করো
                            </motion.button>
                        )}
                    </div>

                    {saveSuccess && (
                        <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                            ✅ সফলভাবে আপডেট হয়েছে!
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                            ❌ {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-white/50 text-sm mb-1 block">পূর্ণ নাম</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    title="পূর্ণ নাম"
                                    value={formData.full_name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                                    }
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition"
                                />
                            ) : (
                                <p className="text-white px-4 py-3 bg-white/5 rounded-xl">
                                    {teacher.full_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-white/50 text-sm mb-1 block">Email</label>
                            <p className="text-white/50 px-4 py-3 bg-white/5 rounded-xl">
                                {teacher.email}
                            </p>
                        </div>

                        <div>
                            <label className="text-white/50 text-sm mb-1 block">Phone</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    placeholder="01XXXXXXXXX"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition"
                                />
                            ) : (
                                <p className="text-white px-4 py-3 bg-white/5 rounded-xl">
                                    {teacher.phone || 'দেওয়া হয়নি'}
                                </p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold disabled:opacity-50 transition"
                                >
                                    {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFormData({
                                            full_name: teacher.full_name,
                                            phone: teacher.phone || '',
                                        })
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 transition"
                                >
                                    বাতিল
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Logout */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 disabled:opacity-50 transition"
                >
                    {isLoggingOut ? 'Logout হচ্ছে...' : '🚪 Logout'}
                </motion.button>
            </div>
        </div>
    )
}