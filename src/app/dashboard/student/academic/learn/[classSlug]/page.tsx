'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Subject {
    id: string
    name: string
    name_bn: string
    icon: string
    color: string
    is_mandatory: boolean
    order_index: number
}

interface ClassInfo {
    id: string
    name: string
    slug: string
    class_number: number
}

/** Match class-1, class_1, class1, Class 1, etc. */
function slugCandidates(raw: string): string[] {
    const s = decodeURIComponent(raw || '').trim().toLowerCase()
    const underscored = s.replace(/-/g, '_')
    const dashed = s.replace(/_/g, '-')
    const compact = s.replace(/[-_\s]/g, '')
    return [...new Set([s, underscored, dashed, compact].filter(Boolean))]
}

function parseClassNumber(raw: string): number | null {
    const m = decodeURIComponent(raw || '').match(/(\d{1,2})/)
    if (!m) return null
    const n = parseInt(m[1], 10)
    return n >= 1 && n <= 12 ? n : null
}

export default function ClassSubjectsPage() {
    const params = useParams()
    const classSlug = params.classSlug as string

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [progress] = useState<Record<string, number>>({})

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            const supabase = createClient()

            try {
                const candidates = slugCandidates(classSlug)
                let cls: ClassInfo | null = null

                // 1) Try exact slug matches
                for (const slug of candidates) {
                    const { data } = await supabase
                        .from('curriculum_classes')
                        .select('id, name, slug, class_number')
                        .eq('slug', slug)
                        .eq('is_active', true)
                        .maybeSingle()
                    if (data) {
                        cls = data
                        break
                    }
                }

                // 2) Fallback: class_number from slug (class-1 → 1)
                if (!cls) {
                    const num = parseClassNumber(classSlug)
                    if (num != null) {
                        const { data } = await supabase
                            .from('curriculum_classes')
                            .select('id, name, slug, class_number')
                            .eq('class_number', num)
                            .eq('is_active', true)
                            .maybeSingle()
                        if (data) cls = data
                    }
                }

                if (!cls) {
                    setClassInfo(null)
                    setSubjects([])
                    setError(`Class "${classSlug}" পাওয়া যায়নি। Admin curriculum_classes-এ slug check করুন।`)
                    return
                }

                setClassInfo(cls)

                const { data: subs, error: subErr } = await supabase
                    .from('curriculum_subjects')
                    .select('id, name, name_bn, icon, color, is_mandatory, order_index')
                    .eq('class_id', cls.id)
                    .eq('is_active', true)
                    .order('order_index')

                if (subErr) {
                    console.error('subjects fetch', subErr)
                    setError('Subjects load করা যায়নি।')
                    setSubjects([])
                    return
                }

                setSubjects(subs ?? [])
            } catch (e) {
                console.error(e)
                setError('ডেটা load করতে সমস্যা হয়েছে।')
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [classSlug])

    const sectorColor = 'from-blue-400 to-cyan-500'

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
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
                                    <p className="text-gray-400 text-sm mb-1">NCTB Curriculum</p>
                                    <h1 className={`text-3xl font-bold bg-linear-to-r ${sectorColor} bg-clip-text text-transparent`}>
                                        {classInfo.name}
                                    </h1>
                                    <p className="text-gray-400 mt-1">{subjects.length}টি বিষয়</p>
                                </div>
                                <div className="text-6xl">📚</div>
                            </div>
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

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-6 animate-pulse h-40" />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-amber-200 font-semibold">{error}</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Admin → Curriculum → Classes-এ slug `class_1` বা `class-1` আছে কি দেখো।
                    </p>
                </div>
            ) : subjects.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-white font-semibold">এই ক্লাসে এখনো subject নেই</p>
                    <p className="text-gray-400 text-sm mt-2">Admin subject add ও lesson publish করলে এখানে দেখা যাবে।</p>
                </div>
            ) : (
                <>
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>📌</span> বিষয়সমূহ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map((subject, i) => (
                                <SubjectCard
                                    key={subject.id}
                                    subject={subject}
                                    classSlug={classSlug}
                                    index={i}
                                    progress={progress[subject.id] || 0}
                                />
                            ))}
                        </div>
                    </div>
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
}: {
    subject: Subject
    classSlug: string
    index: number
    progress: number
}) {
    const color = subject.color || 'from-violet-500 to-purple-600'
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
        >
            <Link href={`/dashboard/student/academic/learn/${classSlug}/${subject.id}`}>
                <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center text-3xl shadow-lg`}>
                            {subject.icon || '📖'}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">অগ্রগতি</p>
                            <p className={`text-lg font-bold bg-linear-to-r ${color} bg-clip-text text-transparent`}>
                                {progress}%
                            </p>
                        </div>
                    </div>

                    <h3 className="font-bold text-white text-lg mb-0.5 group-hover:text-blue-400 transition-colors">
                        {subject.name_bn || subject.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">{subject.name}</p>

                    <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`bg-linear-to-r ${color} h-2 rounded-full`}
                        />
                    </div>

                    <div className={`text-sm font-semibold bg-linear-to-r ${color} bg-clip-text text-transparent flex items-center gap-1`}>
                        {progress > 0 ? 'চালিয়ে যাও' : 'শুরু করো'} <span>→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
