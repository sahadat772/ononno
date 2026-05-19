'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TypewriterText from '@/components/ui/TypewriterText'
import AnimatedCard from '@/components/ui/AnimatedCard'
import StatsCounter from '@/components/ui/StatsCounter'

const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
}

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
}

// const floatAnimation = {
//     initial: { y: 0 },
//     animate: { y: [-10, 10, -10], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }
// }

export default function Home() {
    return (
        <main className="min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-indigo-50/30">

            {/* Premium Navbar */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-black/5 px-6 py-4"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                    >
                        Ononno
                    </motion.div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
                        >
                            লগইন
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/register"
                                className="text-sm font-semibold bg-linear-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-300"
                            >
                                শুরু করো →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section with Aurora Background */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Aurora/Mesh Background */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-100/20 via-white to-emerald-100/20" />
                <div className="absolute top-0 -left-40 w-96 h-96 bg-linear-to-r from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 -right-40 w-96 h-96 bg-linear-to-l from-emerald-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 width: 600px; height: 600px; bg-linear-to-r from-cyan-200/10 to-blue-200/10 rounded-full blur-3xl" />

                <div className="max-w-6xl mx-auto px-6 py-20 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 text-emerald-700 text-sm font-medium px-5 py-2 rounded-full mb-8 shadow-lg"
                    >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Nursery থেকে Masters পর্যন্ত
                    </motion.div>

                    <motion.h1
                        {...fadeUp}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
                    >
                        শিক্ষায়{' '}
                        <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-linear">
                            অনন্য
                        </span>
                        <br />
                        <span className="text-4xl md:text-5xl font-semibold text-gray-600">
                            <TypewriterText
                                texts={[
                                    'AI দিয়ে শেখো',
                                    'ক্যারিয়ার গড়ো',
                                    'কুরআন শিখো',
                                    'দক্ষ হও',
                                ]}
                                className="bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        একাডেমিক শিক্ষা, ইসলামিক জ্ঞান, ক্যারিয়ার গাইডেন্স এবং স্কিল ট্রেনিং —
                        সব এক জায়গায়। AI তোমাকে তোমার মতো করে শেখাবে।
                    </motion.p>

                    <motion.div
                        {...fadeUp}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex items-center justify-center gap-4 flex-wrap"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                বিনামূল্যে শুরু করো
                                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="#features"
                                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl text-base font-medium border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                আরো জানো
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Floating Dashboard Mock Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-16"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            {[
                                { icon: '📖', text: 'কুরআন AI', color: 'from-green-400 to-emerald-500', bg: 'from-green-50/80 to-emerald-50/80' },
                                { icon: '🎓', text: 'Smart Learning', color: 'from-blue-400 to-cyan-500', bg: 'from-blue-50/80 to-cyan-50/80' },
                                { icon: '🧠', text: 'Career AI', color: 'from-purple-400 to-violet-500', bg: 'from-purple-50/80 to-violet-50/80' },
                                { icon: '💹', text: 'Stock Training', color: 'from-amber-400 to-orange-500', bg: 'from-amber-50/80 to-orange-50/80' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.text}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.05 }}
                                    className={`bg-linear-to-br ${item.bg} backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-xl cursor-pointer transition-all duration-300`}
                                >
                                    <div className={`text-3xl mb-2 bg-linear-to-br ${item.color} bg-clip-text text-transparent`}>{item.icon}</div>
                                    <div className="text-xs font-semibold text-gray-700">{item.text}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Premium Stats Section */}
            <section className="py-20 bg-white/40 backdrop-blur-sm border-y border-gray-100/50">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                    >
                        {[
                            { value: 4, suffix: '+', label: 'বছর বয়স থেকে', color: 'from-emerald-500 to-teal-500' },
                            { value: 6, suffix: '', label: 'ML ইঞ্জিন', color: 'from-cyan-500 to-blue-500' },
                            { value: 12, suffix: '+', label: 'ট্রেনিং মডিউল', color: 'from-amber-500 to-orange-500' },
                            { value: 0, prefix: '৳', suffix: '', label: 'শুরুতে খরচ', color: 'from-emerald-500 to-teal-500' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeUp}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className={`text-4xl font-bold mb-2 bg-linear-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                                    <StatsCounter
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        prefix={stat.prefix}
                                    />
                                </div>
                                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section with Glass Cards */}
            <section id="features" className="py-28 bg-linear-to-b from-gray-50/50 to-white">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block bg-linear-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium px-5 py-2 rounded-full mb-4 shadow-sm">
                            সব এক জায়গায়
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            একটি platform,{' '}
                            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">সব সমাধান</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-lg">
                            শিশু থেকে বয়স্ক, ছাত্র থেকে উদ্যোক্তা — সবার জন্য আলাদা learning path
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🕌',
                                title: 'ইসলামিক শিক্ষা',
                                desc: 'কুরআন তিলাওয়াত AI, হাদিস, ফিকহ — সকল মুসলিম শিক্ষার্থীর জন্য বাধ্যতামূলক।',
                                linear: 'from-green-500 to-emerald-600',
                                bg: 'from-green-50/50 to-emerald-50/50',
                                delay: 0,
                            },
                            {
                                icon: '🎓',
                                title: 'একাডেমিক শিক্ষা',
                                desc: 'Nursery থেকে Masters পর্যন্ত বাংলাদেশ কারিকুলাম অনুযায়ী সম্পূর্ণ পাঠ্যক্রম।',
                                linear: 'from-blue-500 to-cyan-600',
                                bg: 'from-blue-50/50 to-cyan-50/50',
                                delay: 0.1,
                            },
                            {
                                icon: '🧠',
                                title: 'AI ক্যারিয়ার গাইড',
                                desc: 'ML দিয়ে তোমার psychology বিশ্লেষণ করে সেরা career path suggest করবে।',
                                linear: 'from-purple-500 to-violet-600',
                                bg: 'from-purple-50/50 to-violet-50/50',
                                delay: 0.2,
                            },
                            {
                                icon: '💹',
                                title: 'Stock Market Training',
                                desc: 'শেয়ার বাজার থেকে হালাল বিনিয়োগ — সম্পূর্ণ practical training।',
                                linear: 'from-amber-500 to-orange-600',
                                bg: 'from-amber-50/50 to-orange-50/50',
                                delay: 0.3,
                            },
                            {
                                icon: '💻',
                                title: 'Skill Development',
                                desc: 'Web, App, AI development, Marketing, Business — সব training এক জায়গায়।',
                                linear: 'from-cyan-500 to-blue-600',
                                bg: 'from-cyan-50/50 to-blue-50/50',
                                delay: 0.4,
                            },
                            {
                                icon: '👨‍👩‍👧',
                                title: 'Parent Dashboard',
                                desc: 'সন্তানের Islamic ও academic progress real-time এ দেখুন।',
                                linear: 'from-rose-500 to-pink-600',
                                bg: 'from-rose-50/50 to-pink-50/50',
                                delay: 0.5,
                            },
                        ].map((feature) => (
                            <AnimatedCard
                                key={feature.title}
                                delay={feature.delay}
                                className={`bg-linear-to-br ${feature.bg} backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
                            >
                                <div className={`w-14 h-14 bg-linear-to-br ${feature.linear} rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-xl">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                            </AnimatedCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="py-28 relative overflow-hidden">
                {/* Animated linear Background */}
                <div className="absolute inset-0 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 animate-linear-x" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 width: 500px; height: 500px; bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2 mb-6"
                        >
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">সীমিত সময়ের অফার</span>
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            আজই শুরু করো
                            <br />
                            <span className="text-white/90">সম্পূর্ণ বিনামূল্যে</span>
                        </h2>
                        <p className="text-emerald-100 mb-10 text-lg max-w-xl mx-auto">
                            এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের জন্য সর্বদা বিনামূল্যে
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-3 bg-white text-emerald-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                এখনই রেজিস্ট্রেশন করো →
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Modern Footer */}
            <footer className="py-12 bg-gray-900 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-gray-800" />
                <div className="relative z-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-2xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3"
                    >
                        Ononno
                    </motion.div>
                    <p className="text-gray-500 text-sm">© 2026 Ononno · শিক্ষায় অনন্য</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link href="/privacy" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
                            গোপনীয়তা
                        </Link>
                        <Link href="/terms" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
                            শর্তাবলী
                        </Link>
                        <Link href="/contact" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
                            যোগাযোগ
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    )
}