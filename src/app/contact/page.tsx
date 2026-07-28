'use client'

import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Headphones,
    Mail,
    MapPin,
    MessageCircle,
    Send,
    Sparkles,
} from 'lucide-react'

const contactOptions = [
    {
        icon: Mail,
        title: 'ইমেইল করুন',
        detail: 'support@ononno.com.bd',
        helper: 'যেকোনো প্রশ্ন বা পরামর্শ',
        href: 'mailto:support@ononno.com.bd',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: MessageCircle,
        title: 'হোয়াটসঅ্যাপে কথা বলুন',
        detail: '+880 1615680137',
        helper: 'দ্রুত সহায়তার জন্য',
        href: 'https://wa.me/880',
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        icon: MapPin,
        title: 'আমাদের ঠিকানা',
        detail: 'ঢাকা, বাংলাদেশ',
        helper: 'দেশজুড়ে শিক্ষার সঙ্গী',
        href: '#contact-form',
        color: 'bg-violet-50 text-violet-600',
    },
]

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (form.name.trim() && form.email.trim() && form.message.trim()) {
            setSent(true)
        }
    }

    const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'

    return (
        <main className="min-h-screen overflow-hidden bg-[#f8fbfa] text-slate-900">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_12%_15%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(99,102,241,0.12),transparent_25%),linear-gradient(180deg,#effcf5_0%,#f8fbfa_82%)]" />

            <section className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
                <nav className="flex items-center justify-between" aria-label="প্রধান নেভিগেশন">
                    <Link href="/" className="group inline-flex items-center gap-2.5">
                        {/* <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-black text-white shadow-lg shadow-emerald-600/20">অ</span> */}
                        <Image
                            src="/icons/logo-icon.png"
                            alt="অনন্য"
                            width={40}
                            height={40}
                            className="rounded-xl"
                        />
                        <span className="text-xl font-black tracking-tight text-slate-900">অনন্য</span>
                    </Link>
                    <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-emerald-700">
                        <ArrowLeft className="h-4 w-4" />
                        হোমে ফিরুন
                    </Link>
                </nav>

                <div className="grid items-start gap-10 pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-20">
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            আপনার শেখার সঙ্গী, সবসময় পাশে
                        </div>
                        <h1 className="max-w-xl text-4xl font-black leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                            চলুন, <span className="text-emerald-600">কথা বলি</span>
                        </h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                            কোর্স, অ্যাকাউন্ট বা পড়াশোনার যেকোনো সহায়তায় আমাদের জানাও। অনন্য টিম যত দ্রুত সম্ভব তোমার পাশে থাকবে।
                        </p>

                        <div className="mt-8 space-y-3">
                            {contactOptions.map((option, index) => {
                                const Icon = option.icon
                                return (
                                    <motion.a
                                        key={option.title}
                                        href={option.href}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.12 + index * 0.08 }}
                                        whileHover={{ x: 4 }}
                                        className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                    >
                                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${option.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-bold text-slate-800">{option.title}</span>
                                            <span className="mt-0.5 block truncate text-sm text-slate-500">{option.detail} <span className="hidden sm:inline">· {option.helper}</span></span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-emerald-600" />
                                    </motion.a>
                                )
                            })}
                        </div>

                        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><Clock3 className="h-4.5 w-4.5" /></span>
                            <span><strong className="font-bold">সাপোর্ট সময়:</strong> প্রতিদিন সকাল ৯টা থেকে রাত ১০টা</span>
                        </div>
                    </motion.div>

                    <motion.div
                        id="contact-form"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="rounded-[2rem] border border-white bg-white p-6 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.28)] sm:p-8"
                    >
                        {!sent ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-7 flex items-start gap-3">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Headphones className="h-5 w-5" /></span>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">একটি বার্তা পাঠান</h2>
                                        <p className="mt-1 text-sm leading-5 text-slate-500">ফর্মটি পূরণ করুন, আমরা দ্রুত আপনার সঙ্গে যোগাযোগ করব।</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-slate-700">আপনার নাম</span>
                                        <input type="text" required placeholder="যেমন: তানজিলা ইসলাম" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-slate-700">ইমেইল ঠিকানা</span>
                                        <input type="email" required placeholder="আপনার ইমেইল লিখুন" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={inputClass} />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-slate-700">কীভাবে সাহায্য করতে পারি?</span>
                                        <textarea required rows={5} placeholder="আপনার প্রশ্ন বা সমস্যাটি সংক্ষেপে লিখুন..." value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} className={`${inputClass} resize-none`} />
                                    </label>
                                </div>

                                <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:shadow-emerald-600/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/25">
                                    বার্তা পাঠান
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
                                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-10 w-10" /></span>
                                <h2 className="mt-6 text-2xl font-black text-slate-900">বার্তাটি পাঠানো হয়েছে!</h2>
                                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">ধন্যবাদ। আমাদের টিম খুব শিগগিরই আপনার সঙ্গে যোগাযোগ করবে, ইনশাআল্লাহ।</p>
                                <button type="button" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }} className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">আরেকটি বার্তা লিখুন</button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <p className="mt-12 text-center text-xs text-slate-400">© {new Date().getFullYear()} অনন্য · বাংলাদেশের শিক্ষার্থীদের জন্য ভালোবাসা দিয়ে তৈরি</p>
            </section>
        </main>
    )
}
