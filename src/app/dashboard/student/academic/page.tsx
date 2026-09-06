'use client'

import { useState, useEffect } from 'react'
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

interface Class {
  id: string
  sector_id: string
  name: string
  slug: string
  level: string
  order_index: number
}

export default function AcademicPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
  const [studentLevel, setStudentLevel] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: sp } = await supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', user.id)
        .single()

      if (sp?.class_level) setStudentLevel(sp.class_level)

      if (sp?.class_level === 'nursery' || sp?.class_level === 'kg') {
        router.replace('/dashboard/student/kids-zone')
        return
      }

      const { data: sectorsData } = await supabase
        .from('learning_sectors')
        .select('*')
        .eq('is_active', true)
        .order('order_index')

      if (sectorsData) setSectors(sectorsData)
      setLoading(false)
    }
    void fetchData()
  }, [router])

  const fetchClasses = async (sector: Sector) => {
    if (sector.slug === 'kids-zone') {
      router.push('/dashboard/student/kids-zone')
      return
    }
    setSelectedSector(sector)
    const supabase = createClient()
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('sector_id', sector.id)
      .eq('is_active', true)
      .order('order_index')
    if (data) setClasses(data)
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

  const myClassHref = (() => {
    if (!studentLevel) return '/dashboard/student/academic'
    const level = studentLevel.toLowerCase().trim()
    if (level === 'nursery' || level === 'kg') return '/dashboard/student/kids-zone'
    return `/dashboard/student/academic/learn/${level.replace(/_/g, '-')}`
  })()

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.07),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-6xl p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard/student"
            className="mb-4 inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
          >
            ← Dashboard
          </Link>

          <div className="mt-3 flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-3xl shadow-lg shadow-sky-500/20">
              📚
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-sky-300 to-cyan-300 bg-clip-text text-3xl font-black text-transparent">
                একাডেমিক
              </h1>
              <p className="mt-1 text-sm text-slate-400">NCTB Curriculum · Sector বেছে নিয়ে শেখা শুরু করো</p>
            </div>
          </div>
        </motion.div>

        {studentLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-500/25 bg-gradient-to-r from-sky-500/10 to-cyan-500/10 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-xs text-slate-400">তোমার level</p>
                <p className="font-bold text-white">
                  {studentLevel.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <Link
              href={myClassHref}
              className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
            >
              আমার ক্লাসে যাও →
            </Link>
          </motion.div>
        )}

        {!selectedSector && (
          <>
            <h2 className="mb-4 text-lg font-black text-white">শেখার স্তর</h2>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sectors.map((sector, i) => (
                  <motion.button
                    type="button"
                    key={sector.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                    onClick={() => void fetchClasses(sector)}
                    className={`rounded-2xl border bg-white/5 p-6 text-left transition hover:bg-white/10 ${
                      sectorBorders[sector.slug] || 'border-white/10'
                    }`}
                  >
                    <div
                      className={`mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${
                        sectorColors[sector.slug] || sector.color
                      }`}
                    >
                      {sectorIcons[sector.slug] || sector.icon}
                    </div>
                    <h3 className="text-xl font-black text-white">{sector.name}</h3>
                    <p className="mb-3 text-sm text-slate-400">{sector.level_range}</p>
                    <p
                      className={`bg-gradient-to-r bg-clip-text text-sm font-bold text-transparent ${
                        sectorColors[sector.slug] || 'from-sky-400 to-cyan-400'
                      }`}
                    >
                      {sector.slug === 'kids-zone' ? 'Kids Zone →' : 'ক্লাস দেখো →'}
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
                className="mb-6 text-sm text-sky-400 hover:text-sky-300"
              >
                ← সব Sector
              </button>

              <div
                className={`mb-6 rounded-2xl bg-gradient-to-r p-px ${
                  sectorColors[selectedSector.slug] || selectedSector.color
                }`}
              >
                <div className="flex items-center gap-4 rounded-2xl bg-[#0f0f2a] p-5">
                  <span className="text-4xl">
                    {sectorIcons[selectedSector.slug] || selectedSector.icon}
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-white">{selectedSector.name}</h2>
                    <p className="text-slate-400">{selectedSector.level_range}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls, i) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
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
                              sectorColors[selectedSector.slug] || selectedSector.color
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
