'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowRight,
    BookOpen,
    BrainCircuit,
    Check,
    ChevronRight,
    CirclePlay,
    HeartHandshake,
    Menu,
    Rocket,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react'

const learningPaths = [
    { icon: '🧒', title: 'কিডস জোন', subtitle: 'নার্সারি ও কেজি', tone: 'bg-amber-50 text-amber-600 border-amber-100' },
    { icon: '📚', title: 'প্রাইমারি', subtitle: '১ম – ৫ম শ্রেণি', tone: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { icon: '🏫', title: 'সেকেন্ডারি', subtitle: '৬ষ্ঠ – ১০ম শ্রেণি', tone: 'bg-sky-50 text-sky-600 border-sky-100' },
    { icon: '🎯', title: 'উচ্চ মাধ্যমিক', subtitle: 'একাদশ – দ্বাদশ', tone: 'bg-violet-50 text-violet-600 border-violet-100' },
    { icon: '🎓', title: 'বিশ্ববিদ্যালয়', subtitle: 'অনার্স ও মাস্টার্স', tone: 'bg-rose-50 text-rose-600 border-rose-100' },
]

const features = [
    { icon: BookOpen, title: 'এক জায়গায় সব শিক্ষা', description: 'একাডেমিক, ইসলামিক জ্ঞান, ক্যারিয়ার গাইডলাইন ও স্কিল ডেভেলপমেন্ট—সবকিছু একই প্ল্যাটফর্মে।', color: 'bg-emerald-100 text-emerald-700' },
    { icon: BrainCircuit, title: 'তোমার জন্য ব্যক্তিগত AI', description: 'তোমার শেখার গতি ও প্রয়োজন বুঝে AI Tutor সাজেস্ট করবে সঠিক পরবর্তী ধাপ।', color: 'bg-violet-100 text-violet-700' },
    { icon: HeartHandshake, title: 'অভিভাবকও থাকবেন সঙ্গে', description: 'সন্তানের progress ও শেখার অভ্যাস সহজেই দেখুন Parent Dashboard থেকে।', color: 'bg-rose-100 text-rose-700' },
]

const plans = [
    { name: 'নার্সারি', price: '৯৯', tag: 'শেখার প্রথম বন্ধু' },
    { name: 'প্রাইমারি', price: '১৯৯', tag: '১ম – ৫ম শ্রেণি' },
    { name: 'সেকেন্ডারি', price: '২৯৯', tag: '৬ষ্ঠ – ১০ম শ্রেণি', featured: true },
    { name: 'কলেজ', price: '৪৯৯', tag: 'একাদশ – দ্বাদশ' },
]

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
}

export default function Home() {
    return (
        <main className="min-h-screen overflow-x-hidden bg-[#fbfdfc] text-slate-900">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[50rem] bg-[radial-gradient(circle_at_7%_10%,rgba(16,185,129,0.16),transparent_24%),radial-gradient(circle_at_90%_15%,rgba(99,102,241,0.13),transparent_22%),linear-gradient(180deg,#f1fcf6_0%,#fbfdfc_80%)]" />

            <header className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-black text-white shadow-lg shadow-emerald-600/20">অ</span>
                    <span className="text-xl font-black tracking-tight">অনন্য</span>
                </Link>
                <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
                    <a href="#path" className="transition hover:text-emerald-700">শেখার পথ</a>
                    <a href="#features" className="transition hover:text-emerald-700">কেন অনন্য</a>
                    <a href="#pricing" className="transition hover:text-emerald-700">মূল্য</a>
                    <Link href="/contact" className="transition hover:text-emerald-700">যোগাযোগ</Link>
                </nav>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white sm:block">লগইন</Link>
                    <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:px-5">শুরু করুন <ArrowRight className="h-4 w-4" /></Link>
                    <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden" aria-label="মেনু খুলুন"><Menu className="h-5 w-5" /></button>
                </div>
            </header>

            <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm"><Sparkles className="h-3.5 w-3.5" /> বাংলাদেশের স্মার্ট লার্নিং প্ল্যাটফর্ম</div>
                        <h1 className="max-w-3xl text-4xl font-black leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">শিক্ষার প্রতিটি ধাপে <span className="text-emerald-600">অনন্য</span> সঙ্গী</h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">নার্সারি থেকে মাস্টার্স—একাডেমিক পড়াশোনা, ইসলামিক শিক্ষা, AI guidance এবং প্রয়োজনীয় দক্ষতা গড়ার একটি নির্ভরযোগ্য জায়গা।</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:-translate-y-0.5"><Rocket className="h-4 w-4" /> বিনামূল্যে শুরু করুন</Link>
                            <a href="#path" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"><CirclePlay className="h-4 w-4 text-emerald-600" /> কীভাবে কাজ করে</a>
                        </div>
                        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
                            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> নিরাপদ শিক্ষার পরিবেশ</span>
                            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> বাংলা ও NCTB-friendly</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.1 }} className="relative mx-auto w-full max-w-xl">
                        <div className="rounded-[2rem] border border-white bg-white p-5 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.35)] sm:p-7">
                            <div className="flex items-center justify-between">
                                <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">আজকের শেখা</p><h2 className="mt-1 text-xl font-black">তোমার Learning Journey</h2></div>
                                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-xl">🌱</span>
                            </div>
                            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700"><BookOpen className="h-5 w-5" /></span><div><p className="font-bold text-slate-800">আজকের পাঠ</p><p className="mt-0.5 text-xs text-slate-500">গণিত · অধ্যায় ৩</p></div></div>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">চলছে</span>
                                </div>
                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" /></div>
                                <p className="mt-2 text-right text-xs font-semibold text-slate-500">৭২% সম্পন্ন</p>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-amber-50 p-4"><p className="text-2xl font-black text-amber-600">১২</p><p className="mt-1 text-xs font-semibold text-amber-900/70">দিনের স্ট্রিক 🔥</p></div><div className="rounded-2xl bg-sky-50 p-4"><p className="text-2xl font-black text-sky-600">৪.৯</p><p className="mt-1 text-xs font-semibold text-sky-900/70">শিক্ষার্থী রেটিং ★</p></div></div>
                        </div>
                        <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-lg sm:flex"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><BrainCircuit className="h-5 w-5" /></span><span><b className="block text-sm">AI Tutor</b><small className="text-xs text-slate-500">তোমার জন্য সাজানো</small></span></div>
                    </motion.div>
                </div>
            </section>

            <section className="border-y border-emerald-100 bg-white/75"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-5 py-7 text-center sm:grid-cols-4"><Stat value="৪+" label="বছর বয়স থেকে" /><Stat value="১০০%" label="বাংলা কনটেন্ট" /><Stat value="২৪/৭" label="AI সহায়তা" /><Stat value="৳০" label="শুরু করতে খরচ নেই" /></div></section>

            <section id="path" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                <motion.div {...fadeUp} className="mx-auto mb-11 max-w-2xl text-center"><p className="text-sm font-bold text-emerald-600">একটি প্ল্যাটফর্ম, প্রতিটি ধাপ</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">তোমার বয়স, তোমার শেখার পথ</h2><p className="mt-4 leading-7 text-slate-600">তোমার বর্তমান স্তর বেছে নাও, আর শুরু করো নিজের গতিতে শেখা।</p></motion.div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{learningPaths.map((path, index) => <motion.div {...fadeUp} transition={{ delay: index * 0.06 }} key={path.title} whileHover={{ y: -6 }} className={`group cursor-default rounded-2xl border p-5 transition-shadow hover:shadow-lg ${path.tone}`}><span className="text-3xl">{path.icon}</span><h3 className="mt-5 font-black text-slate-800">{path.title}</h3><p className="mt-1 text-sm text-slate-500">{path.subtitle}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold">শুরু করুন <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></motion.div>)}</div>
            </section>

            <section id="features" className="bg-slate-900 px-5 py-20 text-white sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><motion.div {...fadeUp} className="mb-12 max-w-2xl"><p className="text-sm font-bold text-emerald-400">শুধু ক্লাস নয়, সম্পূর্ণ সহায়তা</p><h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">শেখা হবে সহজ,<br />লক্ষ্য হবে আরও কাছে</h2></motion.div><div className="grid gap-5 md:grid-cols-3">{features.map((feature, index) => { const Icon = feature.icon; return <motion.article {...fadeUp} transition={{ delay: index * 0.08 }} key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-7"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${feature.color}`}><Icon className="h-6 w-6" /></span><h3 className="mt-6 text-xl font-black">{feature.title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p></motion.article> })}</div></div></section>

            <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><motion.div {...fadeUp} className="mx-auto mb-11 max-w-2xl text-center"><p className="text-sm font-bold text-emerald-600">সবার জন্য সহজ মূল্য</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">তোমার প্রয়োজনের প্ল্যান বেছে নাও</h2><p className="mt-4 leading-7 text-slate-600">বার্ষিক প্ল্যানে থাকছে বিশেষ ছাড়। শুরু করার জন্য কোনো বাধ্যবাধকতা নেই।</p></motion.div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{plans.map((plan, index) => <motion.div {...fadeUp} transition={{ delay: index * 0.07 }} key={plan.name} className={`relative rounded-3xl border p-6 ${plan.featured ? 'border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-600/10' : 'border-slate-200 bg-white'}`}>{plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">সবচেয়ে জনপ্রিয়</span>}<h3 className="font-black text-slate-800">{plan.name}</h3><p className="mt-2 text-sm text-slate-500">{plan.tag}</p><p className="mt-6 text-4xl font-black text-slate-900"><span className="text-xl">৳</span>{plan.price}<span className="ml-1 text-sm font-medium text-slate-500">/মাস</span></p><Link href="/register" className="mt-6 flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">প্ল্যানটি নিন</Link></motion.div>)}</div></section>

            <section className="px-5 pb-20 sm:px-8 lg:pb-28"><motion.div {...fadeUp} className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-6 py-14 text-center text-white shadow-xl sm:px-12"><div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" /><div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-current" /> আজই শেখা শুরু করুন</span><h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">ভালো ভবিষ্যৎ গড়ার<br />শুরুটা হোক আজ থেকেই</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-emerald-50 sm:text-base">হাজারো শিক্ষার্থী ও অভিভাবকের সঙ্গে যুক্ত হোন। অনন্য আপনার শেখার পথ সহজ করে দেবে।</p><Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-emerald-700 shadow-lg transition hover:-translate-y-0.5">এখনই রেজিস্ট্রেশন করুন <ArrowRight className="h-4 w-4" /></Link></div></motion.div></section>

            <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 text-center sm:flex-row sm:px-8 sm:text-left lg:px-10"><Link href="/" className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-sm font-black text-white">অ</span><span className="font-black">অনন্য</span></Link><p className="text-xs text-slate-500">© {new Date().getFullYear()} অনন্য · বাংলাদেশের শিক্ষার্থীদের জন্য</p><div className="flex gap-4 text-xs font-semibold text-slate-500"><Link href="/contact" className="hover:text-emerald-700">যোগাযোগ</Link><Link href="/login" className="hover:text-emerald-700">লগইন</Link></div></div></footer>
        </main>
    )
}

function Stat({ value, label }: { value: string; label: string }) {
    return <div><p className="text-2xl font-black text-emerald-600 sm:text-3xl">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{label}</p></div>
}
