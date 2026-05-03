'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import AnimatedCard from '@/components/ui/AnimatedCard'

type Subject = {
    id: string
    name: string
    name_bn: string
    class_level: string
    category: string
    is_mandatory: boolean
    description: string | null
    order_index: number
}

const categories = [
    { value: 'islamic', label: 'ইসলামিক', icon: '🕌', color: 'bg-green-100 text-green-700' },
    { value: 'academic', label: 'একাডেমিক', icon: '📚', color: 'bg-blue-100 text-blue-700' },
    { value: 'training', label: 'ট্রেনিং', icon: '💡', color: 'bg-amber-100 text-amber-700' },
    { value: 'skill', label: 'স্কিল', icon: '⚡', color: 'bg-purple-100 text-purple-700' },
]

const classLevels = [
    'nursery', 'class_1', 'class_2', 'class_3', 'class_4', 'class_5',
    'class_6', 'class_7', 'class_8', 'class_9', 'class_10',
    'class_11', 'class_12', 'university', 'masters', 'all',
]

const classLevelBn: Record<string, string> = {
    nursery: 'নার্সারি', class_1: 'শ্রেণী ১', class_2: 'শ্রেণী ২',
    class_3: 'শ্রেণী ৩', class_4: 'শ্রেণী ৪', class_5: 'শ্রেণী ৫',
    class_6: 'শ্রেণী ৬', class_7: 'শ্রেণী ৭', class_8: 'শ্রেণী ৮',
    class_9: 'শ্রেণী ৯', class_10: 'শ্রেণী ১০', class_11: 'শ্রেণী ১১',
    class_12: 'শ্রেণী ১২', university: 'বিশ্ববিদ্যালয়', masters: 'মাস্টার্স', all: 'সবার জন্য',
}

export default function ContentPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [filterCategory, setFilterCategory] = useState('all')

    const [form, setForm] = useState({
        name: '',
        name_bn: '',
        class_level: 'class_6',
        category: 'academic',
        is_mandatory: false,
        description: '',
        order_index: 0,
    })

    useEffect(() => {
        fetchSubjects()
    }, [])

    async function fetchSubjects() {
        const supabase = createClient()
        const { data } = await supabase
            .from('subjects')
            .select('*')
            .order('order_index')
        setSubjects(data || [])
        setLoading(false)
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const supabase = createClient()
        const { error } = await supabase.from('subjects').insert({
            name: form.name,
            name_bn: form.name_bn,
            class_level: form.class_level,
            category: form.category,
            is_mandatory: form.is_mandatory,
            description: form.description || null,
            order_index: form.order_index,
        })

        if (!error) {
            setSuccess(true)
            setShowForm(false)
            setForm({ name: '', name_bn: '', class_level: 'class_6', category: 'academic', is_mandatory: false, description: '', order_index: 0 })
            fetchSubjects()
            setTimeout(() => setSuccess(false), 3000)
        }
        setSaving(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('এই subject টি delete করবে?')) return
        const supabase = createClient()
        await supabase.from('subjects').delete().eq('id', id)
        fetchSubjects()
    }

    const filteredSubjects = filterCategory === 'all'
        ? subjects
        : subjects.filter(s => s.category === filterCategory)

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin" className="text-gray-400 hover:text-gray-600">←</Link>
                        <div className="text-lg font-bold text-gradient-primary">Content Management</div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(true)}
                        className="gradient-primary text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-green-200"
                    >
                        + Subject যোগ করো
                    </motion.button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

                {/* Success */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
                        >
                            ✅ Subject সফলভাবে যোগ হয়েছে!
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">কন্টেন্ট ব্যবস্থাপনা</h1>
                    <p className="text-gray-500 text-sm">Subjects ও lessons যোগ ও manage করো</p>
                </motion.div>

                {/* Filter */}
                <div className="flex gap-2 flex-wrap mb-6">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCategory === 'all'
                            ? 'gradient-primary text-white shadow-lg shadow-green-200'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        সব ({subjects.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCategory === cat.value
                                ? 'gradient-primary text-white shadow-lg shadow-green-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            {cat.icon} {cat.label} ({subjects.filter(s => s.category === cat.value).length})
                        </button>
                    ))}
                </div>

                {/* Subjects list */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">লোড হচ্ছে...</p>
                    </div>
                ) : filteredSubjects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-gray-400 mb-4">এখনো কোনো subject নেই</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowForm(true)}
                            className="gradient-primary text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-200"
                        >
                            প্রথম Subject যোগ করো
                        </motion.button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSubjects.map((subject, i) => {
                            const cat = categories.find(c => c.value === subject.category)
                            return (
                                <AnimatedCard key={subject.id} delay={i * 0.05} className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat?.color || 'bg-gray-100 text-gray-700'}`}>
                                                {cat?.icon} {cat?.label}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                {classLevelBn[subject.class_level] || subject.class_level}
                                            </span>
                                            {subject.is_mandatory && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    বাধ্যতামূলক
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{subject.name_bn}</h3>
                                    <p className="text-xs text-gray-400 mb-3">{subject.name}</p>
                                    {subject.description && (
                                        <p className="text-xs text-gray-500 leading-relaxed mb-4">{subject.description}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <button className="flex-1 text-xs border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            Lessons যোগ করো
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject.id)}
                                            className="text-xs border border-red-100 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </AnimatedCard>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Add Subject Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6">নতুন Subject যোগ করো</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">নাম (English)</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Mathematics"
                                            required
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">নাম (বাংলা)</label>
                                        <input
                                            type="text"
                                            value={form.name_bn}
                                            onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                                            placeholder="গণিত"
                                            required
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">শ্রেণী</label>
                                        <select
                                            title="শ্রেণী নির্বাচন করো"
                                            value={form.class_level}
                                            onChange={(e) => setForm({ ...form, class_level: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {classLevels.map(level => (
                                                <option key={level} value={level}>{classLevelBn[level] || level}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">ক্যাটাগরি</label>
                                        <select
                                            title="ক্যাটাগরি নির্বাচন করো"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">বিবরণ</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="এই বিষয় সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="mandatory"
                                        checked={form.is_mandatory}
                                        onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })}
                                        className="w-4 h-4 accent-green-600"
                                    />
                                    <label htmlFor="mandatory" className="text-sm text-gray-700">
                                        বাধ্যতামূলক বিষয়
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        বাতিল
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={saving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 gradient-primary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-200 disabled:opacity-50"
                                    >
                                        {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}