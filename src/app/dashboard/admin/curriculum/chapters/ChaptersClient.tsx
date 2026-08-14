'use client'

import { useMemo, useState } from 'react'
import { BookOpen, CirclePlus, Eye, Filter, FolderOpen, GraduationCap, Pencil, Search, Trash2 } from 'lucide-react'
import AddChapterModal from './AddChapterModal'
import EditChapterModal from './EditChapterModal'
import DeleteChapterModal from './DeleteChapterModal'

type CurriculumClass = { id: string; name: string; class_number: number }
type CurriculumSubject = { id: string; name: string; name_bn: string; class_id: string }
type CurriculumChapter = {
    id: string
    subject_id: string
    class_id: string
    title: string
    title_bn: string
    slug: string
    description?: string | null
    chapter_number: number
    icon?: string | null
    is_active: boolean
    order_index: number
    curriculum_subjects?: { id: string; name: string; name_bn: string } | null
    curriculum_classes?: { id: string; name: string; class_number: number } | null
}
type Props = {
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

function Status({ active }: { active: boolean }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${active
            ? 'bg-emerald-400/10 text-emerald-300'
            : 'bg-slate-500/15 text-slate-400'
            }`}>
            {active ? 'Active' : 'Inactive'}
        </span>
    )
}

function StatCard({ label, value, text, color, icon }: {
    label: string; value: number; text: string
    color: 'blue' | 'green' | 'purple'; icon: React.ReactNode
}) {
    const theme = {
        blue: 'border-sky-400/50 text-sky-300',
        green: 'border-emerald-400/50 text-emerald-300',
        purple: 'border-violet-400/50 text-violet-300',
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

export default function ChaptersClient({ chapters, subjects, classes }: Props) {
    const [openModal, setOpenModal] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedChapter, setSelectedChapter] = useState<CurriculumChapter | null>(null)
    const [search, setSearch] = useState('')
    const [filterClass, setFilterClass] = useState('')
    const [filterSubject, setFilterSubject] = useState('')

    const filteredSubjects = useMemo(() =>
        !filterClass ? subjects : subjects.filter(s => s.class_id === filterClass),
        [subjects, filterClass]
    )

    const filteredChapters = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return chapters.filter((item) => {
            const matchSearch = !keyword || [item.title, item.title_bn, item.slug]
                .some((v) => v.toLowerCase().includes(keyword))
            const matchClass = !filterClass || item.class_id === filterClass
            const matchSubject = !filterSubject || item.subject_id === filterSubject
            return matchSearch && matchClass && matchSubject
        })
    }, [chapters, search, filterClass, filterSubject])

    const activeChapters = chapters.filter((item) => item.is_active).length

    const openEdit = (item: CurriculumChapter) => { setSelectedChapter(item); setEditOpen(true) }
    const openDelete = (item: CurriculumChapter) => { setSelectedChapter(item); setDeleteOpen(true) }

    return (
        <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">

                {/* Header */}
                <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-xl border border-violet-400/55 bg-violet-400/10 shadow-[0_0_26px_rgba(167,139,250,.18)]">
                            <BookOpen className="size-6 text-violet-300" />
                        </div>
                        <div>
                            <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                                Chapter <span className="bg-linear-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">Management</span>
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-400">Manage curriculum chapters for each subject.</p>
                        </div>
                    </div>
                    <button onClick={() => setOpenModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-500 px-4 py-2.5 text-sm font-bold shadow-lg shadow-violet-900/30 transition hover:brightness-110">
                        <CirclePlus className="size-4" /> Add Chapter
                    </button>
                </header>

                {/* Stats */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard label="Total Chapters" value={chapters.length} text="All curriculum chapters" color="blue" icon={<BookOpen className="size-6" />} />
                    <StatCard label="Active Chapters" value={activeChapters} text="Visible to learners" color="green" icon={<Eye className="size-6" />} />
                    <StatCard label="Search Results" value={filteredChapters.length} text={search ? `Matching "${search}"` : 'All chapters shown'} color="purple" icon={<Filter className="size-6" />} />
                </section>

                {/* Table */}
                <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15] shadow-[0_15px_50px_rgba(0,0,0,.25)]">
                    <div className="flex flex-col gap-4 border-b border-slate-700/70 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <FolderOpen className="size-5 text-violet-300" /> Curriculum Chapters
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">Browse, edit and manage all chapters.</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {/* Class Filter */}
                            <select
                                value={filterClass}
                                onChange={(e) => { setFilterClass(e.target.value); setFilterSubject('') }}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-violet-400"
                            >
                                <option value="">সব Class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {/* Subject Filter */}
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-violet-400"
                            >
                                <option value="">সব Subject</option>
                                {filteredSubjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name_bn} ({s.name})</option>
                                ))}
                            </select>
                            {/* Search */}
                            <label className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search chapter..."
                                    className="h-10 w-52 rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-violet-400" />
                            </label>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="hidden grid-cols-[80px_minmax(200px,1fr)_150px_150px_100px_120px_120px] gap-4 border-b border-slate-700/80 bg-slate-800/60 px-5 py-3 text-xs font-semibold text-slate-300 md:grid">
                        <span>Chapter</span>
                        <span>Title</span>
                        <span>Slug</span>
                        <span>Subject</span>
                        <span>Class</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-800/90">
                        {filteredChapters.length === 0 ? (
                            <div className="py-16 text-center">
                                <FolderOpen className="mx-auto size-10 text-slate-600" />
                                <p className="mt-3 font-bold">No chapters found</p>
                                <p className="mt-1 text-sm text-slate-500">Try another search keyword.</p>
                            </div>
                        ) : filteredChapters.map((item) => (
                            <article key={item.id}
                                className="grid items-center gap-4 px-5 py-3 transition hover:bg-white/[.025] md:grid-cols-[80px_minmax(200px,1fr)_150px_150px_100px_120px_120px]">
                                {/* Chapter Number */}
                                <div className="grid size-11 place-items-center rounded-xl border border-violet-400/45 bg-violet-400/10 text-lg font-black text-violet-300 shadow-[0_0_18px_rgba(167,139,250,.15)]">
                                    {item.chapter_number}
                                </div>
                                {/* Title */}
                                <div>
                                    <p className="font-bold text-white">{item.title_bn}</p>
                                    <p className="text-xs text-slate-400">{item.title}</p>
                                </div>
                                {/* Slug */}
                                <code className="w-fit rounded-md bg-slate-800/80 px-2 py-1 text-xs text-sky-300">
                                    {item.slug}
                                </code>
                                {/* Subject */}
                                <p className="text-sm text-slate-400">
                                    {item.curriculum_subjects?.name_bn ?? '—'}
                                </p>
                                {/* Class */}
                                <p className="text-sm text-slate-400">
                                    {item.curriculum_classes?.name ?? '—'}
                                </p>
                                {/* Status */}
                                <Status active={item.is_active} />
                                {/* Actions */}
                                <div className="flex gap-2">
                                    <ActionButton label="Edit chapter" onClick={() => openEdit(item)}>
                                        <Pencil className="size-3.5" />
                                    </ActionButton>
                                    <ActionButton label="Delete chapter" danger onClick={() => openDelete(item)}>
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
                        ['Chapter order', 'Keep a unique chapter number per subject', '01'],
                        ['Visibility', 'Active chapters are available for lessons', '✓'],
                        ['Content', 'Add lessons inside each chapter', '▣'],
                        ['Need help?', 'Start by selecting a subject first', '+'],
                    ].map(([title, text, symbol]) => (
                        <div key={title} className="rounded-xl border border-slate-700/80 bg-linear-to-br from-[#10192b] to-[#080c16] p-4">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-lg border border-violet-400/40 bg-violet-400/10 text-sm font-bold text-violet-300">{symbol}</span>
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
            <AddChapterModal
                open={openModal}
                subjects={subjects}
                classes={classes}
                onClose={() => setOpenModal(false)}
                onSuccess={() => window.location.reload()}
            />
            <EditChapterModal
                key={selectedChapter?.id ?? 'edit'}
                open={editOpen}
                chapter={selectedChapter}
                subjects={subjects}
                classes={classes}
                onClose={() => setEditOpen(false)}
                onSuccess={() => window.location.reload()}
            />
            <DeleteChapterModal
                open={deleteOpen}
                chapter={selectedChapter}
                onClose={() => setDeleteOpen(false)}
                onSuccess={() => window.location.reload()}
            />
        </main>
    )
}