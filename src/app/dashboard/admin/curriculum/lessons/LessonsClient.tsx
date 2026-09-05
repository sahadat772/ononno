'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, CirclePlus, Eye, Filter, FolderOpen, Image as ImageIcon, Pencil, Search, Send, Trash2, WandSparkles, Zap } from 'lucide-react'
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
    workflow_status?: "draft" | "extracted" | "reviewed" | "generating" | "generated" | "approved" | "published" | "archived"
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

function ActionButton({ label, children, danger, onClick, disabled }: { label: string; children: React.ReactNode; danger?: boolean; onClick?: () => void; disabled?: boolean }) {
    return (
        <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
            className={`grid size-8 place-items-center rounded-full border transition disabled:opacity-40 ${danger
                ? 'border-rose-500/35 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-slate-600 bg-slate-800/70 text-slate-200 hover:border-violet-400 hover:text-white'
                }`}>
            {children}
        </button>
    )
}

function WorkflowBadge({ status }: { status?: string }) {
    const map: Record<string, string> = {
        draft: 'bg-slate-500/15 text-slate-300',
        extracted: 'bg-sky-400/10 text-sky-300',
        reviewed: 'bg-violet-400/10 text-violet-300',
        generating: 'bg-amber-400/10 text-amber-300',
        generated: 'bg-cyan-400/10 text-cyan-300',
        approved: 'bg-emerald-400/10 text-emerald-300',
        published: 'bg-emerald-500/20 text-emerald-200',
        archived: 'bg-slate-600/20 text-slate-400',
    }
    const s = status || 'draft'
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${map[s] ?? map.draft}`}>
            {s}
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

export default function LessonsClient({ lessons: initialLessons, chapters, subjects, classes }: Props) {
    const [lessons, setLessons] = useState(initialLessons)
    const [openModal, setOpenModal] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selectedLesson, setSelectedLesson] = useState<CurriculumLesson | null>(null)
    const [search, setSearch] = useState('')
    const [filterClass, setFilterClass] = useState('')
    const [filterSubject, setFilterSubject] = useState('')
    const [filterChapter, setFilterChapter] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [workflowBusy, setWorkflowBusy] = useState<string | null>(null)
    const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null)
    const [hint, setHint] = useState<string | null>(null)

    const softRefresh = async () => {
        try {
            const res = await fetch('/api/admin/curriculum/lessons')
            if (!res.ok) return
            const data = await res.json()
            if (Array.isArray(data)) setLessons(data)
        } catch {
            /* keep list */
        }
    }

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
                (filterStatus === 'inactive' && !item.is_active) ||
                (filterStatus === 'reviewed' && item.workflow_status === 'reviewed') ||
                (filterStatus === 'generated' && item.workflow_status === 'generated')
            return matchSearch && matchClass && matchSubject && matchChapter && matchStatus
        })
    }, [lessons, search, filterClass, filterSubject, filterChapter, filterStatus])

    const publishedCount = lessons.filter(l => l.is_published).length
    const draftCount = lessons.filter(l => !l.is_published && l.is_active).length
    const readyToGenerate = lessons.filter(l => l.workflow_status === 'reviewed').length

    const nextAfterGenerated = useMemo(() => {
        if (!lastGeneratedId) return null
        const idx = lessons.findIndex(l => l.id === lastGeneratedId)
        if (idx < 0) return null
        return lessons.slice(idx + 1).find(l =>
            l.workflow_status === 'reviewed' || l.workflow_status === 'extracted' || l.workflow_status === 'draft'
        ) ?? null
    }, [lastGeneratedId, lessons])

    const openEdit = (item: CurriculumLesson) => { setSelectedLesson(item); setEditOpen(true) }
    const openDelete = (item: CurriculumLesson) => { setSelectedLesson(item); setDeleteOpen(true) }

    const generateCover = async (item: CurriculumLesson) => {
        setWorkflowBusy(`${item.id}:cover`)
        setHint(null)
        try {
            const res = await fetch(`/api/admin/curriculum/lessons/${item.id}/generate-cover`, {
                method: 'POST',
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(
                    (data.message || data.error || 'Cover generate fails') +
                    (data.details ? `\n${data.details}` : ''),
                )
            }
            setHint(data.cover_image_url
                ? 'Cover image generate হয়েছে।'
                : (data.message || 'Cover request complete।'))
        } catch (e) {
            window.alert(e instanceof Error ? e.message : 'Cover generate fails')
        } finally {
            setWorkflowBusy(null)
        }
    }

    const runWorkflow = async (
        item: CurriculumLesson,
        action: "review" | "generate" | "approve" | "publish",
        opts?: { force?: boolean },
    ) => {
        setWorkflowBusy(`${item.id}:${action}`)
        setHint(null)
        try {
            const force = opts?.force === true
            const generateUrl = force
                ? `/api/admin/curriculum/lessons/${item.id}/generate?force=1`
                : `/api/admin/curriculum/lessons/${item.id}/generate`

            const response = await fetch(
                action === "generate"
                    ? generateUrl
                    : `/api/admin/curriculum/lessons/${item.id}/workflow`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: action === "generate" ? undefined : JSON.stringify({ action }),
                },
            )
            const data = await response.json()
            if (!response.ok) {
                const detail = data.details
                    ? `\n\nDetail: ${String(data.details).slice(0, 400)}`
                    : ''
                throw new Error(
                    (data.message || data.error || "Workflow update করা যায়নি।") + detail,
                )
            }

            if (action === 'generate') {
                setLastGeneratedId(item.id)
                if (data.cached) {
                    setHint(data.message || 'Cached content — নতুন করতে Force Re-generate চাপুন।')
                } else {
                    setHint('ছাত্র-পাঠ্য study draft save হয়েছে। Approve → Publish করুন।')
                }
            }

            const nextStatus =
                action === 'review' ? 'reviewed' :
                action === 'generate' ? 'generated' :
                action === 'approve' ? 'approved' :
                action === 'publish' ? 'published' : item.workflow_status

            setLessons((prev) =>
                prev.map((l) =>
                    l.id === item.id
                        ? {
                            ...l,
                            workflow_status: (data.lesson?.workflow_status || nextStatus) as CurriculumLesson['workflow_status'],
                            is_published:
                                action === 'publish'
                                    ? true
                                    : action === 'generate' && opts?.force
                                      ? false
                                      : l.is_published,
                        }
                        : l,
                ),
            )
            void softRefresh()
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Workflow update করা যায়নি।")
        } finally {
            setWorkflowBusy(null)
        }
    }

    return (
        <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-5">

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/admin/curriculum"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10">
                        <ArrowLeft className="size-3.5" /> Curriculum
                    </Link>
                    <Link href="/dashboard/admin/curriculum/import"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/20">
                        Import PDF
                    </Link>
                </div>

                <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-xl border border-amber-400/55 bg-amber-400/10 shadow-[0_0_26px_rgba(251,191,36,.18)]">
                            <BookOpen className="size-6 text-amber-300" />
                        </div>
                        <div>
                            <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                                Lesson <span className="bg-linear-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Management</span>
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-400">
                                Generate → Approve → Publish · Published-এ Force Re-generate + Cover আছে
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setOpenModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold shadow-lg shadow-amber-900/30 transition hover:brightness-110">
                        <CirclePlus className="size-4" /> Add Lesson
                    </button>
                </header>

                <div className="rounded-xl border border-violet-400/25 bg-violet-950/20 px-4 py-3 text-sm text-violet-100">
                    <p className="font-semibold">Architecture workflow</p>
                    <p className="mt-1 text-xs text-violet-200/80">
                        PDF → Extract → Review → Generate → Approve → Publish
                    </p>
                    <p className="mt-2 text-xs text-amber-200/90">Ready to generate: {readyToGenerate}</p>
                </div>

                {hint && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{hint}</div>
                )}

                {nextAfterGenerated && (
                    <div className="rounded-xl border border-sky-400/30 bg-sky-950/30 px-4 py-3 text-sm text-sky-100">
                        পরের lesson suggest: <strong>{nextAfterGenerated.title_bn || nextAfterGenerated.title}</strong>
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Lessons" value={lessons.length} text="All curriculum lessons" color="blue" icon={<BookOpen className="size-6" />} />
                    <StatCard label="Published" value={publishedCount} text="Live for students" color="green" icon={<Eye className="size-6" />} />
                    <StatCard label="Draft" value={draftCount} text="Not yet published" color="amber" icon={<Filter className="size-6" />} />
                    <StatCard label="Results" value={filteredLessons.length} text={search ? `Matching "${search}"` : 'All shown'} color="purple" icon={<Zap className="size-6" />} />
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15] shadow-[0_15px_50px_rgba(0,0,0,.25)]">
                    <div className="flex flex-col gap-4 border-b border-slate-700/70 p-5">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <FolderOpen className="size-5 text-amber-300" /> Curriculum Lessons
                            </h2>
                        </div>
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
                                <option value="reviewed">Reviewed</option>
                                <option value="generated">Generated</option>
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

                    <div className="divide-y divide-slate-800/90">
                        {filteredLessons.length === 0 ? (
                            <div className="py-16 text-center">
                                <FolderOpen className="mx-auto size-10 text-slate-600" />
                                <p className="mt-3 font-bold">No lessons found</p>
                            </div>
                        ) : filteredLessons.map((item) => (
                            <article key={item.id}
                                className="grid items-center gap-4 px-5 py-3 transition hover:bg-white/[.025] md:grid-cols-[60px_minmax(180px,1fr)_120px_100px_80px_110px_200px]">
                                <div className="grid size-11 place-items-center rounded-xl border border-amber-400/45 bg-amber-400/10 text-lg font-black text-amber-300">
                                    {item.lesson_number}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{item.title_bn}</p>
                                    <p className="text-xs text-slate-400">{item.title}</p>
                                </div>
                                <p className="text-sm text-slate-400 truncate">{item.curriculum_chapters?.title_bn ?? '—'}</p>
                                <p className="text-sm text-slate-400 truncate">{item.curriculum_subjects?.name_bn ?? '—'}</p>
                                <p className="text-sm font-semibold text-amber-200">{item.xp_reward}</p>
                                <WorkflowBadge status={item.workflow_status} />
                                <div className="flex flex-wrap gap-1.5">
                                    {(item.workflow_status === 'draft' || item.workflow_status === 'extracted') && (
                                        <ActionButton label="Mark reviewed" disabled={workflowBusy === `${item.id}:review`} onClick={() => runWorkflow(item, 'review')}>
                                            <CheckCircle2 className="size-3.5" />
                                        </ActionButton>
                                    )}
                                    {item.workflow_status === 'reviewed' && (
                                        <ActionButton label="Generate study" disabled={workflowBusy === `${item.id}:generate`} onClick={() => runWorkflow(item, 'generate')}>
                                            <WandSparkles className="size-3.5" />
                                        </ActionButton>
                                    )}
                                    {item.workflow_status === 'generated' && (
                                        <>
                                            <ActionButton label="Approve" disabled={workflowBusy === `${item.id}:approve`} onClick={() => runWorkflow(item, 'approve')}>
                                                <CheckCircle2 className="size-3.5" />
                                            </ActionButton>
                                            <ActionButton label="Force re-generate" disabled={workflowBusy === `${item.id}:generate`} onClick={() => {
                                                if (window.confirm('নতুন study আবার generate?')) void runWorkflow(item, 'generate', { force: true })
                                            }}>
                                                <WandSparkles className="size-3.5" />
                                            </ActionButton>
                                            <ActionButton label="Generate cover image" disabled={workflowBusy === `${item.id}:cover`} onClick={() => void generateCover(item)}>
                                                <ImageIcon className="size-3.5" />
                                            </ActionButton>
                                        </>
                                    )}
                                    {item.workflow_status === 'approved' && (
                                        <>
                                            <ActionButton label="Publish" disabled={workflowBusy === `${item.id}:publish`} onClick={() => runWorkflow(item, 'publish')}>
                                                <Send className="size-3.5" />
                                            </ActionButton>
                                            <ActionButton label="Generate cover image" disabled={workflowBusy === `${item.id}:cover`} onClick={() => void generateCover(item)}>
                                                <ImageIcon className="size-3.5" />
                                            </ActionButton>
                                        </>
                                    )}
                                    {(item.workflow_status === 'published' || item.is_published) && (
                                        <>
                                            <ActionButton
                                                label="Force re-generate study"
                                                disabled={workflowBusy === `${item.id}:generate`}
                                                onClick={() => {
                                                    if (window.confirm('Published lesson unpublish করে নতুন study generate হবে। চালিয়ে যাবে?')) {
                                                        void runWorkflow(item, 'generate', { force: true })
                                                    }
                                                }}
                                            >
                                                <WandSparkles className="size-3.5" />
                                            </ActionButton>
                                            <ActionButton
                                                label="Generate cover image"
                                                disabled={workflowBusy === `${item.id}:cover`}
                                                onClick={() => void generateCover(item)}
                                            >
                                                <ImageIcon className="size-3.5" />
                                            </ActionButton>
                                        </>
                                    )}
                                    <ActionButton label="Edit" onClick={() => openEdit(item)}><Pencil className="size-3.5" /></ActionButton>
                                    <ActionButton label="Delete" danger onClick={() => openDelete(item)}><Trash2 className="size-3.5" /></ActionButton>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            <AddLessonModal open={openModal} chapters={chapters} subjects={subjects} classes={classes} onClose={() => setOpenModal(false)} onSuccess={() => { void softRefresh() }} />
            <EditLessonModal key={selectedLesson?.id ?? 'edit'} open={editOpen} lesson={selectedLesson} chapters={chapters} subjects={subjects} classes={classes} onClose={() => setEditOpen(false)} onSuccess={() => { void softRefresh() }} />
            <DeleteLessonModal open={deleteOpen} lesson={selectedLesson} onClose={() => setDeleteOpen(false)} onSuccess={() => {
                if (selectedLesson) {
                    setLessons((prev) => prev.filter((l) => l.id !== selectedLesson.id))
                }
                void softRefresh()
            }} />
        </main>
    )
}
