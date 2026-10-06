'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { loadKidsProgressFromDb, readLocalKidsProgress, mergeProgressMaps } from '@/lib/kids-progress'
import KidsZoneShell from '@/components/kids/KidsZoneShell'

const units = [
  {
    id: 1,
    title: 'রঙ শিখি',
    subtitle: 'লাল · নীল · সবুজ · হলুদ · সাদা…',
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
      { id: 'gk-color-white', title: 'সাদা', icon: '⚪', xp: 10 },
      { id: 'gk-color-black', title: 'কালো', icon: '⚫', xp: 10 },
    ],
  },
  {
    id: 2,
    title: 'ফল শিখি',
    subtitle: 'আম · কলা · কাঁঠাল · পেয়ারা…',
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
      { id: 'gk-fruit-jackfruit', title: 'কাঁঠাল', icon: '🍈', xp: 10 },
      { id: 'gk-fruit-guava', title: 'পেয়ারা', icon: '🟢', xp: 10 },
    ],
  },
  {
    id: 3,
    title: 'প্রাণী শিখি',
    subtitle: 'বাঘ · হাতি · মাছ · খরগোশ…',
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
      { id: 'gk-animal-fish', title: 'মাছ', icon: '🐟', xp: 10 },
      { id: 'gk-animal-rabbit', title: 'খরগোশ', icon: '🐰', xp: 10 },
    ],
  },
  {
    id: 4,
    title: 'শরীরের অংশ',
    subtitle: 'চোখ · কান · হাত · মুখ…',
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
      { id: 'gk-body-mouth', title: 'মুখ', icon: '👄', xp: 10 },
    ],
  },
  {
    id: 5,
    title: 'যানবাহন',
    subtitle: 'বাস · গাড়ি · রিকশা · বিমান…',
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
      { id: 'gk-vehicle-rickshaw', title: 'রিকশা', icon: '🛺', xp: 10 },
    ],
  },
  {
    id: 6,
    title: 'বাংলাদেশ',
    subtitle: 'পতাকা · ঢাকা · ইলিশ · বাংলা…',
    icon: '🇧🇩',
    color: 'from-green-400 to-emerald-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    lessons: [
      { id: 'gk-bd-flag', title: 'জাতীয় পতাকা', icon: '🚩', xp: 15 },
      { id: 'gk-bd-capital', title: 'রাজধানী ঢাকা', icon: '🏛️', xp: 15 },
      { id: 'gk-bd-flower', title: 'জাতীয় ফুল', icon: '🌸', xp: 15 },
      { id: 'gk-bd-bird', title: 'জাতীয় পাখি', icon: '🦜', xp: 15 },
      { id: 'gk-bd-hilsa', title: 'জাতীয় মাছ', icon: '🐠', xp: 15 },
      { id: 'gk-bd-language', title: 'বাংলা ভাষা', icon: '📝', xp: 15 },
    ],
  },
  {
    id: 7,
    title: 'ঋতু শিখি',
    subtitle: 'গ্রীষ্ম · বর্ষা · শীত · বসন্ত',
    icon: '🌦️',
    color: 'from-cyan-400 to-sky-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    lessons: [
      { id: 'gk-season-summer', title: 'গ্রীষ্ম', icon: '☀️', xp: 12 },
      { id: 'gk-season-rainy', title: 'বর্ষা', icon: '🌧️', xp: 12 },
      { id: 'gk-season-winter', title: 'শীত', icon: '❄️', xp: 12 },
      { id: 'gk-season-spring', title: 'বসন্ত', icon: '🌼', xp: 12 },
    ],
  },
  {
    id: 8,
    title: 'পেশা শিখি',
    subtitle: 'ডাক্তার · শিক্ষক · কৃষক · পুলিশ…',
    icon: '💼',
    color: 'from-indigo-400 to-blue-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    lessons: [
      { id: 'gk-job-doctor', title: 'ডাক্তার', icon: '👨‍⚕️', xp: 12 },
      { id: 'gk-job-teacher', title: 'শিক্ষক', icon: '👩‍🏫', xp: 12 },
      { id: 'gk-job-farmer', title: 'কৃষক', icon: '👨‍🌾', xp: 12 },
      { id: 'gk-job-police', title: 'পুলিশ', icon: '👮', xp: 12 },
      { id: 'gk-job-driver', title: 'চালক', icon: '🧑‍✈️', xp: 12 },
    ],
  },
  {
    id: 9,
    title: 'আকাশ ও আবহাওয়া',
    subtitle: 'সূর্য · চাঁদ · মেঘ · বৃষ্টি · তারা',
    icon: '🌌',
    color: 'from-yellow-400 to-indigo-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    lessons: [
      { id: 'gk-weather-sun', title: 'সূর্য', icon: '☀️', xp: 12 },
      { id: 'gk-weather-moon', title: 'চাঁদ', icon: '🌙', xp: 12 },
      { id: 'gk-weather-cloud', title: 'মেঘ', icon: '☁️', xp: 12 },
      { id: 'gk-weather-rain', title: 'বৃষ্টি', icon: '🌧️', xp: 12 },
      { id: 'gk-weather-star', title: 'তারা', icon: '⭐', xp: 12 },
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
        if (!user) {
          setLoading(false)
          return
        }
        const { map: dbMap } = await loadKidsProgressFromDb(user.id)
        const localMap = readLocalKidsProgress(user.id)
        const map = mergeProgressMaps(dbMap, localMap)
        setProgress(map)
        let xp = 0
        for (const u of units) {
          for (const l of u.lessons) {
            if (map[l.id]?.completed) xp += l.xp
          }
        }
        setTotalXp(xp)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  function isLessonUnlocked(unitIdx: number, lessonIdx: number) {
    // First unit first lesson always open; also unlock unit 1 fully for new kids
    if (unitIdx === 0) return true
    if (lessonIdx > 0) return progress[units[unitIdx].lessons[lessonIdx - 1].id]?.completed === true
    if (unitIdx > 0) {
      const prev = units[unitIdx - 1]
      // need at least half of previous unit OR last lesson
      const done = prev.lessons.filter((l) => progress[l.id]?.completed).length
      return done >= Math.ceil(prev.lessons.length / 2) || progress[prev.lessons[prev.lessons.length - 1].id]?.completed === true
    }
    return false
  }

  const totalLessons = units.reduce((s, u) => s + u.lessons.length, 0)
  const completedLessons = units.flatMap((u) => u.lessons).filter((l) => progress[l.id]?.completed).length
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <KidsZoneShell title="সাধারণ জ্ঞান" subtitle="রঙ · ফল · প্রাণী · বাংলাদেশ · ঋতু" emoji="🌍" stars={totalXp}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 overflow-hidden rounded-3xl border border-lime-500/30 bg-gradient-to-br from-lime-600/25 via-emerald-600/15 to-cyan-600/20 p-5"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-3xl shadow-lg shadow-lime-500/30"
          >
            🌍
          </motion.div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-white sm:text-xl">সাধারণ জ্ঞান শিখি</h1>
            <p className="mt-0.5 text-xs text-lime-200/80">৯টি অধ্যায় · {totalLessons}টি মজার পাঠ</p>
            <div className="mt-2.5">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>
                  {completedLessons}/{totalLessons} সম্পন্ন
                </span>
                <span className="font-bold text-lime-300">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-3 rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
        {completedLessons === 0 && (
          <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-center text-xs text-lime-100/90">
            ✨ প্রথম অধ্যায় (রঙ) পুরো আনলক — শুরু করো!
          </p>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
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
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: unitIdx * 0.04 }}
              >
                <button
                  type="button"
                  onClick={() => isUnitUnlocked && setExpandedUnit(isExpanded ? 0 : unit.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${unit.border} ${unit.bg} ${
                    !isUnitUnlocked ? 'opacity-45' : 'hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-md ${unit.color}`}
                    >
                      {isUnitUnlocked ? unit.icon : '🔒'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{unit.title}</h3>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                          {unit.lessons.length} পাঠ
                        </span>
                      </div>
                      <p className="truncate text-xs text-gray-400">{unit.subtitle}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/10">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${unit.color}`}
                            style={{
                              width: `${(unitCompleted / unit.lessons.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-400">
                          {unitCompleted}/{unit.lessons.length}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && isUnitUnlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 grid grid-cols-2 gap-2 px-1 sm:grid-cols-3">
                        {unit.lessons.map((lesson, lessonIdx) => {
                          const isCompleted = progress[lesson.id]?.completed === true
                          const isUnlocked = isLessonUnlocked(unitIdx, lessonIdx)
                          const stars = progress[lesson.id]?.stars || 0
                          return (
                            <Link
                              key={lesson.id}
                              href={
                                isUnlocked
                                  ? `/dashboard/student/kids-zone/nursery/gk/${lesson.id}`
                                  : '#'
                              }
                              onClick={(e) => {
                                if (!isUnlocked) e.preventDefault()
                              }}
                              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                                isCompleted
                                  ? 'border-emerald-400/40 bg-emerald-500/15'
                                  : isUnlocked
                                    ? 'border-white/15 bg-white/5 hover:bg-white/10 active:scale-95'
                                    : 'border-transparent bg-white/[0.03] opacity-40'
                              }`}
                            >
                              <span
                                className={`grid size-12 place-items-center rounded-full text-xl ${
                                  isCompleted
                                    ? `bg-gradient-to-br ${unit.color}`
                                    : isUnlocked
                                      ? `bg-gradient-to-br ${unit.color} ring-2 ring-white/25`
                                      : 'bg-gray-700/50'
                                }`}
                              >
                                {isCompleted ? '✅' : isUnlocked ? lesson.icon : '🔒'}
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isUnlocked ? 'text-white' : 'text-gray-500'
                                }`}
                              >
                                {lesson.title}
                              </span>
                              <span className="text-[10px] text-amber-400">
                                ⚡{lesson.xp}
                                {stars > 0 ? ` · ${'⭐'.repeat(Math.min(3, stars))}` : ''}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-lime-500/20 bg-lime-500/10 p-4 text-center">
        <p className="mb-1 font-semibold text-lime-300">💡 টিপস</p>
        <p className="text-sm leading-relaxed text-slate-400">
          রঙের সব পাঠ আনলক। পরের অধ্যায় খুলতে আগের অধ্যায়ের অন্তত অর্ধেক শেষ করো। গেম খেলে XP
          ও তারা পাবে!
        </p>
      </div>
    </KidsZoneShell>
  )
}
