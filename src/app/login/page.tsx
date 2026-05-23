'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError('ইমেইল বা পাসওয়ার্ড সঠিক নয় ❌')
                return
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

    return (
        <main className="min-h-screen bg-[#07071a] flex items-center justify-center px-4 relative overflow-hidden">

            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
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
                    <p className="text-gray-500 text-sm">তোমার অ্যাকাউন্টে লগইন করো</p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-sm"
                >
                    <form onSubmit={handleLogin} className="space-y-5">

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

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                ইমেইল
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                required
                                className={inputCls}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    পাসওয়ার্ড
                                </label>
                                <Link href="/forgot-password"
                                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                    ভুলে গেছো?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="তোমার পাসওয়ার্ড"
                                    required
                                    className={inputCls + ' pr-12'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-lg"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-linear-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    লগইন হচ্ছে...
                                </span>
                            ) : 'লগইন করো →'}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/[0.07]" />
                        <span className="text-xs text-gray-600">অথবা</span>
                        <div className="flex-1 h-px bg-white/[0.07]" />
                    </div>

                    {/* Register link */}
                    <p className="text-center text-sm text-gray-500">
                        অ্যাকাউন্ট নেই?{' '}
                        <Link href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                            রেজিস্ট্রেশন করো
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