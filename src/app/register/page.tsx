'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ClassLevel, UserRole } from '@/types/database'

const roles = [
    { value: 'student', label: '🎓 শিক্ষার্থী', desc: 'Nursery থেকে Masters' },
    { value: 'parent', label: '👨‍👩‍👧 অভিভাবক', desc: 'সন্তানের progress দেখো' },
    { value: 'teacher', label: '👨‍🏫 শিক্ষক', desc: 'Students পরিচালনা করো' },
    { value: 'skill_learner', label: '💻 Skill Learner', desc: 'নতুন দক্ষতা অর্জন করো' },
]

const classLevels = [
    { value: 'nursery', label: 'নার্সারি' },
    { value: 'kg', label: 'কেজি' },
    { value: 'class_1', label: 'শ্রেণী ১' },
    { value: 'class_2', label: 'শ্রেণী ২' },
    { value: 'class_3', label: 'শ্রেণী ৩' },
    { value: 'class_4', label: 'শ্রেণী ৪' },
    { value: 'class_5', label: 'শ্রেণী ৫' },
    { value: 'class_6', label: 'শ্রেণী ৬' },
    { value: 'class_7', label: 'শ্রেণী ৭' },
    { value: 'class_8', label: 'শ্রেণী ৮' },
    { value: 'class_9', label: 'শ্রেণী ৯' },
    { value: 'class_10', label: 'শ্রেণী ১০' },
    { value: 'class_11', label: 'শ্রেণী ১১' },
    { value: 'class_12', label: 'শ্রেণী ১২' },
    { value: 'university', label: 'বিশ্ববিদ্যালয়' },
    { value: 'masters', label: 'মাস্টার্স' },
]

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student' as UserRole,
        religion: 'muslim',
        class_level: 'class_6' as ClassLevel,
        gender: '',
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const supabase = createClient()
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        phone: formData.phone,
                        role: formData.role,
                        religion: formData.religion,
                    },
                },
            })
            if (signUpError) { setError(signUpError.message); return }

            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone || null,
                    role: formData.role,
                    religion: formData.religion,
                })
                if (formData.role === 'student') {
                    await supabase.from('student_profiles').insert({
                        user_id: data.user.id,
                        class_level: formData.class_level,
                        gender: formData.gender || null,
                    })
                }
                if (formData.role === 'parent') {
                    await supabase.from('parent_profiles').insert({
                        user_id: data.user.id,
                        gender: formData.gender || null,
                    })
                }
            }
            router.push('/auth/redirect')
            router.refresh()
        } catch {
            setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।')
        } finally {
            setLoading(false)
        }
    }

    const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all placeholder:text-gray-600'
    const selectCls = inputCls + ' cursor-pointer'

    return (
        <main className="min-h-screen bg-[#07071a] flex items-center justify-center px-4 py-10 relative overflow-hidden">

            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: 'linear-linear(rgba(255,255,255,1) 1px, transparent 1px), linear-linear(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '64px 64px' }}
                />
            </div>

            <div className="w-full max-w-md relative z-10">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-black shadow-lg shadow-emerald-500/30">
                            অ
                        </div>
                        <span className="font-black text-white text-2xl tracking-tight">অনন্য</span>
                    </Link>
                    <p className="text-gray-500 text-sm">নতুন অ্যাকাউন্ট তৈরি করো</p>
                </motion.div>

                {/* Step Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mb-6"
                >
                    {[1, 2].map(s => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s
                                ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                                : 'bg-white/10 text-gray-500 border border-white/10'
                                }`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s < 2 && (
                                <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-linear-to-r from-emerald-500 to-teal-500' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-sm"
                >
                    <form onSubmit={handleRegister} className="space-y-4">

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── STEP 1 ── */}
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">পুরো নাম</label>
                                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                                            placeholder="তোমার পুরো নাম লেখো" required className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">ইমেইল</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                                            placeholder="example@email.com" required className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">পাসওয়ার্ড</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                                                onChange={handleChange} placeholder="কমপক্ষে ৬ অক্ষর" required minLength={6}
                                                className={inputCls + ' pr-12'} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-lg">
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                            ফোন নম্বর <span className="text-gray-600 normal-case">(ঐচ্ছিক)</span>
                                        </label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                            placeholder="01XXXXXXXXX" className={inputCls} />
                                    </div>

                                    <motion.button
                                        type="button"
                                        onClick={() => {
                                            if (!formData.full_name || !formData.email || !formData.password) {
                                                setError('নাম, ইমেইল ও পাসওয়ার্ড দাও')
                                                return
                                            }
                                            setError('')
                                            setStep(2)
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-linear-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                                    >
                                        পরের ধাপ →
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* ── STEP 2 ── */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {/* Role Select */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">তুমি কে?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {roles.map(r => (
                                                <button
                                                    key={r.value}
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, role: r.value as UserRole }))}
                                                    className={`p-3 rounded-xl border text-left transition-all ${formData.role === r.value
                                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/8'
                                                        }`}
                                                >
                                                    <p className="text-xs font-bold">{r.label}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{r.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Class Level */}
                                    {formData.role === 'student' && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">শ্রেণী</label>
                                            <select name="class_level" aria-label='class-level' value={formData.class_level} onChange={handleChange} className={selectCls}>
                                                {classLevels.map(c => (
                                                    <option key={c.value} value={c.value} className="bg-[#0f0f2a]">{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Religion */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">ধর্ম</label>
                                        <select name="religion" aria-label='religion' value={formData.religion} onChange={handleChange} className={selectCls}>
                                            <option value="muslim" className="bg-[#0f0f2a]">মুসলিম</option>
                                            <option value="hindu" className="bg-[#0f0f2a]">হিন্দু</option>
                                            <option value="christian" className="bg-[#0f0f2a]">খ্রিস্টান</option>
                                            <option value="buddhist" className="bg-[#0f0f2a]">বৌদ্ধ</option>
                                            <option value="other" className="bg-[#0f0f2a]">অন্যান্য</option>
                                        </select>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">লিঙ্গ</label>
                                        <select name="gender" aria-label='gender' value={formData.gender} onChange={handleChange} className={selectCls}>
                                            <option value="" className="bg-[#0f0f2a]">নির্বাচন করো</option>
                                            <option value="male" className="bg-[#0f0f2a]">ছেলে</option>
                                            <option value="female" className="bg-[#0f0f2a]">মেয়ে</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button" onClick={() => setStep(1)}
                                            className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-all">
                                            ← পেছনে
                                        </button>
                                        <motion.button
                                            type="submit"
                                            disabled={loading}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 bg-linear-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    তৈরি হচ্ছে...
                                                </span>
                                            ) : '✅ অ্যাকাউন্ট তৈরি করো'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        আগেই অ্যাকাউন্ট আছে?{' '}
                        <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                            লগইন করো
                        </Link>
                    </p>
                </motion.div>

                {/* Free access */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-xs text-gray-600 mt-6"
                >
                    এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীরা{' '}
                    <Link href="/free-access" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        এখানে আবেদন করো
                    </Link>
                </motion.p>
            </div>
        </main>
    )
}