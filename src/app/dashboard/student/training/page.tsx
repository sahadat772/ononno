'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const TRACKS = [
  {
    id: 'tech',
    title: 'Tech Skills',
    emoji: '💻',
    desc: 'Web, coding basics, digital literacy',
    color: 'from-cyan-500 to-blue-600',
    topics: ['HTML/CSS পরিচিতি', 'Problem solving', 'Safe internet'],
  },
  {
    id: 'business',
    title: 'Business Basics',
    emoji: '📈',
    desc: 'উদ্যোগ, টাকা-পয়সা, marketing',
    color: 'from-amber-500 to-orange-600',
    topics: ['Idea to product', 'Simple budgeting', 'Customer care'],
  },
  {
    id: 'finance',
    title: 'Financial Literacy',
    emoji: '💰',
    desc: 'সঞ্চয়, বিনিয়োগের ধারণা (হালাল)',
    color: 'from-emerald-500 to-teal-600',
    topics: ['সঞ্চয় অভ্যাস', 'Halal finance', 'Risk বোঝা'],
  },
  {
    id: 'soft',
    title: 'Soft Skills',
    emoji: '🗣️',
    desc: 'কথা বলা, টিমওয়ার্ক, নেতৃত্ব',
    color: 'from-violet-500 to-purple-600',
    topics: ['Public speaking', 'Time management', 'Team work'],
  },
]

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08),transparent_50%)]" />
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link href="/dashboard/student" className="text-gray-400 hover:text-white">
            ←
          </Link>
          <div>
            <h1 className="text-sm font-bold">Skill Training</h1>
            <p className="text-[10px] text-cyan-400">হালাল স্কিল ডেভেলপমেন্ট</p>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-5"
        >
          <p className="text-2xl">💡</p>
          <h2 className="mt-1 text-xl font-bold">নিজের স্কিল বাড়াও</h2>
          <p className="mt-1 text-sm text-gray-400">
            একাডেমিক পড়ার পাশাপাশি বাস্তব দক্ষতা শেখো — ধাপে ধাপে মডিউল আসছে।
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          {TRACKS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div
                className={`mb-3 grid size-12 place-items-center rounded-xl bg-gradient-to-br ${t.color} text-2xl`}
              >
                {t.emoji}
              </div>
              <h3 className="font-bold text-white">{t.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{t.desc}</p>
              <ul className="mt-3 space-y-1">
                {t.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="size-1.5 rounded-full bg-cyan-400/60" />
                    {topic}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-semibold text-cyan-400">শীঘ্রই লাইভ মডিউল →</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">
          পূর্ণ কোর্স কনটেন্ট ধাপে ধাপে যোগ হবে।
        </p>
      </div>
    </main>
  )
}
