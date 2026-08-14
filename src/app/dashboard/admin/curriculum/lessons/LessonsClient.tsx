'use client'

import { useMemo, useState } from 'react'
import { BookOpen, CirclePlus, Eye, Filter, FolderOpen, Pencil, Search, Trash2, Zap } from 'lucide-react'
import AddLessonModal from './AddLessonModal'
import EditLessonModal from './EditLessonModal'
import DeleteLessonModal from './DeleteLessonModal'

type CurriculumClass = { id: string; name: string; class_number: number }
type CurriculumSubject = { id: string; name: string; name_bn: string; class_id: string }
type CurriculumChapter = { id: string; title: string; title_bn: string; subject_id: string; class_id: string }
type CurriculumLesson = {
    id: string
    chapter_id: string
    subject_id: string
    class_id: string
    title: string
    title_bn: string
    slug: string
    description?: string | null
    lesson_number: number
    duration_minutes: number
    xp_reward: number
    coin_reward: number
    is_free_preview: boolean
    is_published: boolean
    is_active: boolean
    order_index: number
    curriculum_chapters?: { id: string; title: string; title_bn: string } | null
    curriculum_subjects?: { id: string; name: string; name_bn: string } | null
    curriculum_classes?: { id: string; name: string; class_number: number } | null
}

type Props = {
    lessons: CurriculumLesson[]
    chapters: CurriculumChapter[]
    subjects: CurriculumSubject[]
    classes: CurriculumClass[]
}

function ActionButton({ label, children, danger, onClick }: { label: string; children: React.ReactNode; danger?: boolean; onClick?: () => void }) {
    return (
        <button type="button" aria-label={label} title={label} onClick={onClick}
            className={`grid size-8 place-items-center rounded-full border transition ${danger
                ? 'border-rose-500/35 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-slate-600 bg-slate-800/70 text-slate-200 hover:border-violet-400 hover:text-white'
                }`}>
            {children}
        </button>
    )
}

function Status({ active, published }: { active: boolean; published: boolean }) {
    if (!active) return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold bg-slate-500/15 text-slate-400">
            Inactive
        </span>
    )
    if (published) return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-400/10 text-emerald-300">
            Published
        </span>
    )
    return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold bg-amber-400/10 text-amber-300">
            Draft
        </span>
    )
}

function StatCard({ label, value, text, color, icon }: {
    label: string; value: number; text: string
    color: 'blue' | 'green' | 'purple' | 'amber'; icon: React.ReactNode
}) {
    const theme = {
        blue: 'border-sky-400/50 text-sky-300',
        green: 'border-emerald-400/50 text-emerald-300',
        purple: 'border-violet-400/50 text-violet-300',
        amber: 'border-amber-400/50 text-amber-300',
    }[color]
    return (
        <article className={`rounded-xl border bg-linear-to-br from-[#0d1425] to-[#070b16] p-5 shadow-2xl ${theme}`}>
            <div className={`grid size-12 place-items-center rounded-xl border bg-white/4 ${theme}`}>{icon}</div>
            <p className="mt-5 text-xs text-slate-300">{label}</p>
            <p className="mt-1 text-4xl font-extrabold text-white">{value}</p>
            <p className="mt-4 text-xs text-slate-400">{text}</p>
            <div className="mt-3 h-px bg-current opacity-30" />
        </article>
    )
}

export default function LessonsClient({ lessons, chapters, subjects, classes }: Props) {
    const [openModal, setOpenModal] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null)
    const [search, setSearch] = useState('')
    const [filterClass, setFilterClass] = useState('')
    const [filterSubject, setFilterSubject] = useState('')
    const [filterChapter, setFilterChapter] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const filteredSubjects = useMemo(() =>
        !filterClass ? subjects : subjects.filter(s => s.class_id === filterClass),
        [subjects, filterClass]
    )

    const filteredChapters = useMemo(() => {
        let result = chapters
        if (filterClass) result = result.filter(c => c.class_id === filterClass)
        if (filterSubject) result = result.filter(c => c.subject_id === filterSubject)
        return result
    }, [chapters, filterClass, filterSubject])

    const filteredLessons = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return lessons.filter((item) => {
            const matchSearch = !keyword || [item.title, item.title_bn, item.slug]
                .some((v) => v.toLowerCase().includes(keyword))
            const matchClass = !filterClass || item.class_id === filterClass
            const matchSubject = !filterSubject || item.subject_id === filterSubject
            const matchChapter = !filterChapter || item.chapter_id === filterChapter
            const matchStatus = !filterStatus ||
                (filterStatus === 'published' && item.is_published) ||
                (filterStatus === 'draft' && !item.is_published && item.is_active) ||
                (filterStatus === 'inactive' && !item.is_active)
            return matchSearch && matchClass && matchSubject && matchChapter && matchStatus
        })
    }, [lessons, search, filterClass, filterSubject, filterChapter, filterStatus])

    const publishedCount = lessons.filter(l => l.is_published).length
    const draftCount = lessons.filter(l => !l.is_published && l.is_active).length

    const openEdit = (item: CurriculumLesson) => { setSelectedLesson(item); setEditOpen(true) }
    const openDelete = (item: CurriculumLesson) => { setSelectedLesson(item); setDeleteOpen(true) }

    return (
        <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">

                {/* Header */}
                <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-xl border border-amber-400/55 bg-amber-400/10 shadow-[0_0_26px_rgba(251,191,36,.18)]">
                            <BookOpen className="size-6 text-amber-300" />
                        </div>
                        <div>
                            <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                                Lesson <span className="bg-linear-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Management</span>
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-400">Manage curriculum lessons for each chapter.</p>
                        </div>
                    </div>
                    <button onClick={() => setOpenModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold shadow-lg shadow-amber-900/30 transition hover:brightness-110">
                        <CirclePlus className="size-4" /> Add Lesson
                    </button>
                </header>

                {/* Stats */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Lessons" value={lessons.length} text="All curriculum lessons" color="blue" icon={<BookOpen className="size-6" />} />
                    <StatCard label="Published" value={publishedCount} text="Live for students" color="green" icon={<Eye className="size-6" />} />
                    <StatCard label="Draft" value={draftCount} text="Not yet published" color="amber" icon={<Filter className="size-6" />} />
                    <StatCard label="Results" value={filteredLessons.length} text={search ? `Matching "${search}"` : 'All shown'} color="purple" icon={<Zap className="size-6" />} />
                </section>

                {/* Table */}
                <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15] shadow-[0_15px_50px_rgba(0,0,0,.25)]">
                    <div className="flex flex-col gap-4 border-b border-slate-700/70 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold">
                                    <FolderOpen className="size-5 text-amber-300" /> Curriculum Lessons
                                </h2>
                                <p className="mt-1 text-xs text-slate-400">Browse, edit and manage all lessons.</p>
                            </div>
                        </div>
                        {/* Filters */}
                        <div className="flex gap-3 flex-wrap">
                            <select value={filterClass}
                                onChange={(e) => { setFilterClass(e.target.value); setFilterSubject(''); setFilterChapter('') }}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-amber-400">
                                <option value="">সব Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={filterSubject}
                                onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('') }}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-amber-400">
                                <option value="">সব Subject</option>
                                {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name_bn}</option>)}
                            </select>
                            <select value={filterChapter}
                                onChange={(e) => setFilterChapter(e.target.value)}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-amber-400">
                                <option value="">সব Chapter</option>
                                {filteredChapters.map((c) => <option key={c.id} value={c.id}>{c.title_bn}</option>)}
                            </select>
                            <select value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-amber-400">
                                <option value="">সব Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <label className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search lesson..."
                                    className="h-10 w-48 rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-amber-400" />
                            </label>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="hidden grid-cols-[60px_minmax(180px,1fr)_130px_130px_80px_100px_120px] gap-4 border-b border-slate-700/80 bg-slate-800/60 px-5 py-3 text-xs font-semibold text-slate-300 md:grid">
                        <span>No.</span>
                        <span>Title</span>
                        <span>Chapter</span>
                        <span>Subject</span>
                        <span>XP</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-800/90">
                        {filteredLessons.length === 0 ? (
                            <div className="py-16 text-center">
                                <FolderOpen className="mx-auto size-10 text-slate-600" />
                                <p className="mt-3 font-bold">No lessons found</p>
                                <p className="mt-1 text-sm text-slate-500">Try another filter or search keyword.</p>
                            </div>
                        ) : filteredLessons.map((item) => (
                            <article key={item.id}
                                className="grid items-center gap-4 px-5 py-3 transition hover:bg-white/[.025] md:grid-cols-[60px_minmax(180px,1fr)_130px_130px_80px_100px_120px]">
                                {/* Lesson Number */}
                                <div className="grid size-11 place-items-center rounded-xl border border-amber-400/45 bg-amber-400/10 text-lg font-black text-amber-300">
                                    {item.lesson_number}
                                </div>
                                {/* Title */}
                                <div>
                                    <p className="font-bold text-white">{item.title_bn}</p>
                                    <p className="text-xs text-slate-400">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.is_free_preview && (
                                            <span className="text-[10px] bg-blue-400/10 text-blue-300 px-2 py-0.5 rounded-full">Free Preview</span>
                                        )}
                                        <span className="text-[10px] text-slate-500">{item.duration_minutes} min</span>
                                    </div>
                                </div>
                                {/* Chapter */}
                                <p className="text-sm text-slate-400 truncate">
                                    {item.curriculum_chapters?.title_bn ?? '—'}
                                </p>
                                {/* Subject */}
                                <p className="text-sm text-slate-400 truncate">
                                    {item.curriculum_subjects?.name_bn ?? '—'}
                                </p>
                                {/* XP */}
                                <div className="flex items-center gap-1">
                                    <Zap className="size-3 text-amber-400" />
                                    <span className="text-sm text-amber-300 font-bold">{item.xp_reward}</span>
                                </div>
                                {/* Status */}
                                <Status active={item.is_active} published={item.is_published} />
                                {/* Actions */}
                                <div className="flex gap-2">
                                    <ActionButton label="Edit lesson" onClick={() => openEdit(item)}>
                                        <Pencil className="size-3.5" />
                                    </ActionButton>
                                    <ActionButton label="Delete lesson" danger onClick={() => openDelete(item)}>
                                        <Trash2 className="size-3.5" />
                                    </ActionButton>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Tips */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        ['Lesson order', 'Keep a unique lesson number per chapter', '01'],
                        ['Draft first', 'Create as draft, publish when ready', '✓'],
                        ['Free Preview', 'Mark some lessons as free for students', '🆓'],
                        ['XP & Coins', 'Reward students for completing lessons', '⚡'],
                    ].map(([title, text, symbol]) => (
                        <div key={title} className="rounded-xl border border-slate-700/80 bg-linear-to-br from-[#10192b] to-[#080c16] p-4">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-lg border border-amber-400/40 bg-amber-400/10 text-sm font-bold text-amber-300">{symbol}</span>
                                <div>
                                    <p className="text-sm font-semibold">{title}</p>
                                    <p className="mt-1 text-xs text-slate-400">{text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* Modals */}
            <AddLessonModal
                open={openModal}
                chapters={chapters}
                subjects={subjects}
                classes={classes}
                onClose={() => setOpenModal(false)}
                onSuccess={() => window.location.reload()}
            />
            <EditLessonModal
                key={selectedLesson?.id ?? 'edit'}
                open={editOpen}
                lesson={selectedLesson}
                chapters={chapters}
                subjects={subjects}
                classes={classes}
                onClose={() => setEditOpen(false)}
                onSuccess={() => window.location.reload()}
            />
            <DeleteLessonModal
                open={deleteOpen}
                lesson={selectedLesson}
                onClose={() => setDeleteOpen(false)}
                onSuccess={() => window.location.reload()}
            />
        </main>
    )
}