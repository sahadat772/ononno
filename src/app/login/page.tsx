'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়')
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

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-semibold text-green-700">
                        অনন্য
                    </Link>
                    <p className="text-gray-500 text-sm mt-2">
                        তোমার অ্যাকাউন্টে লগইন করো
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                ইমেইল
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="তোমার ইমেইল লেখো"
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-gray-700">
                                    পাসওয়ার্ড
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-green-700 hover:underline"
                                >
                                    পাসওয়ার্ড ভুলে গেছো?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="তোমার পাসওয়ার্ড লেখো"
                                required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'লগইন হচ্ছে...' : 'লগইন করো'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">অথবা</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Register link */}
                    <p className="text-center text-sm text-gray-500">
                        অ্যাকাউন্ট নেই?{' '}
                        <Link
                            href="/register"
                            className="text-green-700 font-medium hover:underline"
                        >
                            রেজিস্ট্রেশন করো
                        </Link>
                    </p>
                </div>

                {/* Free access note */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীরা{' '}
                    <Link href="/free-access" className="text-green-700 hover:underline">
                        এখানে আবেদন করো
                    </Link>
                </p>
            </div>
        </main>
    )
}