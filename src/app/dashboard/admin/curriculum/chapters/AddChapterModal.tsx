'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CurriculumClass = { id: string; name: string; class_number: number }
type CurriculumSubject = { id: string; name: string; name_bn: string; class_id: string }

interface Props {
    open: boolean
    subjects: CurriculumSubject[]
    classes: CurriculumClass[]
    onClose: () => void
    onSuccess: () => void
}

const ICONS = ['📖', '📝', '🔢', '🔬', '🌍', '🎨', '📚', '✏️', '💡', '🧪', '🗺️', '📊']

const inputClass = 'mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white placeholder:text-slate-500 outline-none focus:border-violet-400 transition'
const labelClass = 'text-sm text-gray-400'

export default function AddChapterModal({ open, subjects, classes, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filterClassId, setFilterClassId] = useState('')

    const [form, setForm] = useState({
        classId: '',
        subjectId: '',
        title: '',
        titleBn: '',
        slug: '',
        description: '',
        chapterNumber: 1,
        icon: '📖',
        orderIndex: 0,
    })

    const filteredSubjects = filterClassId
        ? subjects.filter(s => s.class_id === filterClassId)
        : subjects

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

        if (!form.subjectId) { setError('Subject বেছে নাও'); return }
        if (!form.classId) { setError('Class বেছে নাও'); return }

        setLoading(true)

        const res = await fetch('/api/admin/curriculum/chapters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        setLoading(false)

        if (!res.ok) {
            const data = await res.json()
            setError(data.error || 'Chapter তৈরি করা যায়নি।')
            return
        }

        onSuccess()
        setForm({
            classId: '',
            subjectId: '',
            title: '',
            titleBn: '',
            slug: '',
            description: '',
            chapterNumber: 1,
            icon: '📖',
            orderIndex: 0,
        })
        setFilterClassId('')
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
                                <div className="inline-flex items-center gap-3 rounded-3xl bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
                                    <span className="text-lg">➕</span>
                                    <span>Add Curriculum Chapter</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white">New chapter details</h2>
                                    <p className="mt-2 text-sm text-gray-400">
                                        Add a new chapter to a subject. Fill all required fields and save.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                                <p className="font-semibold text-white">Tip</p>
                                <p className="mt-2 text-sm leading-6">
                                    Chapter slug auto-generate হয় English title থেকে। Chapter number দিয়ে order ঠিক করো।
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
                                            setForm({ ...form, classId: e.target.value, subjectId: '' })
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">সব Class</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className={labelClass}>Subject *</label>
                                    <select
                                        value={form.subjectId}
                                        onChange={(e) => {
                                            const subject = subjects.find(s => s.id === e.target.value)
                                            setForm({
                                                ...form,
                                                subjectId: e.target.value,
                                                classId: subject?.class_id ?? form.classId,
                                            })
                                        }}
                                        className={inputClass}
                                        required
                                    >
                                        <option value="">Subject বেছে নাও</option>
                                        {filteredSubjects.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name_bn} ({s.name})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Title English */}
                                <div>
                                    <label className={labelClass}>Chapter Title (English) *</label>
                                    <input
                                        className={inputClass}
                                        placeholder="The Poem"
                                        value={form.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Title Bangla */}
                                <div>
                                    <label className={labelClass}>Chapter Title (বাংলা) *</label>
                                    <input
                                        className={inputClass}
                                        placeholder="কবিতা"
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
                                        placeholder="the-poem"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        required
                                    />
                                </div>

                                {/* Chapter Number + Order */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Chapter Number *</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className={inputClass}
                                            value={form.chapterNumber}
                                            onChange={(e) => setForm({ ...form, chapterNumber: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Order Index</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className={inputClass}
                                            value={form.orderIndex}
                                            onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Icon */}
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setForm({ ...form, icon })}
                                                className={`text-2xl p-2 rounded-xl border transition ${form.icon === icon
                                                    ? 'border-violet-400 bg-violet-400/20'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        rows={3}
                                        className={inputClass}
                                        placeholder="Chapter সম্পর্কে সংক্ষেপে লেখো..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-2xl bg-linear-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02] transition disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Chapter'}
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