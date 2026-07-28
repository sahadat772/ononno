'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

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
        <main className="relative min-h-screen overflow-hidden bg-[#050816] flex items-center justify-center px-4 py-12">

            {/* Animated Background */}

            <div className="absolute inset-0 overflow-hidden">

                {/* Base liner */}
                <div className="absolute inset-0 bg-liner-to-br from-[#071428] via-[#081221] to-[#04050d]" />

                {/* Emerald Glow */}
                <motion.div
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -60, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-emerald-500/20 blur-[120px]"
                />

                {/* Blue Glow */}
                <motion.div
                    animate={{
                        x: [0, -70, 0],
                        y: [0, 70, 0],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-[-180px] right-[-120px] w-[560px] h-[560px] rounded-full bg-cyan-500/15 blur-[140px]"
                />

                {/* Purple Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-violet-600/10 blur-[170px]"
                />

                {/* Grid */}

                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            `linear-liner(rgba(255,255,255,.08) 1px, transparent 1px),
                 linear-liner(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Noise */}

                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "radial-liner(circle,#fff 1px,transparent 1px)",
                        backgroundSize: "26px 26px",
                    }}
                />
            </div>

            <div className="w-full max-w-md relative z-10">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .6 }}
                    className="text-center mb-10"
                >

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 mb-6">

                        <span className="text-emerald-400">
                            ✨
                        </span>

                        <span className="text-xs tracking-wide text-emerald-300 font-semibold">

                            বাংলাদেশের স্মার্ট লার্নিং প্ল্যাটফর্ম

                        </span>

                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-4"
                    >

                        <motion.div
                            whileHover={{
                                rotate: 8,
                                scale: 1.08,
                            }}
                            className="w-16 h-16 rounded-[22px]
                                bg-liner-to-br
                                from-emerald-400
                                via-teal-500
                                to-cyan-500
                                text-red-800
                                flex
                                items-center
                                justify-center
                                text-3xl
                                font-black
                                shadow-[0_0_50px_rgba(16,185,129,.45)]
                            "
                        >

                            {/* অ */}
                            <Image
                                src="/icons/logo-icon.png"
                                alt="অনন্য"
                                width={40}
                                height={40}
                                className="rounded-xl"
                            />

                        </motion.div>

                        <div className="text-left">

                            <h1 className="text-4xl font-black text-white tracking-tight">

                                অনন্য

                            </h1>

                            <p className="text-gray-400">

                                AI Powered Learning Platform

                            </p>

                        </div>

                    </Link>

                    <motion.h2

                        initial={{ opacity: 0 }}

                        animate={{ opacity: 1 }}

                        transition={{ delay: .3 }}

                        className="mt-8 text-3xl font-black text-white"

                    >

                        স্বাগতম 👋

                    </motion.h2>

                    <p className="text-gray-400 mt-3 max-w-sm mx-auto leading-7">

                        নিরাপদভাবে লগইন করে শেখা শুরু করো।
                        হাজারো শিক্ষার্থীর সাথে যুক্ত হও এবং প্রতিদিন নতুন কিছু শেখো।

                    </p>

                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: .95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: .5 }}
                    className="
                            relative
                            overflow-hidden
                            rounded-[34px]
                            border
                            border-white/10
                            bg-white/[0.05]
                            backdrop-blur-2xl
                            shadow-[0_25px_80px_rgba(0,0,0,.45)]
                            p-8
                        "
                >

                    <div className="mb-8">
                        <div className="absolute inset-0 rounded-[34px] border border-white/5 pointer-events-none" />

                        <div className="absolute -top-20 right-0 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="absolute bottom-0 -left-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />

                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 mb-4">

                            <span>🔐</span>

                            <span className="text-xs text-emerald-300 font-semibold">

                                Secure Login

                            </span>

                        </div>

                        <h2 className="text-3xl font-black text-white">

                            লগইন করো

                        </h2>

                        <p className="text-gray-400 mt-2">

                            তোমার শেখার যাত্রা আবার শুরু হোক।

                        </p>

                    </div>
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

                            <label className="block text-sm font-semibold text-gray-300 mb-2">

                                📧 ইমেইল

                            </label>

                            <div className="relative">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">

                                    ✉️

                                </span>

                                <input

                                    type="email"

                                    value={email}

                                    onChange={(e) => setEmail(e.target.value)}

                                    placeholder="example@email.com"

                                    required

                                    className="

                                            w-full

                                            pl-12

                                            pr-4

                                            py-4

                                            rounded-2xl

                                            bg-white/5

                                            border

                                            border-white/10

                                            text-white

                                            placeholder:text-gray-500

                                            focus:border-emerald-400

                                            focus:ring-4

                                            focus:ring-emerald-500/20

                                            transition-all

                                        "

                                />

                            </div>

                        </div>

                        {/* Password */}
                        <div>

                            <div className="flex justify-between mb-2">

                                <label className="text-sm font-semibold text-gray-300">

                                    🔒 পাসওয়ার্ড

                                </label>

                                <Link

                                    href="/forgot-password"

                                    className="text-emerald-400 text-xs hover:text-emerald-300"

                                >

                                    ভুলে গেছো?

                                </Link>

                            </div>

                            <div className="relative">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">

                                    🔑

                                </span>

                                <input

                                    type={showPassword ? 'text' : 'password'}

                                    value={password}

                                    onChange={(e) => setPassword(e.target.value)}

                                    placeholder="তোমার পাসওয়ার্ড"

                                    required

                                    className="

                                        w-full

                                        pl-12

                                        pr-12

                                        py-4

                                        rounded-2xl

                                        bg-white/5

                                        border

                                        border-white/10

                                        text-white

                                        focus:border-emerald-400

                                        focus:ring-4

                                        focus:ring-emerald-500/20

                                        transition-all

                                    "

                                />

                                <button

                                    type="button"

                                    onClick={() => setShowPassword(!showPassword)}

                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"

                                >

                                    {showPassword ? "🙈" : "👁️"}

                                </button>

                            </div>

                        </div>
                        <div className="flex items-center justify-between">

                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">

                                <input

                                    type="checkbox"

                                    className="rounded border-white/20 bg-transparent"

                                />

                                আমাকে মনে রাখো

                            </label>

                            <div className="text-xs text-emerald-400">

                                🛡 নিরাপদ সংযোগ

                            </div>

                        </div>

                        {/* Submit */}
                        <motion.button

                            type="submit"

                            disabled={loading}

                            whileHover={{ scale: 1.02 }}

                            whileTap={{ scale: .98 }}

                            className="

                                    group

                                    relative

                                    overflow-hidden

                                    w-full

                                    rounded-2xl

                                    bg-liner-to-r

                                    from-emerald-500

                                    via-teal-500

                                    to-cyan-500

                                    py-4

                                    font-bold

                                    text-white

                                    shadow-[0_15px_40px_rgba(16,185,129,.35)]

                                    transition-all

                                "

                        >

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity" />

                            <span className="relative flex items-center justify-center gap-3">

                                {loading ?

                                    <>

                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                                        লগইন হচ্ছে...

                                    </>

                                    :

                                    <>

                                        ✨

                                        লগইন করো

                                        <span className="group-hover:translate-x-1 transition-transform">

                                            →

                                        </span>

                                    </>

                                }

                            </span>

                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">

                        <div className="flex-1 h-px bg-liner-to-r from-transparent via-white/20 to-transparent" />

                        <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                            অথবা
                        </span>

                        <div className="flex-1 h-px bg-liner-to-r from-transparent via-white/20 to-transparent" />

                    </div>


                    {/* Register link */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">

                        <p className="text-gray-400">

                            এখনও অ্যাকাউন্ট নেই?

                        </p>

                        <Link

                            href="/register"

                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition-all"

                        >

                            ✨

                            নতুন অ্যাকাউন্ট তৈরি করো

                        </Link>

                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-8">

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">

                            <div className="text-2xl mb-2">
                                📚
                            </div>

                            <p className="text-white font-bold">
                                ১০০+
                            </p>

                            <p className="text-[11px] text-gray-400">
                                কোর্স
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">

                            <div className="text-2xl mb-2">
                                🎓
                            </div>

                            <p className="text-white font-bold">
                                ৫০K+
                            </p>

                            <p className="text-[11px] text-gray-400">
                                শিক্ষার্থী
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">

                            <div className="text-2xl mb-2">
                                ⭐
                            </div>

                            <p className="text-white font-bold">
                                4.9
                            </p>

                            <p className="text-[11px] text-gray-400">
                                Rating
                            </p>

                        </div>

                    </div>
                </motion.div>
                <motion.div

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ delay: .5 }}

                    className="grid grid-cols-3 gap-4 mt-8"

                >

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">

                        <div className="text-2xl">

                            🔒

                        </div>

                        <p className="text-xs text-gray-400 mt-2">

                            SSL Secure

                        </p>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">

                        <div className="text-2xl">

                            🛡️

                        </div>

                        <p className="text-xs text-gray-400 mt-2">

                            Protected

                        </p>

                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">

                        <div className="text-2xl">

                            🇧🇩

                        </div>

                        <p className="text-xs text-gray-400 mt-2">

                            বাংলাদেশ

                        </p>

                    </div>

                </motion.div>

                {/* Free access */}
                <motion.div

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ delay: .7 }}

                    className="mt-8 rounded-3xl border border-emerald-500/20 bg-liner-to-r from-emerald-500/10 to-cyan-500/10 p-6 text-center"

                >

                    <div className="text-5xl mb-3">

                        🎓

                    </div>

                    <h3 className="text-lg font-bold text-white">

                        বিশেষ সহায়তা কর্মসূচি

                    </h3>

                    <p className="text-sm text-gray-300 mt-2 leading-7">

                        এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের জন্য
                        সম্পূর্ণ বিনামূল্যে শেখার সুযোগ।

                    </p>

                    <Link

                        href="/free-access"

                        className="inline-flex items-center gap-2 mt-5 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400 transition-all"

                    >

                        এখনই আবেদন করো

                        →

                    </Link>

                </motion.div>
            </div>
            <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">

                <p className="text-xs text-gray-500">

                    © ২০২৬ <span className="text-emerald-400 font-semibold">অনন্য</span>

                </p>

                <p className="text-[11px] text-gray-600 mt-1">

                    বাংলাদেশের শিশুদের জন্য ভালোবাসা দিয়ে তৈরি ❤️

                </p>

            </footer>
        </main>
    )
}