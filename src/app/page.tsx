'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  GraduationCap,
  Menu,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import SiteFooter from '@/components/shared/SiteFooter'

/** Hard navigation — avoids stuck client router / SW edge cases */
function AuthLink({
  href,
  className,
  children,
}: {
  href: '/login' | '/register'
  className?: string
  children: React.ReactNode
}) {
  return (
    <a href={href} className={className} role="link">
      {children}
    </a>
  )
}

const stats = [
  { icon: BookOpen, label: '১০০+ পাঠ', sub: 'NCTB ভিত্তিক লেসন' },
  { icon: GraduationCap, label: 'বিশেষজ্ঞ নির্দেশনা', sub: 'নিজের গতিতে শেখো' },
  { icon: Users, label: 'শেখা বাড়ছে', sub: 'প্রতিদিন নতুন শিক্ষার্থী' },
]

const categories = [
  { id: 'kids', icon: '🧒', title: 'কিডস জোন', sub: 'নার্সারি · কেজি', href: '/register' },
  { id: 'primary', icon: '📚', title: 'প্রাইমারি', sub: '১ম – ৫ম শ্রেণি', href: '/register' },
  { id: 'secondary', icon: '🏫', title: 'সেকেন্ডারি', sub: '৬ষ্ঠ – ১০ম শ্রেণি', href: '/register' },
  { id: 'hsc', icon: '🎯', title: 'উচ্চ মাধ্যমিক', sub: 'একাদশ – দ্বাদশ', href: '/register' },
  { id: 'gk', icon: '🌍', title: 'সাধারণ জ্ঞান', sub: 'মজার তথ্য · কুইজ', href: '/register' },
  { id: 'lang', icon: '🗣️', title: 'ভাষা শেখা', sub: 'বাংলা · ইংরেজি', href: '/register' },
]

const classCards = [
  { bn: 'প্রথম শ্রেণি', en: 'Class One', emoji: '1️⃣' },
  { bn: 'দ্বিতীয় শ্রেণি', en: 'Class Two', emoji: '2️⃣' },
  { bn: 'তৃতীয় শ্রেণি', en: 'Class Three', emoji: '3️⃣' },
  { bn: 'চতুর্থ শ্রেণি', en: 'Class Four', emoji: '4️⃣' },
  { bn: 'পঞ্চম শ্রেণি', en: 'Class Five', emoji: '5️⃣' },
  { bn: 'ষষ্ঠ শ্রেণি', en: 'Class Six', emoji: '6️⃣' },
]

const features = [
  {
    icon: PlayCircle,
    title: 'নিজের গতিতে শেখো',
    desc: 'এখন পড়াশোনা হবে ঘরেই — অনলাইন কিম্বা অফলাইনে, যখন খুশি।',
  },
  {
    icon: BrainCircuit,
    title: 'স্মার্ট লেসন',
    desc: 'প্রতিটি বিষয় ধাপে ধাপে — শোনা, বলা, মিলানো, কুইজ ও XP।',
  },
  {
    icon: ShieldCheck,
    title: 'নিরাপদ কনটেন্ট',
    desc: 'শুধু published NCTB লেসন — AI তৈরি, শিক্ষক/অ্যাডমিন রিভিউ।',
  },
]

const testimonials = [
  {
    name: 'ফারজানা আক্তার',
    text: 'সারাদিন কাজের পরও ছেলের পড়া নিয়ে চিন্তা থাকত। অনন্য-এর লেসন দেখে এখন ঘরে বসেই শেখাতে পারি।',
  },
  {
    name: 'নীলিমা হাসান',
    text: 'ভিডিও ও গেমের মতো স্টেপ থাকায় বাচ্চা নিজে নিজেই আগ্রহ নিয়ে শেখে। নতুন ক্লাসের জন্যও নিতে চাই।',
  },
  {
    name: 'ওবায়দুর রহমান',
    text: 'ইংরেজি ও অঙ্কের ভয় কমেছে। অল্প সময়েই লেসন শেষ করে quiz দিতে পারে।',
  },
]

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
            <div className="min-w-0">
              <p className="text-lg font-black leading-none tracking-tight">অনন্য</p>
              <p className="hidden text-[10px] font-semibold text-emerald-600 sm:block">
                ONONNO · Learn anywhere
              </p>
            </div>
          </Link>

          <div className="hidden max-w-xs flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">কোর্স বা শ্রেণি খুঁজুন…</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#categories" className="transition hover:text-emerald-700">
              ক্যাটাগরি
            </a>
            <a href="#classes" className="transition hover:text-emerald-700">
              শ্রেণি
            </a>
            <a href="#why" className="transition hover:text-emerald-700">
              কেন অনন্য
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <AuthLink
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 sm:px-4"
            >
              লগইন
            </AuthLink>
            <AuthLink
              href="/register"
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-95 sm:px-4"
            >
              রেজিস্টার <ArrowRight className="hidden h-4 w-4 sm:block" />
            </AuthLink>
            <button
              type="button"
              className="ml-0.5 grid size-10 place-items-center rounded-xl border border-slate-200 bg-white md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
              <a href="#categories" onClick={() => setMenuOpen(false)}>
                ক্যাটাগরি
              </a>
              <a href="#classes" onClick={() => setMenuOpen(false)}>
                শ্রেণি
              </a>
              <a href="#why" onClick={() => setMenuOpen(false)}>
                কেন অনন্য
              </a>
              <AuthLink href="/login" className="pt-2 font-bold">
                লগইন
              </AuthLink>
              <AuthLink
                href="/register"
                className="rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white"
              >
                রেজিস্ট্রেশন
              </AuthLink>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero (DSR-style full banner) ── */}
      <section className="relative z-10 min-h-[min(72vh,560px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(105deg, rgba(6,78,59,0.88) 0%, rgba(15,23,42,0.75) 45%, rgba(6,78,59,0.55) 100%), url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80)',
          }}
        />
        <div className="relative mx-auto flex min-h-[min(72vh,560px)] max-w-6xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            NCTB · AI Lesson · Kids Zone
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl"
          >
            স্কুল যাবে ঘরে
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-xl text-base text-emerald-50/95 sm:text-lg"
          >
            বাংলাদেশের শিক্ষার্থীদের জন্য ডিজিটাল ক্লাসরুম — নার্সারি থেকে দ্বাদশ, গেমসহ লেসন ও কুইজ।
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <AuthLink
              href="/register"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 text-sm font-black text-white shadow-xl shadow-black/20 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              আজই রেজিস্টার করো
            </AuthLink>
            <span className="hidden text-white/60 sm:inline">অথবা</span>
            <AuthLink
              href="/login"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              লগ ইন
            </AuthLink>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="relative z-10 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 sm:py-10">
          {stats.map((s) => (
            <div key={s.label} className="flex items-start gap-3 text-left sm:justify-center sm:text-center">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 sm:mx-auto sm:mb-1">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="sm:w-full">
                <p className="text-lg font-black sm:text-xl">{s.label}</p>
                <p className="text-sm text-emerald-50/90">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="relative z-10 bg-[#f8fafc] py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">টপ ক্যাটাগরি</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">তোমার স্তর বেছে নাও — এক ক্লিকে শুরু</p>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <motion.div key={c.id} {...fade} transition={{ delay: i * 0.04 }}>
                <AuthLink
                  href="/register"
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-3xl">
                    {c.icon}
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-black text-slate-900">{c.title}</p>
                    <p className="text-sm text-slate-500">{c.sub}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-emerald-600" />
                </AuthLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Class cards ── */}
      <section id="classes" className="relative z-10 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">শ্রেণি অনুযায়ী কোর্স</h2>
              <p className="mt-2 text-sm text-slate-600">প্রাইমারি থেকে ধাপে ধাপে এগিয়ে যাও</p>
            </div>
            <AuthLink href="/register" className="text-sm font-bold text-emerald-700 hover:underline">
              সব দেখো →
            </AuthLink>
          </motion.div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classCards.map((c, i) => (
              <motion.div
                key={c.en}
                {...fade}
                transition={{ delay: i * 0.04 }}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 text-5xl transition group-hover:from-emerald-100 group-hover:to-cyan-100">
                  {c.emoji}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-black text-slate-900">{c.bn}</p>
                    <p className="text-xs font-semibold text-slate-500">{c.en}</p>
                  </div>
                  <AuthLink
                    href="/register"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                  >
                    দেখো
                  </AuthLink>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why / features ── */}
      <section id="why" className="relative z-10 border-t border-slate-100 bg-[#f8fafc] py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">কেন অনন্য বেছে নেবে?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              মানসম্পন্ন শিক্ষা সবার জন্য — সহজ বাংলায়, খেলার মতো স্টেপে
            </p>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fade}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-black">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">অভিভাবকরা কী বলেন</h2>
            <p className="mt-2 text-sm text-slate-600">বিশ্বাসযোগ্য শেখার অভিজ্ঞতা</p>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={t.name}
                {...fade}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm leading-relaxed text-slate-600">“{t.text}”</p>
                <footer className="mt-4 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                    {t.name.slice(0, 1)}
                  </span>
                  <cite className="not-italic text-sm font-bold text-slate-900">{t.name}</cite>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 px-5 pb-16 sm:px-8 sm:pb-20">
        <motion.div
          {...fade}
          className="mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-12 text-center text-white shadow-2xl sm:px-12"
        >
          <h2 className="text-3xl font-black sm:text-4xl">আজই শেখা শুরু করো</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-emerald-50 sm:text-base">
            ফ্রি অ্যাকাউন্ট খুলে কিডস জোন ও NCTB লেসন এক্সপ্লোর করো
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AuthLink
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-emerald-700 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              রেজিস্ট্রেশন <ArrowRight className="h-4 w-4" />
            </AuthLink>
            <AuthLink
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20 active:scale-[0.98]"
            >
              লগইন
            </AuthLink>
          </div>
          <ul className="mx-auto mt-8 flex max-w-md flex-col gap-2 text-sm text-emerald-50">
            {['Published lesson only', 'Quiz · XP · Progress', 'Student & Parent roles'].map((x) => (
              <li key={x} className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 shrink-0" /> {x}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <SiteFooter />
    </main>
  )
}
