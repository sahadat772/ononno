'use client'

import Link from 'next/link'
import {
  BookOpen,
  ClipboardList,
  FileText,
  FolderOpen,
  GraduationCap,
  LibraryBig,
  Sparkles,
  Target,
  Upload,
  Wand2,
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

const quickLinks = [
  {
    href: '/dashboard/admin/curriculum/import',
    title: 'Import PDF',
    subtitle: 'Catalog → Extract → Commit',
    icon: Upload,
    tone: 'from-violet-500 to-fuchsia-500',
  },
  {
    href: '/dashboard/admin/curriculum/chapters',
    title: 'Chapters',
    subtitle: 'অধ্যায় ম্যানেজমেন্ট',
    icon: ClipboardList,
    tone: 'from-violet-500 to-purple-500',
  },
  {
    href: '/dashboard/admin/curriculum/lessons',
    title: 'Lessons',
    subtitle: 'Review → Generate → Publish',
    icon: BookOpen,
    tone: 'from-amber-500 to-orange-500',
  },
  {
    href: '/dashboard/admin/curriculum/subjects',
    title: 'Subjects',
    subtitle: 'Subject list',
    icon: Target,
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    href: '/dashboard/admin/curriculum/classes',
    title: 'Classes',
    subtitle: 'শ্রেণি তালিকা',
    icon: GraduationCap,
    tone: 'from-sky-500 to-blue-500',
  },
  {
    href: '/dashboard/admin/curriculum/versions',
    title: 'Versions',
    subtitle: 'Curriculum versions',
    icon: LibraryBig,
    tone: 'from-pink-500 to-rose-500',
  },
]

export default function CurriculumDashboardClient({
  stats,
  activeVersion,
  classes,
  subjects,
  sources,
}: Props) {
  const draft = Math.max(0, stats.lessons - stats.published)

  return (
    <main className="min-h-screen bg-[#030711] px-3 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/10">
              <LibraryBig className="size-6 text-pink-300" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Curriculum{' '}
                <span className="bg-linear-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                AI generates → Admin reviews → Publish → Student learns
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg border border-slate-600 bg-[#080d1b] px-3 py-2 text-xs">
              <span className="block text-slate-500">Active Version</span>
              <span className="font-bold text-white">{activeVersion}</span>
            </span>
            <Link
              href="/dashboard/admin/curriculum/import"
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Wand2 className="size-4" /> Import PDF
            </Link>
          </div>
        </header>

        {/* Workflow strip */}
        <section className="rounded-xl border border-violet-500/25 bg-violet-950/20 px-4 py-3 text-sm text-violet-100">
          <p className="font-semibold flex items-center gap-2">
            <Sparkles className="size-4" /> ONONNO workflow
          </p>
          <p className="mt-1 text-xs text-violet-200/80">
            1) Import PDF → 2) Extract + Commit (chapters/lessons) → 3) Review → 4) Generate study+quiz → 5) Approve → 6) Publish
          </p>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Classes', value: stats.classes, icon: GraduationCap, color: 'text-sky-300 border-sky-400/40' },
            { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'text-emerald-300 border-emerald-400/40' },
            { label: 'Chapters', value: stats.chapters, icon: ClipboardList, color: 'text-violet-300 border-violet-400/40' },
            { label: 'Lessons', value: stats.lessons, icon: Target, color: 'text-amber-300 border-amber-400/40' },
          ].map((s) => (
            <article
              key={s.label}
              className={`rounded-xl border bg-linear-to-br from-[#0d1425] to-[#070b16] p-5 ${s.color.split(' ')[1]}`}
            >
              <div className={`grid size-11 place-items-center rounded-xl border bg-white/5 ${s.color}`}>
                <s.icon className="size-5" />
              </div>
              <p className="mt-4 text-xs text-slate-400">{s.label}</p>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
            </article>
          ))}
        </section>

        {/* Lesson pipeline */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Published', value: stats.published, href: '/dashboard/admin/curriculum/lessons', hint: 'Student live' },
            { label: 'Reviewed (ready)', value: stats.reviewed, href: '/dashboard/admin/curriculum/lessons', hint: 'Generate করো' },
            { label: 'Generated', value: stats.generated, href: '/dashboard/admin/curriculum/lessons', hint: 'Approve/Publish' },
            { label: 'Not published', value: draft, href: '/dashboard/admin/curriculum/lessons', hint: 'Draft pool' },
          ].map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-xl border border-slate-700/80 bg-[#0b1223] p-4 transition hover:border-violet-400/40 hover:bg-[#0f1830]"
            >
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-[11px] text-violet-300">{s.hint} →</p>
            </Link>
          ))}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <FolderOpen className="size-5 text-sky-300" /> Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-slate-700/80 bg-linear-to-br from-[#10192b] to-[#080c16] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div
                  className={`grid size-12 place-items-center rounded-xl bg-linear-to-br ${item.tone} text-white shadow-lg`}
                >
                  <item.icon className="size-6" />
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-violet-200">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PDF sources */}
        <section className="rounded-xl border border-slate-700/80 bg-[#0b1223] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/70 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 font-bold">
                <FileText className="size-5 text-emerald-300" /> PDF Sources
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Supabase catalog (latest)</p>
            </div>
            <Link href="/dashboard/admin/curriculum/import" className="text-xs font-semibold text-violet-300 hover:text-violet-200">
              Import →
            </Link>
          </div>
          {sources.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">এখনো কোনো PDF source নেই। Import page থেকে শুরু করো।</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {sources.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-slate-500">
                      {s.source_status} · {s.workflow_status} · ch {s.total_chapters} · les {s.total_lessons}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/admin/curriculum/import"
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5"
                  >
                    Open Import
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Classes + subjects snapshot */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-700/80 bg-[#0b1223] overflow-hidden">
            <div className="border-b border-slate-700/70 px-5 py-4 flex justify-between">
              <h2 className="font-bold">Classes</h2>
              <Link href="/dashboard/admin/curriculum/classes" className="text-xs text-violet-300">
                All →
              </Link>
            </div>
            <ul className="max-h-64 overflow-y-auto divide-y divide-slate-800">
              {classes.length === 0 ? (
                <li className="p-4 text-sm text-slate-500">No classes</li>
              ) : (
                classes.map((c) => (
                  <li key={c.id} className="px-5 py-2.5 text-sm flex justify-between">
                    <span className="text-white">{c.name}</span>
                    <span className="text-slate-500 text-xs">#{c.class_number}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-[#0b1223] overflow-hidden">
            <div className="border-b border-slate-700/70 px-5 py-4 flex justify-between">
              <h2 className="font-bold">Subjects (sample)</h2>
              <Link href="/dashboard/admin/curriculum/subjects" className="text-xs text-violet-300">
                All →
              </Link>
            </div>
            <ul className="max-h-64 overflow-y-auto divide-y divide-slate-800">
              {subjects.length === 0 ? (
                <li className="p-4 text-sm text-slate-500">No subjects</li>
              ) : (
                subjects.slice(0, 15).map((s) => (
                  <li key={s.id} className="px-5 py-2.5 text-sm flex justify-between gap-2">
                    <span className="text-white truncate">{s.name_bn || s.name}</span>
                    <span className="text-slate-500 text-xs shrink-0">{s.name}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
