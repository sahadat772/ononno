'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Languages,
  Menu,
  Pencil,
  Search,
  Settings2,
  Smile,
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
  { icon: Settings2, title: '100+ online courses', sub: 'Explore a variety of fresh topics' },
  { icon: GraduationCap, title: 'Expert instruction', sub: 'Learn on your schedule' },
  { icon: Users, title: 'Growing students', sub: 'Growing Everyday' },
]

const categoryTabs = [
  'Primary School',
  'Secondary School',
  'Higher Secondary',
  'Exam Preparation',
  'Language Learning',
  'Professional Learning',
]

const classCards = [
  { bn: 'প্রথম শ্রেণি', en: 'Class One', color: 'from-orange-400 to-rose-400', emoji: '📖' },
  { bn: 'দ্বিতীয় শ্রেণি', en: 'Class Two', color: 'from-amber-400 to-orange-500', emoji: '✏️' },
  { bn: 'তৃতীয় শ্রেণি', en: 'Class Three', color: 'from-orange-400 to-pink-400', emoji: '🎒' },
  { bn: 'চতুর্থ শ্রেণি', en: 'Class Four', color: 'from-rose-400 to-orange-400', emoji: '📚' },
  { bn: 'পঞ্চম শ্রেণি', en: 'Class Five', color: 'from-orange-500 to-amber-400', emoji: '🏫' },
]

const featureBlocks = [
  {
    icon: Settings2,
    title: 'Go at your own pace',
    desc: 'এখন পড়াশোনা হবে সবখানে অনলাইন কিম্বা অফলাইনে',
  },
  {
    icon: Pencil,
    title: 'Learn from industry experts',
    desc: 'সকলের জন্য হবে মানসম্পন্ন শিক্ষা',
  },
  {
    icon: BookOpen,
    title: 'Find courses on almost any topic',
    desc: 'প্রতিটা সাবজেক্ট এর প্রথম থেকে শেষ পর্যন্ত প্রয়োজনীয় এনিমেশনসহ ছোট ছোট লেসনে শেখানো হয়েছে সবকিছু',
  },
]

const popularCourses = [
  { title: 'কিডস জোন · সাধারণ জ্ঞান', slug: 'kids-gk', enrolled: '1,200+', badge: 'কিডস', badgeColor: 'bg-violet-500' },
  { title: 'Class 1–5 · NCTB পাঠ', slug: 'primary', enrolled: '3,400+', badge: 'প্রাইমারি', badgeColor: 'bg-pink-500' },
  { title: 'Class 6–10 · বিজ্ঞান ও গণিত', slug: 'secondary', enrolled: '4,100+', badge: 'সেকেন্ডারি', badgeColor: 'bg-emerald-600' },
  { title: 'HSC · তথ্য ও যোগাযোগ প্রযুক্তি', slug: 'hsc', enrolled: '2,800+', badge: 'HSC', badgeColor: 'bg-indigo-600' },
]

const topCategories = [
  { title: 'Primary School', icon: BookOpen },
  { title: 'Secondary School', icon: GraduationCap },
  { title: 'Higher Secondary', icon: Users },
  { title: 'Exam Preparation', icon: Pencil },
  { title: 'Language Learning', icon: Languages },
  { title: 'Professional Learning', icon: Settings2 },
]

const testimonials = [
  {
    name: 'ফারজানা আক্তার',
    text: 'সারাদিন কাজের পরও ছেলের পড়া নিয়ে চিন্তা থাকত। অনন্য-এর লেসন দেখে এখন ঘরে বসেই শেখাতে পারি। ফলাফলও ভালো করেছে।',
  },
  {
    name: 'ডঃ জিল্লুর রহমান',
    text: 'এটা যে শুধু শিক্ষার্থীদের কাজে আসছে তাই নয়, শিক্ষকদের প্রশিক্ষণেও ভূমিকা রাখছে।',
  },
  {
    name: 'নীলিমা হাসান',
    text: 'ভিডিও ও গেমের মতো স্টেপ থাকায় বাচ্চা নিজে নিজেই আগ্রহ নিয়ে শেখে। নতুন ক্লাসের জন্যও নিতে চাই।',
  },
]

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-800">
      {/* ══════ HEADER (DSR-style) ══════ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-3 px-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={40} height={40} className="rounded-lg" />
            <div className="hidden min-[400px]:block">
              <p className="text-base font-black leading-none tracking-tight text-slate-900">
                অনন্য <span className="text-pink-500">ONONNO</span>
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Learn anything, online or offline
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="ml-2 hidden items-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50 lg:inline-flex"
          >
            <Menu className="h-4 w-4" /> Categories <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <div className="mx-auto hidden max-w-md flex-1 items-stretch overflow-hidden rounded-md border border-slate-200 lg:flex">
            <input
              readOnly
              placeholder="Search for anything"
              className="w-full px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <span className="grid w-12 place-items-center bg-pink-500 text-white">
              <Search className="h-4 w-4" />
            </span>
          </div>

          <nav className="ml-auto hidden items-center gap-4 text-xs font-bold uppercase tracking-wide text-slate-600 xl:flex">
            <a href="#classes" className="hover:text-pink-600">
              Package Courses
            </a>
            <a href="#popular" className="hover:text-pink-600">
              Courses
            </a>
            <a href="#top-categories" className="hover:text-pink-600">
              Teachers
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:ml-2 sm:gap-2 xl:ml-3">
            <AuthLink
              href="/login"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Users className="hidden h-4 w-4 sm:block" /> Login
            </AuthLink>
            <AuthLink
              href="/register"
              className="rounded-md bg-pink-500 px-3 py-2 text-sm font-bold text-white hover:bg-pink-600 sm:px-4"
            >
              Register
            </AuthLink>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-md border border-slate-200 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
              <a href="#classes" onClick={() => setMenuOpen(false)}>
                Package Courses
              </a>
              <a href="#popular" onClick={() => setMenuOpen(false)}>
                Popular Courses
              </a>
              <a href="#top-categories" onClick={() => setMenuOpen(false)}>
                Categories
              </a>
              <AuthLink href="/login">Login</AuthLink>
              <AuthLink href="/register" className="rounded-md bg-pink-500 px-4 py-3 text-center text-white">
                Register Today
              </AuthLink>
            </div>
          </div>
        )}
      </header>

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-[min(78vh,620px)] overflow-hidden">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.45)), url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1800&q=80)',
          }}
        />
        <div className="relative flex min-h-[min(78vh,620px)] flex-col items-center justify-center px-4 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-medium tracking-wide text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: 'Georgia, "Noto Serif Bengali", serif' }}
          >
            স্কুল যাবে ঘরে
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <AuthLink
              href="/register"
              className="min-h-11 rounded-sm bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-pink-600"
            >
              Register Today
            </AuthLink>
            <span className="text-sm font-medium text-white/80">or</span>
            <AuthLink
              href="/login"
              className="min-h-11 rounded-sm border border-white/90 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Log In
            </AuthLink>
          </motion.div>
        </div>
      </section>

      {/* ══════ STATS BAR (magenta → coral) ══════ */}
      <section className="bg-gradient-to-r from-[#9b1b6b] via-[#c2185b] to-[#e91e63] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 sm:py-12">
          {stats.map((s) => (
            <div key={s.title} className="flex flex-col items-center text-center">
              <s.icon className="mb-2 h-8 w-8 opacity-90" strokeWidth={1.5} />
              <p className="text-lg font-semibold sm:text-xl">{s.title}</p>
              <p className="mt-1 text-sm text-white/85">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CATEGORY TABS ══════ */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 py-3 sm:justify-center sm:px-6">
          {categoryTabs.map((t) => (
            <a
              key={t}
              href="#top-categories"
              className="shrink-0 border-b-2 border-transparent px-3 py-2 text-center text-xs font-semibold text-blue-700 hover:border-blue-600 hover:text-blue-900 sm:text-sm"
            >
              {t.split(' ').map((w, i) => (
                <span key={i} className="block leading-tight">
                  {w}
                </span>
              ))}
            </a>
          ))}
        </div>
      </section>

      {/* ══════ CLASSES: photo + cards (DSR layout) ══════ */}
      <section id="classes" className="bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <motion.div {...fade} className="overflow-hidden rounded-sm shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80"
              alt="Students learning together"
              className="h-full max-h-[420px] w-full object-cover"
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {classCards.map((c, i) => (
              <motion.div
                key={c.en}
                {...fade}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
              >
                <div className={`bg-gradient-to-r ${c.color} px-2 py-1.5 text-center text-xs font-bold text-white sm:text-sm`}>
                  {c.bn}
                </div>
                <div className="flex h-24 items-center justify-center bg-slate-50 text-4xl sm:h-28">{c.emoji}</div>
                <div className="border-t border-slate-100 p-3">
                  <p className="text-xs font-semibold text-slate-800 sm:text-sm">
                    {c.bn}{' '}
                    <span className="font-normal text-slate-500">( {c.en} )</span>
                  </p>
                  <AuthLink
                    href="/register"
                    className="mt-2 inline-block rounded-sm bg-teal-400 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-500"
                  >
                    View
                  </AuthLink>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURE BLOCKS (purple) ══════ */}
      <section className="bg-[#f3f4f6] py-12 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {featureBlocks.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade}
              transition={{ delay: i * 0.06 }}
              className="rounded-sm bg-[#5b2c6f] px-5 py-8 text-center text-white shadow-md"
            >
              <f.icon className="mx-auto mb-3 h-8 w-8 text-cyan-300" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ POPULAR COURSES ══════ */}
      <section id="popular" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-2xl font-semibold text-slate-800">Popular Courses</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularCourses.map((c, i) => (
              <motion.article
                key={c.slug}
                {...fade}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
              >
                <div className={`px-2 py-1.5 text-center text-xs font-bold text-white ${c.badgeColor}`}>
                  {c.badge}
                </div>
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-5xl">
                  📘
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-800">{c.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Enrolled : {c.enrolled}</p>
                  <div className="mt-3 flex gap-2">
                    <AuthLink
                      href="/register"
                      className="rounded-sm bg-pink-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-600"
                    >
                      Buy This Course
                    </AuthLink>
                    <AuthLink
                      href="/register"
                      className="rounded-sm bg-teal-400 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500"
                    >
                      VIEW
                    </AuthLink>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TOP CATEGORIES ══════ */}
      <section id="top-categories" className="bg-white pb-12 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-700">Top Categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topCategories.map((c) => (
              <AuthLink
                key={c.title}
                href="/register"
                className="flex items-center gap-3 rounded-sm bg-pink-500 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
              >
                <c.icon className="h-5 w-5 shrink-0 opacity-90" />
                {c.title}
              </AuthLink>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <AuthLink
              href="/register"
              className="flex items-center gap-3 rounded-sm bg-emerald-500 px-5 py-4 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <BookOpen className="h-5 w-5" /> Book Store
            </AuthLink>
            <AuthLink
              href="/register"
              className="flex items-center gap-3 rounded-sm bg-sky-400 px-5 py-4 text-sm font-semibold text-white hover:bg-sky-500"
            >
              <Users className="h-5 w-5" /> Online Teachers
            </AuthLink>
          </div>
        </div>
      </section>

      {/* ══════ PARENTS SAY ══════ */}
      <section className="border-t border-slate-100 bg-[#fafafa] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-8 text-2xl font-semibold text-slate-800">What Our Parents Say</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={t.name}
                {...fade}
                transition={{ delay: i * 0.05 }}
                className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full border-2 border-emerald-400 text-emerald-500">
                    <Smile className="h-6 w-6" />
                  </span>
                  <cite className="not-italic text-sm font-bold text-slate-800">{t.name}</cite>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{t.text}</p>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
