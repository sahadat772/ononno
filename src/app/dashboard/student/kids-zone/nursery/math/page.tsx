'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const units = [
  { id: 1, title: '১ থেকে ১০', subtitle: '১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯ ১০', icon: '🌱', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30',
    lessons: [
      { id: 'math-1', title: '১ — এক', icon: '১', xp: 10 }, { id: 'math-2', title: '২ — দুই', icon: '২', xp: 10 },
      { id: 'math-3', title: '৩ — তিন', icon: '৩', xp: 10 }, { id: 'math-4', title: '৪ — চার', icon: '৪', xp: 10 },
      { id: 'math-5', title: '৫ — পাঁচ', icon: '৫', xp: 10 }, { id: 'math-6', title: '৬ — ছয়', icon: '৬', xp: 10 },
      { id: 'math-7', title: '৭ — সাত', icon: '৭', xp: 10 }, { id: 'math-8', title: '৮ — আট', icon: '৮', xp: 10 },
      { id: 'math-9', title: '৯ — নয়', icon: '৯', xp: 10 }, { id: 'math-10', title: '১০ — দশ', icon: '🔟', xp: 10 },
    ], bossQuiz: { id: 'boss-math-1', title: '১–১০ Boss Quiz', xp: 50 } },
  { id: 2, title: '১১ থেকে ২০', subtitle: '১১–২০', icon: '🌿', color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30',
    lessons: [
      { id: 'math-11', title: '১১ — এগারো', icon: '১১', xp: 10 }, { id: 'math-12', title: '১২ — বারো', icon: '১২', xp: 10 },
      { id: 'math-13', title: '১৩ — তেরো', icon: '১৩', xp: 10 }, { id: 'math-14', title: '১৪ — চৌদ্দ', icon: '১৪', xp: 10 },
      { id: 'math-15', title: '১৫ — পনেরো', icon: '১৫', xp: 10 }, { id: 'math-16', title: '১৬ — ষোলো', icon: '১৬', xp: 10 },
      { id: 'math-17', title: '১৭ — সতেরো', icon: '১৭', xp: 10 }, { id: 'math-18', title: '১৮ — আঠারো', icon: '১৮', xp: 10 },
      { id: 'math-19', title: '১৯ — উনিশ', icon: '১৯', xp: 10 }, { id: 'math-20', title: '২০ — বিশ', icon: '২০', xp: 10 },
    ], bossQuiz: { id: 'boss-math-2', title: '১১–২০ Boss Quiz', xp: 50 } },
  { id: 3, title: '২১ থেকে ৫০', subtitle: '৩০ ৪০ ৫০', icon: '🌳', color: 'from-violet-400 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30',
    lessons: [
      { id: 'math-30', title: '৩০ — ত্রিশ', icon: '৩০', xp: 15 }, { id: 'math-40', title: '৪০ — চল্লিশ', icon: '৪০', xp: 15 },
      { id: 'math-50', title: '৫০ — পঞ্চাশ', icon: '৫০', xp: 15 },
    ], bossQuiz: { id: 'boss-math-3', title: '২১–৫০ Boss Quiz', xp: 50 } },
  { id: 4, title: 'যোগ শিখি', subtitle: '১+১ থেকে ৫+৫', icon: '➕', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
    lessons: [
      { id: 'math-add-1', title: '১+১ = ২', icon: '➕', xp: 15 }, { id: 'math-add-2', title: '২+২ = ৪', icon: '➕', xp: 15 },
      { id: 'math-add-3', title: '৩+৩ = ৬', icon: '➕', xp: 15 }, { id: 'math-add-4', title: '৪+৪ = ৮', icon: '➕', xp: 15 },
      { id: 'math-add-5', title: '৫+৫ = ১০', icon: '➕', xp: 15 },
    ], bossQuiz: { id: 'boss-math-4', title: 'যোগ Boss Quiz', xp: 50 } },
  { id: 5, title: 'বিয়োগ শিখি', subtitle: '৫-১ থেকে ১০-৫', icon: '➖', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30',
    lessons: [
      { id: 'math-sub-1', title: '৫-১ = ৪', icon: '➖', xp: 15 }, { id: 'math-sub-2', title: '৬-২ = ৪', icon: '➖', xp: 15 },
      { id: 'math-sub-3', title: '৮-৩ = ৫', icon: '➖', xp: 15 }, { id: 'math-sub-4', title: '১০-৫ = ৫', icon: '➖', xp: 15 },
    ], bossQuiz: { id: 'boss-math-5', title: 'চূড়ান্ত Boss Quiz', xp: 100 } },
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
        const { data } = await supabase.from('learning_progress').select('lesson_id, completed, stars, score').eq('user_id', user.id)
        if (data) {
          const map: Progress = {}
          let xp = 0
          data.forEach((r) => { map[r.lesson_id] = { completed: r.completed, stars: r.stars || 0 }; xp += r.score || 0 })
          setProgress(map); setTotalXp(xp)
        }
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
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)

  return (
    <KidsZoneShell title="গণিত" subtitle="সংখ্যা · যোগ · বিয়োগ" emoji="🔢" stars={totalXp}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white">১</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">গণিত</h1>
            <p className="text-sm text-gray-400">গণনা → যোগ → বিয়োগ</p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-gray-400"><span>{completedLessons}/{totalLessons} lessons</span><span>{progressPercent}%</span></div>
              <div className="h-2.5 rounded-full bg-white/10"><div className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${progressPercent}%` }} /></div>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />)}</div> : (
        <div className="space-y-3">
          {units.map((unit, unitIdx) => {
            const isExpanded = expandedUnit === unit.id
            const isUnitUnlocked = isLessonUnlocked(unitIdx, 0)
            const unitCompleted = unit.lessons.filter(l => progress[l.id]?.completed).length
            return (
              <div key={unit.id}>
                <button type="button" onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)} className={`w-full rounded-2xl border p-4 text-left ${unit.border} ${unit.bg} ${!isUnitUnlocked ? 'opacity-50' : ''`}>
                  <div className="flex items-center gap-3">
                    <div className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${unit.color}`}>{isUnitUnlocked ? unit.icon : '🔒'}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white">{unit.title}</h3>
                      <p className="truncate text-xs text-gray-400">{unit.subtitle}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10"><div className={`h-1.5 rounded-full bg-gradient-to-r ${unit.color}`} style={{ width: `${(unitCompleted / unit.lessons.length) * 100}%` }} /></div>
                        <span className="text-xs text-gray-400">{unitCompleted}/{unit.lessons.length}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && isUnitUnlocked && (
                  <div className="mt-2 space-y-2 px-2">
                    {unit.lessons.map((lesson, lessonIdx) => {
                      const isCompleted = progress[lesson.id]?.completed === true
                      const isUnlocked = isLessonUnlocked(unitIdx, lessonIdx)
                      const stars = progress[lesson.id]?.stars || 0
                      return (
                        <div key={lesson.id} className={`flex items-center gap-3 ${lessonIdx % 2 === 0 ? 'ml-2' : 'ml-8'}`}>
                          <Link href={isUnlocked ? `/dashboard/student/kids-zone/nursery/math/${lesson.id}` : '#'} className={`flex size-14 items-center justify-center rounded-full text-lg font-bold ${isCompleted ? `bg-gradient-to-br ${unit.color} text-white` : isUnlocked ? `bg-gradient-to-br ${unit.color} text-white ring-4 ring-white/20` : 'bg-gray-700/50 text-gray-500'}`}>
                            {isCompleted ? '✅' : isUnlocked ? lesson.icon : '🔒'}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{lesson.title}</p>
                            <p className="text-xs text-amber-400">⚡ {lesson.xp} XP{stars > 0 ? ` · ${'⭐'.repeat(stars)}` : ''}</p>
                          </div>
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

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
        <p className="mb-1 font-semibold text-amber-300">💡 মনে রেখো!</p>
        <p className="text-sm text-slate-400">একটা lesson শেষ করলে পরেরটা unlock হবে। গণনা → যোগ → বিয়োগ!</p>
      </div>
    </KidsZoneShell>
  )
}
