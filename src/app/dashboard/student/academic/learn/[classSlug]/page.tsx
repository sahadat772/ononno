'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Subject {
    id: string
    name: string
    name_en: string
    icon: string
    color: string
    is_mandatory: boolean
    order_index: number
}

interface ClassInfo {
    id: string
    name: string
    slug: string
    level: string
    sector_id: string
    learning_sectors: {
        name: string
        slug: string
        color: string
    }
}

export default function ClassSubjectsPage() {
    const params = useParams()
    const classSlug = params.classSlug as string

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState<Record<string, number>>({})

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()

            // Class info আনো
            const { data: cls } = await supabase
                .from('classes')
                .select('*, learning_sectors(name, slug, color)')
                .eq('slug', classSlug)
                .single()

            if (!cls) return
            setClassInfo(cls)

            // Subjects আনো
            const { data: subs } = await supabase
                .from('class_subjects')
                .select('*')
                .eq('class_id', cls.id)
                .eq('is_active', true)
                .order('order_index')

            if (subs) setSubjects(subs)
            setLoading(false)
        }
        fetchData()
    }, [classSlug])

    const sectorColors: Record<string, string> = {
        'kids-zone': 'from-yellow-400 to-orange-400',
        'primary': 'from-green-400 to-emerald-500',
        'high-school': 'from-blue-400 to-cyan-500',
        'secondary': 'from-violet-400 to-purple-500',
        'hsc': 'from-rose-400 to-pink-500',
        'university': 'from-amber-400 to-yellow-500',
        'masters': 'from-indigo-400 to-blue-500',
    }

    const sectorColor = classInfo?.learning_sectors?.slug
        ? sectorColors[classInfo.learning_sectors.slug]
        : 'from-blue-400 to-cyan-500'

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    href="/dashboard/student/academic"
                    className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-flex items-center gap-2"
                >
                    ← Learning Dashboard এ ফিরে যাও
                </Link>

                {classInfo && (
                    <div className={`rounded-2xl bg-linear-to-r ${sectorColor} p-px mt-4`}>
                        <div className="rounded-2xl bg-[#0f0f2a] p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">
                                        {classInfo.learning_sectors?.name}
                                    </p>
                                    <h1 className={`text-3xl font-bold bg-linear-to-r ${sectorColor} bg-clip-text text-transparent`}>
                                        {classInfo.name}
                                    </h1>
                                    <p className="text-gray-400 mt-1">{subjects.length}টি বিষয়</p>
                                </div>
                                <div className="text-6xl">
                                    {classInfo.learning_sectors?.slug === 'kids-zone' ? '🧒' :
                                        classInfo.learning_sectors?.slug === 'primary' ? '📚' :
                                            classInfo.learning_sectors?.slug === 'high-school' ? '🏫' :
                                                classInfo.learning_sectors?.slug === 'secondary' ? '🎯' :
                                                    classInfo.learning_sectors?.slug === 'hsc' ? '🏛️' : '🎓'}
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>সামগ্রিক অগ্রগতি</span>
                                    <span>০%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className={`bg-linear-to-r ${sectorColor} h-2 rounded-full w-0`} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Subjects */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-6 animate-pulse h-40" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Mandatory */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>📌</span> বাধ্যতামূলক বিষয়
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.filter(s => s.is_mandatory).map((subject, i) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    classSlug={classSlug}
                                    index={i}
                                    progress={progress[subject.id] || 0}
                                    sectorColor={sectorColor}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Optional */}
                    {subjects.filter(s => !s.is_mandatory).length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span>✨</span> ঐচ্ছিক বিষয়
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subjects.filter(s => !s.is_mandatory).map((subject, i) => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        classSlug={classSlug}
                                        index={i}
                                        progress={progress[subject.id] || 0}
                                        sectorColor={sectorColor}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function SubjectCard({
    subject,
    classSlug,
    index,
    progress,
    sectorColor,
}: {
    subject: Subject
    classSlug: string
    index: number
    progress: number
    sectorColor: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
        >
            <Link href={`/dashboard/student/academic/learn/${classSlug}/${subject.id}`}>
                <div className={`rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all cursor-pointer group`}>
                    {/* Icon & Progress */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${subject.color} flex items-center justify-center text-3xl shadow-lg`}>
                            {subject.icon}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">অগ্রগতি</p>
                            <p className={`text-lg font-bold bg-linear-to-r ${subject.color} bg-clip-text text-transparent`}>
                                {progress}%
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-white text-lg mb-0.5 group-hover:text-blue-400 transition-colors">
                        {subject.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">{subject.name_en}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`bg-linear-to-r ${subject.color} h-2 rounded-full`}
                        />
                    </div>

                    <div className={`text-sm font-semibold bg-linear-to-r ${subject.color} bg-clip-text text-transparent flex items-center gap-1`}>
                        {progress > 0 ? 'চালিয়ে যাও' : 'শুরু করো'} <span>→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}