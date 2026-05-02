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

export default function Home() {
    return (
        <main className="min-h-screen overflow-hidden">

            {/* Navbar */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/50 px-6 py-4"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-xl font-bold text-gradient-primary"
                    >
                        Ononno
                    </motion.div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                        >
                            লগইন
                        </Link>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/register"
                                className="text-sm gradient-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-green-200 hover:shadow-green-300 transition-shadow"
                            >
                                শুরু করো →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero */}
            <section className="gradient-hero min-h-screen flex items-center pt-20 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float" />

                <div className="max-w-6xl mx-auto px-6 py-20 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-8 shadow-sm"
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Nursery থেকে Masters পর্যন্ত
                    </motion.div>

                    <motion.h1
                        {...fadeUp}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
                    >
                        শিক্ষায়{' '}
                        <span className="text-gradient-primary">অনন্য</span>
                        <br />
                        <span className="text-4xl md:text-5xl font-semibold text-gray-600">
                            <TypewriterText
                                texts={[
                                    'AI দিয়ে শেখো',
                                    'ক্যারিয়ার গড়ো',
                                    'কুরআন শিখো',
                                    'দক্ষ হও',
                                ]}
                                className="text-gradient-secondary"
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
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 gradient-primary text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-xl shadow-green-200 hover:shadow-green-300 transition-all"
                            >
                                বিনামূল্যে শুরু করো
                                <span className="text-lg">→</span>
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="#features"
                                className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl text-base font-medium border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all"
                            >
                                আরো জানো
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Floating cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                    >
                        {[
                            { icon: '📖', text: 'কুরআন AI', color: 'from-green-50 to-emerald-50' },
                            { icon: '🎓', text: 'Smart Learning', color: 'from-blue-50 to-cyan-50' },
                            { icon: '🧠', text: 'Career AI', color: 'from-purple-50 to-violet-50' },
                            { icon: '💹', text: 'Stock Training', color: 'from-amber-50 to-orange-50' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.text}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                whileHover={{ y: -6, scale: 1.03 }}
                                className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 border border-white shadow-sm cursor-pointer`}
                            >
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <div className="text-xs font-medium text-gray-700">{item.text}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                    >
                        {[
                            { value: 4, suffix: '+', label: 'বছর বয়স থেকে', color: 'text-gradient-primary' },
                            { value: 6, suffix: '', label: 'ML ইঞ্জিন', color: 'text-gradient-secondary' },
                            { value: 12, suffix: '+', label: 'ট্রেনিং মডিউল', color: 'text-gradient-warm' },
                            { value: 0, prefix: '৳', suffix: '', label: 'শুরুতে খরচ', color: 'text-gradient-primary' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeUp}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                                    <StatsCounter
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        prefix={stat.prefix}
                                    />
                                </div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block bg-purple-50 text-purple-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                            সব এক জায়গায়
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            একটি platform,{' '}
                            <span className="text-gradient-primary">সব সমাধান</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            শিশু থেকে বয়স্ক, ছাত্র থেকে উদ্যোক্তা — সবার জন্য আলাদা learning path
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '🕌',
                                title: 'ইসলামিক শিক্ষা',
                                desc: 'কুরআন তিলাওয়াত AI, হাদিস, ফিকহ — সকল মুসলিম শিক্ষার্থীর জন্য বাধ্যতামূলক।',
                                gradient: 'from-green-500 to-emerald-600',
                                bg: 'from-green-50 to-emerald-50',
                                delay: 0,
                            },
                            {
                                icon: '🎓',
                                title: 'একাডেমিক শিক্ষা',
                                desc: 'Nursery থেকে Masters পর্যন্ত বাংলাদেশ কারিকুলাম অনুযায়ী সম্পূর্ণ পাঠ্যক্রম।',
                                gradient: 'from-blue-500 to-cyan-600',
                                bg: 'from-blue-50 to-cyan-50',
                                delay: 0.1,
                            },
                            {
                                icon: '🧠',
                                title: 'AI ক্যারিয়ার গাইড',
                                desc: 'ML দিয়ে তোমার psychology বিশ্লেষণ করে সেরা career path suggest করবে।',
                                gradient: 'from-purple-500 to-violet-600',
                                bg: 'from-purple-50 to-violet-50',
                                delay: 0.2,
                            },
                            {
                                icon: '💹',
                                title: 'Stock Market Training',
                                desc: 'শেয়ার বাজার থেকে হালাল বিনিয়োগ — সম্পূর্ণ practical training।',
                                gradient: 'from-amber-500 to-orange-600',
                                bg: 'from-amber-50 to-orange-50',
                                delay: 0.3,
                            },
                            {
                                icon: '💻',
                                title: 'Skill Development',
                                desc: 'Web, App, AI development, Marketing, Business — সব training এক জায়গায়।',
                                gradient: 'from-cyan-500 to-blue-600',
                                bg: 'from-cyan-50 to-blue-50',
                                delay: 0.4,
                            },
                            {
                                icon: '👨‍👩‍👧',
                                title: 'Parent Dashboard',
                                desc: 'সন্তানের Islamic ও academic progress real-time এ দেখুন।',
                                gradient: 'from-rose-500 to-pink-600',
                                bg: 'from-rose-50 to-pink-50',
                                delay: 0.5,
                            },
                        ].map((feature) => (
                            <AnimatedCard
                                key={feature.title}
                                delay={feature.delay}
                                className={`bg-gradient-to-br ${feature.bg} border-0 p-6`}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                            </AnimatedCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 gradient-primary opacity-95" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            আজই শুরু করো
                            <br />
                            সম্পূর্ণ বিনামূল্যে
                        </h2>
                        <p className="text-green-100 mb-10 text-lg">
                            এতিম, দরিদ্র ও প্রতিবন্ধী শিক্ষার্থীদের জন্য সর্বদা বিনামূল্যে
                        </p>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-3 bg-white text-green-700 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all"
                            >
                                এখনই রেজিস্ট্রেশন করো →
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 bg-gray-900 text-center">
                <div className="text-gradient-primary font-bold text-xl mb-2">Ononno</div>
                <p className="text-gray-500 text-sm">© 2026 Ononno · শিক্ষায় অনন্য</p>
            </footer>
        </main>
    )
}