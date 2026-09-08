'use client'

import Link from 'next/link'
import { useMemo, useState, type ComponentType } from 'react'
import {
  ArrowRight,
  Bot,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  Download,
  Eye,
  FilePlus2,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  LibraryBig,
  MoreVertical,
  Search,
  Sparkles,
  Target,
  Upload,
  Wand2,
  BarChart3,
} from 'lucide-react'

type Stats = {
  classes: number
  subjects: number
  chapters: number
  lessons: number
  published: number
  generated: number
  reviewed: number
  versions: number
}

type ClassRow = { id: string; name: string; class_number: number; slug?: string | null }
type SubjectRow = { id: string; name: string; name_bn: string; class_id: string }
type SourceRow = {
  id: string
  title: string
  source_status: string
  workflow_status: string
  total_chapters: number
  total_lessons: number
}

type Props = {
  stats: Stats
  activeVersion: string
  classes: ClassRow[]
  subjects: SubjectRow[]
  sources: SourceRow[]
}

export default function CurriculumDashboardClient({
  stats,
  activeVersion,
  classes,
  subjects,
  sources,
}: Props) {
  const [query, setQuery] = useState('')
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = classes[0]?.id
    return new Set(first ? ['root', first] : ['root'])
  })

  async function runSeed(force = false) {
    setSeedLoading(true)
    setSeedMsg(null)
    try {
      const res = await fetch('/api/admin/curriculum/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSeedMsg(data.error || 'Seed failed')
        return
      }
      const s = data.summary
      setSeedMsg(
        `Seed done — Class ${s?.classes ?? 0}, Subject ${s?.subjects ?? 0}, Chapter ${s?.chapters ?? 0}, Lesson ${s?.lessons ?? 0}. Refresh page.`,
      )
    } catch {
      setSeedMsg('Server error')
    } finally {
      setSeedLoading(false)
    }
  }

  const subjectsByClass = useMemo(() => {
    const map = new Map<string, SubjectRow[]>()
    for (const s of subjects) {
      const list = map.get(s.class_id) ?? []
      list.push(s)
      map.set(s.class_id, list)
    }
    return map
  }, [subjects])

  const visibleClasses = useMemo(() => {
    const text = query.trim().toLocaleLowerCase()
    if (!text) return classes
    return classes.filter((c) => {
      const subNames = (subjectsByClass.get(c.id) ?? []).map((s) => `${s.name} ${s.name_bn}`)
      return [c.name, ...subNames].some((item) => item.toLocaleLowerCase().includes(text))
    })
  }, [classes, query, subjectsByClass])

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <main className="min-h-screen bg-[#030711] px-3 py-5 text-[#f7f7ff] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Curriculum Management
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Active: {activeVersion} · Classes {stats.classes} · Subjects {stats.subjects} · Lessons{' '}
              {stats.lessons}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin/learning-analytics"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-200"
            >
              <BarChart3 className="size-4" /> Analytics
            </Link>
            <button
              type="button"
              disabled={seedLoading}
              onClick={() => void runSeed(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-200 disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {seedLoading ? 'Seeding…' : 'Seed Baseline'}
            </button>
            <Link
              href="/dashboard/admin/curriculum/import"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-bold text-white"
            >
              <Wand2 className="size-4" /> Import PDF
            </Link>
          </div>
        </header>

        {(stats.classes === 0 || seedMsg) && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              seedMsg?.startsWith('Seed done')
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : stats.classes === 0
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {seedMsg ? (
              <p>{seedMsg}</p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  Curriculum DB empty. Click Seed Baseline for primary class 1–5 (Bangla, English,
                  Math, Islam, Science).
                </p>
                <button
                  type="button"
                  disabled={seedLoading}
                  onClick={() => void runSeed(false)}
                  className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {seedLoading ? 'Seeding…' : 'Seed now'}
                </button>
              </div>
            )}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Classes', stats.classes],
            ['Subjects', stats.subjects],
            ['Chapters', stats.chapters],
            ['Lessons', stats.lessons],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Structure</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => toggle('root')}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/5"
          >
            {expanded.has('root') ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            <span className="font-semibold">{activeVersion || 'Curriculum'}</span>
            <span className="text-xs text-slate-400">{stats.classes} classes</span>
          </button>
          {expanded.has('root') && (
            <div className="ml-4 border-l border-white/10 pl-3">
              {visibleClasses.length === 0 ? (
                <p className="py-3 text-sm text-slate-500">No classes</p>
              ) : (
                visibleClasses.map((grade) => {
                  const classSubjects = subjectsByClass.get(grade.id) ?? []
                  return (
                    <div key={grade.id}>
                      <button
                        type="button"
                        onClick={() => toggle(grade.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/5"
                      >
                        {expanded.has(grade.id) ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                        <span>{grade.name}</span>
                        <span className="text-xs text-slate-400">{classSubjects.length} subjects</span>
                      </button>
                      {expanded.has(grade.id) && (
                        <div className="ml-4 space-y-1 py-1">
                          {classSubjects.map((subject) => (
                            <div key={subject.id} className="px-2 py-1 text-sm text-slate-300">
                              {subject.name_bn || subject.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3 text-xs">
          <Link href="/dashboard/admin/curriculum/classes" className="text-violet-300 underline">
            Classes
          </Link>
          <Link href="/dashboard/admin/curriculum/subjects" className="text-violet-300 underline">
            Subjects
          </Link>
          <Link href="/dashboard/admin/curriculum/chapters" className="text-violet-300 underline">
            Chapters
          </Link>
          <Link href="/dashboard/admin/curriculum/lessons" className="text-violet-300 underline">
            Lessons
          </Link>
          <Link href="/dashboard/admin/curriculum/import" className="text-violet-300 underline">
            Import PDF
          </Link>
        </div>
      </div>
    </main>
  )
}
