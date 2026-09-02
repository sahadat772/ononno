'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Platform = {
  total_students: number
  active_today: number
  sessions_today: number
  total_sessions: number
  completed_sessions: number
  completion_rate: number
  average_study_minutes: number
  quiz_average: number | null
  weak_lessons_count: number
}

type SubjectRow = {
  subject_id: string
  name: string
  students: number
  average_study_minutes: number
  average_quiz_score: number | null
  attempts: number
}

type HardLesson = {
  lesson_id: string
  title: string
  average_score: number
  attempts: number
  band: string
}

export default function LearningAnalyticsClient() {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [hardest, setHardest] = useState<HardLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/learning-analytics')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Load failed')
      setPlatform(data.platform)
      setSubjects(data.by_subject ?? [])
      setHardest(data.hardest_lessons ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard/admin/curriculum"
              className="text-xs text-white/40 hover:text-white"
            >
              ← Curriculum
            </Link>
            <h1 className="text-2xl font-bold mt-1">📊 Learning Analytics</h1>
            <p className="text-sm text-white/50">
              Student study sessions · quiz · weak lessons (Phase 2.7)
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-white/40 text-sm">লোড হচ্ছে...</p>
        )}

        {platform && !loading && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: 'Total Students',
                  value: platform.total_students,
                  icon: '👥',
                },
                {
                  label: 'Active Today',
                  value: platform.active_today,
                  icon: '🟢',
                },
                {
                  label: 'Sessions Today',
                  value: platform.sessions_today,
                  icon: '📚',
                },
                {
                  label: 'Avg Study',
                  value: `${platform.average_study_minutes}m`,
                  icon: '⏱',
                },
                {
                  label: 'Completion',
                  value: `${platform.completion_rate}%`,
                  icon: '✅',
                },
                {
                  label: 'Quiz Avg',
                  value:
                    platform.quiz_average != null
                      ? `${platform.quiz_average}%`
                      : '—',
                  icon: '🎯',
                },
                {
                  label: 'Total Sessions',
                  value: platform.total_sessions,
                  icon: '📈',
                },
                {
                  label: 'Weak Lessons',
                  value: platform.weak_lessons_count,
                  icon: '🔴',
                },
              ].map((c) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xl">{c.icon}</p>
                  <p className="text-2xl font-black mt-1">{c.value}</p>
                  <p className="text-xs text-white/40">{c.label}</p>
                </motion.div>
              ))}
            </div>

            <section className="rounded-2xl border border-violet-500/25 bg-violet-950/20 p-5">
              <h2 className="font-bold mb-4">Subject Analytics</h2>
              {subjects.length === 0 ? (
                <p className="text-sm text-white/40">এখনো subject data নেই।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-white/40 text-xs border-b border-white/10">
                      <tr>
                        <th className="py-2 pr-3">Subject</th>
                        <th className="py-2 pr-3">Students</th>
                        <th className="py-2 pr-3">Study min</th>
                        <th className="py-2 pr-3">Quiz avg</th>
                        <th className="py-2">Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr
                          key={s.subject_id}
                          className="border-b border-white/5"
                        >
                          <td className="py-2.5 pr-3 font-semibold">
                            {s.name}
                          </td>
                          <td className="py-2.5 pr-3">{s.students}</td>
                          <td className="py-2.5 pr-3">
                            {s.average_study_minutes}
                          </td>
                          <td className="py-2.5 pr-3">
                            {s.average_quiz_score != null
                              ? `${s.average_quiz_score}%`
                              : '—'}
                          </td>
                          <td className="py-2.5">{s.attempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-red-500/25 bg-red-950/20 p-5">
              <h2 className="font-bold mb-4">Most Difficult Lessons</h2>
              {hardest.length === 0 ? (
                <p className="text-sm text-white/40">Quiz data নেই।</p>
              ) : (
                <div className="space-y-2">
                  {hardest.map((h, i) => (
                    <div
                      key={h.lesson_id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">#{i + 1}</p>
                        <p className="font-semibold truncate">{h.title}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p
                          className={
                            h.average_score < 50
                              ? 'text-red-300 font-bold'
                              : h.average_score < 80
                                ? 'text-amber-300 font-bold'
                                : 'text-emerald-300 font-bold'
                          }
                        >
                          {h.average_score}%
                        </p>
                        <p className="text-[11px] text-white/40">
                          {h.attempts} attempts · {h.band}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
