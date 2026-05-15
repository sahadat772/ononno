'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CreateAccountFormProps {
    role: 'teacher' | 'parent'
    creatorId: string
    onSuccess?: (studentId: string) => void
}

const CLASS_LEVELS = [
    'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10',
    'Class 11', 'Class 12',
    'Honours 1st Year', 'Honours 2nd Year',
    'Honours 3rd Year', 'Honours 4th Year',
    'Masters',
]

export default function CreateAccountForm({
    role,
    creatorId,
    onSuccess,
}: CreateAccountFormProps) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        class_level: '',
        phone: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const endpoint =
            role === 'teacher'
                ? '/api/teacher/create-student'
                : '/api/parent/create-child'

        const payload =
            role === 'teacher'
                ? { teacher_id: creatorId, ...formData }
                : { parent_id: creatorId, ...formData }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'কিছু একটা সমস্যা হয়েছে')
                return
            }

            setSuccess(true)
            setFormData({
                full_name: '',
                email: '',
                password: '',
                class_level: '',
                phone: '',
            })

            if (onSuccess) {
                onSuccess(role === 'teacher' ? data.student_id : data.child_id)
            }

        } catch {
            setError('Server এ সমস্যা হয়েছে, আবার চেষ্টা করো')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
            <h2 className="text-xl font-bold text-white mb-6">
                {role === 'teacher' ? 'নতুন Student যোগ করো' : 'নতুন Child যোগ করো'}
            </h2>

            {success && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm"
                >
                    ✅ Account সফলভাবে তৈরি হয়েছে!
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm"
                >
                    ❌ {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="text-white/60 text-sm mb-1 block">
                        পূর্ণ নাম
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        placeholder="নাম লিখো"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="text-white/60 text-sm mb-1 block">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="text-white/60 text-sm mb-1 block">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        minLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition"
                    />
                </div>

                {/* Class Level */}
                <div>
                    <label className="text-white/60 text-sm mb-1 block">
                        Class Level
                    </label>
                    <select
                        name="class_level"
                        area-lebel="Class Level"
                        title="Class Level"
                        value={formData.class_level}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition"
                    >
                        <option value="">Class বেছে নাও</option>
                        {CLASS_LEVELS.map((level) => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Phone (optional) */}
                <div>
                    <label className="text-white/60 text-sm mb-1 block">
                        Phone (optional)
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition"
                    />
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-violet-600 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isLoading ? 'তৈরি হচ্ছে...' : 'Account তৈরি করো'}
                </motion.button>
            </form>
        </motion.div>
    )
}