'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AdWrapper from '@/components/shared/AdWrapper'
import WeakAreaCard from '@/components/student/WeakAreaCard'
import LearningInsightsCard from '@/components/student/LearningInsightsCard'

interface Props {
  profile: Record<string, string> | null
  studentProfile: Record<string, string> | null
}

const classNames: Record<string, string> = {
  class_3: 'তৃতীয় শ্রেণী',
  class_4: 'চতুর্থ শ্রেণী',
  class_5: 'পঞ্চম শ্রেণী',
  class_6: 'ষষ্ঠ শ্রেণী',
  class_7: 'সপ্তম শ্রেণী',
  class_8: 'অষ্টম শ্রেণী',
  class_9: 'নবম শ্রেণী',
  class_10: 'দশম শ্রেণী',
  class_11: 'একাদশ শ্রেণী',
  class_12: 'দ্বাদশ শ্রেণী',
  university: 'বিশ্ববিদ্যালয়',
  masters: 'মাস্টার্স',
  general: 'সাধারণ',
}

export default function GeneralDashboard({ profile, studentProfile }: Props) {
  const [realStats, setRealStats] = useState({ lessons: 0, quizScore: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('learning_progress')
          .select('status, score')
          .eq('user_id', user.id)

        if (data) {
          const completedLessons = data.filter(
            (r) => r.status === 'completed' || (r.score != null && Number(r.score) >= 0),
          ).length
          const avgScore =
            data.length > 0
              ? Math.round(
                  data.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / data.length,
                )
              : 0
          setRealStats({ lessons: completedLessons, quizScore: avgScore })
        }
      } catch (e) {
        console.error('Stats load failed:', e)
      }
    }
    void loadStats()
  }, [])

  const classLevel = studentProfile?.class_level || 'general'
  const className = classNames[classLevel] || classLevel
  void profile

  const isCareerAvailable = [
    'class_9',
    'class_10',
    'class_11',
    'class_12',
    'university',
    'masters',
  ].includes(classLevel)
  const isTrainingAvailable = ['class_11', 'class_12', 'university', 'masters'].includes(
    classLevel,
  )

  const modules = [
    {
      title: 'ইসলামিক শিক্ষা',
      desc: 'কুরআন, হাদিস, ফিকহ, দোয়া',
      icon: '🕌',
      color: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-500/25',
      href: '/dashboard/student/islamic',
      badge: 'বাধ্যতামূলক',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      items: ['কুরআন তিলাওয়াত', 'Tajweed AI', 'হিফজ Tracker', 'উস্তাদ AI Chat'],
    },
    {
      title: 'একাডেমিক',
      desc: className + ' এর NCTB পাঠ্যক্রম',
      icon: '📚',
      color: 'from-violet-500 to-fuchsia-500',
      border: 'border-violet-500/25',
      href: '/dashboard/student/academic',
      badge: className,
      badgeColor: 'bg-violet-500/20 text-violet-200 border-violet-500/30',
      items: ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান'],
    },
    {
      title: 'AI শিক্ষক',
      desc: 'যেকোনো প্রশ্নের উত্তর পাও',
      icon: '🤖',
      color: 'from-sky-500 to-indigo-500',
      border: 'border-sky-500/25',
      href: '/dashboard/student/ai-tutor',
      badge: 'Groq AI',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      items: ['বাংলায় উত্তর', 'যেকোনো বিষয়', '২৪/৭ সাহায্য'],
    },
  ]

  return (
    <div className="space-y-4 pb-2">
      <AdWrapper position="top" className="mb-2" />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {[
          {
            label: 'সম্পন্ন লেসন',
            value: `${realStats.lessons}`,
            icon: '📚',
            color: 'text-violet-300',
          },
          {
            label: 'Quiz score',
            value: `${realStats.quizScore}%`,
            icon: '✅',
            color: 'text-emerald-300',
          },
          {
            label: 'ইসলামিক',
            value: '—',
            icon: '🕌',
            color: 'text-teal-300',
          },
          {
            label: 'Streak',
            value: '—',
            icon: '🔥',
            color: 'text-amber-300',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-[#12122a]/80 p-3 text-center"
          >
            <div className="text-lg">{stat.icon}</div>
            <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <LearningInsightsCard />
      <WeakAreaCard />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {modules.map((module, i) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
          >
            <Link href={module.href}>
              <div
                className={`h-full cursor-pointer rounded-2xl border ${module.border} bg-white/[0.04] p-4 transition-all hover:bg-white/[0.07] md:p-5`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-2xl shadow-md`}
                  >
                    {module.icon}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${module.badgeColor}`}
                  >
                    {module.badge}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-bold text-white md:text-lg">{module.title}</h3>
                <p className="mb-3 text-sm text-slate-400">{module.desc}</p>
                <div className="space-y-1">
                  {module.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                      <span
                        className={`size-1.5 shrink-0 rounded-full bg-gradient-to-r ${module.color}`}
                      />
                      {item}
                    </div>
                  ))}
                </div>
                <div
                  className={`mt-3 text-sm font-semibold bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}
                >
                  শুরু করো →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          🕌 Islamic shortcuts
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              href: '/dashboard/student/islamic/tajweed',
              icon: '🎵',
              label: 'Tajweed AI',
              color: 'from-blue-500 to-indigo-600',
            },
            {
              href: '/dashboard/student/islamic/memorization',
              icon: '📚',
              label: 'হিফজ Tracker',
              color: 'from-violet-500 to-purple-600',
            },
            {
              href: '/dashboard/student/islamic/chat',
              icon: '🤖',
              label: 'উস্তাদ AI',
              color: 'from-emerald-500 to-teal-600',
            },
            {
              href: '/dashboard/student/islamic/progress',
              icon: '📊',
              label: 'Weekly Report',
              color: 'from-amber-500 to-orange-600',
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:bg-white/[0.08]">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-lg`}
                >
                  {item.icon}
                </div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isCareerAvailable && (
        <Link href="/dashboard/student/career">
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 transition hover:bg-amber-500/15 md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl">
                🧭
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white">ক্যারিয়ার পাথ AI</h3>
                <p className="truncate text-sm text-slate-400">আগ্রহ অনুযায়ী ক্যারিয়ার গাইড</p>
              </div>
              <span className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
                শুরু →
              </span>
            </div>
          </div>
        </Link>
      )}

      {isTrainingAvailable && (
        <Link href="/dashboard/student/training">
          <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 transition hover:bg-cyan-500/15 md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-2xl">
                💡
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white">Skill Training</h3>
                <p className="truncate text-sm text-slate-400">Tech · Business · Finance</p>
              </div>
              <span className="shrink-0 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-white">
                শুরু →
              </span>
            </div>
          </div>
        </Link>
      )}

      <AdWrapper position="bottom" className="mt-4" />
    </div>
  )
}
