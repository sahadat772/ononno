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
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import SiteFooter from '@/components/shared/SiteFooter'

const paths = [
  { icon: '🧒', title: 'কিডস জোন', sub: 'নার্সারি ও কেজি' },
  { icon: '📚', title: 'প্রাইমারি', sub: '১ম – ৫ম শ্রেণি' },
  { icon: '🏫', title: 'সেকেন্ডারি', sub: '৬ষ্ঠ – ১০ম' },
  { icon: '🎯', title: 'উচ্চ মাধ্যমিক', sub: 'একাদশ – দ্বাদশ' },
]

const features = [
  {
    icon: BookOpen,
    title: 'NCTB Curriculum',
    desc: 'সরকারি পাঠ্যবই ভিত্তিক পাঠ — AI বুঝে, শিক্ষক রিভিউ করে, তারপর তুমি পড়ো।',
  },
  {
    icon: BrainCircuit,
    title: 'স্মার্ট স্টাডি',
    desc: 'পাঠ → কুইজ → XP → অগ্রগতি। সময় অনুযায়ী প্ল্যান করে শেখো।',
  },
  {
    icon: ShieldCheck,
    title: 'নিরাপদ কনটেন্ট',
    desc: 'অনুমোদিত published lesson ছাড়া কিছুই student-এর সামনে আসে না।',
  },
]

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faf9] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.12),transparent_45%),radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.1),transparent_40%)]" />

      <header className="relative z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-18 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
            <div>
              <p className="text-lg font-black tracking-tight leading-none">অনন্য</p>
              <p className="text-[10px] font-semibold text-emerald-600">ONONNO · NCTB Learning</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#path" className="hover:text-emerald-700 transition">শেখার পথ</a>
            <a href="#features" className="hover:text-emerald-700 transition">কেন অনন্য</a>
            <a href="#how" className="hover:text-emerald-700 transition">কীভাবে কাজ করে</a>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
              লগইন
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition">
              শুরু করো <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
              <a href="#path" onClick={() => setMenuOpen(false)}>শেখার পথ</a>
              <a href="#features" onClick={() => setMenuOpen(false)}>কেন অনন্য</a>
              <a href="#how" onClick={() => setMenuOpen(false)}>কীভাবে কাজ করে</a>
              <Link href="/login" className="pt-2">লগইন</Link>
              <Link href="/register" className="rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white">রেজিস্ট্রেশন</Link>
            </div>
          </div>
        )}
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI + Human Reviewed · NCTB Curriculum
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
              পাঠ্যবই থেকে{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">আনন্দের শেখা</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              অনন্য বাংলাদেশের Class 1–12 NCTB পাঠকে structured lesson, quiz ও progress-এ রূপান্তর করে — যাতে তুমি মুখস্থ নয়, বুঝে শিখতে পারো।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-600/25 hover:-translate-y-0.5 transition">
                বিনামূল্যে শুরু করো <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50 transition">
                আগে থেকে আছি — লগইন
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div><p className="text-2xl font-black text-emerald-600">১–১২</p><p className="text-xs font-semibold text-slate-500">শ্রেণির পাঠ</p></div>
              <div><p className="text-2xl font-black text-emerald-600">Quiz + XP</p><p className="text-xs font-semibold text-slate-500">খেলে শেখা</p></div>
              <div><p className="text-2xl font-black text-emerald-600">Safe</p><p className="text-xs font-semibold text-slate-500">Reviewed content</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.1 }} className="relative">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-200/60 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Learning Loop</p>
                  <p className="text-lg font-black text-slate-900">শেখো → অনুশীলন → আয়ত্ত</p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl text-white shadow-lg">📖</span>
              </div>
              <ol className="space-y-3">
                {['Official PDF থেকে AI curriculum বোঝে','Admin review ও publish করে','Student lesson পড়ে ও quiz দেয়','Progress, XP ও পরের পাঠ unlock'].map((t, i) => (
                  <li key={t} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-700">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="pointer-events-none absolute -bottom-4 -right-4 -z-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-6 -top-6 -z-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          </motion.div>
        </div>
      </section>

      <section id="path" className="relative z-10 border-t border-slate-200/70 bg-white/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">তোমার শেখার পথ</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">নার্সারি থেকে উচ্চ মাধ্যমিক — এক প্ল্যাটফর্মে structured journey</p>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map((p, i) => (
              <motion.div key={p.title} {...fade} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-3 font-black text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-500">{p.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">কেন অনন্য?</h2>
            <p className="mt-2 text-slate-600">Curriculum Intelligence — সাধারণ PDF reader নয়</p>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><f.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-black">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 border-t border-slate-200/70 bg-[#0a0a1a] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div {...fade} className="text-center">
            <h2 className="text-2xl font-black sm:text-3xl">কীভাবে কাজ করে</h2>
            <p className="mt-2 text-sm text-slate-400">Dashboard-এর মতোই — পরিষ্কার ও নিরাপদ flow</p>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[{ t: 'PDF', d: 'Google Drive / Storage' },{ t: 'AI', d: 'Lesson generate' },{ t: 'Review', d: 'Admin approve' },{ t: 'Learn', d: 'Student + Quiz' }].map((s, i) => (
              <div key={s.t} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-xs font-bold text-emerald-400">Step {i + 1}</p>
                <p className="mt-2 text-xl font-black">{s.t}</p>
                <p className="mt-1 text-sm text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-16 sm:px-8 sm:py-20">
        <motion.div {...fade} className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-6 py-12 text-center text-white shadow-2xl sm:px-12">
          <Star className="mx-auto h-6 w-6 fill-current opacity-90" />
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">আজই শেখা শুরু করো</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-emerald-50 sm:text-base">Class 1 থেকে ধাপে ধাপে NCTB curriculum — progress সহ</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-emerald-700 shadow-lg hover:-translate-y-0.5 transition">রেজিস্ট্রেশন <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition">লগইন</Link>
          </div>
          <ul className="mx-auto mt-8 flex max-w-md flex-col gap-2 text-left text-sm text-emerald-50 sm:text-center">
            {['Published lesson only', 'Quiz & XP', 'Parent / Student roles'].map((x) => (
              <li key={x} className="flex items-center justify-center gap-2"><Check className="h-4 w-4 shrink-0" /> {x}</li>
            ))}
          </ul>
        </motion.div>
      </section>

      <SiteFooter />
    </main>
  )
}
