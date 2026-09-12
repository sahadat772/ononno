'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  CirclePlus,
  Eye,
  Filter,
  FolderOpen,
  Pencil,
  Search,
  Send,
  Trash2,
  WandSparkles,
  Zap,
} from 'lucide-react'
import AddLessonModal from './AddLessonModal'
import EditLessonModal from './EditLessonModal'
import DeleteLessonModal from './DeleteLessonModal'
import ViewStudyLink from './ViewStudyLink'

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
  workflow_status?:
    | 'draft'
    | 'extracted'
    | 'reviewed'
    | 'generating'
    | 'generated'
    | 'approved'
    | 'published'
    | 'archived'
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

function ActionButton({
  label,
  children,
  danger,
  onClick,
  disabled,
}: {
  label: string
  children: React.ReactNode
  danger?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 place-items-center rounded-full border transition disabled:opacity-40 ${
        danger
          ? 'border-rose-500/35 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
          : 'border-slate-600 bg-slate-800/70 text-slate-200 hover:border-violet-400 hover:text-white'
      }`}
    >
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

export default function LessonsClient({
  lessons: initialLessons,
  chapters,
  subjects,
  classes,
}: Props) {
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
  const [hint, setHint] = useState<string | null>(null)

  const softRefresh = async () => {
    try {
      const res = await fetch('/api/admin/curriculum/lessons')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) setLessons(data)
    } catch {
      /* keep */
    }
  }

  const filteredSubjects = useMemo(
    () => (!filterClass ? subjects : subjects.filter((s) => s.class_id === filterClass)),
    [subjects, filterClass],
  )

  const filteredChapters = useMemo(() => {
    let result = chapters
    if (filterClass) result = result.filter((c) => c.class_id === filterClass)
    if (filterSubject) result = result.filter((c) => c.subject_id === filterSubject)
    return result
  }, [chapters, filterClass, filterSubject])

  const filteredLessons = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return lessons.filter((item) => {
      const matchSearch =
        !keyword ||
        [item.title, item.title_bn, item.slug].some((v) => v.toLowerCase().includes(keyword))
      const matchClass = !filterClass || item.class_id === filterClass
      const matchSubject = !filterSubject || item.subject_id === filterSubject
      const matchChapter = !filterChapter || item.chapter_id === filterChapter
      const matchStatus =
        !filterStatus ||
        (filterStatus === 'published' && item.is_published) ||
        (filterStatus === 'draft' && !item.is_published && item.is_active) ||
        (filterStatus === 'generated' && item.workflow_status === 'generated') ||
        (filterStatus === 'archived' &&
          (item.workflow_status === 'archived' || item.is_active === false))
      return matchSearch && matchClass && matchSubject && matchChapter && matchStatus
    })
  }, [lessons, search, filterClass, filterSubject, filterChapter, filterStatus])

  const runWorkflow = async (
    item: CurriculumLesson,
    action: 'review' | 'generate' | 'approve' | 'publish' | 'restore',
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
        action === 'generate' ? generateUrl : `/api/admin/curriculum/lessons/${item.id}/workflow`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: action === 'generate' ? undefined : JSON.stringify({ action }),
        },
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Workflow fails')
      }
      if (action === 'generate') setHint('Study draft save হয়েছে। View Study চাপুন।')
      void softRefresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Workflow fails')
    } finally {
      setWorkflowBusy(null)
    }
  }

  const openEdit = (item: CurriculumLesson) => {
    setSelectedLesson(item)
    setEditOpen(true)
  }
  const openDelete = (item: CurriculumLesson) => {
    setSelectedLesson(item)
    setDeleteOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/curriculum"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"
          >
            <ArrowLeft className="size-3.5" /> Curriculum
          </Link>
          <Link
            href="/dashboard/admin/curriculum/import"
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200"
          >
            Import PDF
          </Link>
        </div>

        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-amber-400/55 bg-amber-400/10">
              <BookOpen className="size-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Lesson{' '}
                <span className="bg-linear-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Generate → <span className="text-sky-300">View Study</span> → Approve → Publish
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold"
          >
            <CirclePlus className="size-4" /> Add Lesson
          </button>
        </header>

        {hint && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {hint}
          </div>
        )}

        <section className="flex flex-wrap gap-3">
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value)
              setFilterSubject('')
              setFilterChapter('')
            }}
            className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm"
          >
            <option value="">সব Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value)
              setFilterChapter('')
            }}
            className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm"
          >
            <option value="">সব Subject</option>
            {filteredSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_bn}
              </option>
            ))}
          </select>
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm"
          >
            <option value="">সব Chapter</option>
            {filteredChapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title_bn}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm"
          >
            <option value="">সব Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="archived">Archived</option>
          </select>
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-10 w-48 rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm"
            />
          </label>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b1223]">
          <div className="border-b border-slate-700/70 p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FolderOpen className="size-5 text-amber-300" /> Curriculum Lessons ({filteredLessons.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-800/90">
            {filteredLessons.length === 0 ? (
              <div className="py-16 text-center font-bold">No lessons found</div>
            ) : (
              filteredLessons.map((item) => {
                const isArchived =
                  String(item.workflow_status || '').toLowerCase() === 'archived' ||
                  item.is_active === false
                return (
                  <article
                    key={item.id}
                    className="grid items-center gap-3 px-4 py-3 md:grid-cols-[48px_1fr_auto]"
                  >
                    <div className="grid size-10 place-items-center rounded-xl border border-amber-400/45 bg-amber-400/10 text-sm font-black text-amber-300">
                      {item.lesson_number}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{item.title_bn || item.title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {item.curriculum_subjects?.name_bn || '—'} ·{' '}
                        {item.curriculum_chapters?.title_bn || '—'} ·{' '}
                        {item.curriculum_classes?.name || '—'}
                      </p>
                      <div className="mt-1">
                        <WorkflowBadge status={item.workflow_status} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {!isArchived && (
                        <>
                          <ActionButton
                            label="Generate"
                            disabled={workflowBusy === `${item.id}:generate`}
                            onClick={() => void runWorkflow(item, 'generate')}
                          >
                            <WandSparkles className="size-3.5" />
                          </ActionButton>
                          {(item.workflow_status === 'generated' ||
                            item.workflow_status === 'approved') && (
                            <ActionButton
                              label="Publish"
                              disabled={workflowBusy === `${item.id}:publish`}
                              onClick={() => void runWorkflow(item, 'publish')}
                            >
                              <Send className="size-3.5" />
                            </ActionButton>
                          )}
                        </>
                      )}
                      <ViewStudyLink item={item} />
                      <ActionButton label="Edit" onClick={() => openEdit(item)}>
                        <Pencil className="size-3.5" />
                      </ActionButton>
                      <ActionButton label="Delete" danger onClick={() => openDelete(item)}>
                        <Trash2 className="size-3.5" />
                      </ActionButton>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        <p className="text-center text-[11px] text-slate-500">
          <Eye className="mr-1 inline size-3" />
          View Study = student path with <code className="text-sky-300">?preview=1</code> (admin can
          open unpublished)
        </p>
      </div>

      <AddLessonModal
        open={openModal}
        chapters={chapters}
        subjects={subjects}
        classes={classes}
        onClose={() => setOpenModal(false)}
        onSuccess={() => void softRefresh()}
      />
      <EditLessonModal
        key={selectedLesson?.id ?? 'edit'}
        open={editOpen}
        lesson={selectedLesson}
        chapters={chapters}
        subjects={subjects}
        classes={classes}
        onClose={() => setEditOpen(false)}
        onSuccess={() => void softRefresh()}
      />
      <DeleteLessonModal
        open={deleteOpen}
        lesson={selectedLesson}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => void softRefresh()}
      />
    </main>
  )
}
