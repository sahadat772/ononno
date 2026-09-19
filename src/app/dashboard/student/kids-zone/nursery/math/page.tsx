'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { loadKidsProgressFromDb, readLocalKidsProgress, mergeProgressMaps } from '@/lib/kids-progress'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const units = [
  {
    id: 1,
    title: 'গণনা ১–১০',
    subtitle: 'Count 1 to 10',
    icon: '🔢',
    color: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    lessons: [
      { id: 'math-1', title: '১ — এক',
        icon: '1', xp: 10 },
      { id: 'math-2', title: '২ — দুই', icon: '2', xp: 10 },
      { id: 'math-3', title: '৩ — তিন', icon: '3', xp: 10 },
      { id: 'math-4', title: '৪ — চার', icon: '4', xp: 10 },
      { id: 'math-5', title: '৫ — পাঁচ', icon: '5', xp: 10 },
      { id: 'math-6', title: '৬ — ছয়', icon: '6', xp: 10 },
      { id: 'math-7', title: '৭ — সাত', icon: '7', xp: 10 },
      { id: 'math-8', title: '৮ — আট', icon: '8', xp: 10 },
      { id: 'math-9', title: '৯ — নয়', icon: '9', xp: 10 },
      { id: 'math-10', title: '১০ — দশ', icon: '10', xp: 10 },
    ],
  },
]

type Progress = Record<string, { completed: boolean; stars: number }>

export default function NurseryMathPage() {
  const [expandedUnit, setExpandedUnit] = useState(1)
  const [progress, setProgress] = useState<Progress>({})
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { map: dbMap } = await loadKidsProgressFromDb(user.id)
        const localMap = readLocalKidsProgress(user.id)
        const map = mergeProgressMaps(dbMap, localMap)
        setProgress(map)
        setTotalXp(Object.values(map).filter((x) => x.completed).length * 10)
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    void load()
  }, [])

  function isLessonUnlocked(unitIdx: number, lessonIdx: number) {
    if (unitIdx === 0 && lessonIdx === 0) return true
    if (lessonIdx > 0) return progress[units[unitIdx].lessons[lessonIdx - 1].id]?.completed === true
    if (unitIdx > 0) {
      const prev = units[unitIdx - 1]
      return progress[prev.lessons[prev.lessons.length - 1].id]?.completed === true
    }
    return false
  }

  const totalLessons = units.reduce((s, u) => s + u.lessons.length, 0)
  const completedLessons = Object.values(progress).filter((p) => p.completed).length
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <KidsZoneShell title="গণিত" subtitle="Count & Play" emoji="🔢" stars={totalXp}>
      <div className="mb-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>{completedLessons}/{totalLessons} lessons</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-sky-400" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />)}</div>
      ) : (
        <div className="space-y-3">
          {units.map((unit, unitIdx) => {
            const isExpanded = expandedUnit === unit.id
            const isUnitUnlocked = isLessonUnlocked(unitIdx, 0)
            const unitCompleted = unit.lessons.filter((l) => progress[l.id]?.completed).length
            return (
              <div key={unit.id}>
                <button type="button" onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)}
                  className={`w-full rounded-2xl border p-4 text-left ${unit.border} ${unit.bg} ${!isUnitUnlocked ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${unit.color}`}>{isUnitUnlocked ? unit.icon : '🔒'}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white">{unit.title}</h3>
                      <p className="text-xs text-gray-400">{unit.subtitle}</p>
                      <span className="text-xs text-gray-500">{unitCompleted}/{unit.lessons.length}</span>
                    </div>
                    <span className="text-sm text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && isUnitUnlocked && (
                  <div className="mt-2 space-y-2 px-2">
                    {unit.lessons.map((lesson, lessonIdx) => {
                      const isCompleted = progress[lesson.id]?.completed === true
                      const isUnlocked = isLessonUnlocked(unitIdx, lessonIdx)
                      return (
                        <div key={lesson.id} className="flex items-center gap-3">
                          <Link href={isUnlocked ? `/dashboard/student/kids-zone/nursery/math/${lesson.id}` : '#'}
                            className={`flex size-12 items-center justify-center rounded-full text-lg font-bold ${
                              isCompleted ? `bg-gradient-to-br ${unit.color} text-white` : isUnlocked ? `bg-gradient-to-br ${unit.color} text-white ring-2 ring-white/20` : 'bg-gray-700/50 text-gray-500'
                            }`}>
                            {isCompleted ? '✅' : isUnlocked ? lesson.icon : '🔒'}
                          </Link>
                          <p className={`text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}">{lesson.title}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <p className="mt-6 text-center text-sm text-slate-400">একটা lesson শেষ করলে পরেরটা unlock হবে।</p>
    </KidsZoneShell>
  )
}
