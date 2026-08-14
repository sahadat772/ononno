'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CurriculumClass = { id: string; name: string; class_number: number }
type CurriculumSubject = { id: string; name: string; name_bn: string; class_id: string }
type CurriculumChapter = { id: string; title: string; title_bn: string; subject_id: string; class_id: string }

interface Props {
    open: boolean
    chapters: CurriculumChapter[]
    subjects: CurriculumSubject[]
    classes: CurriculumClass[]
    onClose: () => void
    onSuccess: () => void
}

const inputClass = 'mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition'
const labelClass = 'text-sm text-gray-400'

export default function AddLessonModal({ open, chapters, subjects, classes, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filterClassId, setFilterClassId] = useState('')
    const [filterSubjectId, setFilterSubjectId] = useState('')

    const [form, setForm] = useState({
        classId: '',
        subjectId: '',
        chapterId: '',
        title: '',
        titleBn: '',
        slug: '',
        description: '',
        lessonNumber: 1,
        durationMinutes: 30,
        xpReward: 10,
        coinReward: 5,
        isFreePreview: false,
        orderIndex: 0,
    })

    const filteredSubjects = useMemo(() =>
        !filterClassId ? subjects : subjects.filter(s => s.class_id === filterClassId),
        [subjects, filterClassId]
    )

    const filteredChapters = useMemo(() => {
        let result = chapters
        if (filterClassId) result = result.filter(c => c.class_id === filterClassId)
        if (filterSubjectId) result = result.filter(c => c.subject_id === filterSubjectId)
        return result
    }, [chapters, filterClassId, filterSubjectId])

    function handleTitleChange(value: string) {
        const slug = value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        setForm({ ...form, title: value, slug })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!form.chapterId) { setError('Chapter বেছে নাও'); return }
        if (!form.subjectId) { setError('Subject বেছে নাও'); return }
        if (!form.classId) { setError('Class বেছে নাও'); return }

        setLoading(true)

        const res = await fetch('/api/admin/curriculum/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        setLoading(false)

        if (!res.ok) {
            const data = await res.json()
            setError(data.error || 'Lesson তৈরি করা যায়নি।')
            return
        }

        onSuccess()
        setForm({
            classId: '',
            subjectId: '',
            chapterId: '',
            title: '',
            titleBn: '',
            slug: '',
            description: '',
            lessonNumber: 1,
            durationMinutes: 30,
            xpReward: 10,
            coinReward: 5,
            isFreePreview: false,
            orderIndex: 0,
        })
        setFilterClassId('')
        setFilterSubjectId('')
        onClose()
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm px-4 py-6 sm:px-6 sm:py-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ scale: 0.96, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 20 }}
                        className="mx-auto w-full max-w-3xl overflow-hidden rounded-4xl border border-white/10 bg-[#111827] shadow-2xl"
                    >
                        {/* Header */}
                        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr,0.8fr]">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 rounded-3xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                    <span className="text-lg">➕</span>
                                    <span>Add Curriculum Lesson</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white">New lesson details</h2>
                                    <p className="mt-2 text-sm text-gray-400">
                                        Add a new lesson to a chapter. Lesson saves as draft by default.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                                <p className="font-semibold text-white">Tip</p>
                                <p className="mt-2 text-sm leading-6">
                                    Lesson draft হিসেবে save হবে। Content add করার পর publish করো।
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
                            <div className="grid gap-5">

                                {/* Class Filter */}
                                <div>
                                    <label className={labelClass}>Class দিয়ে filter করো</label>
                                    <select
                                        value={filterClassId}
                                        onChange={(e) => {
                                            setFilterClassId(e.target.value)
                                            setFilterSubjectId('')
                                            setForm({ ...form, classId: e.target.value, subjectId: '', chapterId: '' })
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">সব Class</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject Filter */}
                                <div>
                                    <label className={labelClass}>Subject দিয়ে filter করো</label>
                                    <select
                                        value={filterSubjectId}
                                        onChange={(e) => {
                                            setFilterSubjectId(e.target.value)
                                            const subject = subjects.find(s => s.id === e.target.value)
                                            setForm({
                                                ...form,
                                                subjectId: e.target.value,
                                                classId: subject?.class_id ?? form.classId,
                                                chapterId: '',
                                            })
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">সব Subject</option>
                                        {filteredSubjects.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name_bn} ({s.name})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chapter */}
                                <div>
                                    <label className={labelClass}>Chapter *</label>
                                    <select
                                        value={form.chapterId}
                                        onChange={(e) => {
                                            const chapter = chapters.find(c => c.id === e.target.value)
                                            setForm({
                                                ...form,
                                                chapterId: e.target.value,
                                                subjectId: chapter?.subject_id ?? form.subjectId,
                                                classId: chapter?.class_id ?? form.classId,
                                            })
                                        }}
                                        className={inputClass}
                                        required
                                    >
                                        <option value="">Chapter বেছে নাও</option>
                                        {filteredChapters.map((c) => (
                                            <option key={c.id} value={c.id}>{c.title_bn} ({c.title})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Title English */}
                                <div>
                                    <label className={labelClass}>Lesson Title (English) *</label>
                                    <input
                                        className={inputClass}
                                        placeholder="The Story of Ibrahim"
                                        value={form.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Title Bangla */}
                                <div>
                                    <label className={labelClass}>Lesson Title (বাংলা) *</label>
                                    <input
                                        className={inputClass}
                                        placeholder="ইব্রাহীমের গল্প"
                                        value={form.titleBn}
                                        onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className={labelClass}>Slug *</label>
                                    <input
                                        className={inputClass}
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        required
                                    />
                                </div>

                                {/* Numbers */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Lesson Number *</label>
                                        <input type="number" min={1} className={inputClass}
                                            value={form.lessonNumber}
                                            onChange={(e) => setForm({ ...form, lessonNumber: parseInt(e.target.value) || 1 })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Duration (minutes)</label>
                                        <input type="number" min={1} className={inputClass}
                                            value={form.durationMinutes}
                                            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 30 })} />
                                    </div>
                                </div>

                                {/* XP + Coins */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>XP Reward ⚡</label>
                                        <input type="number" min={0} className={inputClass}
                                            value={form.xpReward}
                                            onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Coin Reward 🪙</label>
                                        <input type="number" min={0} className={inputClass}
                                            value={form.coinReward}
                                            onChange={(e) => setForm({ ...form, coinReward: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>

                                {/* Order */}
                                <div>
                                    <label className={labelClass}>Order Index</label>
                                    <input type="number" min={0} className={inputClass}
                                        value={form.orderIndex}
                                        onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea rows={3} className={inputClass}
                                        placeholder="Lesson সম্পর্কে সংক্ষেপে লেখো..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>

                                {/* Free Preview */}
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="checkbox" checked={form.isFreePreview}
                                        onChange={(e) => setForm({ ...form, isFreePreview: e.target.checked })}
                                        className="h-4 w-4 rounded border-white/10 bg-slate-800 text-amber-500" />
                                    Free Preview (সবাই দেখতে পারবে)
                                </label>

                                {/* Error */}
                                {error && (
                                    <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button type="button" onClick={onClose}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition disabled:opacity-50">
                                        {loading ? 'Creating...' : 'Create Lesson'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}