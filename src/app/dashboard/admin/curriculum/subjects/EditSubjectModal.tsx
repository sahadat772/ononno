'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CurriculumClass = { id: string; name: string; class_number: number }
type CurriculumSubject = {
    id: string
    class_id: string
    name: string
    name_bn: string
    slug: string
    description?: string | null
    icon?: string | null
    color?: string | null
    is_mandatory: boolean
    is_active: boolean
    order_index: number
}

interface Props {
    open: boolean
    subject: CurriculumSubject | null
    classes: CurriculumClass[]
    onClose: () => void
    onSuccess: () => void
}

const ICONS = ['📚', '📖', '✏️', '🔢', '🔬', '🌍', '🎨', '🕌', '💻', '🏃', '🎵', '🌿']
const COLORS = [
    { label: 'Blue', value: 'from-blue-400 to-cyan-500' },
    { label: 'Green', value: 'from-green-400 to-emerald-500' },
    { label: 'Purple', value: 'from-violet-400 to-purple-500' },
    { label: 'Orange', value: 'from-amber-400 to-orange-500' },
    { label: 'Pink', value: 'from-rose-400 to-pink-500' },
    { label: 'Indigo', value: 'from-indigo-400 to-blue-500' },
    { label: 'Teal', value: 'from-teal-400 to-cyan-500' },
    { label: 'Red', value: 'from-red-400 to-rose-500' },
]

const inputClass = 'mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-400 transition'
const labelClass = 'text-sm text-gray-400'

export default function EditSubjectModal({ open, subject, classes, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [form, setForm] = useState({
        name: subject?.name ?? '',
        nameBn: subject?.name_bn ?? '',
        slug: subject?.slug ?? '',
        description: subject?.description ?? '',
        icon: subject?.icon ?? '📚',
        color: subject?.color ?? 'from-blue-400 to-cyan-500',
        isMandatory: subject?.is_mandatory ?? true,
        isActive: subject?.is_active ?? true,
        orderIndex: subject?.order_index ?? 0,
    })

    // subject change হলে form reset করো
    // const subjectId = subject?.id
    // useEffect(() => {
    //     if (!subjectId) return
    //     setForm({
    //         name: subject?.name ?? '',
    //         nameBn: subject?.name_bn ?? '',
    //         slug: subject?.slug ?? '',
    //         description: subject?.description ?? '',
    //         icon: subject?.icon ?? '📚',
    //         color: subject?.color ?? 'from-blue-400 to-cyan-500',
    //         isMandatory: subject?.is_mandatory ?? true,
    //         isActive: subject?.is_active ?? true,
    //         orderIndex: subject?.order_index ?? 0,
    //     })
    //     setError(null)
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [subjectId])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!subject) return
        setError(null)
        setLoading(true)

        const res = await fetch(`/api/admin/curriculum/subjects/${subject.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        setLoading(false)

        if (!res.ok) {
            const data = await res.json()
            setError(data.error || 'Subject আপডেট করা যায়নি।')
            return
        }

        onSuccess()
        onClose()
    }

    return (
        <AnimatePresence>
            {open && subject && (
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
                                    <span className="text-lg">✏️</span>
                                    <span>Edit Subject</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white">Edit subject details</h2>
                                    <p className="mt-2 text-sm text-gray-400">
                                        Update the subject information below.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                                <p className="font-semibold text-white">Class</p>
                                <p className="mt-2 text-sm leading-6 text-blue-300">
                                    {classes.find(c => c.id === subject.class_id)?.name ?? '—'}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
                            <div className="grid gap-5">

                                {/* Name English */}
                                <div>
                                    <label className={labelClass}>Subject Name (English) *</label>
                                    <input
                                        className={inputClass}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Name Bangla */}
                                <div>
                                    <label className={labelClass}>Subject Name (বাংলা) *</label>
                                    <input
                                        className={inputClass}
                                        value={form.nameBn}
                                        onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
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
                                                    ? 'border-blue-400 bg-blue-400/20'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color */}
                                <div>
                                    <label className={labelClass}>Color</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, color: color.value })}
                                                className={`h-8 w-16 rounded-xl bg-gradient-to-r ${color.value} border-2 transition ${form.color === color.value
                                                    ? 'border-white scale-110'
                                                    : 'border-transparent'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        rows={3}
                                        className={inputClass}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                {/* Order Index */}
                                <div>
                                    <label className={labelClass}>Order Index</label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={form.orderIndex}
                                        min={0}
                                        onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                {/* Mandatory + Active */}
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isMandatory}
                                            onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                                            className="h-4 w-4 rounded border-white/10 bg-slate-800 text-blue-500"
                                        />
                                        বাধ্যতামূলক
                                    </label>
                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            className="h-4 w-4 rounded border-white/10 bg-slate-800 text-blue-500"
                                        />
                                        Active
                                    </label>
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
                                        className="rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
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