'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type MemorizationItem = {
    id: string
    surah_number: number
    ayah_from: number
    ayah_to: number
    memorization_level: number
    last_revised_at: string | null
    next_revision_at: string | null
    ai_score: number | null
    ai_feedback: string | null
}

type AIPlan = {
    priority_order: string[]
    estimated_time_minutes: number
    ai_tip: string
    weak_surahs: string[]
    encouragement: string
}

type APIResponse = {
    due_revisions: {
        surah_number: number
        ayah_from: number
        ayah_to: number
        memorization_level: number
        next_revision_at: string
        overdue: boolean
        days_overdue: number
    }[]
    all_memorization: MemorizationItem[]
    ai_plan: AIPlan | null
    total_memorized: number
    due_today: number
}

const SURAH_NAMES: Record<number, string> = {
    1: 'আল-ফাতিহা', 2: 'আল-বাকারা', 3: 'আল-ইমরান',
    4: 'আন-নিসা', 5: 'আল-মায়িদা', 112: 'আল-ইখলাস',
    113: 'আল-ফালাক', 114: 'আন-নাস', 108: 'আল-কাওসার',
    110: 'আন-নাসর', 111: 'আল-মাসাদ', 109: 'আল-কাফিরুন',
    107: 'আল-মাউন', 106: 'কুরাইশ', 105: 'আল-ফিল',
}

const LEVEL_INFO = [
    { label: 'শুরু হয়নি', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' },
    { label: 'নতুন মুখস্থ', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    { label: 'Revision দরকার', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
    { label: 'ভালো', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    { label: 'শক্তিশালী', color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/30' },
    { label: 'পারফেক্ট ✨', color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
]

// New surah add করার form
type NewSurahForm = {
    surah_number: string
    ayah_from: string
    ayah_to: string
}

export default function MemorizationPage() {
    const [data, setData] = useState<APIResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'today' | 'all' | 'add'>('today')
    const [form, setForm] = useState<NewSurahForm>({ surah_number: '', ayah_from: '', ayah_to: '' })
    const [submitting, setSubmitting] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')
    const [revisingId, setRevisingId] = useState<string | null>(null)

    const refetch = async () => {
        try {
            const res = await fetch('/api/islamic/memorization')
            const json = await res.json()
            setData(json)
        } catch {
            console.error('Memorization fetch error')
        }
    }

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await fetch('/api/islamic/memorization')
                const json = await res.json()
                if (!cancelled) setData(json)
            } catch {
                console.error('Memorization fetch error')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])
    const handleAddNew = async () => {
        if (!form.surah_number || !form.ayah_from || !form.ayah_to) {
            alert('সব field পূরণ করুন')
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch('/api/islamic/memorization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'start',
                    surah_number: parseInt(form.surah_number),
                    ayah_from: parseInt(form.ayah_from),
                    ayah_to: parseInt(form.ayah_to),
                }),
            })
            const json = await res.json()
            if (res.ok) {
                setSuccessMsg(json.message)
                setForm({ surah_number: '', ayah_from: '', ayah_to: '' })
                await refetch()
                setActiveTab('all')
                setTimeout(() => setSuccessMsg(''), 3000)
            } else {
                alert(json.error || 'সমস্যা হয়েছে')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleRevised = async (item: MemorizationItem) => {
        setRevisingId(item.id)
        try {
            const res = await fetch('/api/islamic/memorization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'revised',
                    surah_number: item.surah_number,
                    ayah_from: item.ayah_from,
                    ayah_to: item.ayah_to,
                }),
            })
            const json = await res.json()
            if (res.ok) {
                setSuccessMsg(json.message)
                await refetch()
                setTimeout(() => setSuccessMsg(''), 3000)
            }
        } finally {
            setRevisingId(null)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] to-[#0a0a1a] flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-4xl mb-3"
                >📚</motion.div>
                <p className="text-emerald-400">হিফজ data লোড হচ্ছে...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0d0a2e] via-[#0a1628] to-[#0a0a1a] text-white">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#0d0a2e]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard/student/islamic"
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                        ← Islamic এ ফিরে যাও
                    </Link>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                        📚 {data?.total_memorized || 0} টি মুখস্থ
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl mb-2"
                    >📚</motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">হিফজ Tracker</h1>
                    <p className="text-2xl text-emerald-300 mb-1">حفظ القرآن</p>
                    <p className="text-gray-400 text-sm">Spaced Repetition + AI Plan</p>
                </motion.div>

                {/* Success message */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-3 text-center text-emerald-400 text-sm font-semibold"
                        >
                            ✅ {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: 'আজকের Revision', value: data?.due_today || 0, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                        { label: 'মোট মুখস্থ', value: data?.total_memorized || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'পারফেক্ট', value: data?.all_memorization?.filter(m => m.memorization_level === 5).length || 0, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-2xl ${stat.bg} border ${stat.border} p-3 text-center`}
                        >
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* AI Plan */}
                {data?.ai_plan && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 rounded-2xl bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-5"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🤖</span>
                            <p className="text-violet-400 font-bold text-sm">AI Revision Plan</p>
                            <span className="ml-auto text-xs text-gray-500">
                                ~{data.ai_plan.estimated_time_minutes} মিনিট
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                            {data.ai_plan.ai_tip}
                        </p>
                        {data.ai_plan.weak_surahs.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs text-amber-400">⚠️ মনোযোগ দরকার:</span>
                                {data.ai_plan.weak_surahs.map((s, i) => (
                                    <span key={i} className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="text-emerald-300 text-sm italic">
                            💚 {data.ai_plan.encouragement}
                        </p>
                    </motion.div>
                )}

                {/* Tabs */}
                <div className="flex gap-1.5 mb-6 bg-white/5 rounded-xl p-1">
                    {[
                        { key: 'today', label: `📅 আজকের (${data?.due_today || 0})` },
                        { key: 'all', label: `📚 সব (${data?.total_memorized || 0})` },
                        { key: 'add', label: '➕ নতুন যোগ' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                                ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Today's revision */}
                {activeTab === 'today' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {!data?.due_revisions || data.due_revisions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-3">🎉</p>
                                <p className="text-emerald-400 font-bold text-lg">
                                    আজকের সব revision শেষ!
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    মাশাআল্লাহ! কাল আবার দেখো।
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.due_revisions.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`rounded-2xl border p-4 ${item.overdue
                                            ? 'bg-rose-500/10 border-rose-500/30'
                                            : 'bg-amber-500/10 border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <p className="font-bold text-white text-sm">
                                                    সূরা {SURAH_NAMES[item.surah_number] || item.surah_number}
                                                </p>
                                                <p className="text-gray-400 text-xs">
                                                    আয়াত {item.ayah_from} — {item.ayah_to}
                                                </p>
                                                {item.overdue && (
                                                    <p className="text-rose-400 text-xs mt-1">
                                                        ⚠️ {item.days_overdue} দিন overdue
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${LEVEL_INFO[item.memorization_level]?.bg} ${LEVEL_INFO[item.memorization_level]?.color}`}>
                                                    Level {item.memorization_level}/5
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        const found = data.all_memorization.find(
                                                            m => m.surah_number === item.surah_number &&
                                                                m.ayah_from === item.ayah_from &&
                                                                m.ayah_to === item.ayah_to
                                                        )
                                                        if (found) handleRevised(found)
                                                    }}
                                                    disabled={revisingId !== null}
                                                    className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                                                >
                                                    {revisingId ? '⏳' : '✅ Revised'}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Tab: All memorization */}
                {activeTab === 'all' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {!data?.all_memorization || data.all_memorization.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-3">📖</p>
                                <p className="text-gray-400">এখনো কোনো সূরা যোগ করা হয়নি।</p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="mt-3 text-emerald-400 text-sm hover:text-emerald-300"
                                >
                                    ➕ প্রথম সূরা যোগ করো
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.all_memorization.map((item, i) => {
                                    const level = LEVEL_INFO[item.memorization_level]
                                    const nextRevision = item.next_revision_at
                                        ? new Date(item.next_revision_at).toLocaleDateString('bn-BD')
                                        : 'N/A'

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className={`rounded-2xl border ${level.bg} ${level.border} p-4`}
                                        >
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-white text-sm">
                                                            সূরা {SURAH_NAMES[item.surah_number] || item.surah_number}
                                                        </p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${level.bg} ${level.color} border ${level.border}`}>
                                                            {level.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-xs">
                                                        আয়াত {item.ayah_from}—{item.ayah_to}
                                                    </p>
                                                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                        {item.ai_score && (
                                                            <span>🤖 AI score: {item.ai_score}%</span>
                                                        )}
                                                        <span>📅 পরের revision: {nextRevision}</span>
                                                    </div>

                                                    {/* Level progress bar */}
                                                    <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full bg-linear-to-r ${item.memorization_level >= 4
                                                                ? 'from-emerald-400 to-teal-500'
                                                                : item.memorization_level >= 2
                                                                    ? 'from-amber-400 to-orange-500'
                                                                    : 'from-blue-400 to-indigo-500'
                                                                } ${item.memorization_level === 0 ? 'w-0' :
                                                                    item.memorization_level === 1 ? 'w-1/5' :
                                                                        item.memorization_level === 2 ? 'w-2/5' :
                                                                            item.memorization_level === 3 ? 'w-3/5' :
                                                                                item.memorization_level === 4 ? 'w-4/5' : 'w-full'
                                                                }`}
                                                        />
                                                    </div>
                                                </div>

                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleRevised(item)}
                                                    disabled={revisingId === item.id}
                                                    className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 disabled:opacity-50"
                                                >
                                                    {revisingId === item.id ? '⏳' : '🔁 Revise'}
                                                </motion.button>
                                            </div>

                                            {/* AI feedback */}
                                            {item.ai_feedback && (
                                                <p className="mt-2 text-xs text-gray-500 italic border-t border-white/5 pt-2">
                                                    🤖 {item.ai_feedback}
                                                </p>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Tab: Add new */}
                {activeTab === 'add' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6">
                            <h3 className="text-white font-bold text-lg mb-1">নতুন সূরা/আয়াত যোগ করো</h3>
                            <p className="text-gray-400 text-sm mb-5">
                                Ebbinghaus algorithm অনুযায়ী পরের revision schedule হবে
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-semibold mb-2 block">
                                        সূরা নম্বর (১-১১৪)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="114"
                                        value={form.surah_number}
                                        onChange={e => setForm(prev => ({ ...prev, surah_number: e.target.value }))}
                                        placeholder="যেমন: 112 (সূরা ইখলাস)"
                                        className="w-full rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 font-semibold mb-2 block">
                                            আয়াত থেকে
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.ayah_from}
                                            onChange={e => setForm(prev => ({ ...prev, ayah_from: e.target.value }))}
                                            placeholder="যেমন: 1"
                                            className="w-full rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-semibold mb-2 block">
                                            আয়াত পর্যন্ত
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.ayah_to}
                                            onChange={e => setForm(prev => ({ ...prev, ayah_to: e.target.value }))}
                                            placeholder="যেমন: 4"
                                            className="w-full rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Spaced repetition info */}
                                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                                    <p className="text-xs text-amber-400 font-semibold mb-2">
                                        📊 Ebbinghaus Spaced Repetition Schedule
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['১ দিন', '৩ দিন', '৭ দিন', '১৪ দিন', '৩০ দিন', '৯০ দিন'].map((d, i) => (
                                            <span key={i} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                                                Level {i + 1}: {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddNew}
                                    disabled={submitting}
                                    className="w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                                >
                                    {submitting ? '⏳ যোগ হচ্ছে...' : '➕ হিফজ শুরু করো'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}