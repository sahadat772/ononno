'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback } from 'react'
import { ArrowLeft, BookOpen, CirclePlus, Eye, Filter, FolderOpen, Pencil, Search, Trash2 } from 'lucide-react'
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

export default function SubjectsClient({ subjects: initialSubjects, classes }: Props) {
  const [subjects, setSubjects] = useState(initialSubjects)
  const [openModal, setOpenModal] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<CurriculumSubject | null>(null)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [listBusy, setListBusy] = useState(false)

  const softRefresh = useCallback(async () => {
    setListBusy(true)
    try {
      const res = await fetch('/api/admin/curriculum/subjects')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) setSubjects(data)
    } catch {
      /* keep current list */
    } finally {
      setListBusy(false)
    }
  }, [])

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
  const openDelete = (item: CurriculumSubject) => { setSelectedSubject(item); setDeleteOpen(true) }

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
        </div>

        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-blue-400/55 bg-blue-400/10 shadow-[0_0_26px_rgba(96,165,250,.18)]">
              <BookOpen className="size-6 text-blue-300" />
            </div>
            <div>
              <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                Subject <span className="bg-linear-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">Class অনুযায়ী বিষয় তৈরি ও পরিচালনা</p>
            </div>
          </div>
          <button onClick={() => setOpenModal(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-bold shadow-lg">
            <CirclePlus className="size-4" /> Add Subject
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-sky-400/40 bg-[#0d1425] p-4"><p className="text-xs text-slate-400">Total</p><p className="text-3xl font-black">{subjects.length}</p></div>
          <div className="rounded-xl border border-emerald-400/40 bg-[#0d1425] p-4"><p className="text-xs text-slate-400">Active</p><p className="text-3xl font-black">{activeSubjects}</p></div>
          <div className="rounded-xl border border-violet-400/40 bg-[#0d1425] p-4"><p className="text-xs text-slate-400">Filtered</p><p className="text-3xl font-black">{filteredSubjects.length}</p></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0b1223]">
          <div className="flex flex-col gap-3 border-b border-slate-700/70 p-4 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject…" className="h-10 w-full rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none focus:border-blue-400" />
            </label>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="h-10 rounded-lg border border-slate-600 bg-[#0a1020] px-3 text-sm">
              <option value="">সব Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" onClick={() => void softRefresh()} disabled={listBusy} className="h-10 rounded-lg border border-slate-600 px-3 text-xs font-semibold text-slate-300 disabled:opacity-50">
              {listBusy ? '…' : 'Refresh'}
            </button>
          </div>

          <div className="divide-y divide-slate-800/90">
            {filteredSubjects.length === 0 ? (
              <p className="py-12 text-center text-slate-500">কোনো subject নেই</p>
            ) : filteredSubjects.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                <div className="grid size-10 place-items-center rounded-xl border border-blue-400/40 bg-blue-400/10 text-lg">{item.icon || '📖'}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">{item.name_bn || item.name}</p>
                  <p className="text-xs text-slate-500">{item.curriculum_classes?.name || '—'} · {item.name}</p>
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

        <AddSubjectModal open={openModal} onClose={() => setOpenModal(false)} onSuccess={() => void softRefresh()} classes={classes} />
        <EditSubjectModal open={editOpen} subject={selectedSubject} onClose={() => setEditOpen(false)} onSuccess={() => void softRefresh()} classes={classes} />
        <DeleteSubjectModal open={deleteOpen} subject={selectedSubject} onClose={() => setDeleteOpen(false)} onSuccess={() => void softRefresh()} />
      </div>
    </main>
  )
}
