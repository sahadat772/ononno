'use client'

import { useMemo, useState } from 'react'
import { BookOpen, CirclePlus, Eye, Filter, FolderOpen, Pencil, Search, Trash2 } from 'lucide-react'
import AddSubjectModal from './AddSubjectModal'
import EditSubjectModal from './EditSubjectModal'
import DeleteSubjectModal from './DeleteSubjectModal'

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
    curriculum_classes?: { id: string; name: string; class_number: number } | null
}
type Props = { subjects: CurriculumSubject[]; classes: CurriculumClass[] }

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

export default function SubjectsClient({ subjects, classes }: Props) {
    const [openModal, setOpenModal] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<CurriculumSubject | null>(null)
    const [search, setSearch] = useState('')
    const [filterClass, setFilterClass] = useState('')

    const filteredSubjects = useMemo(() => {
        const keyword = search.trim().toLowerCase()
        return subjects.filter((item) => {
            const matchSearch = !keyword || [item.name, item.name_bn, item.slug]
                .some((v) => v.toLowerCase().includes(keyword))
            const matchClass = !filterClass || item.class_id === filterClass
            return matchSearch && matchClass
        })
    }, [subjects, search, filterClass])

    const activeSubjects = subjects.filter((item) => item.is_active).length

    const openEdit = (item: CurriculumSubject) => { setSelectedSubject(item); setEditOpen(true) }
    const openDelete = (item: CurriculumSubject) => { console.log('Opening delete modal for:', item.id); setSelectedSubject(item); setDeleteOpen(true) }

    return (
        <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">

                {/* Header */}
                <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-xl border border-blue-400/55 bg-blue-400/10 shadow-[0_0_26px_rgba(96,165,250,.18)]">
                            <BookOpen className="size-6 text-blue-300" />
                        </div>
                        <div>
                            <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                                Subject <span className="bg-linear-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Management</span>
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-400">Manage curriculum subjects for each class.</p>
                        </div>
                    </div>
                    <button onClick={() => setOpenModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-bold shadow-lg transition hover:brightness-110">
                        <CirclePlus className="size-4" /> Add Subject
                    </button>
                </header>

                {/* Stats */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard label="Total Subjects" value={subjects.length} text="All curriculum subjects" color="blue" icon={<BookOpen className="size-6" />} />
                    <StatCard label="Active Subjects" value={activeSubjects} text="Visible to learners" color="green" icon={<Eye className="size-6" />} />
                    <StatCard label="Search Results" value={filteredSubjects.length} text={search ? `Matching "${search}"` : 'All subjects shown'} color="purple" icon={<Filter className="size-6" />} />
                </section>

                {/* Table */}
                <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15] shadow-[0_15px_50px_rgba(0,0,0,.25)]">
                    <div className="flex flex-col gap-4 border-b border-slate-700/70 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <FolderOpen className="size-5 text-blue-300" /> Curriculum Subjects
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">Browse, edit and manage all subjects.</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            {/* Class Filter */}
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm text-slate-300 outline-none focus:border-blue-400"
                            >
                                <option value="">সব Class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {/* Search */}
                            <label className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search subject..."
                                    className="h-10 w-52 rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400" />
                            </label>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="hidden grid-cols-[60px_minmax(180px,1fr)_150px_150px_100px_120px_120px] gap-4 border-b border-slate-700/80 bg-slate-800/60 px-5 py-3 text-xs font-semibold text-slate-300 md:grid">
                        <span>Icon</span>
                        <span>Name</span>
                        <span>Slug</span>
                        <span>Class</span>
                        <span>Mandatory</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-800/90">
                        {filteredSubjects.length === 0 ? (
                            <div className="py-16 text-center">
                                <FolderOpen className="mx-auto size-10 text-slate-600" />
                                <p className="mt-3 font-bold">No subjects found</p>
                                <p className="mt-1 text-sm text-slate-500">Try another search keyword.</p>
                            </div>
                        ) : filteredSubjects.map((item) => (
                            <article key={item.id}
                                className="grid items-center gap-4 px-5 py-3 transition hover:bg-white/[.025] md:grid-cols-[60px_minmax(180px,1fr)_150px_150px_100px_120px_120px]">
                                {/* Icon */}
                                <div className={`grid size-11 place-items-center rounded-xl border border-blue-400/45 bg-gradient-to-br ${item.color || 'from-blue-400 to-cyan-500'} text-xl shadow-lg`}>
                                    {item.icon || '📚'}
                                </div>
                                {/* Name */}
                                <div>
                                    <p className="font-bold text-white">{item.name_bn}</p>
                                    <p className="text-xs text-slate-400">{item.name}</p>
                                </div>
                                {/* Slug */}
                                <code className="w-fit rounded-md bg-slate-800/80 px-2 py-1 text-xs text-sky-300">
                                    {item.slug}
                                </code>
                                {/* Class */}
                                <p className="text-sm text-slate-400">
                                    {item.curriculum_classes?.name ?? '—'}
                                </p>
                                {/* Mandatory */}
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${item.is_mandatory
                                    ? 'bg-amber-400/10 text-amber-300'
                                    : 'bg-slate-500/15 text-slate-400'}`}>
                                    {item.is_mandatory ? 'বাধ্যতামূলক' : 'Optional'}
                                </span>
                                {/* Status */}
                                <Status active={item.is_active} />
                                {/* Actions */}
                                <div className="flex gap-2">
                                    <ActionButton label="Edit subject" onClick={() => openEdit(item)}>
                                        <Pencil className="size-3.5" />
                                    </ActionButton>
                                    <ActionButton label="Delete subject" danger onClick={() => openDelete(item)}>
                                        <Trash2 className="size-3.5" />
                                    </ActionButton>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {/* Modals */}
            <AddSubjectModal
                open={openModal}
                classes={classes}
                onClose={() => setOpenModal(false)}
                onSuccess={() => window.location.reload()}
            />
            <EditSubjectModal
                key={selectedSubject?.id ?? 'edit'}
                open={editOpen}
                subject={selectedSubject}
                classes={classes}
                onClose={() => setEditOpen(false)}
                onSuccess={() => window.location.reload()}
            />
            <DeleteSubjectModal
                open={deleteOpen}
                subject={selectedSubject}
                onClose={() => setDeleteOpen(false)}
                onSuccess={() => window.location.reload()}
            />
        </main>
    )
}