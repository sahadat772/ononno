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

const colors: Record<
  string,
  { border: string; glow: string; icon: string; line: string }
> = {
  blue: {
    border: 'border-[#087dff]/55',
    glow: 'shadow-[0_0_28px_rgba(0,120,255,.12)]',
    icon: 'text-[#48a8ff]',
    line: '#1597ff',
  },
  green: {
    border: 'border-[#16b76a]/50',
    glow: 'shadow-[0_0_28px_rgba(22,183,106,.11)]',
    icon: 'text-[#41e88c]',
    line: '#26d87b',
  },
  purple: {
    border: 'border-[#a855f7]/55',
    glow: 'shadow-[0_0_28px_rgba(168,85,247,.12)]',
    icon: 'text-[#c66bff]',
    line: '#ae45f8',
  },
  orange: {
    border: 'border-[#f77b21]/55',
    glow: 'shadow-[0_0_28px_rgba(247,123,33,.12)]',
    icon: 'text-[#ff9d45]',
    line: '#ff6d17',
  },
  cyan: {
    border: 'border-[#0c9cbd]/55',
    glow: 'shadow-[0_0_28px_rgba(12,156,189,.12)]',
    icon: 'text-[#38d5f5]',
    line: '#16c7ec',
  },
  pink: {
    border: 'border-[#e344a7]/55',
    glow: 'shadow-[0_0_28px_rgba(227,68,167,.12)]',
    icon: 'text-[#f56bc1]',
    line: '#df3ba9',
  },
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 210 34"
      className="mt-4 h-9 w-full overflow-visible"
      aria-hidden="true"
    >
      <path
        d="M1 24 L16 24 L27 24 L39 24 L50 24 L64 24 L75 24 L86 24 L99 23 L110 24 L122 18 L132 19 L143 11 L154 14 L165 13 L177 25 L188 18 L199 19 L209 10"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill={color}>
        {[1, 23, 45, 67, 90, 111, 132, 154, 177, 209].map((cx, index) => (
          <circle
            key={cx}
            cx={cx}
            cy={[24, 24, 24, 24, 23, 24, 19, 14, 25, 10][index]}
            r="1.8"
          />
        ))}
      </g>
    </svg>
  )
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
      {children}
    </span>
  )
}

const actionItems = [
  {
    title: 'Import PDF',
    subtitle: 'Extract + Commit structure',
    Icon: Upload,
    color: 'blue',
    href: '/dashboard/admin/curriculum/import',
  },
  {
    title: 'Learning Analytics',
    subtitle: 'Students · sessions · weak',
    Icon: BarChart3,
    color: 'cyan',
    href: '/dashboard/admin/learning-analytics',
  },
  {
    title: 'Chapters',
    subtitle: 'Chapter management',
    Icon: ClipboardList,
    color: 'orange',
    href: '/dashboard/admin/curriculum/chapters',
  },
  {
    title: 'Lessons',
    subtitle: 'Review → Generate → Publish',
    Icon: Target,
    color: 'cyan',
    href: '/dashboard/admin/curriculum/lessons',
  },
  {
    title: 'AI Lesson',
    subtitle: 'Generate student study',
    Icon: Bot,
    color: 'pink',
    href: '/dashboard/admin/curriculum/lessons',
    badge: 'AI',
  },
  {
    title: 'Subjects',
    subtitle: 'Manage subjects',
    Icon: BookOpen,
    color: 'purple',
    href: '/dashboard/admin/curriculum/subjects',
  },
  {
    title: 'Classes',
    subtitle: 'Manage classes',
    Icon: GraduationCap,
    color: 'green',
    href: '/dashboard/admin/curriculum/classes',
  },
  {
    title: 'Versions',
    subtitle: 'Curriculum versions',
    Icon: FilePlus2,
    color: 'blue',
    href: '/dashboard/admin/curriculum/versions',
  },
] as const

export default function CurriculumDashboardClient({
  stats,
  activeVersion,
  classes,
  subjects,
  sources,
}: Props) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const first = classes[0]?.id
    return new Set(first ? ['root', first] : ['root'])
  })

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
      const subNames = (subjectsByClass.get(c.id) ?? []).map(
        (s) => `${s.name} ${s.name_bn}`,
      )
      return [c.name, ...subNames].some((item) =>
        item.toLocaleLowerCase().includes(text),
      )
    })
  }, [classes, query, subjectsByClass])

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const draft = Math.max(0, stats.lessons - stats.published)

  const topStats = [
    ['Curriculum Versions', stats.versions || 1, LibraryBig, 'blue'],
    ['Classes', stats.classes, GraduationCap, 'green'],
    ['Subjects', stats.subjects, BookOpen, 'purple'],
    ['Lessons', stats.lessons, Target, 'orange'],
  ] as const

  const bottomStats = [
    ['Total Lessons', String(stats.lessons), 'All curriculum lessons', '⚡', 'blue'],
    ['Published', String(stats.published), 'Live for students', '✓', 'green'],
    ['Draft / pipeline', String(draft), 'Not yet published', '✎', 'orange'],
    ['Ready to generate', String(stats.reviewed), 'Reviewed status', '✹', 'purple'],
  ] as const

  return (
    <main className="min-h-screen bg-[#030711] px-3 py-5 font-sans text-[#f7f7ff] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-fuchsia-500/60 bg-linear-to-br from-fuchsia-900/50 to-slate-950 shadow-[0_0_25px_rgba(223,50,206,.25)]">
              <LibraryBig className="size-6 text-pink-300" />
            </div>
            <div>
              <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                Curriculum{' '}
                <span className="bg-linear-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage NCTB Curriculum, Classes, Subjects, Chapters and Lessons.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex min-w-40 items-center justify-between rounded-lg border border-slate-600 bg-[#080d1b] px-3 py-2 text-left"
            >
              <span>
                <span className="block text-[10px] text-slate-400">Active Version</span>
                <span className="block text-sm font-bold">{activeVersion}</span>
              </span>
              <ChevronDown className="size-4 text-slate-300" />
            </button>
            <Link
              href="/dashboard/admin/learning-analytics"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20"
            >
              <BarChart3 className="size-4" /> Analytics
            </Link>
            <Link
              href="/dashboard/admin/curriculum/import"
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold shadow-lg shadow-fuchsia-900/30"
            >
              <Wand2 className="size-4" /> Import PDF
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topStats.map(([label, value, Icon, color]) => {
            const tone = colors[color]
            return (
              <article
                key={label}
                className={`rounded-xl border bg-linear-to-br from-[#0d1425] to-[#070b16] p-5 ${tone.border} ${tone.glow}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`grid size-14 place-items-center rounded-xl border ${tone.border} bg-white/3 shadow-[0_0_22px_currentColor] ${tone.icon}`}
                  >
                    <Icon className="size-7" />
                  </div>
                  <MoreVertical className="size-4 text-slate-400" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-slate-300">{label}</p>
                  <p className="mt-1 text-4xl font-extrabold">{value}</p>
                </div>
                <div className="mt-5 flex items-center gap-3 text-xs">
                  <span className="font-bold text-emerald-400">Live data</span>
                  <span className="text-slate-400">from Supabase</span>
                </div>
                <Sparkline color={tone.line} />
              </article>
            )
          })}
        </section>

        <section className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15] p-5 shadow-[0_15px_50px_rgba(0,0,0,.25)]">
          <Sparkles className="absolute right-5 top-5 size-6 text-violet-400" />
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span className="text-xl">🚀</span> Quick Actions
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            AI generates → Admin reviews → Publish → Student learns
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {actionItems.map(({ title, subtitle, Icon, color, href, ...rest }) => {
              const tone = colors[color]
              const badge = 'badge' in rest ? rest.badge : null
              return (
                <Link
                  key={title}
                  href={href}
                  className={`group relative min-h-44 rounded-lg border bg-linear-to-br from-[#10192b] to-[#080c16] p-4 transition hover:-translate-y-1 ${tone.border} ${tone.glow}`}
                >
                  <div
                    className={`mx-auto grid size-16 place-items-center rounded-2xl bg-white/4 ${tone.icon} shadow-[0_0_30px_currentColor]`}
                  >
                    <Icon className="size-9" />
                  </div>
                  {badge && (
                    <span className="absolute right-3 top-3 rounded bg-pink-400/20 px-1.5 py-0.5 text-[10px] font-bold text-pink-200">
                      {badge}
                    </span>
                  )}
                  <h3 className="mt-4 text-center font-bold text-white">{title}</h3>
                  <p className="mt-1 text-center text-xs text-slate-400">{subtitle}</p>
                  <ArrowRight className="absolute bottom-3 right-3 size-4 text-slate-300 transition group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15]">
          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <FolderOpen className="size-5 text-sky-300" /> Curriculum Structure
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Live hierarchy from database — click a class to expand subjects
              </p>
            </div>
            <div className="flex gap-3">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="h-10 w-48 rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none focus:border-violet-400"
                />
              </label>
              <button
                type="button"
                aria-label="Filter"
                className="grid size-10 place-items-center rounded-lg border border-slate-600 bg-[#0a1020]"
              >
                <Filter className="size-4" />
              </button>
              <Link
                href="/dashboard/admin/curriculum/import"
                className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-bold"
              >
                <CirclePlus className="size-4" /> Add
              </Link>
            </div>
          </div>

          <div className="mx-5 mb-2 hidden grid-cols-[1fr_90px_110px_120px] rounded-t-md border border-slate-700/80 bg-slate-800/70 px-3 py-3 text-xs font-semibold text-slate-200 md:grid">
            <span>Name</span>
            <span>Count</span>
            <span>Status</span>
            <span>Open</span>
          </div>

          <div className="px-5 pb-5">
            <TreeRow
              open={expanded.has('root')}
              onToggle={() => toggle('root')}
              icon="📚"
              label={activeVersion || 'NCTB Curriculum'}
              meta={`${stats.classes} classes`}
              root
            />
            {expanded.has('root') && (
              <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">
                {visibleClasses.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">No classes found</p>
                ) : (
                  visibleClasses.map((grade) => {
                    const classSubjects = subjectsByClass.get(grade.id) ?? []
                    return (
                      <div key={grade.id}>
                        <TreeRow
                          open={expanded.has(grade.id)}
                          onToggle={() => toggle(grade.id)}
                          icon="🏫"
                          label={grade.name}
                          meta={`${classSubjects.length} subjects`}
                          href={`/dashboard/admin/curriculum/subjects`}
                        />
                        {expanded.has(grade.id) && (
                          <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">
                            {classSubjects.length === 0 ? (
                              <p className="py-2 text-xs text-slate-500">No subjects</p>
                            ) : (
                              classSubjects.map((subject) => (
                                <TreeRow
                                  key={subject.id}
                                  open={false}
                                  onToggle={() => undefined}
                                  icon="📖"
                                  label={subject.name_bn || subject.name}
                                  meta={subject.name}
                                  leaf
                                  href="/dashboard/admin/curriculum/chapters"
                                />
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </section>

        {sources.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15]">
            <div className="flex items-center justify-between border-b border-slate-700/70 px-5 py-4">
              <h2 className="flex items-center gap-2 font-bold">
                <FileText className="size-5 text-emerald-300" /> PDF Sources
              </h2>
              <Link
                href="/dashboard/admin/curriculum/import"
                className="text-xs font-semibold text-violet-300 hover:text-violet-200"
              >
                Import →
              </Link>
            </div>
            <div className="divide-y divide-slate-800/90">
              {sources.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-slate-500">
                      {s.source_status} · {s.workflow_status} · {s.total_chapters} ch ·{' '}
                      {s.total_lessons} lessons
                    </p>
                  </div>
                  <StatusPill>{s.workflow_status}</StatusPill>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {bottomStats.map(([title, value, subtitle, symbol, color]) => {
            const tone = colors[color]
            return (
              <Link
                key={title}
                href="/dashboard/admin/curriculum/lessons"
                className={`overflow-hidden rounded-xl border bg-linear-to-br from-[#10192b] to-[#080c16] transition hover:-translate-y-0.5 ${tone.border}`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div
                    className={`grid size-12 place-items-center rounded-xl border text-xl ${tone.border} ${tone.icon}`}
                  >
                    {symbol}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p>
                  </div>
                </div>
                <div
                  className={`border-t border-white/10 px-4 py-3 text-xs font-semibold ${tone.icon}`}
                >
                  View {title} <ArrowRight className="ml-1 inline size-3.5" />
                </div>
              </Link>
            )
          })}
        </section>
      </div>
    </main>
  )
}

function TreeRow({
  open,
  onToggle,
  icon,
  label,
  meta,
  root = false,
  leaf = false,
  href,
}: {
  open: boolean
  onToggle: () => void
  icon: string
  label: string
  meta?: string
  root?: boolean
  leaf?: boolean
  href?: string
}) {
  return (
    <div className="grid grid-cols-[1fr_90px_110px_120px] items-center border-b border-slate-800/80 py-2.5 text-sm last:border-0">
      <button type="button" onClick={onToggle} className="flex min-w-0 items-center gap-2 text-left">
        <span className="grid size-5 place-items-center rounded-full bg-slate-800 text-slate-300">
          {leaf ? (
            <ChevronRight className="size-3" />
          ) : open ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
        </span>
        <span>{icon}</span>
        <span className={root ? 'font-bold' : 'font-semibold truncate'}>{label}</span>
        {!leaf && <StatusPill>Active</StatusPill>}
      </button>
      <span className="text-slate-300 text-xs truncate">{meta ?? '—'}</span>
      <StatusPill>Live</StatusPill>
      <span className="flex gap-2">
        {href ? (
          <Link
            href={href}
            className="grid size-7 place-items-center rounded-full border border-slate-600/70 bg-slate-800/80 text-slate-300 hover:border-violet-400 hover:text-white"
            title="Open"
          >
            <Eye className="size-3.5" />
          </Link>
        ) : (
          <span className="grid size-7 place-items-center rounded-full border border-slate-700 text-slate-600">
            <Eye className="size-3.5" />
          </span>
        )}
      </span>
    </div>
  )
}
