'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────

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

type Chapter = {
    id: string
    subject_id: string
    title: string
    title_bn: string
    description: string | null
    order_index: number
    is_active: boolean
}

type Lesson = {
    id: string
    chapter_id: string
    title: string
    title_bn: string
    content: string | null
    lesson_type: string
    duration_minutes: number
    xp_reward: number
    order_index: number
    is_active: boolean
}

type View = 'subjects' | 'chapters' | 'lessons'

// ─── Constants ───────────────────────────────────────────────────────────────

const categories = [
    { value: 'islamic', label: 'ইসলামিক', icon: '🕌', color: 'from-emerald-500 to-teal-600' },
    { value: 'academic', label: 'একাডেমিক', icon: '📚', color: 'from-blue-500 to-cyan-600' },
    { value: 'training', label: 'ট্রেনিং', icon: '💡', color: 'from-amber-500 to-orange-600' },
    { value: 'skill', label: 'স্কিল', icon: '⚡', color: 'from-purple-500 to-violet-600' },
]

const classLevels = [
    'nursery', 'kg', 'class_1', 'class_2', 'class_3', 'class_4', 'class_5',
    'class_6', 'class_7', 'class_8', 'class_9', 'class_10',
    'class_11', 'class_12', 'university', 'masters', 'all',
]

const classLevelBn: Record<string, string> = {
    nursery: 'নার্সারি', kg: 'কেজি',
    class_1: 'শ্রেণী ১', class_2: 'শ্রেণী ২', class_3: 'শ্রেণী ৩',
    class_4: 'শ্রেণী ৪', class_5: 'শ্রেণী ৫', class_6: 'শ্রেণী ৬',
    class_7: 'শ্রেণী ৭', class_8: 'শ্রেণী ৮', class_9: 'শ্রেণী ৯',
    class_10: 'শ্রেণী ১০', class_11: 'শ্রেণী ১১', class_12: 'শ্রেণী ১২',
    university: 'বিশ্ববিদ্যালয়', masters: 'মাস্টার্স', all: 'সবার জন্য',
}

const lessonTypes = [
    { value: 'text', label: 'পাঠ্য', icon: '📝' },
    { value: 'video', label: 'ভিডিও', icon: '🎥' },
    { value: 'quiz', label: 'কুইজ', icon: '❓' },
    { value: 'interactive', label: 'ইন্টারেক্টিভ', icon: '🎮' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentPage() {
    const [view, setView] = useState<View>('subjects')
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
    const [loading, setLoading] = useState(true)
    const [filterCategory, setFilterCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const [showSyllabusUpload, setShowSyllabusUpload] = useState(false)
    const [syllabusImage, setSyllabusImage] = useState<string | null>(null)
    const [extracting, setExtracting] = useState(false)
    const [extractedData, setExtractedData] = useState<{
        chapters: {
            title: string
            title_bn: string
            lessons: { title: string; title_bn: string }[]
        }[]
    } | null>(null)
    const [savingAll, setSavingAll] = useState(false)

    // Modal states
    const [showSubjectForm, setShowSubjectForm] = useState(false)
    const [showChapterForm, setShowChapterForm] = useState(false)
    const [showLessonForm, setShowLessonForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

    // Forms
    const [subjectForm, setSubjectForm] = useState({
        name: '', name_bn: '', class_level: 'class_6',
        category: 'academic', is_mandatory: false,
        description: '', order_index: 0,
    })
    const [chapterForm, setChapterForm] = useState({
        title: '', title_bn: '', description: '', order_index: 0,
    })
    const [lessonForm, setLessonForm] = useState({
        title: '', title_bn: '', content: '',
        lesson_type: 'text', duration_minutes: 15,
        xp_reward: 10, order_index: 0,
    })
    const [generating, setGenerating] = useState(false)

    useEffect(() => { fetchSubjects() }, [])

    function showToast(msg: string, type: 'success' | 'error' = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    // ── Fetch ──────────────────────────────────────────────────────────────────

    async function fetchSubjects() {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase.from('subjects').select('*').order('order_index')
        setSubjects(data || [])
        setLoading(false)
    }

    async function fetchChapters(subject: Subject) {
        setLoading(true)
        setSelectedSubject(subject)
        setView('chapters')
        const supabase = createClient()
        const { data } = await supabase
            .from('chapters')
            .select('*')
            .eq('subject_id', subject.id)
            .order('order_index')
        setChapters(data || [])
        setLoading(false)
    }

    async function fetchLessons(chapter: Chapter) {
        setLoading(true)
        setSelectedChapter(chapter)
        setView('lessons')
        const supabase = createClient()
        const { data } = await supabase
            .from('class_lessons')
            .select('*')
            .eq('chapter_id', chapter.id)
            .order('order_index')
        setLessons(data || [])
        setLoading(false)
    }

    // ── Save ───────────────────────────────────────────────────────────────────

    async function saveSubject(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase.from('subjects').insert({
            name: subjectForm.name,
            name_bn: subjectForm.name_bn,
            class_level: subjectForm.class_level,
            category: subjectForm.category,
            is_mandatory: subjectForm.is_mandatory,
            description: subjectForm.description || null,
            order_index: subjectForm.order_index,
        })
        setSaving(false)
        if (error) { showToast('সমস্যা হয়েছে: ' + error.message, 'error'); return }
        showToast('Subject সফলভাবে যোগ হয়েছে!')
        setShowSubjectForm(false)
        setSubjectForm({ name: '', name_bn: '', class_level: 'class_6', category: 'academic', is_mandatory: false, description: '', order_index: 0 })
        fetchSubjects()
    }

    async function saveChapter(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedSubject) return
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase.from('chapters').insert({
            subject_id: selectedSubject.id,
            title: chapterForm.title,
            title_bn: chapterForm.title_bn,
            description: chapterForm.description || null,
            order_index: chapterForm.order_index,
            is_active: true,
        })
        setSaving(false)
        if (error) { showToast('সমস্যা হয়েছে: ' + error.message, 'error'); return }
        showToast('Chapter সফলভাবে যোগ হয়েছে!')
        setShowChapterForm(false)
        setChapterForm({ title: '', title_bn: '', description: '', order_index: 0 })
        fetchChapters(selectedSubject)
    }
    async function generateLessonContent() {
        if (!lessonForm.title || !selectedChapter || !selectedSubject) {
            showToast('আগে Lesson এর নাম লেখো!', 'error')
            return
        }
        setGenerating(true)
        try {
            const res = await fetch('/api/admin/generate-lesson-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectName: selectedSubject.name_bn,
                    chapterTitle: selectedChapter.title_bn,
                    lessonTitle: lessonForm.title_bn || lessonForm.title,
                    classLevel: selectedSubject.class_level,
                }),
            })
            const data = await res.json()
            if (data.content) {
                setLessonForm(prev => ({ ...prev, content: data.content }))
                showToast('AI content তৈরি হয়েছে! ✨')
            } else {
                showToast('Content তৈরি হয়নি, আবার চেষ্টা করো', 'error')
            }
        } catch {
            showToast('সমস্যা হয়েছে!', 'error')
        } finally {
            setGenerating(false)
        }
    }

    async function saveLesson(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedChapter) return
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase.from('class_lessons').insert({
            chapter_id: selectedChapter.id,
            title: lessonForm.title,
            title_bn: lessonForm.title_bn,
            content: lessonForm.content || null,
            lesson_type: lessonForm.lesson_type,
            duration_minutes: lessonForm.duration_minutes,
            xp_reward: lessonForm.xp_reward,
            order_index: lessonForm.order_index,
            is_active: true,
        })
        setSaving(false)
        if (error) { showToast('সমস্যা হয়েছে: ' + error.message, 'error'); return }
        showToast('Lesson সফলভাবে যোগ হয়েছে!')
        setShowLessonForm(false)
        setLessonForm({ title: '', title_bn: '', content: '', lesson_type: 'text', duration_minutes: 15, xp_reward: 10, order_index: 0 })
        fetchLessons(selectedChapter)
    }

    async function handleSyllabusImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]
            setSyllabusImage(base64)
        }
        reader.readAsDataURL(file)
    }

    async function extractSyllabus() {
        if (!syllabusImage || !selectedSubject) {
            showToast('আগে Subject select করো এবং ছবি upload করো!', 'error')
            return
        }
        setExtracting(true)
        try {
            const res = await fetch('/api/admin/extract-syllabus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: syllabusImage,
                    subjectName: selectedSubject.name_bn,
                    classLevel: selectedSubject.class_level,
                }),
            })
            const data = await res.json()
            if (data.chapters) {
                setExtractedData(data)
                showToast(`${data.chapters.length}টি Chapter পাওয়া গেছে! ✨`)
            } else {
                showToast('সিলেবাস extract করা যায়নি, আবার চেষ্টা করো', 'error')
            }
        } catch {
            showToast('সমস্যা হয়েছে!', 'error')
        } finally {
            setExtracting(false)
        }
    }

    async function saveExtractedSyllabus() {
        if (!extractedData || !selectedSubject) return
        setSavingAll(true)
        const supabase = createClient()
        let successCount = 0

        for (let ci = 0; ci < extractedData.chapters.length; ci++) {
            const chapter = extractedData.chapters[ci]

            // Chapter save করো
            const { data: savedChapter, error: chapterError } = await supabase
                .from('chapters')
                .insert({
                    subject_id: selectedSubject.id,
                    title: chapter.title,
                    title_bn: chapter.title_bn,
                    order_index: ci + 1,
                    is_active: true,
                })
                .select('id')
                .single()

            if (chapterError || !savedChapter) continue

            // Chapter এর Lessons save করো
            for (let li = 0; li < chapter.lessons.length; li++) {
                const lesson = chapter.lessons[li]
                await supabase.from('class_lessons').insert({
                    chapter_id: savedChapter.id,
                    title: lesson.title,
                    title_bn: lesson.title_bn,
                    lesson_type: 'text',
                    duration_minutes: 15,
                    xp_reward: 10,
                    order_index: li + 1,
                    is_active: true,
                })
                successCount++
            }
        }

        setSavingAll(false)
        setShowSyllabusUpload(false)
        setExtractedData(null)
        setSyllabusImage(null)
        showToast(`${extractedData.chapters.length}টি Chapter ও ${successCount}টি Lesson সফলভাবে যোগ হয়েছে! 🎉`)
        fetchChapters(selectedSubject)
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    async function deleteSubject(id: string) {
        if (!confirm('এই Subject এবং এর সব Chapter/Lesson মুছে যাবে। নিশ্চিত?')) return
        const supabase = createClient()
        await supabase.from('subjects').delete().eq('id', id)
        showToast('Subject মুছে গেছে!')
        fetchSubjects()
    }

    async function deleteChapter(id: string) {
        if (!confirm('এই Chapter এবং এর সব Lesson মুছে যাবে। নিশ্চিত?')) return
        const supabase = createClient()
        await supabase.from('chapters').delete().eq('id', id)
        showToast('Chapter মুছে গেছে!')
        if (selectedSubject) fetchChapters(selectedSubject)
    }

    async function deleteLesson(id: string) {
        if (!confirm('এই Lesson মুছে যাবে। নিশ্চিত?')) return
        const supabase = createClient()
        await supabase.from('class_lessons').delete().eq('id', id)
        showToast('Lesson মুছে গেছে!')
        if (selectedChapter) fetchLessons(selectedChapter)
    }

    // ── Filtered data ──────────────────────────────────────────────────────────

    const filteredSubjects = subjects.filter(s => {
        const matchCat = filterCategory === 'all' || s.category === filterCategory
        const matchSearch = !searchQuery ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name_bn.includes(searchQuery)
        return matchCat && matchSearch
    })

    const catInfo = (cat: string) => categories.find(c => c.value === cat)

    // ── Breadcrumb ─────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen bg-[#0a0a1a] text-white">

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-index: 100; px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl ${toast.type === 'success'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}
                    >
                        {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white transition-colors shrink-0">
                            ← Admin
                        </Link>
                        <span className="text-gray-600">/</span>
                        <button
                            onClick={() => { setView('subjects'); setSelectedSubject(null); setSelectedChapter(null) }}
                            className={`transition-colors shrink-0 ${view === 'subjects' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Subjects
                        </button>
                        {selectedSubject && (
                            <>
                                <span className="text-gray-600">/</span>
                                <button
                                    onClick={() => { setView('chapters'); setSelectedChapter(null) }}
                                    className={`transition-colors truncate max-width: 120px; ${view === 'chapters' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {selectedSubject.name_bn}
                                </button>
                            </>
                        )}
                        {selectedChapter && (
                            <>
                                <span className="text-gray-600">/</span>
                                <span className="text-white font-semibold truncate max-width: 120px;">
                                    {selectedChapter.title_bn}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-2 shrink-0">
                        {view === 'chapters' && selectedSubject && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowSyllabusUpload(true)}
                                className="bg-linear-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg"
                            >
                                📸 সিলেবাস Upload
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                if (view === 'subjects') setShowSubjectForm(true)
                                else if (view === 'chapters') setShowChapterForm(true)
                                else setShowLessonForm(true)
                            }}
                            className="bg-linear-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/40"
                        >
                            + {view === 'subjects' ? 'Subject' : view === 'chapters' ? 'Chapter' : 'Lesson'} যোগ করো
                        </motion.button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">

                {/* ── SUBJECTS VIEW ──────────────────────────────────────────────── */}
                {view === 'subjects' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Header */}
                        <div className="mb-6 mt-4">
                            <h1 className="text-2xl font-bold text-white mb-1">Content Management</h1>
                            <p className="text-gray-400 text-sm">Subject → Chapter → Lesson hierarchy manage করো</p>
                        </div>

                        {/* Search + Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Subject খোঁজো..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterCategory('all')}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterCategory === 'all' ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                >
                                    সব ({subjects.length})
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setFilterCategory(cat.value)}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterCategory === cat.value ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {cat.icon} {cat.label} ({subjects.filter(s => s.category === cat.value).length})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {[
                                { label: 'মোট Subject', value: subjects.length, icon: '📚' },
                                { label: 'Academic', value: subjects.filter(s => s.category === 'academic').length, icon: '🎓' },
                                { label: 'Islamic', value: subjects.filter(s => s.category === 'islamic').length, icon: '🕌' },
                                { label: 'বাধ্যতামূলক', value: subjects.filter(s => s.is_mandatory).length, icon: '⭐' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                                >
                                    <div className="text-2xl mb-1">{stat.icon}</div>
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Subject list */}
                        {loading ? <LoadingGrid /> : filteredSubjects.length === 0 ? (
                            <EmptyState
                                icon="📚"
                                title="কোনো Subject নেই"
                                desc="প্রথম Subject যোগ করো"
                                onAdd={() => setShowSubjectForm(true)}
                            />
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSubjects.map((subject, i) => {
                                    const cat = catInfo(subject.category)
                                    return (
                                        <motion.div
                                            key={subject.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white/5 border border-white/10 hover:border-violet-500/40 rounded-2xl p-5 transition-all hover:bg-white/8"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full bg-linear-to-r ${cat?.color} text-white font-medium`}>
                                                        {cat?.icon} {cat?.label}
                                                    </span>
                                                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                                                        {classLevelBn[subject.class_level] || subject.class_level}
                                                    </span>
                                                    {subject.is_mandatory && (
                                                        <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                                                            বাধ্যতামূলক
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteSubject(subject.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                                                    title="Delete"
                                                >
                                                    🗑
                                                </button>
                                            </div>

                                            <h3 className="font-bold text-white text-lg mb-0.5">{subject.name_bn}</h3>
                                            <p className="text-xs text-gray-500 mb-2">{subject.name}</p>
                                            {subject.description && (
                                                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{subject.description}</p>
                                            )}

                                            <button
                                                onClick={() => fetchChapters(subject)}
                                                className="w-full mt-2 py-2.5 rounded-xl bg-linear-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-violet-400 text-sm font-semibold hover:from-violet-600/30 hover:to-purple-600/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                📂 Chapters দেখো ও যোগ করো →
                                            </button>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── CHAPTERS VIEW ──────────────────────────────────────────────── */}
                {view === 'chapters' && selectedSubject && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Subject header */}
                        <div className="mb-6 mt-4 rounded-2xl bg-linear-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 p-5">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${catInfo(selectedSubject.category)?.color} flex items-center justify-center text-2xl`}>
                                    {catInfo(selectedSubject.category)?.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedSubject.name_bn}</h2>
                                    <p className="text-gray-400 text-sm">{selectedSubject.name} · {classLevelBn[selectedSubject.class_level]}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-2xl font-bold text-violet-400">{chapters.length}</div>
                                    <div className="text-xs text-gray-400">Chapter</div>
                                </div>
                            </div>
                        </div>

                        {/* Chapter list */}
                        {loading ? <LoadingGrid /> : chapters.length === 0 ? (
                            <EmptyState
                                icon="📂"
                                title="কোনো Chapter নেই"
                                desc="প্রথম Chapter যোগ করো"
                                onAdd={() => setShowChapterForm(true)}
                            />
                        ) : (
                            <div className="space-y-3">
                                {chapters.map((chapter, i) => (
                                    <motion.div
                                        key={chapter.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex items-center gap-4 bg-white/5 border border-white/10 hover:border-violet-500/30 rounded-2xl p-4 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">{chapter.title_bn}</h3>
                                            <p className="text-xs text-gray-500 truncate">{chapter.title}</p>
                                            {chapter.description && (
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{chapter.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-xs px-2 py-1 rounded-full ${chapter.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {chapter.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                            <button
                                                onClick={() => fetchLessons(chapter)}
                                                className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition-all whitespace-nowrap"
                                            >
                                                📝 Lessons →
                                            </button>
                                            <button
                                                onClick={() => deleteChapter(chapter.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── LESSONS VIEW ──────────────────────────────────────────────── */}
                {view === 'lessons' && selectedChapter && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Chapter header */}
                        <div className="mb-6 mt-4 rounded-2xl bg-linear-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl">
                                    📂
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedChapter.title_bn}</h2>
                                    <p className="text-gray-400 text-sm">{selectedSubject?.name_bn} · {selectedChapter.title}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-2xl font-bold text-blue-400">{lessons.length}</div>
                                    <div className="text-xs text-gray-400">Lesson</div>
                                </div>
                            </div>
                        </div>

                        {/* Lesson list */}
                        {loading ? <LoadingGrid /> : lessons.length === 0 ? (
                            <EmptyState
                                icon="📝"
                                title="কোনো Lesson নেই"
                                desc="প্রথম Lesson যোগ করো"
                                onAdd={() => setShowLessonForm(true)}
                            />
                        ) : (
                            <div className="space-y-3">
                                {lessons.map((lesson, i) => {
                                    const lt = lessonTypes.find(t => t.value === lesson.lesson_type)
                                    return (
                                        <motion.div
                                            key={lesson.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group flex items-center gap-4 bg-white/5 border border-white/10 hover:border-blue-500/30 rounded-2xl p-4 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-lg shrink-0">
                                                {lt?.icon || '📝'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white truncate">{lesson.title_bn}</h3>
                                                <p className="text-xs text-gray-500 truncate">{lesson.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs text-gray-400">⏱ {lesson.duration_minutes} মিনিট</span>
                                                    <span className="text-xs text-amber-400">⭐ {lesson.xp_reward} XP</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                                                    {lt?.label}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${lesson.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {lesson.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                                </span>
                                                <button
                                                    onClick={() => deleteLesson(lesson.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* ── SUBJECT MODAL ────────────────────────────────────────────────── */}
            <Modal show={showSubjectForm} onClose={() => setShowSubjectForm(false)} title="নতুন Subject যোগ করো">
                <form onSubmit={saveSubject} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="নাম (English)">
                            <input type="text" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                placeholder="Mathematics" required className={inputCls} />
                        </FormField>
                        <FormField label="নাম (বাংলা)">
                            <input type="text" value={subjectForm.name_bn} onChange={e => setSubjectForm({ ...subjectForm, name_bn: e.target.value })}
                                placeholder="গণিত" required className={inputCls} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="শ্রেণী">
                            <select title="শ্রেণী" value={subjectForm.class_level} onChange={e => setSubjectForm({ ...subjectForm, class_level: e.target.value })} className={inputCls}>
                                {classLevels.map(l => <option key={l} value={l}>{classLevelBn[l] || l}</option>)}
                            </select>
                        </FormField>
                        <FormField label="ক্যাটাগরি">
                            <select title="ক্যাটাগরি" value={subjectForm.category} onChange={e => setSubjectForm({ ...subjectForm, category: e.target.value })} className={inputCls}>
                                {categories.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Order Index">
                            <input type="number" aria-label='number' value={subjectForm.order_index} onChange={e => setSubjectForm({ ...subjectForm, order_index: +e.target.value })} className={inputCls} min={0} />
                        </FormField>
                        <FormField label=" ">
                            <label className="flex items-center gap-2 height: 42px; cursor-pointer">
                                <input type="checkbox" checked={subjectForm.is_mandatory} onChange={e => setSubjectForm({ ...subjectForm, is_mandatory: e.target.checked })} className="w-4 h-4 accent-violet-600" />
                                <span className="text-sm text-gray-300">বাধ্যতামূলক</span>
                            </label>
                        </FormField>
                    </div>
                    <FormField label="বিবরণ (ঐচ্ছিক)">
                        <textarea value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })}
                            placeholder="সংক্ষিপ্ত বিবরণ..." rows={3} className={inputCls + ' resize-none'} />
                    </FormField>
                    <ModalButtons onCancel={() => setShowSubjectForm(false)} saving={saving} label="Subject সংরক্ষণ" />
                </form>
            </Modal>

            {/* ── CHAPTER MODAL ────────────────────────────────────────────────── */}
            <Modal show={showChapterForm} onClose={() => setShowChapterForm(false)} title={`নতুন Chapter — ${selectedSubject?.name_bn}`}>
                <form onSubmit={saveChapter} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="নাম (English)">
                            <input type="text" value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })}
                                placeholder="Chapter 1: Introduction" required className={inputCls} />
                        </FormField>
                        <FormField label="নাম (বাংলা)">
                            <input type="text" value={chapterForm.title_bn} onChange={e => setChapterForm({ ...chapterForm, title_bn: e.target.value })}
                                placeholder="অধ্যায় ১: ভূমিকা" required className={inputCls} />
                        </FormField>
                    </div>
                    <FormField label="Order Index">
                        <input type="number" aria-label='number' value={chapterForm.order_index} onChange={e => setChapterForm({ ...chapterForm, order_index: +e.target.value })} className={inputCls} min={0} />
                    </FormField>
                    <FormField label="বিবরণ (ঐচ্ছিক)">
                        <textarea value={chapterForm.description} onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
                            placeholder="Chapter সম্পর্কে সংক্ষিপ্ত..." rows={3} className={inputCls + ' resize-none'} />
                    </FormField>
                    <ModalButtons onCancel={() => setShowChapterForm(false)} saving={saving} label="Chapter সংরক্ষণ" />
                </form>
            </Modal>

            {/* ── LESSON MODAL ─────────────────────────────────────────────────── */}
            <Modal show={showLessonForm} onClose={() => setShowLessonForm(false)} title={`নতুন Lesson — ${selectedChapter?.title_bn}`}>
                <form onSubmit={saveLesson} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="নাম (English)">
                            <input type="text" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                placeholder="Lesson 1: Basics" required className={inputCls} />
                        </FormField>
                        <FormField label="নাম (বাংলা)">
                            <input type="text" value={lessonForm.title_bn} onChange={e => setLessonForm({ ...lessonForm, title_bn: e.target.value })}
                                placeholder="পাঠ ১: মৌলিক ধারণা" required className={inputCls} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <FormField label="ধরন">
                            <select title="ধরন" value={lessonForm.lesson_type} onChange={e => setLessonForm({ ...lessonForm, lesson_type: e.target.value })} className={inputCls}>
                                {lessonTypes.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                            </select>
                        </FormField>
                        <FormField label="সময় (মিনিট)">
                            <input type="number" aria-label='number' value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: +e.target.value })} className={inputCls} min={1} max={120} />
                        </FormField>
                        <FormField label="XP পুরস্কার">
                            <input type="number" aria-label='number' value={lessonForm.xp_reward} onChange={e => setLessonForm({ ...lessonForm, xp_reward: +e.target.value })} className={inputCls} min={1} />
                        </FormField>
                    </div>
                    <FormField label="Order Index">
                        <input type="number" aria-label='number' value={lessonForm.order_index} onChange={e => setLessonForm({ ...lessonForm, order_index: +e.target.value })} className={inputCls} min={0} />
                    </FormField>
                    <FormField label="Content">
                        <div className="space-y-2">
                            <motion.button
                                type="button"
                                onClick={generateLessonContent}
                                disabled={generating}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-2.5 rounded-xl bg-linear-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-violet-400 text-sm font-semibold hover:from-violet-600/30 hover:to-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {generating ? (
                                    <>
                                        <span className="animate-spin">⚙️</span>
                                        AI content তৈরি হচ্ছে...
                                    </>
                                ) : (
                                    <>✨ AI দিয়ে NCTB Content তৈরি করো</>
                                )}
                            </motion.button>
                            <textarea
                                value={lessonForm.content}
                                onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                                placeholder="AI generate করবে, অথবা নিজে লেখো..."
                                rows={6}
                                className={inputCls + ' resize-none'}
                            />
                            {lessonForm.content && (
                                <p className="text-xs text-emerald-400">✅ Content ready — প্রয়োজনে edit করো</p>
                            )}
                        </div>
                    </FormField>
                    <ModalButtons onCancel={() => setShowLessonForm(false)} saving={saving} label="Lesson সংরক্ষণ" />
                </form>
            </Modal>

            {/* ── SYLLABUS UPLOAD MODAL ─────────────────────────────────────────── */}
            <Modal show={showSyllabusUpload} onClose={() => { setShowSyllabusUpload(false); setExtractedData(null); setSyllabusImage(null) }} title={`সিলেবাস Upload — ${selectedSubject?.name_bn}`}>
                <div className="space-y-4">
                    {/* Image upload */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                            সিলেবাস বা সূচিপত্রের ছবি তোলো 📸
                        </label>
                        <label className="block w-full cursor-pointer">
                            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${syllabusImage ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/20 hover:border-violet-500/50 hover:bg-violet-500/5'}`}>
                                {syllabusImage ? (
                                    <div>
                                        <p className="text-emerald-400 font-semibold mb-2">✅ ছবি upload হয়েছে!</p>
                                        <Image
                                            src={`data:image/jpeg;base64,${syllabusImage}`}
                                            alt="syllabus preview"
                                            width={400}
                                            height={160}
                                            className="max-h-40 mx-auto rounded-xl object-contain"
                                        />
                                        <p className="text-xs text-gray-400 mt-2">অন্য ছবি দিতে আবার click করো</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-4xl mb-2">📷</p>
                                        <p className="text-gray-300 font-medium">ছবি select করো</p>
                                        <p className="text-xs text-gray-500 mt-1">সিলেবাসের পাতার ছবি তোলো</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleSyllabusImage}
                            />
                        </label>
                    </div>

                    {/* Extract button */}
                    {syllabusImage && !extractedData && (
                        <motion.button
                            type="button"
                            onClick={extractSyllabus}
                            disabled={extracting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {extracting ? (
                                <><span className="animate-spin">⚙️</span> AI সিলেবাস বিশ্লেষণ করছে...</>
                            ) : (
                                <>✨ AI দিয়ে Chapter ও Lesson বের করো</>
                            )}
                        </motion.button>
                    )}

                    {/* Extracted data preview */}
                    {extractedData && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-white">
                                    📂 {extractedData.chapters.length}টি Chapter পাওয়া গেছে
                                </p>
                                <p className="text-xs text-gray-400">
                                    মোট {extractedData.chapters.reduce((s, c) => s + c.lessons.length, 0)}টি Lesson
                                </p>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                {extractedData.chapters.map((chapter, ci) => (
                                    <div key={ci} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                        <p className="text-sm font-semibold text-violet-400 mb-1">
                                            {ci + 1}. {chapter.title_bn}
                                        </p>
                                        <div className="space-y-1">
                                            {chapter.lessons.map((lesson, li) => (
                                                <p key={li} className="text-xs text-gray-400 pl-3">
                                                    → {lesson.title_bn}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setExtractedData(null); setSyllabusImage(null) }}
                                    className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                                >
                                    আবার চেষ্টা করো
                                </button>
                                <motion.button
                                    type="button"
                                    onClick={saveExtractedSyllabus}
                                    disabled={savingAll}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                                >
                                    {savingAll ? '⏳ Save হচ্ছে...' : '✅ সব Save করো'}
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </main>
    )
}

// ─── Helper Components ────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors'

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
            {children}
        </div>
    )
}

function Modal({ show, onClose, title, children }: {
    show: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={e => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#0f0f23] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function ModalButtons({ onCancel, saving, label }: { onCancel: () => void; saving: boolean; label: string }) {
    return (
        <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel}
                className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
                বাতিল
            </button>
            <motion.button type="submit" disabled={saving}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex-1 bg-linear-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-50">
                {saving ? '⏳ সংরক্ষণ হচ্ছে...' : '✅ ' + label}
            </motion.button>
        </div>
    )
}

function LoadingGrid() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 h-36 animate-pulse" />
            ))}
        </div>
    )
}

function EmptyState({ icon, title, desc, onAdd }: { icon: string; title: string; desc: string; onAdd: () => void }) {
    return (
        <div className="text-center py-20">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-gray-300 font-semibold mb-1">{title}</h3>
            <p className="text-gray-500 text-sm mb-6">{desc}</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onAdd}
                className="bg-linear-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg">
                + {desc}
            </motion.button>
        </div>
    )
}