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
    const [studentLevel, setStudentLevel] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: sp } = await supabase
                .from('student_profiles')
                .select('class_level')
                .eq('user_id', user.id)
                .single()

            if (sp?.class_level) setStudentLevel(sp.class_level)

            // Nursery ও KG → Kids Zone এ redirect
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
        fetchData()
    }, [router])

    const fetchClasses = async (sector: Sector) => {
        // Kids Zone sector → সরাসরি kids-zone page এ নিয়ে যাও
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
        'kids-zone': 'from-yellow-400 to-orange-400',
        'primary': 'from-green-400 to-emerald-500',
        'high-school': 'from-blue-400 to-cyan-500',
        'secondary': 'from-violet-400 to-purple-500',
        'hsc': 'from-rose-400 to-pink-500',
        'university': 'from-amber-400 to-yellow-500',
        'masters': 'from-indigo-400 to-blue-500',
    }

    const sectorBorders: Record<string, string> = {
        'kids-zone': 'border-yellow-500/30 hover:border-yellow-500/60',
        'primary': 'border-green-500/30 hover:border-green-500/60',
        'high-school': 'border-blue-500/30 hover:border-blue-500/60',
        'secondary': 'border-violet-500/30 hover:border-violet-500/60',
        'hsc': 'border-rose-500/30 hover:border-rose-500/60',
        'university': 'border-amber-500/30 hover:border-amber-500/60',
        'masters': 'border-indigo-500/30 hover:border-indigo-500/60',
    }

    const sectorIcons: Record<string, string> = {
        'kids-zone': '🧒',
        'primary': '📚',
        'high-school': '🏫',
        'secondary': '🎯',
        'hsc': '🏛️',
        'university': '🎓',
        'masters': '🔬',
    }

    // "আমার ক্লাসে যাও" এর সঠিক href বের করো
    const myClassHref = (() => {
        if (!studentLevel) return '#'
        const level = studentLevel.toLowerCase().trim()
        if (level === 'nursery' || level === 'kg') {
            return '/dashboard/student/kids-zone'
        }
        return `/dashboard/student/academic/learn/${level}`
    })()

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    href="/dashboard/student"
                    className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-flex items-center gap-2"
                >
                    ← Dashboard এ ফিরে যাও
                </Link>

                <div className="flex items-center gap-4 mt-2">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-3xl shadow-lg">
                        📚
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Learning Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">তোমার level বেছে নাও এবং শেখা শুরু করো</p>
                    </div>
                </div>
            </motion.div>

            {/* My Level Banner */}
            {studentLevel && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 rounded-2xl bg-linear-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-4 flex items-center justify-between flex-wrap gap-3"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                            <p className="text-xs text-gray-400">তোমার current level</p>
                            <p className="text-white font-bold">
                                {studentLevel.replace('_', ' ').toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={myClassHref}
                        className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all"
                    >
                        আমার ক্লাসে যাও →
                    </Link>
                </motion.div>
            )}

            {/* Sectors Grid */}
            {!selectedSector && (
                <>
                    <h2 className="text-xl font-bold text-white mb-4">📂 সব Sector</h2>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-6 animate-pulse h-36" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sectors.map((sector, i) => (
                                <motion.div
                                    key={sector.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    onClick={() => fetchClasses(sector)}
                                    className={`cursor-pointer rounded-2xl border ${sectorBorders[sector.slug] || 'border-white/10 hover:border-white/30'} bg-white/5 hover:bg-white/10 p-6 transition-all duration-300`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${sectorColors[sector.slug] || sector.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                                        {sectorIcons[sector.slug] || sector.icon}
                                    </div>
                                    <h3 className="font-bold text-white text-xl mb-1">{sector.name}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{sector.level_range}</p>
                                    <div className={`text-sm font-semibold bg-linear-to-r ${sectorColors[sector.slug] || sector.color} bg-clip-text text-transparent flex items-center gap-1`}>
                                        {sector.slug === 'kids-zone' ? '🧒 Kids Zone এ যাও →' : 'দেখো →'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Classes List */}
            <AnimatePresence>
                {selectedSector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button
                            onClick={() => { setSelectedSector(null); setClasses([]) }}
                            className="text-blue-400 hover:text-blue-300 text-sm mb-6 flex items-center gap-1 transition-colors"
                        >
                            ← সব Sector দেখো
                        </button>

                        {/* Sector Header */}
                        <div className={`rounded-2xl bg-linear-to-r ${sectorColors[selectedSector.slug] || selectedSector.color} p-px mb-6`}>
                            <div className="rounded-2xl bg-[#0f0f2a] p-5 flex items-center gap-4">
                                <span className="text-4xl">{sectorIcons[selectedSector.slug] || selectedSector.icon}</span>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedSector.name}</h2>
                                    <p className="text-gray-400">{selectedSector.level_range}</p>
                                </div>
                            </div>
                        </div>

                        {/* Classes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classes.map((cls, i) => (
                                <motion.div
                                    key={cls.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    whileHover={{ y: -4 }}
                                >
                                    <Link href={`/dashboard/student/academic/learn/${cls.slug}`}>
                                        <div className={`rounded-2xl border ${sectorBorders[selectedSector.slug] || 'border-white/10'} bg-white/5 hover:bg-white/10 p-5 transition-all cursor-pointer`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${sectorColors[selectedSector.slug] || selectedSector.color} flex items-center justify-center text-lg font-bold text-white shadow-md`}>
                                                    {i + 1}
                                                </div>
                                                {cls.level === studentLevel && (
                                                    <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                                                        ✨ আমার ক্লাস
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-white text-lg mb-1">{cls.name}</h3>
                                            <div className={`mt-3 text-sm font-semibold bg-linear-to-r ${sectorColors[selectedSector.slug] || selectedSector.color} bg-clip-text text-transparent`}>
                                                শুরু করো →
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}