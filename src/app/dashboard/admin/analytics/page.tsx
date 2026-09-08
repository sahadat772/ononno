'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    totalQuizAttempts: 0,
    totalProgress: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      try {
        const [users, conversations, quizzes, progress] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('ai_conversations').select('*', { count: 'exact', head: true }),
          supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
          supabase.from('student_progress').select('*', { count: 'exact', head: true }),
        ])

        setStats({
          totalUsers: users.count || 0,
          totalConversations: conversations.count || 0,
          totalQuizAttempts: quizzes.count || 0,
          totalProgress: progress.count || 0,
        })
      } finally {
        setLoading(false)
      }
    }
    void fetchStats()
  }, [])

  const metrics = [
    {
      label: 'মোট ব্যবহারকারী',
      value: stats.totalUsers,
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
      desc: 'নিবন্ধিত সদস্য',
    },
    {
      label: 'AI কথোপকথন',
      value: stats.totalConversations,
      icon: '🤖',
      color: 'from-violet-500 to-purple-500',
      desc: 'AI Tutor sessions',
    },
    {
      label: 'কুইজ attempt',
      value: stats.totalQuizAttempts,
      icon: '📝',
      color: 'from-amber-500 to-yellow-500',
      desc: 'মোট পরীক্ষা',
    },
    {
      label: 'অগ্রগতি রেকর্ড',
      value: stats.totalProgress,
      icon: '📈',
      color: 'from-emerald-500 to-teal-500',
      desc: 'Progress rows',
    },
  ]

  const models = [
    { name: 'LLaMA 3.3 70B', role: 'Tutor & chat', status: 'Active', load: 87 },
    { name: 'Llama 4 Scout', role: 'Vision / verify', status: 'Active', load: 62 },
    { name: 'Whisper (Groq)', role: 'Pronunciation', status: 'Active', load: 45 },
    { name: 'Adaptive Curriculum', role: 'ML personalize', status: 'Soon', load: 0 },
  ]

  return (
    <div className="min-h-screen bg-[#060612] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-rose-400 transition hover:text-rose-300"
          >
            ← Admin Panel
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-3xl shadow-lg">
              🧠
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-rose-300 to-pink-300 bg-clip-text text-3xl font-black text-transparent">
                AI Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Platform AI usage · models · learning signals
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Link
                href="/dashboard/admin/learning-analytics"
                className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-200"
              >
                Learning Analytics
              </Link>
              <Link
                href="/dashboard/admin"
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-3 text-3xl">{m.icon}</div>
              <p
                className={`bg-gradient-to-r ${m.color} bg-clip-text text-3xl font-black text-transparent`}
              >
                {loading ? '…' : m.value.toLocaleString('bn-BD')}
              </p>
              <p className="mt-1 font-semibold text-white">{m.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-3">
            <h2 className="mb-4 text-lg font-bold">Model load</h2>
            <div className="space-y-3">
              {models.map((m) => (
                <div
                  key={m.name}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.role}</p>
                  </div>
                  <div className="w-28">
                    <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                      <span>Load</span>
                      <span>{m.load}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                        style={{ width: `${m.load}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${
                      m.status === 'Active'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-5 lg:col-span-2">
            <h2 className="mb-3 text-lg font-bold">Next instrumentation</h2>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="rounded-xl border border-white/8 bg-black/20 p-3">
                Token usage & cost per model
              </li>
              <li className="rounded-xl border border-white/8 bg-black/20 p-3">
                Error rate & fallback hits
              </li>
              <li className="rounded-xl border border-white/8 bg-black/20 p-3">
                Top student AI topics
              </li>
              <li className="rounded-xl border border-white/8 bg-black/20 p-3">
                Latency p50 / p95 charts
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">🚀 শীঘ্রই আসছে</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { icon: '📊', title: 'Learning Progress Chart', desc: 'শিক্ষার্থীদের অগ্রগতির গ্রাফ' },
              { icon: '🤖', title: 'AI Usage Analytics', desc: 'AI Tutor ব্যবহারের বিশ্লেষণ' },
              { icon: '📈', title: 'Revenue Graph', desc: 'মাসিক আয়ের চার্ট' },
              { icon: '🌍', title: 'Geographic Distribution', desc: 'ব্যবহারকারীদের অবস্থান' },
              { icon: '⭐', title: 'Top Performers', desc: 'সেরা শিক্ষার্থীদের তালিকা' },
              { icon: '📱', title: 'Device Analytics', desc: 'কোন device থেকে ব্যবহার' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
