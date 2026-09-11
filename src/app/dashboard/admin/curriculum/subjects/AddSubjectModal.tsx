'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CurriculumClass = { id: string; name: string; class_number: number }

interface Props {
  open: boolean
  classes: CurriculumClass[]
  onClose: () => void
  onSuccess: () => void
}

const ICONS = ['📚', '📖', '✏️', '🔢', '🔬', '🌍', '🎨', '🕌', '💻', '🏃', '🎵', '🌿', '📐', '🧪']
const COLORS = [
  { label: 'Violet', value: 'from-violet-500 to-fuchsia-500' },
  { label: 'Sky', value: 'from-sky-400 to-blue-600' },
  { label: 'Emerald', value: 'from-emerald-400 to-teal-600' },
  { label: 'Amber', value: 'from-amber-400 to-orange-500' },
  { label: 'Rose', value: 'from-rose-400 to-pink-600' },
  { label: 'Indigo', value: 'from-indigo-400 to-violet-600' },
  { label: 'Cyan', value: 'from-cyan-400 to-sky-600' },
  { label: 'Red', value: 'from-red-400 to-rose-500' },
]

const emptyForm = {
  classId: '',
  name: '',
  nameBn: '',
  slug: '',
  description: '',
  icon: '📚',
  color: 'from-violet-500 to-fuchsia-500',
  isMandatory: true,
  orderIndex: 0,
}

export default function AddSubjectModal({ open, classes, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) return
    setError(null)
    setLoading(false)
  }, [open])

  function handleNameChange(value: string) {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setForm((prev) => ({ ...prev, name: value, slug }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.classId) {
      setError('ক্লাস বেছে নিন')
      return
    }
    if (!form.name.trim()) {
      setError('English name দিন')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/curriculum/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Subject তৈরি করা যায়নি')
        return
      }
      setForm(emptyForm)
      onSuccess()
      onClose()
    } catch {
      setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  const sortedClasses = [...classes].sort(
    (a, b) => (a.class_number ?? 0) - (b.class_number ?? 0),
  )

  const selectedClass = sortedClasses.find((c) => c.id === form.classId)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) onClose()
          }}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0c0c1a] shadow-2xl shadow-violet-950/40 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0 overflow-hidden border-b border-white/8 bg-gradient-to-br from-violet-600/25 via-[#12122a] to-fuchsia-600/15 px-5 py-4 sm:px-6">
              <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-500/20 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-200">
                    <span className="text-sm">➕</span> Curriculum
                  </span>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                    নতুন বিষয় যোগ করুন
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    NCTB / সিলেবাস অনুযায়ী class-এ subject যোগ করুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div
                  className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${form.color} text-xl shadow-lg`}
                >
                  {form.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {form.nameBn || form.name || 'বিষয়ের নাম'}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {selectedClass?.name || 'ক্লাস বাছাই করুন'}
                    {form.slug ? ` · ${form.slug}` : ''}
                  </p>
                </div>
                {form.isMandatory && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    বাধ্যতামূলক
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  ক্লাস <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#141428] px-3 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">— ক্লাস বেছে নিন —</option>
                  {sortedClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {typeof c.class_number === 'number' ? ` (Class ${c.class_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    নাম (English) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#141428] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    নাম (বাংলা)
                  </label>
                  <input
                    value={form.nameBn}
                    onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                    placeholder="যেমন: গণিত"
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#141428] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  Slug <span className="font-normal text-slate-600">(auto · editable)</span>
                </label>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  placeholder="mathematics"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#141428] px-3 font-mono text-sm text-violet-200 placeholder:text-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">আইকন</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`grid size-10 place-items-center rounded-xl text-lg transition ${
                        form.icon === icon
                          ? 'scale-105 border border-violet-400/50 bg-violet-500/25 ring-2 ring-violet-500/30'
                          : 'border border-white/8 bg-white/[0.04] hover:bg-white/[0.08]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">রঙ</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      title={color.label}
                      onClick={() => setForm({ ...form, color: color.value })}
                      className={`h-8 w-12 rounded-lg bg-gradient-to-r ${color.value} transition ${
                        form.color === color.value
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0c0c1a]'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  বিবরণ <span className="font-normal text-slate-600">(ঐচ্ছিক)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="বিষয় সম্পর্কে সংক্ষেপে…"
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#141428] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">ক্রম (Order)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.orderIndex}
                    onChange={(e) =>
                      setForm({ ...form, orderIndex: parseInt(e.target.value, 10) || 0 })
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#141428] px-3 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-[#141428] px-3 transition hover:border-violet-500/30">
                    <input
                      type="checkbox"
                      checked={form.isMandatory}
                      onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                      className="size-4 rounded border-white/20 bg-slate-800 text-violet-500 focus:ring-violet-500/40"
                    />
                    <span className="text-xs font-semibold text-slate-300">বাধ্যতামূলক</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                  {error}
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-white/8 bg-[#0a0a16] px-5 py-3.5 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 flex-[1.4] rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'তৈরি হচ্ছে…' : 'বিষয় তৈরি করুন'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
