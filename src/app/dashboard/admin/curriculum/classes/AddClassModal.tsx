'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CurriculumVersion {
    id: string
    name: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddClassModal({
    open,
    onClose,
    onSuccess,
}: Props) {
    const [loading, setLoading] = useState(false)

    const [versions, setVersions] = useState<CurriculumVersion[]>([])

    const [form, setForm] = useState({
        versionId: '',
        name: '',
        slug: '',
        classNumber: '',
        description: '',
        isActive: true,
    })

    useEffect(() => {
        if (!open) return

        async function loadVersions() {
            const res = await fetch('/api/admin/curriculum/versions')

            if (!res.ok) return

            const data = await res.json()

            setVersions(data)

            if (data.length) {
                setForm((prev) => ({
                    ...prev,
                    versionId: data[0].id,
                }))
            }
        }

        loadVersions()
    }, [open])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        setLoading(true)

        const res = await fetch('/api/admin/curriculum/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        })

        setLoading(false)

        if (!res.ok) {
            const error = await res.json()
            alert(error.error)
            return
        }

        onSuccess()

        setForm({
            versionId: '',
            name: '',
            slug: '',
            classNumber: '',
            description: '',
            isActive: true,
        })

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
                        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr,0.8fr]">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 rounded-3xl bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                                    <span className="text-lg">➕</span>
                                    <span>Add Curriculum Class</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white">New class details</h2>
                                    <p className="mt-2 text-sm text-gray-400">
                                        Add a new class to the selected curriculum version. Fill all required fields and save.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                                <p className="font-semibold text-white">Tip</p>
                                <p className="mt-2 text-sm leading-6">
                                    Use a unique slug and class number so the class appears in the correct order within the curriculum.
                                </p>
                            </div>
                        </div>
                        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
                            <div className="grid gap-5">
                                <div>
                                    <label className="text-sm text-gray-400">
                                        Curriculum Version
                                    </label>

                                    <select
                                        className="mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white"
                                        value={form.versionId}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                versionId: e.target.value,
                                            })
                                        }
                                    >
                                        {versions.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">
                                        Class Name
                                    </label>

                                    <input
                                        className="mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white"
                                        placeholder="Class 1"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">
                                        Slug
                                    </label>
                                    <input
                                        className="mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white"
                                        placeholder="class_1"
                                        value={form.slug}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                slug: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">
                                        Class Number
                                    </label>

                                    <input
                                        type="number"
                                        className="mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white"
                                        value={form.classNumber}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                classNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">
                                        Description
                                    </label>

                                    <textarea
                                        rows={4}
                                        className="mt-2 w-full rounded-2xl bg-[#1f2937] border border-white/10 p-3 text-white"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <label className="flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                isActive: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded border-white/10 bg-slate-800 text-blue-500"
                                    />
                                    Active
                                </label>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={loading}
                                        className="rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Class'}
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
