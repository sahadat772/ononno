'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const units = [
  { id: 1, title: 'A to G', subtitle: 'A B C D E F G', icon: '🌱', color: 'from-violet-400 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30',
    lessons: [
      { id: 'english-a', title: 'A — Apple', icon: 'A', xp: 10 }, { id: 'english-b', title: 'B — Ball', icon: 'B', xp: 10 },
      { id: 'english-c', title: 'C — Cat', icon: 'C', xp: 10 }, { id: 'english-d', title: 'D — Dog', icon: 'D', xp: 10 },
      { id: 'english-e', title: 'E — Egg', icon: 'E', xp: 10 }, { id: 'english-f', title: 'F — Fish', icon: 'F', xp: 10 },
      { id: 'english-g', title: 'G — Goat', icon: 'G', xp: 10 },
    ], bossQuiz: { id: 'boss-english-1', title: 'A–G Boss Quiz', xp: 50 } },
  { id: 2, title: 'H to N', subtitle: 'H I J K L M N', icon: '🌿', color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30',
    lessons: [
      { id: 'english-h', title: 'H — Hat', icon: 'H', xp: 10 }, { id: 'english-i', title: 'I — Ice cream', icon: 'I', xp: 10 },
      { id: 'english-j', title: 'J — Jar', icon: 'J', xp: 10 }, { id: 'english-k', title: 'K — Kite', icon: 'K', xp: 10 },
      { id: 'english-l', title: 'L — Lion', icon: 'L', xp: 10 }, { id: 'english-m', title: 'M — Mango', icon: 'M', xp: 10 },
      { id: 'english-n', title: 'N — Nest', icon: 'N', xp: 10 },
    ], bossQuiz: { id: 'boss-english-2', title: 'H–N Boss Quiz', xp: 50 } },
  { id: 3, title: 'O to U', subtitle: 'O P Q R S T U', icon: '🌳', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30',
    lessons: [
      { id: 'english-o', title: 'O — Orange', icon: 'O', xp: 10 }, { id: 'english-p', title: 'P — Parrot', icon: 'P', xp: 10 },
      { id: 'english-q', title: 'Q — Queen', icon: 'Q', xp: 10 }, { id: 'english-r', title: 'R — Rabbit', icon: 'R', xp: 10 },
      { id: 'english-s', title: 'S — Sun', icon: 'S', xp: 10 }, { id: 'english-t', title: 'T — Tiger', icon: 'T', xp: 10 },
      { id: 'english-u', title: 'U — Umbrella', icon: 'U', xp: 10 },
    ], bossQuiz: { id: 'boss-english-3', title: 'O–U Boss Quiz', xp: 50 } },
  { id: 4, title: 'V to Z', subtitle: 'V W X Y Z', icon: '🏆', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30',
    lessons: [
      { id: 'english-v', title: 'V — Van', icon: 'V', xp: 10 }, { id: 'english-w', title: 'W — Water', icon: 'W', xp: 10 },
      { id: 'english-x', title: 'X — X-ray', icon: 'X', xp: 10 }, { id: 'english-y', title: 'Y — Yak', icon: 'Y', xp: 10 },
      { id: 'english-z', title: 'Z — Zebra', icon: 'Z', xp: 10 },
    ], bossQuiz: { id: 'boss-english-4', title: 'V–Z Boss Quiz', xp: 50 } },
  { id: 5, title: 'Capital & Small', subtitle: 'Aa Bb Cc…', icon: '🌟', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
    lessons: [
      { id: 'english-caps-1', title: 'Aa Bb Cc Dd', icon: 'Aa', xp: 15 }, { id: 'english-caps-2', title: 'Ee Ff Gg Hh', icon: 'Ee', xp: 15 },
      { id: 'english-caps-3', title: 'Ii Jj Kk Ll', icon: 'Ii', xp: 15 }, { id: 'english-caps-4', title: 'Mm Nn Oo Pp', icon: 'Mm', xp: 15 },
      { id: 'english-caps-5', title: 'সব অক্ষর রিভিশন', icon: '🔄', xp: 20 },
    ], bossQuiz: { id: 'boss-english-5', title: 'চূড়ান্ত Boss Quiz', xp: 100 } },
]

type Progress = Record<string, { completed: boolean; stars: number }>

export default function NurseryEnglishPage() {
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
    <KidsZoneShell title="English" subtitle="ABC Adventure" emoji="🔡" stars={totalXp}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 text-3xl font-bold text-white">A</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">English ABC</h1>
            <p className="text-sm text-gray-400">Listen → Say → Write → Play</p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-gray-400"><span>{completedLessons}/{totalLessons} lessons</span><span>{progressPercent}%</span></div>
              <div className="h-2.5 rounded-full bg-white/10"><div className="h-2.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" style={{ width: `${progressPercent}%` }} /></div>
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
                <button type="button" onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)} className={`w-full rounded-2xl border p-4 text-left ${unit.border} ${unit.bg} ${!isUnitUnlocked ? 'opacity-50' : ''}`}>
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
                          <Link href={isUnlocked ? `/dashboard/student/kids-zone/nursery/english/${lesson.id}` : '#'} className={`flex size-14 items-center justify-center rounded-full text-xl font-bold ${isCompleted ? `bg-gradient-to-br ${unit.color} text-white` : isUnlocked ? `bg-gradient-to-br ${unit.color} text-white ring-4 ring-white/20` : 'bg-gray-700/50 text-gray-500'}`}>
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

      <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-center">
        <p className="mb-1 font-semibold text-violet-300">💡 Remember!</p>
        <p className="text-sm text-slate-400">একটা lesson শেষ করলে পরেরটা unlock হবে। Listen → Say → Write → Play!</p>
      </div>
    </KidsZoneShell>
  )
}
