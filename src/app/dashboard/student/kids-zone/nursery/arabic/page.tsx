'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const units = [
  { id: 1, title: 'আলিফ থেকে যাল', subtitle: 'ا ب ت ث ج ح خ د ذ', icon: '🌱', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
    lessons: [
      { id: 'arabic-alif', title: 'ا — আলিফ', icon: 'ا', xp: 10 }, { id: 'arabic-ba', title: 'ب — বা', icon: 'ب', xp: 10 },
      { id: 'arabic-ta', title: 'ت — তা', icon: 'ت', xp: 10 }, { id: 'arabic-tha', title: 'ث — ছা', icon: 'ث', xp: 10 },
      { id: 'arabic-jeem', title: 'ج — জিম', icon: 'ج', xp: 10 }, { id: 'arabic-ha', title: 'ح — হা', icon: 'ح', xp: 10 },
      { id: 'arabic-kha', title: 'خ — খা', icon: 'خ', xp: 10 }, { id: 'arabic-dal', title: 'د — দাল', icon: 'د', xp: 10 },
      { id: 'arabic-dhal', title: 'ذ — যাল', icon: 'ذ', xp: 10 },
    ], bossQuiz: { id: 'boss-arabic-1', title: 'ا–ذ Boss Quiz', xp: 50 } },
  { id: 2, title: 'রা থেকে দোয়াদ', subtitle: 'ر ز س ش ص ض', icon: '🌿', color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30',
    lessons: [
      { id: 'arabic-ra', title: 'ر — রা', icon: 'ر', xp: 10 }, { id: 'arabic-za', title: 'ز — যা', icon: 'ز', xp: 10 },
      { id: 'arabic-sin', title: 'س — সিন', icon: 'س', xp: 10 }, { id: 'arabic-shin', title: 'ش — শিন', icon: 'ش', xp: 10 },
      { id: 'arabic-sad', title: 'ص — সোয়াদ', icon: 'ص', xp: 10 }, { id: 'arabic-dad', title: 'ض — দোয়াদ', icon: 'ض', xp: 10 },
    ], bossQuiz: { id: 'boss-arabic-2', title: 'ر–ض Boss Quiz', xp: 50 } },
  { id: 3, title: 'তোয়া থেকে কাফ', subtitle: 'ط ظ ع غ ف ق', icon: '🌳', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30',
    lessons: [
      { id: 'arabic-ta2', title: 'ط — তোয়া', icon: 'ط', xp: 10 }, { id: 'arabic-zha', title: 'ظ — যোয়া', icon: 'ظ', xp: 10 },
      { id: 'arabic-ain', title: 'ع — আইন', icon: 'ع', xp: 10 }, { id: 'arabic-ghain', title: 'غ — গাইন', icon: 'غ', xp: 10 },
      { id: 'arabic-fa', title: 'ف — ফা', icon: 'ف', xp: 10 }, { id: 'arabic-qaf', title: 'ق — কাফ', icon: 'ق', xp: 10 },
    ], bossQuiz: { id: 'boss-arabic-3', title: 'ط–ق Boss Quiz', xp: 50 } },
  { id: 4, title: 'কাফ থেকে ইয়া', subtitle: 'ك ل م ن ه و ي', icon: '🏆', color: 'from-violet-400 to-purple-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30',
    lessons: [
      { id: 'arabic-kaf', title: 'ك — কাফ', icon: 'ك', xp: 10 }, { id: 'arabic-lam', title: 'ل — লাম', icon: 'ل', xp: 10 },
      { id: 'arabic-mim', title: 'م — মিম', icon: 'م', xp: 10 }, { id: 'arabic-nun', title: 'ن — নুন', icon: 'ن', xp: 10 },
      { id: 'arabic-ha2', title: 'ه — হা', icon: 'ه', xp: 10 }, { id: 'arabic-waw', title: 'و — ওয়াও', icon: 'و', xp: 10 },
      { id: 'arabic-ya', title: 'ي — ইয়া', icon: 'ي', xp: 10 },
    ], bossQuiz: { id: 'boss-arabic-4', title: 'ك–ي Boss Quiz', xp: 50 } },
  { id: 5, title: 'হরকত শিখি', subtitle: 'فَتْحَة كَسْرَة ضَمَّة', icon: '🌟', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30',
    lessons: [
      { id: 'arabic-fatha', title: 'فَ — যবর (আ)', icon: 'فَ', xp: 15 },
      { id: 'arabic-kasra', title: 'فِ — যের (ই)', icon: 'فِ', xp: 15 },
      { id: 'arabic-damma', title: 'فُ — পেশ (উ)', icon: 'فُ', xp: 15 },
    ], bossQuiz: { id: 'boss-arabic-5', title: 'চূড়ান্ত Boss Quiz', xp: 100 } },
]

type Progress = Record<string, { completed: boolean; stars: number }>

export default function NurseryArabicPage() {
  const [expandedUnit, setExpandedUnit] = useState<number>(1)
  const [progress, setProgress] = useState<Progress>({})
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('learning_progress').select('lesson_id, completed, stars, score').eq('user_id', user.id)
        if (data) {
          const progressMap: Progress = {}
          let xpTotal = 0
          data.forEach((row) => {
            progressMap[row.lesson_id] = { completed: row.completed, stars: row.stars || 0 }
            if (row.completed) xpTotal += row.score || 10
          })
          setProgress(progressMap)
          setTotalXp(xpTotal)
        }
      } catch {}
      finally { setLoading(false) }
    }
    loadProgress()
  }, [])

  function isLessonUnlocked(unitIdx: number, lessonIdx: number): boolean {
    if (unitIdx === 0 && lessonIdx === 0) return true
    if (lessonIdx > 0) {
      const prevLesson = units[unitIdx].lessons[lessonIdx - 1]
      return progress[prevLesson.id]?.completed === true
    }
    const prevUnit = units[unitIdx - 1]
    const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1]
    return progress[lastLesson.id]?.completed === true
  }

  const totalLessons = units.reduce((sum, u) => sum + u.lessons.length, 0)
  const completedLessons = Object.values(progress).filter(p => p.completed).length
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <KidsZoneShell title="আরবি" subtitle="হরফ · হরকত" emoji="ا" stars={totalXp}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl font-bold text-white" style={{ fontFamily: 'Arial' }}>ا</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white">আরবি হরফ</h1>
            <p className="text-sm text-gray-400">শোনো → বলো → লেখো</p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-gray-400"><span>{completedLessons}/{totalLessons} lessons</span><span>{progressPercent}%</span></div>
              <div className="h-2.5 rounded-full bg-white/10"><div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${progressPercent}%` }} /></div>
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
                      <p className="truncate text-xs text-gray-400" style={{ direction: 'rtl' }}>{unit.subtitle}</p>
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
                          <Link href={isUnlocked ? `/dashboard/student/kids-zone/nursery/arabic/${lesson.id}` : '#'} className={`flex size-14 items-center justify-center rounded-full text-2xl font-bold ${isCompleted ? `bg-gradient-to-br ${unit.color} text-white` : isUnlocked ? `bg-gradient-to-br ${unit.color} text-white ring-4 ring-white/20` : 'bg-gray-700/50 text-gray-500'}`} style={{ fontFamily: 'Arial' }}>
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

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
        <p className="text-emerald-200">بِسْمِ اللَّهِ</p>
        <p className="mt-1 text-sm text-slate-400">একটা হরফ শিখলে পরেরটা unlock হবে। শোনো → বলো → লেখো!</p>
      </div>
    </KidsZoneShell>
  )
}
