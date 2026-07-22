'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    return (
        <main className="min-h-screen bg-[#07071a] text-white flex items-center justify-center px-4 py-16">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-black shadow-lg">
                                অ
                            </div>
                            <span className="font-black text-white text-2xl">অনন্য</span>
                        </Link>
                        <h1 className="text-3xl font-black text-white mb-2">যোগাযোগ করো</h1>
                        <p className="text-gray-400">আমরা সবসময় তোমার পাশে আছি</p>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {[
                            { icon: '📧', label: 'ইমেইল', value: 'support@ononno.com.bd', href: 'mailto:support@ononno.com.bd' },
                            { icon: '📱', label: 'WhatsApp', value: '+880 1XXX-XXXXXX', href: '#' },
                            { icon: '📍', label: 'ঠিকানা', value: 'ঢাকা, বাংলাদেশ', href: '#' },
                        ].map((item, i) => (
                            <a key={i} href={item.href}
                                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="text-white font-medium text-sm">{item.value}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Message Form */}
                    {!sent ? (
                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 space-y-4">
                            <h2 className="font-bold text-white">বার্তা পাঠাও</h2>
                            <div>
                                <input
                                    type="text"
                                    placeholder="তোমার নাম"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="ইমেইল ঠিকানা"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="তোমার বার্তা লেখো..."
                                    value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-600 resize-none"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (form.name && form.email && form.message) setSent(true)
                                }}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg"
                            >
                                পাঠাও →
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 text-center"
                        >
                            <div className="text-5xl mb-4">✅</div>
                            <h2 className="text-xl font-bold text-white mb-2">বার্তা পাঠানো হয়েছে!</h2>
                            <p className="text-gray-400 text-sm mb-4">আমরা শীঘ্রই তোমার সাথে যোগাযোগ করবো।</p>
                            <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                                ← Home এ ফিরে যাও
                            </Link>
                        </motion.div>
                    )}

                    <p className="text-center text-gray-600 text-xs mt-6">
                        <Link href="/" className="hover:text-gray-400 transition-colors">← Home</Link>
                        {' · '}
                        <Link href="/free-access" className="hover:text-gray-400 transition-colors">Free Access</Link>
                        {' · '}
                        <Link href="/login" className="hover:text-gray-400 transition-colors">Login</Link>
                    </p>
                </motion.div>
            </div>
        </main>
    )
}