'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CirclePlus, Eye, Filter, FolderOpen, Pencil, Search, Trash2 } from 'lucide-react'
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
  workflow_status?: string | null
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

export default function ChaptersClient({ chapters, subjects, classes }: Props) {
  const [openModal, setOpenModal] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<CurriculumChapter | null>(null)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return chapters.filter((c) => {
      if (filterClass !== 'all' && c.class_id !== filterClass) return false
      if (filterSubject !== 'all' && c.subject_id !== filterSubject) return false
      if (!q) return true
      return [c.title, c.title_bn, c.slug, c.curriculum_subjects?.name_bn, c.curriculum_classes?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [chapters, search, filterClass, filterSubject])

  const activeChapters = chapters.filter((item) => item.is_active).length
  const openEdit = (item: CurriculumChapter) => { setSelectedChapter(item); setEditOpen(true) }
  const openDelete = (item: CurriculumChapter) => { setSelectedChapter(item); setDeleteOpen(true) }

  return (
    <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-200 hover:bg-pink-500/20">
            ← Admin Dashboard
          </Link>
          <Link href="/dashboard/admin/curriculum" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10">
            <ArrowLeft className="size-3.5" /> Curriculum
          </Link>
          <Link href="/dashboard/admin/curriculum/import" className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/20">
            Import PDF
          </Link>
          <Link href="/dashboard/admin/curriculum/lessons" className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20">
            Lessons
          </Link>
        </div>

        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-violet-400/55 bg-violet-400/10">
              <FolderOpen className="size-6 text-violet-300" />
            </div>
            <div>
              <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                Chapter <span className="bg-linear-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">অধ্যায় তৈরি, সম্পাদনা ও সাজানো</p>
            </div>
          </div>
          <button onClick={() => setOpenModal(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-bold shadow-lg">
            <CirclePlus className="size-4" /> Add Chapter
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-sky-400/40 bg-[#0d1425] p-4"><p className="text-xs text-slate-400">Total</p><p className="text-3xl font-black">{chapters.length}</p></div>
          <div className="rounded-xl border border-emerald-400/40 bg-[#0d1425] p-4"><p className="text-xs text-slate-400">Active</p><p className="text-3xl font-black">{activeChapters}</p></div>
          <div className="rounded-xl border border-violet-400/40 bg-[#0d1425] p-4"><p className="text-xs text-slate-400">Filtered</p><p className="text-3xl font-black">{filtered.length}</p></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b1223]">
          <div className="flex flex-col gap-3 border-b border-slate-700/70 p-4 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chapter…" className="h-10 w-full rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none focus:border-violet-400" />
            </label>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm">
              <option value="all">সব Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm">
              <option value="all">সব Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name_bn || s.name}</option>)}
            </select>
          </div>

          <div className="divide-y divide-slate-800/90">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-slate-500">কোনো অধ্যায় নেই</p>
            ) : filtered.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                <div className="grid size-10 place-items-center rounded-xl border border-violet-400/40 bg-violet-400/10 text-sm font-black text-violet-200">{item.chapter_number}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{item.title_bn || item.title}</p>
                  <p className="text-xs text-slate-500">{item.curriculum_classes?.name} · {item.curriculum_subjects?.name_bn || item.curriculum_subjects?.name}</p>
                </div>
                <Status active={item.is_active} />
                <div className="flex gap-2">
                  <ActionButton label="Edit" onClick={() => openEdit(item)}><Pencil className="size-3.5" /></ActionButton>
                  <ActionButton label="Delete" danger onClick={() => openDelete(item)}><Trash2 className="size-3.5" /></ActionButton>
                </div>
              </article>
            ))}
          </div>
        </section>

        <AddChapterModal open={openModal} onClose={() => setOpenModal(false)} onSuccess={() => window.location.reload()} subjects={subjects} classes={classes} />
        <EditChapterModal open={editOpen} chapter={selectedChapter} onClose={() => setEditOpen(false)} onSuccess={() => window.location.reload()} subjects={subjects} classes={classes} />
        <DeleteChapterModal open={deleteOpen} chapter={selectedChapter} onClose={() => setDeleteOpen(false)} onSuccess={() => window.location.reload()} />
      </div>
    </main>
  )
}
