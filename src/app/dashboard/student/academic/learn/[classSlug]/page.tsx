'use client'

import { useState, useEffect, useMemo } from 'react'
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
    /** subjectId → 0–100 */
    const [progress, setProgress] = useState<Record<string, number>>({})
    /** subjectId → { done, total } */
    const [counts, setCounts] = useState<Record<string, { done: number; total: number }>>({})

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            const supabase = createClient()

            try {
                const candidates = slugCandidates(classSlug)
                let cls: ClassInfo | null = null

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

                const subjectList = subs ?? []
                setSubjects(subjectList)

                // Published lessons for this class (denominator)
                const { data: published } = await supabase
                    .from('curriculum_lessons')
                    .select('id, subject_id')
                    .eq('class_id', cls.id)
                    .eq('is_active', true)
                    .eq('is_published', true)

                const totalBySubject: Record<string, number> = {}
                const publishedIds = new Set<string>()
                for (const l of published ?? []) {
                    if (!l.subject_id) continue
                    totalBySubject[l.subject_id] = (totalBySubject[l.subject_id] || 0) + 1
                    publishedIds.add(l.id)
                }

                // Student completions (numerator)
                const { data: { user } } = await supabase.auth.getUser()
                const doneBySubject: Record<string, number> = {}
                if (user && publishedIds.size > 0) {
                    const { data: prog } = await supabase
                        .from('learning_progress')
                        .select('lesson_id, subject_id, status')
                        .eq('user_id', user.id)
                        .eq('status', 'completed')

                    const seen = new Set<string>()
                    for (const row of prog ?? []) {
                        if (!row.lesson_id || !publishedIds.has(row.lesson_id)) continue
                        if (seen.has(row.lesson_id)) continue
                        seen.add(row.lesson_id)
                        const sid = row.subject_id as string
                        if (!sid) continue
                        doneBySubject[sid] = (doneBySubject[sid] || 0) + 1
                    }
                }

                const nextProgress: Record<string, number> = {}
                const nextCounts: Record<string, { done: number; total: number }> = {}
                for (const s of subjectList) {
                    const total = totalBySubject[s.id] || 0
                    const done = Math.min(doneBySubject[s.id] || 0, total)
                    nextCounts[s.id] = { done, total }
                    nextProgress[s.id] = total > 0 ? Math.round((done / total) * 100) : 0
                }
                setProgress(nextProgress)
                setCounts(nextCounts)
            } catch (e) {
                console.error(e)
                setError('ডেটা load করতে সমস্যা হয়েছে।')
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [classSlug])

    const overall = useMemo(() => {
        let done = 0
        let total = 0
        for (const c of Object.values(counts)) {
            done += c.done
            total += c.total
        }
        return {
            done,
            total,
            pct: total > 0 ? Math.round((done / total) * 100) : 0,
        }
    }, [counts])

    const sectorColor = 'from-sky-400 to-blue-600'

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mb-8">
                <Link
                    href="/dashboard/student/academic"
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
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
                                    <p className="text-gray-400 mt-1">
                                        {subjects.length}টি বিষয় · {overall.done}/{overall.total} পাঠ সম্পন্ন
                                    </p>
                                </div>
                                <div className="text-6xl">📚</div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>সামগ্রিক অগ্রগতি</span>
                                    <span className="font-semibold text-sky-300">{overall.pct}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overall.pct}%` }}
                                        transition={{ duration: 0.8 }}
                                        className={`bg-linear-to-r ${sectorColor} h-2.5 rounded-full`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="max-w-5xl mx-auto">
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
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-white font-semibold">এই ক্লাসে এখনো subject নেই</p>
                        <p className="text-gray-400 text-sm mt-2">Admin subject add ও lesson publish করলে এখানে দেখা যাবে।</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subject, i) => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                classSlug={classSlug}
                                index={i}
                                progress={progress[subject.id] || 0}
                                done={counts[subject.id]?.done ?? 0}
                                total={counts[subject.id]?.total ?? 0}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function SubjectCard({
    subject,
    classSlug,
    index,
    progress,
    done,
    total,
}: {
    subject: Subject
    classSlug: string
    index: number
    progress: number
    done: number
    total: number
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
                <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-all cursor-pointer group h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center text-3xl shadow-lg`}>
                            {subject.icon || '📖'}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">অগ্রগতি</p>
                            <p className={`text-lg font-bold bg-linear-to-r ${color} bg-clip-text text-transparent`}>
                                {progress}%
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                {done}/{total} পাঠ
                            </p>
                        </div>
                    </div>

                    <h3 className="font-bold text-white text-lg mb-0.5 group-hover:text-blue-400 transition-colors">
                        {subject.name_bn || subject.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">{subject.name}</p>

                    <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`bg-linear-to-r ${color} h-2 rounded-full`}
                        />
                    </div>

                    <div className={`text-sm font-semibold bg-linear-to-r ${color} bg-clip-text text-transparent flex items-center gap-1`}>
                        {progress >= 100 ? 'সম্পন্ন ✨' : progress > 0 ? 'চালিয়ে যাও' : 'শুরু করো'} <span>→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
