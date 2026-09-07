'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Sector {
  id: string
  name: string
  slug: string
  level_range: string
  icon: string
  color: string
}

interface ClassItem {
  id: string
  sector_id: string
  name: string
  slug: string
  level: string
  order_index: number
}

const FALLBACK_SECTORS: Sector[] = [
  {
    id: 'fb-kids',
    name: 'কিডস জোন',
    slug: 'kids-zone',
    level_range: 'নার্সারি · কেজি',
    icon: '🧒',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'fb-primary',
    name: 'প্রাইমারি',
    slug: 'primary',
    level_range: '১ম – ৫ম শ্রেণি',
    icon: '📚',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'fb-secondary',
    name: 'মাধ্যমিক',
    slug: 'secondary',
    level_range: '৬ষ্ঠ – ৮ম শ্রেণি',
    icon: '🎯',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'fb-high',
    name: 'উচ্চ মাধ্যমিক প্রস্তুতি',
    slug: 'high-school',
    level_range: '৯ম – ১০ম শ্রেণি',
    icon: '🏫',
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'fb-hsc',
    name: 'এইচএসসি',
    slug: 'hsc',
    level_range: '১১শ – ১২শ শ্রেণি',
    icon: '🏛️',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'fb-uni',
    name: 'বিশ্ববিদ্যালয়',
    slug: 'university',
    level_range: 'অনার্স · ডিগ্রি',
    icon: '🎓',
    color: 'from-amber-400 to-yellow-500',
  },
]

/** Static classes when DB classes table is empty */
const FALLBACK_CLASSES: Record<string, ClassItem[]> = {
  primary: [
    { id: 'c1', sector_id: 'fb-primary', name: 'প্রথম শ্রেণি', slug: 'class-1', level: 'class_1', order_index: 1 },
    { id: 'c2', sector_id: 'fb-primary', name: 'দ্বিতীয় শ্রেণি', slug: 'class-2', level: 'class_2', order_index: 2 },
    { id: 'c3', sector_id: 'fb-primary', name: 'তৃতীয় শ্রেণি', slug: 'class-3', level: 'class_3', order_index: 3 },
    { id: 'c4', sector_id: 'fb-primary', name: 'চতুর্থ শ্রেণি', slug: 'class-4', level: 'class_4', order_index: 4 },
    { id: 'c5', sector_id: 'fb-primary', name: 'পঞ্চম শ্রেণি', slug: 'class-5', level: 'class_5', order_index: 5 },
  ],
  secondary: [
    { id: 'c6', sector_id: 'fb-secondary', name: 'ষষ্ঠ শ্রেণি', slug: 'class-6', level: 'class_6', order_index: 1 },
    { id: 'c7', sector_id: 'fb-secondary', name: 'সপ্তম শ্রেণি', slug: 'class-7', level: 'class_7', order_index: 2 },
    { id: 'c8', sector_id: 'fb-secondary', name: 'অষ্টম শ্রেণি', slug: 'class-8', level: 'class_8', order_index: 3 },
  ],
  'high-school': [
    { id: 'c9', sector_id: 'fb-high', name: 'নবম শ্রেণি', slug: 'class-9', level: 'class_9', order_index: 1 },
    { id: 'c10', sector_id: 'fb-high', name: 'দশম শ্রেণি', slug: 'class-10', level: 'class_10', order_index: 2 },
  ],
  hsc: [
    { id: 'c11', sector_id: 'fb-hsc', name: 'একাদশ শ্রেণি', slug: 'class-11', level: 'class_11', order_index: 1 },
    { id: 'c12', sector_id: 'fb-hsc', name: 'দ্বাদশ শ্রেণি', slug: 'class-12', level: 'class_12', order_index: 2 },
  ],
  university: [
    { id: 'cu', sector_id: 'fb-uni', name: 'বিশ্ববিদ্যালয়', slug: 'university', level: 'university', order_index: 1 },
  ],
}

const LEVEL_BN: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'প্রথম শ্রেণি',
  class_2: 'দ্বিতীয় শ্রেণি',
  class_3: 'তৃতীয় শ্রেণি',
  class_4: 'চতুর্থ শ্রেণি',
  class_5: 'পঞ্চম শ্রেণি',
  class_6: 'ষষ্ঠ শ্রেণি',
  class_7: 'সপ্তম শ্রেণি',
  class_8: 'অষ্টম শ্রেণি',
  class_9: 'নবম শ্রেণি',
  class_10: 'দশম শ্রেণি',
  class_11: 'একাদশ শ্রেণি',
  class_12: 'দ্বাদশ শ্রেণি',
  university: 'বিশ্ববিদ্যালয়',
  masters: 'মাস্টার্স',
  general: 'সাধারণ',
}

const sectorColors: Record<string, string> = {
  'kids-zone': 'from-amber-400 to-orange-500',
  primary: 'from-emerald-400 to-teal-500',
  'high-school': 'from-sky-400 to-cyan-500',
  secondary: 'from-violet-400 to-purple-500',
  hsc: 'from-rose-400 to-pink-500',
  university: 'from-amber-400 to-yellow-500',
  masters: 'from-indigo-400 to-blue-500',
}

const sectorBorders: Record<string, string> = {
  'kids-zone': 'border-amber-500/30 hover:border-amber-500/60',
  primary: 'border-emerald-500/30 hover:border-emerald-500/60',
  'high-school': 'border-sky-500/30 hover:border-sky-500/60',
  secondary: 'border-violet-500/30 hover:border-violet-500/60',
  hsc: 'border-rose-500/30 hover:border-rose-500/60',
  university: 'border-amber-500/30 hover:border-amber-500/60',
  masters: 'border-indigo-500/30 hover:border-indigo-500/60',
}

const sectorIcons: Record<string, string> = {
  'kids-zone': '🧒',
  primary: '📚',
  'high-school': '🏫',
  secondary: '🎯',
  hsc: '🏛️',
  university: '🎓',
  masters: '🔬',
}

export default function AcademicPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
  const [studentLevel, setStudentLevel] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: sp } = await supabase
            .from('student_profiles')
            .select('class_level')
            .eq('user_id', user.id)
            .maybeSingle()

          if (sp?.class_level) {
            setStudentLevel(sp.class_level)
            if (sp.class_level === 'nursery' || sp.class_level === 'kg') {
              router.replace('/dashboard/student/kids-zone')
              return
            }
          }
        }

        const { data: sectorsData } = await supabase
          .from('learning_sectors')
          .select('*')
          .eq('is_active', true)
          .order('order_index')

        if (sectorsData && sectorsData.length > 0) {
          setSectors(sectorsData as Sector[])
        } else {
          setSectors(FALLBACK_SECTORS)
        }
      } catch {
        setSectors(FALLBACK_SECTORS)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [router])

  const fetchClasses = async (sector: Sector) => {
    if (sector.slug === 'kids-zone') {
      router.push('/dashboard/student/kids-zone')
      return
    }
    setSelectedSector(sector)
    setLoadingClasses(true)
    setClasses([])
    try {
      const supabase = createClient()
      // real DB sector ids are UUID; fallback ids start with fb-
      if (sector.id.startsWith('fb-')) {
        setClasses(FALLBACK_CLASSES[sector.slug] || [])
      } else {
        const { data } = await supabase
          .from('classes')
          .select('*')
          .eq('sector_id', sector.id)
          .eq('is_active', true)
          .order('order_index')
        if (data && data.length > 0) {
          setClasses(data as ClassItem[])
        } else {
          setClasses(FALLBACK_CLASSES[sector.slug] || [])
        }
      }
    } catch {
      setClasses(FALLBACK_CLASSES[sector.slug] || [])
    } finally {
      setLoadingClasses(false)
    }
  }

  const levelLabel = useMemo(
    () => LEVEL_BN[studentLevel] || studentLevel.replace(/_/g, ' '),
    [studentLevel],
  )

  const myClassHref = (() => {
    if (!studentLevel) return '/dashboard/student/academic'
    const level = studentLevel.toLowerCase().trim()
    if (level === 'nursery' || level === 'kg') return '/dashboard/student/kids-zone'
    return `/dashboard/student/academic/learn/${level.replace(/_/g, '-')}`
  })()

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08),transparent_45%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard/student"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 hover:text-white"
          >
            ←
          </Link>
          <div className="text-center">
            <p className="text-sm font-bold">📚 একাডেমিক হাব</p>
            <p className="text-[10px] text-sky-400">এনসিটিবি পাঠ্যক্রম</p>
          </div>
          <Link
            href="/dashboard/student/learning-path"
            className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-300"
          >
            📅
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-5 pb-12 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-cyan-500/10 to-indigo-500/5 p-5 md:p-7"
        >
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-3xl shadow-lg shadow-sky-500/25 md:size-16 md:text-4xl">
              📚
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-white md:text-3xl">একাডেমিক শিক্ষা</h1>
              <p className="mt-1 text-sm text-sky-100/80">
                স্তর বেছে নাও · বিষয় পড়ো · কুইজ দাও
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: '📖', label: 'পাঠ' },
              { icon: '✅', label: 'কুইজ' },
              { icon: '🤖', label: 'AI সহায়তা' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 py-2.5 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="text-[11px] font-semibold text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { href: myClassHref, icon: '🎯', label: 'আমার ক্লাস', color: 'from-sky-500 to-cyan-600' },
            {
              href: '/dashboard/student/learning-path',
              icon: '📅',
              label: 'আজকের প্ল্যান',
              color: 'from-violet-500 to-purple-600',
            },
            {
              href: '/dashboard/student/ai-tutor',
              icon: '🤖',
              label: 'AI শিক্ষক',
              color: 'from-fuchsia-500 to-pink-600',
            },
            {
              href: '/dashboard/student/kids-zone',
              icon: '🧒',
              label: 'কিডস জোন',
              color: 'from-amber-500 to-orange-600',
            },
          ].map((q) => (
            <Link key={q.href + q.label} href={q.href}>
              <div className="flex min-h-[76px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:border-sky-500/30 hover:bg-white/10 active:scale-95">
                <div
                  className={`mb-1 grid size-10 place-items-center rounded-xl bg-gradient-to-br text-base ${q.color}`}
                >
                  {q.icon}
                </div>
                <span className="text-center text-[11px] font-bold text-white">{q.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {studentLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-500/25 bg-gradient-to-r from-sky-500/10 to-cyan-500/10 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-xs text-slate-400">তোমার শ্রেণি</p>
                <p className="font-bold text-white">{levelLabel}</p>
              </div>
            </div>
            <Link
              href={myClassHref}
              className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
            >
              ক্লাসে যাও →
            </Link>
          </motion.div>
        )}

        {!selectedSector && (
          <>
            <h2 className="mb-3 text-lg font-black text-white">শেখার স্তর বেছে নাও</h2>
            {loading ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                  />
                ))}
              </div>
            ) : sectors.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-3xl">📭</p>
                <p className="mt-2 font-bold text-white">এখনো কোনো স্তর নেই</p>
                <p className="mt-1 text-sm text-slate-400">অ্যাডমিন পাঠ্যক্রম যোগ করলে এখানে দেখাবে</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {sectors.map((sector, i) => (
                  <motion.button
                    type="button"
                    key={sector.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3 }}
                    onClick={() => void fetchClasses(sector)}
                    className={`rounded-2xl border bg-white/5 p-5 text-left transition hover:bg-white/10 ${
                      sectorBorders[sector.slug] || 'border-white/10'
                    }`}
                  >
                    <div
                      className={`mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${
                        sectorColors[sector.slug] || sector.color || 'from-sky-400 to-cyan-500'
                      }`}
                    >
                      {sectorIcons[sector.slug] || sector.icon || '📘'}
                    </div>
                    <h3 className="text-lg font-black text-white">{sector.name}</h3>
                    <p className="mb-2 text-sm text-slate-400">{sector.level_range}</p>
                    <p
                      className={`bg-gradient-to-r bg-clip-text text-sm font-bold text-transparent ${
                        sectorColors[sector.slug] || 'from-sky-400 to-cyan-400'
                      }`}
                    >
                      {sector.slug === 'kids-zone' ? 'কিডস জোনে যাও →' : 'ক্লাস দেখো →'}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {selectedSector && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedSector(null)
                  setClasses([])
                }}
                className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sky-300 hover:text-sky-200"
              >
                ← সব স্তর
              </button>

              <div
                className={`mb-5 rounded-2xl bg-gradient-to-r p-px ${
                  sectorColors[selectedSector.slug] || selectedSector.color || 'from-sky-500 to-cyan-500'
                }`}
              >
                <div className="flex items-center gap-4 rounded-2xl bg-[#0a1220] p-5">
                  <span className="text-4xl">
                    {sectorIcons[selectedSector.slug] || selectedSector.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white md:text-2xl">{selectedSector.name}</h2>
                    <p className="text-sm text-slate-400">{selectedSector.level_range}</p>
                  </div>
                </div>
              </div>

              {loadingClasses ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : classes.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-3xl">📭</p>
                  <p className="mt-2 font-bold">এই স্তরে এখনো ক্লাস নেই</p>
                  <p className="mt-1 text-sm text-slate-400">শীঘ্রই পাঠ যোগ করা হবে</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((cls, i) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -3 }}
                    >
                      <Link href={`/dashboard/student/academic/learn/${cls.slug}`}>
                        <div
                          className={`cursor-pointer rounded-2xl border bg-white/5 p-5 transition hover:bg-white/10 ${
                            sectorBorders[selectedSector.slug] || 'border-white/10'
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div
                              className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br text-sm font-black text-white ${
                                sectorColors[selectedSector.slug] ||
                                selectedSector.color ||
                                'from-sky-400 to-cyan-500'
                              }`}
                            >
                              {i + 1}
                            </div>
                            {cls.level === studentLevel && (
                              <span className="rounded-full border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-xs text-sky-300">
                                আমার ক্লাস
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-white">{cls.name}</h3>
                          <p
                            className={`mt-3 bg-gradient-to-r bg-clip-text text-sm font-semibold text-transparent ${
                              sectorColors[selectedSector.slug] || 'from-sky-400 to-cyan-400'
                            }`}
                          >
                            শুরু করো →
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-center text-xs text-slate-600">
          অনন্য · একাডেমিক হাব · এনসিটিবি ভিত্তিক
        </p>
      </div>
    </div>
  )
}
