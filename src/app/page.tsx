'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import TypewriterText from '@/components/ui/TypewriterText'
import StatsCounter from '@/components/ui/StatsCounter'

const features = [
    {
        icon: '🕌',
        title: 'ইসলামিক শিক্ষা',
        desc: 'কুরআন তিলাওয়াত AI, হাদিস, ফিকহ — সকল মুসলিম শিক্ষার্থীর জন্য।',
        linear: 'from-emerald-500 to-teal-400',
        border: 'border-emerald-500/20',
        glow: 'rgba(16,185,129,0.08)',
    },
    {
        icon: '🎓',
        title: 'একাডেমিক শিক্ষা',
        desc: 'Nursery থেকে Masters — NCTB curriculum অনুযায়ী সম্পূর্ণ পাঠ্যক্রম।',
        linear: 'from-blue-500 to-cyan-400',
        border: 'border-blue-500/20',
        glow: 'rgba(59,130,246,0.08)',
    },
    {
        icon: '🧠',
        title: 'AI ক্যারিয়ার গাইড',
        desc: 'ML দিয়ে তোমার মনস্তত্ত্ব বিশ্লেষণ করে সেরা career path suggest করবে।',
        linear: 'from-violet-500 to-purple-400',
        border: 'border-violet-500/20',
        glow: 'rgba(139,92,246,0.08)',
    },
    {
        icon: '💹',
        title: 'Stock Market Training',
        desc: 'শেয়ার বাজার থেকে হালাল বিনিয়োগ — সম্পূর্ণ practical training।',
        linear: 'from-amber-500 to-orange-400',
        border: 'border-amber-500/20',
        glow: 'rgba(245,158,11,0.08)',
    },
    {
        icon: '💻',
        title: 'Skill Development',
        desc: 'Web, App, AI, Marketing, Business — সব training এক platform এ।',
        linear: 'from-cyan-500 to-blue-400',
        border: 'border-cyan-500/20',
        glow: 'rgba(6,182,212,0.08)',
    },
    {
        icon: '👨‍👩‍👧',
        title: 'Parent Dashboard',
        desc: 'সন্তানের Islamic ও academic progress real-time এ monitor করুন।',
        linear: 'from-rose-500 to-pink-400',
        border: 'border-rose-500/20',
        glow: 'rgba(244,63,94,0.08)',
    },
]

const learningPaths = [
    { icon: '🧒', label: 'Kids Zone', sub: 'Nursery & KG', color: 'from-yellow-400 to-orange-400' },
    { icon: '📚', label: 'Primary', sub: 'Class 1–5', color: 'from-green-400 to-emerald-500' },
    { icon: '🏫', label: 'Secondary', sub: 'Class 6–10', color: 'from-blue-400 to-cyan-500' },
    { icon: '🏛️', label: 'HSC', sub: 'Class 11–12', color: 'from-violet-400 to-purple-500' },
    { icon: '🎓', label: 'University', sub: 'Honors & Masters', color: 'from-rose-400 to-pink-500' },
]

export default function Home() {
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

    return (
        <main className="min-h-screen bg-[#07071a] text-white overflow-x-hidden">

            {/* ── AMBIENT BACKGROUND ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 width: 600px; height: 600px; bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-0 width: 500px; height: 500px; bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 width: 400px; height: 400px; bg-blue-500/4 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-[0.018]"
                    style={{
                        backgroundImage: 'linear-linear(rgba(255,255,255,1) 1px, transparent 1px), linear-linear(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '72px 72px',
                    }}
                />
            </div>

            {/* ── NAVBAR ── */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.06] bg-[#07071a]/80 backdrop-blur-2xl"
            >
                <div className="max-w-6xl mx-auto h-full px-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-base font-black shadow-lg shadow-emerald-500/30">
                            অ
                        </div>
                        <span className="font-black text-white text-xl tracking-tight">অনন্য</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {[
                            { label: 'বৈশিষ্ট্য', href: '#features' },
                            { label: 'মূল্য', href: '#pricing' },
                            { label: 'যোগাযোগ', href: '/contact' },
                            { label: '🤲 বিনামূল্যে আবেদন', href: '/free-access' },
                        ].map((item, i) => (
                            <a key={i} href={item.href}
                                className={`text-sm font-medium transition-colors ${item.label.includes('আবেদন')
                                    ? 'text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10'
                                    : 'text-gray-400 hover:text-white'
                                    }`}>
                                {item.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login"
                            className="text-sm font-medium text-gray-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                            লগইন
                        </Link>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Link href="/register"
                                className="text-sm font-semibold bg-linear-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                                শুরু করো →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            {/* ── HERO ── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-5 text-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium px-5 py-2 rounded-full mb-8"
                    >
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Nursery থেকে Masters পর্যন্ত — বাংলাদেশের প্রথম AI EdTech
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
                    >
                        শিক্ষায়{' '}
                        <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            অনন্য
                        </span>
                        <br />
                        <span className="text-3xl md:text-5xl font-bold text-gray-400 mt-2 block">
                            <TypewriterText
                                texts={['AI দিয়ে শেখো', 'ক্যারিয়ার গড়ো', 'কুরআন শিখো', 'দক্ষ হও']}
                                className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                            />
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        একাডেমিক শিক্ষা, ইসলামিক জ্ঞান, ক্যারিয়ার গাইডেন্স এবং স্কিল ট্রেনিং —
                        সব এক জায়গায়। AI তোমাকে তোমার মতো করে শেখাবে।
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex items-center justify-center gap-4 flex-wrap mb-16"
                    >
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Link href="/register"
                                className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                                বিনামূল্যে শুরু করো →
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Link href="#features"
                                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-8 py-4 rounded-2xl text-base font-medium hover:bg-white/10 hover:border-white/20 transition-all">
                                আরো জানো
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Learning Path Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex items-center justify-center gap-3 flex-wrap"
                    >
                        {learningPaths.map((path, i) => (
                            <motion.div
                                key={path.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.08 }}
                                whileHover={{ y: -6, scale: 1.05 }}
                                className="bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm rounded-2xl px-5 py-4 cursor-pointer transition-all hover:bg-white/[0.08] hover:border-white/15 min-width: 100px;"
                            >
                                <div className={`text-2xl mb-1.5 bg-linear-to-br ${path.color} bg-clip-text`}>{path.icon}</div>
                                <div className="text-white text-xs font-bold">{path.label}</div>
                                <div className="text-gray-500 text-[10px] mt-0.5">{path.sub}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-[#07071a] to-transparent pointer-events-none" />
            </section>

            {/* ── STATS ── */}
            <section className="py-16 border-y border-white/[0.06] bg-white/[0.02]">
                <div className="max-w-5xl mx-auto px-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 4, suffix: '+', label: 'বছর বয়স থেকে শেখা যায়', linear: 'from-emerald-400 to-teal-400' },
                            { value: 6, suffix: '', label: 'AI/ML ইঞ্জিন একসাথে', linear: 'from-cyan-400 to-blue-400' },
                            { value: 12, suffix: '+', label: 'ট্রেনিং মডিউল', linear: 'from-amber-400 to-orange-400' },
                            { value: 0, prefix: '৳', suffix: '', label: 'শুরু করতে কোনো খরচ নেই', linear: 'from-emerald-400 to-teal-400' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className={`text-4xl md:text-5xl font-black mb-2 bg-linear-to-r ${stat.linear} bg-clip-text text-transparent`}>
                                    <StatsCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-28">
                <div className="max-w-6xl mx-auto px-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium px-4 py-2 rounded-full mb-4">
                            ✨ সব এক জায়গায়
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            একটি platform,{' '}
                            <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                সব সমাধান
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            শিশু থেকে বয়স্ক, ছাত্র থেকে উদ্যোক্তা — সবার জন্য আলাদা learning path
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -6 }}
                                className={`relative rounded-2xl border ${feature.border} bg-white/[0.03] hover:bg-white/[0.06] p-6 transition-all duration-300 overflow-hidden group cursor-pointer`}
                                style={{ boxShadow: `0 0 40px ${feature.glow}` }}
                            >
                                <div className={`absolute inset-0 bg-linear-to-br ${feature.linear} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />
                                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.linear} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FREE ACCESS BANNER ── */}
            <section className="py-16 px-5">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden border border-emerald-500/20 p-8 md:p-12 text-center"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/8 via-teal-500/5 to-transparent" />
                        <div className="relative z-10">
                            <div className="text-4xl mb-4">🤲</div>
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                                এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের জন্য সর্বদা বিনামূল্যে
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                                আমরা বিশ্বাস করি শিক্ষা সবার অধিকার। আর্থিক সংকট কখনো শেখার বাধা হবে না।
                            </p>
                            <Link href="/free-access"
                                className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all text-sm">
                                এখানে আবেদন করো →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
            {/* ── PRICING ── */}
            <section id="pricing" className="py-28">
                <div className="max-w-6xl mx-auto px-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium px-4 py-2 rounded-full mb-4">
                            💳 সাশ্রয়ী মূল্য
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            তোমার বাজেটে{' '}
                            <span className="bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                সেরা প্ল্যান
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            মাত্র ৳৯৯ থেকে শুরু — শ্রেণী অনুযায়ী প্ল্যান বেছে নাও
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: '🌱', name: 'নার্সারি', price: '৳৯৯', color: 'from-green-400 to-emerald-500' },
                            { icon: '📚', name: 'শ্রেণী ৩-৫', price: '৳১৯৯', color: 'from-blue-400 to-cyan-500' },
                            { icon: '📖', name: 'শ্রেণী ৬-৮', price: '৳২৯৯', color: 'from-violet-400 to-purple-500' },
                            { icon: '🎯', name: 'শ্রেণী ৯-১০', price: '৳৩৯৯', color: 'from-amber-400 to-orange-500' },
                            { icon: '🏆', name: 'শ্রেণী ১১-১২', price: '৳৪৯৯', color: 'from-rose-400 to-pink-500' },
                            { icon: '🎓', name: 'বিশ্ববিদ্যালয়', price: '৳৫৯৯', color: 'from-indigo-400 to-blue-500' },
                            { icon: '🚀', name: 'Skill Pro', price: '৳৭৯৯', color: 'from-purple-400 to-violet-500' },
                            { icon: '👨‍👩‍👧', name: 'পারিবারিক', price: '৳৯৯৯', color: 'from-emerald-400 to-teal-500' },
                        ].map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -6 }}
                                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center hover:bg-white/[0.06] transition-all"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${plan.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg`}>
                                    {plan.icon}
                                </div>
                                <p className="text-white font-bold text-sm mb-1">{plan.name}</p>
                                <p className={`text-xl font-black bg-linear-to-r ${plan.color} bg-clip-text text-transparent`}>
                                    {plan.price}
                                </p>
                                <p className="text-gray-600 text-xs mt-1">প্রতি মাস</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-gray-500 text-sm mb-4">
                            বার্ষিক plan এ ৩০% ছাড় পাবে!
                        </p>
                        <Link href="/register"
                            className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-amber-500/25">
                            বিনামূল্যে শুরু করো →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section id="about" className="py-28 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium px-4 py-2 rounded-full mb-4">
                            🤝 আমাদের সম্পর্কে
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            কেন{' '}
                            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                অনন্য?
                            </span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            আমরা বিশ্বাস করি প্রতিটি শিশু অনন্য। তাই আমাদের AI প্রতিটি শিক্ষার্থীর
                            শেখার ধরন বুঝে তাকে সেভাবে শেখায়। আপনার সন্তান শিখবে তার মতো করে, তার গতিতে। আমরা শুধু content দিই না, আমরা শেখার অভিজ্ঞতা তৈরি করি।
                            বর্তমান শিক্ষাব্যবস্থা যেখানে standardized, সেখানে অনন্য personalized। আমরা শুধু শিক্ষাই দিই না, আমরা Islamic মূল্যবোধও শেখাই। কুরআন ও সুন্নাহ আমাদের পথ দেখায়।
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        {[
                            {
                                icon: '🕌',
                                title: 'ইসলামিক মূল্যবোধ',
                                desc: 'প্রতিটি content ইসলামিক দৃষ্টিভঙ্গিতে তৈরি। কুরআন ও সুন্নাহ আমাদের পথ দেখায়।',
                                color: 'from-emerald-400 to-teal-400',
                                border: 'border-emerald-500/20',
                            },
                            {
                                icon: '🇧🇩',
                                title: 'বাংলাদেশের জন্য',
                                desc: 'NCTB curriculum অনুসরণ করে বাংলায় তৈরি — বাংলাদেশের শিক্ষার্থীদের কথা মাথায় রেখে।',
                                color: 'from-blue-400 to-cyan-400',
                                border: 'border-blue-500/20',
                            },
                            {
                                icon: '🤖',
                                title: 'AI-Powered',
                                desc: 'Groq, LLaMA, Whisper — সর্বাধুনিক AI দিয়ে personalized শিক্ষার অভিজ্ঞতা।',
                                color: 'from-violet-400 to-purple-400',
                                border: 'border-violet-500/20',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`rounded-2xl border ${item.border} bg-white/[0.03] p-6 text-center`}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}>
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mission Statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 md:p-12 text-center"
                    >
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                            আমাদের লক্ষ্য
                        </h3>
                        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-lg">
                            ২০৩০ সালের মধ্যে বাংলাদেশের প্রতিটি শিক্ষার্থীর হাতে
                            মানসম্পন্ন শিক্ষা পৌঁছে দেওয়া — প্রযুক্তি ও ইসলামিক মূল্যবোধের সমন্বয়ে।
                            আপনারকে আমরা স্বাগত জানাই এই যাত্রায়। একসাথে আমরা শিক্ষার landscape পরিবর্তন করতে পারি।
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-8 flex-wrap">
                            {[
                                { value: '৳৯৯', label: 'থেকে শুরু' },
                                { value: '১০০%', label: 'বাংলায়' },
                                { value: '২৪/৭', label: 'AI Tutor' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                    <p className="text-gray-500 text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-linear(rgba(255,255,255,1) 1px, transparent 1px), linear-linear(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2 mb-6">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">সীমিত সময়ের অফার</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                            আজই শুরু করো
                            <br />
                            <span className="text-white/80 text-3xl md:text-4xl">সম্পূর্ণ বিনামূল্যে</span>
                        </h2>
                        <p className="text-emerald-100 mb-10 text-lg">
                            লক্ষাধিক শিক্ষার্থী ইতোমধ্যে শিখছে — তুমিও শুরু করো আজই!
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                            <Link href="/register"
                                className="inline-flex items-center gap-3 bg-white text-emerald-700 px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-white/20 transition-all">
                                এখনই রেজিস্ট্রেশন করো →
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>


            {/* ── FOOTER ── */}
            < footer className="py-12 border-t border-white/[0.06] bg-[#05050f]" >
                <div className="max-w-6xl mx-auto px-5 text-center">
                    <div className="flex items-center justify-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-black">
                            অ
                        </div>
                        <span className="font-black text-white text-xl">অনন্য</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">© 2026 অনন্য · শিক্ষায় অনন্য — Made with ❤️ in Bangladesh</p>
                    <div className="flex justify-center gap-6">
                        {['গোপনীয়তা', 'শর্তাবলী', 'যোগাযোগ'].map((item, i) => (
                            <Link key={i} href="#"
                                className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </ footer>
        </main >
    )
}