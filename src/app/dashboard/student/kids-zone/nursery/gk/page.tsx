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
    title: 'রঙ শিখি',
    subtitle: 'লাল · নীল · সবুজ · হলুদ…',
    icon: '🎨',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    lessons: [
      { id: 'gk-color-red', title: 'লাল', icon: '🔴', xp: 10 },
      { id: 'gk-color-blue', title: 'নীল', icon: '🔵', xp: 10 },
      { id: 'gk-color-green', title: 'সবুজ', icon: '🟢', xp: 10 },
      { id: 'gk-color-yellow', title: 'হলুদ', icon: '🟡', xp: 10 },
      { id: 'gk-color-orange', title: 'কমলা', icon: '🟠', xp: 10 },
      { id: 'gk-color-purple', title: 'বেগুনি', icon: '🟣', xp: 10 },
    ],
  },
  {
    id: 2,
    title: 'ফল শিখি',
    subtitle: 'আম · কলা · আপেল · কমলা…',
    icon: '🍎',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    lessons: [
      { id: 'gk-fruit-mango', title: 'আম', icon: '🥭', xp: 10 },
      { id: 'gk-fruit-banana', title: 'কলা', icon: '🍌', xp: 10 },
      { id: 'gk-fruit-apple', title: 'আপেল', icon: '🍎', xp: 10 },
      { id: 'gk-fruit-orange', title: 'কমলা', icon: '🍊', xp: 10 },
      { id: 'gk-fruit-grape', title: 'আঙ্গুর', icon: '🍇', xp: 10 },
      { id: 'gk-fruit-watermelon', title: 'তরমুজ', icon: '🍉', xp: 10 },
    ],
  },
  {
    id: 3,
    title: 'প্রাণী শিখি',
    subtitle: 'বাঘ · হাতি · গরু · বিড়াল…',
    icon: '🦁',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    lessons: [
      { id: 'gk-animal-tiger', title: 'বাঘ', icon: '🐯', xp: 10 },
      { id: 'gk-animal-elephant', title: 'হাতি', icon: '🐘', xp: 10 },
      { id: 'gk-animal-cow', title: 'গরু', icon: '🐄', xp: 10 },
      { id: 'gk-animal-cat', title: 'বিড়াল', icon: '🐱', xp: 10 },
      { id: 'gk-animal-dog', title: 'কুকুর', icon: '🐶', xp: 10 },
      { id: 'gk-animal-bird', title: 'পাখি', icon: '🐦', xp: 10 },
    ],
  },
  {
    id: 4,
    title: 'শরীরের অংশ',
    subtitle: 'চোখ · কান · হাত · পা…',
    icon: '🧍',
    color: 'from-sky-400 to-cyan-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    lessons: [
      { id: 'gk-body-eye', title: 'চোখ', icon: '👁️', xp: 10 },
      { id: 'gk-body-ear', title: 'কান', icon: '👂', xp: 10 },
      { id: 'gk-body-hand', title: 'হাত', icon: '✋', xp: 10 },
      { id: 'gk-body-foot', title: 'পা', icon: '🦶', xp: 10 },
      { id: 'gk-body-nose', title: 'নাক', icon: '👃', xp: 10 },
    ],
  },
  {
    id: 5,
    title: 'যানবাহন',
    subtitle: 'বাস · গাড়ি · ট্রেন · নৌকা…',
    icon: '🚌',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    lessons: [
      { id: 'gk-vehicle-bus', title: 'বাস', icon: '🚌', xp: 10 },
      { id: 'gk-vehicle-car', title: 'গাড়ি', icon: '🚗', xp: 10 },
      { id: 'gk-vehicle-train', title: 'ট্রেন', icon: '🚂', xp: 10 },
      { id: 'gk-vehicle-boat', title: 'নৌকা', icon: '⛵', xp: 10 },
      { id: 'gk-vehicle-plane', title: 'বিমান', icon: '✈️', xp: 10 },
    ],
  },
  {
    id: 6,
    title: 'বাংলাদেশ',
    subtitle: 'পতাকা · রাজধানী · ফুল · পাখি',
    icon: '🇧🇩',
    color: 'from-green-400 to-emerald-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    lessons: [
      { id: 'gk-bd-flag', title: 'জাতীয় পতাকা', icon: '🚩', xp: 15 },
      { id: 'gk-bd-capital', title: 'রাজধানী ঢাকা', icon: '🏛️', xp: 15 },
      { id: 'gk-bd-flower', title: 'জাতীয় ফুল', icon: '🌸', xp: 15 },
      { id: 'gk-bd-bird', title: 'জাতীয় পাখি', icon: '🦜', xp: 15 },
    ],
  },
]

type Progress = Record<string, { completed: boolean; stars: number }>

export default function NurseryGkPage() {
  const [expandedUnit, setExpandedUnit] = useState(1)
  const [progress, setProgress] = useState<Progress>({})
  const [totalXp, setTotalXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { map: dbMap } = await loadKidsProgressFromDb(user.id)
        const localMap = readLocalKidsProgress(user.id)
        const map = mergeProgressMaps(dbMap, localMap)
        setProgress(map)
        setTotalXp(Object.values(map).filter((x) => x.completed).length * 10)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
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
  const completedLessons = units
    .flatMap((u) => u.lessons)
    .filter((l) => progress[l.id]?.completed).length
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <KidsZoneShell title="সাধারণ জ্ঞান" subtitle="রঙ · ফল · প্রাণী · বাংলাদেশ" emoji="🌍" stars={totalXp}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-3xl border border-lime-500/30 bg-gradient-to-r from-lime-600/20 to-emerald-600/20 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-2xl">
            🌍
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white">সাধারণ জ্ঞান শিখি</h1>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>
                  {completedLessons}/{totalLessons} lessons
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/10">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit, unitIdx) => {
            const isExpanded = expandedUnit === unit.id
            const isUnitUnlocked = isLessonUnlocked(unitIdx, 0)
            const unitCompleted = unit.lessons.filter((l) => progress[l.id]?.completed).length
            return (
              <div key={unit.id}>
                <button
                  type="button"
                  onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)}
                  className={`w-full rounded-2xl border p-4 text-left ${unit.border} ${unit.bg} ${
                    !isUnitUnlocked ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${unit.color}`}
                    >
                      {isUnitUnlocked ? unit.icon : '🔒'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white">{unit.title}</h3>
                      <p className="truncate text-xs text-gray-400">{unit.subtitle}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${unit.color}`}
                            style={{
                              width: `${(unitCompleted / unit.lessons.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {unitCompleted}/{unit.lessons.length}
                        </span>
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
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-3 ${lessonIdx % 2 === 0 ? 'ml-2' : 'ml-8'}`}
                        >
                          <Link
                            href={
                              isUnlocked
                                ? `/dashboard/student/kids-zone/nursery/gk/${lesson.id}`
                                : '#'
                            }
                            className={`flex size-14 items-center justify-center rounded-full text-lg font-bold ${
                              isCompleted
                                ? `bg-gradient-to-br ${unit.color} text-white`
                                : isUnlocked
                                  ? `bg-gradient-to-br ${unit.color} text-white ring-4 ring-white/20`
                                  : 'bg-gray-700/50 text-gray-500'
                            }`}
                          >
                            {isCompleted ? '✅' : isUnlocked ? lesson.icon : '🔒'}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-medium ${
                                isUnlocked ? 'text-white' : 'text-gray-500'
                              }`}
                            >
                              {lesson.title}
                            </p>
                            <p className="text-xs text-amber-400">
                              ⚡ {lesson.xp} XP{stars > 0 ? ' · ' + '⭐'.repeat(stars) : ''}
                            </p>
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

      <div className="mt-6 rounded-2xl border border-lime-500/20 bg-lime-500/10 p-4 text-center">
        <p className="mb-1 font-semibold text-lime-300">💡 মনে রাখো!</p>
        <p className="text-sm text-slate-400">
          একটা lesson শেষ করলে পরেরটা unlock হবে। রঙ → ফল → প্রাণী → শরীর → যান → বাংলাদেশ!
        </p>
      </div>
    </KidsZoneShell>
  )
}
