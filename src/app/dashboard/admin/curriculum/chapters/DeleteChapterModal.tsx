'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'

type CurriculumChapter = {
    id: string
    title: string
    title_bn: string
}

interface Props {
    open: boolean
    chapter: CurriculumChapter | null
    onClose: () => void
    onSuccess: () => void
}

export default function DeleteChapterModal({ open, chapter, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleDelete() {
        if (!chapter) return
        setError(null)
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/curriculum/chapters/${chapter.id}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Chapter মুছে ফেলা যায়নি।')
                setLoading(false)
                return
            }

            onSuccess()
            onClose()
        } catch {
            setError('Server এ সমস্যা হয়েছে।')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {open && chapter && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 20 }}
                        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl p-8"
                    >
                        {/* Icon */}
                        <div className="grid size-14 place-items-center rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto mb-5">
                            <Trash2 className="size-7 text-red-400" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-black text-white text-center mb-2">
                            Chapter মুছে ফেলবে?
                        </h2>
                        <p className="text-slate-400 text-sm text-center mb-6">
                            <span className="text-white font-semibold">{chapter.title_bn}</span> ({chapter.title}) chapter টি inactive হয়ে যাবে। এই chapter এর lessons affected হবে।
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 px-5 py-3 text-sm font-bold text-white transition disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete করো'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}