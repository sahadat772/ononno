'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ClassLevel, UserRole } from '@/types/database'
import Image from 'next/image'

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

    const inputCls = 'w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-12 pr-4 text-white placeholder:text-gray-600 transition-all duration-300 focus:border-emerald-400 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none'
    const selectCls = inputCls + ' appearance-none cursor-pointer'

    return (
        <main className="min-h-screen bg-[#07071a] flex items-center justify-center px-4 py-10 relative overflow-hidden">

            {/* Premium Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#050816] via-[#0b1024] to-[#050816]" />
                <motion.div
                    animate={{ x: [0, 40, -20, 0], y: [0, -20, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-24 left-1/4 w-[420px] h-[420px] rounded-full bg-emerald-500/15 blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -50, 30, 0], y: [0, 30, -20, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute bottom-0 right-1/4 w-[380px] h-[380px] rounded-full bg-violet-500/15 blur-[120px]"
                />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
                        backgroundSize: '70px 70px',
                    }}
                />
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 4 + i, repeat: Infinity }}
                        className="absolute rounded-full bg-white/10"
                        style={{ width: 6 + i, height: 6 + i, left: `${10 + i * 8}%`, top: `${10 + (i % 5) * 18}%` }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-lg">

                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-3xl bg-emerald-500 blur-xl opacity-40" />
                            {/* <div className="relative w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                                অ
                            </div> */}
                            <Image
                                src="/icons/logo-icon.png"
                                alt="অনন্য"
                                width={40}
                                height={40}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-black text-white">অনন্য</h1>
                            <p className="text-xs text-emerald-300 tracking-wider uppercase">AI Learning Platform</p>
                        </div>
                    </Link>
                    <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-xs font-semibold text-emerald-300 mb-4">
                        ✨ বাংলাদেশের স্মার্ট শিক্ষা প্ল্যাটফর্ম
                    </span>
                    <h2 className="text-2xl font-black text-white">নতুন অ্যাকাউন্ট তৈরি করো</h2>
                    <p className="text-gray-400 mt-2 text-sm">Nursery থেকে Masters পর্যন্ত AI Learning শুরু করো।</p>
                </div>

                {/* Step Indicator */}
                <div className="mb-6 flex items-center">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s !== 2 && (
                                <div className={`flex-1 h-1 mx-3 rounded-full transition-all ${step > s ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl shadow-[0_25px_80px_rgba(16,185,129,.15)] p-8 hover:border-emerald-500/20 transition-all"
                >
                    <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

                    {/* Loading Overlay */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center"
                            >
                                <div className="rounded-3xl bg-[#111827] border border-white/10 p-8 text-center">
                                    <div className="w-14 h-14 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
                                    <p className="mt-5 text-white font-semibold">অপেক্ষা করুন...</p>
                                    <p className="text-gray-400 text-sm mt-2">আপনার অ্যাকাউন্ট তৈরি করা হচ্ছে</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mb-4 bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-4 py-3 rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <AnimatePresence mode="wait">

                            {/* STEP 1 */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, scale: .97, y: 25 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: .97, y: -20 }}
                                    transition={{ duration: .35 }}
                                    className="space-y-4"
                                >
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold tracking-wider uppercase text-gray-400">👤 পুরো নাম</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
                                            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                                                placeholder="তোমার পুরো নাম" required className={inputCls} />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold tracking-wider uppercase text-gray-400">✉️ ইমেইল</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2">✉️</span>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                                placeholder="example@email.com" required className={inputCls} />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold tracking-wider uppercase text-gray-400">🔒 পাসওয়ার্ড</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                                                onChange={handleChange} placeholder="কমপক্ষে ৬ অক্ষর" required minLength={6}
                                                className={inputCls + ' pr-12'} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-white transition">
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {/* Password Strength */}
                                        {formData.password.length > 0 && (
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-500">Password Strength</span>
                                                    <span className={formData.password.length >= 10 ? 'text-green-400' : formData.password.length >= 6 ? 'text-yellow-400' : 'text-red-400'}>
                                                        {formData.password.length >= 10 ? 'Strong' : formData.password.length >= 6 ? 'Medium' : 'Weak'}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${formData.password.length >= 10 ? 'w-full bg-green-500' : formData.password.length >= 6 ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-red-500'}`} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold tracking-wider uppercase text-gray-400">
                                            📱 ফোন <span className="text-gray-600 normal-case">(ঐচ্ছিক)</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📱</span>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                                placeholder="01XXXXXXXXX" className={inputCls} />
                                        </div>
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
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                                    >
                                        পরের ধাপ →
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, scale: .97, y: 25 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: .97, y: -20 }}
                                    transition={{ duration: .35 }}
                                    className="space-y-4"
                                >
                                    {/* Role */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">তুমি কে?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {roles.map(r => (
                                                <button key={r.value} type="button"
                                                    onClick={() => setFormData(p => ({ ...p, role: r.value as UserRole }))}
                                                    className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${formData.role === r.value
                                                        ? 'border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                                                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                                                        }`}
                                                >
                                                    <p className="font-bold text-white text-sm">{r.label}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{r.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Class Level */}
                                    {formData.role === 'student' && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">শ্রেণী</label>
                                            <select name="class_level" aria-label="class-level" value={formData.class_level} onChange={handleChange} className={selectCls}>
                                                {classLevels.map(c => (
                                                    <option key={c.value} value={c.value} className="bg-[#0f0f2a]">{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Religion */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">ধর্ম</label>
                                        <select name="religion" aria-label="religion" value={formData.religion} onChange={handleChange} className={selectCls}>
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
                                        <select name="gender" aria-label="gender" value={formData.gender} onChange={handleChange} className={selectCls}>
                                            <option value="" className="bg-[#0f0f2a]">নির্বাচন করো</option>
                                            <option value="male" className="bg-[#0f0f2a]">ছেলে</option>
                                            <option value="female" className="bg-[#0f0f2a]">মেয়ে</option>
                                        </select>
                                    </div>

                                    {/* Security note */}
                                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-gray-300 flex gap-3">
                                        <span className="text-xl shrink-0">🔒</span>
                                        <div>
                                            <b className="text-white">আপনার তথ্য নিরাপদ</b>
                                            <p className="mt-1 text-gray-400 text-xs">আপনার সকল তথ্য নিরাপদভাবে সংরক্ষণ করা হবে।</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setStep(1)}
                                            className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-all">
                                            ← পেছনে
                                        </button>
                                        <motion.button
                                            type="submit"
                                            disabled={loading}
                                            whileHover={{ scale: 1.02, boxShadow: '0 20px 50px rgba(16,185,129,.35)' }}
                                            whileTap={{ scale: .98 }}
                                            className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-4 font-bold text-white shadow-xl transition disabled:opacity-60"
                                        >
                                            <span className="relative flex items-center justify-center gap-2">
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                        তৈরি হচ্ছে...
                                                    </>
                                                ) : (
                                                    <>✨ রেজিস্ট্রেশন সম্পন্ন করুন →</>
                                                )}
                                            </span>
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
                <p className="text-center text-xs text-gray-600 mt-6">
                    এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীরা{' '}
                    <Link href="/free-access" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        এখানে আবেদন করো
                    </Link>
                </p>

                {/* Bottom badges */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                        { icon: '🔐', label: 'Secure' },
                        { icon: '⚡', label: 'Fast' },
                        { icon: '🎓', label: 'Education' },
                    ].map((b, i) => (
                        <div key={i} className="rounded-2xl bg-white/[0.04] p-4 text-center">
                            <div className="text-2xl">{b.icon}</div>
                            <p className="text-xs mt-2 text-gray-400">{b.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ambient orbs */}
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 8 }}
                className="absolute top-20 right-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ y: [0, 25, 0] }}
                transition={{ repeat: Infinity, duration: 10 }}
                className="absolute bottom-20 left-0 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"
            />
        </main>
    )
}