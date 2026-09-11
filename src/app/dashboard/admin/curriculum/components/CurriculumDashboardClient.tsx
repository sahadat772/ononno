'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  FilePlus2,
  FileText,
  FolderOpen,
  GraduationCap,
  LibraryBig,
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

const colors: Record<string, { border: string; glow: string; icon: string; line: string }> = {
  blue: { border: 'border-[#087dff]/55', glow: 'shadow-[0_0_28px_rgba(0,120,255,.12)]', icon: 'text-[#48a8ff]', line: '#1597ff' },
  green: { border: 'border-[#16b76a]/50', glow: 'shadow-[0_0_28px_rgba(22,183,106,.11)]', icon: 'text-[#41e88c]', line: '#26d87b' },
  purple: { border: 'border-[#a855f7]/55', glow: 'shadow-[0_0_28px_rgba(168,85,247,.12)]', icon: 'text-[#c66bff]', line: '#ae45f8' },
  orange: { border: 'border-[#f77b21]/55', glow: 'shadow-[0_0_28px_rgba(247,123,33,.12)]', icon: 'text-[#ff9d45]', line: '#ff6d17' },
  cyan: { border: 'border-[#0c9cbd]/55', glow: 'shadow-[0_0_28px_rgba(12,156,189,.12)]', icon: 'text-[#38d5f5]', line: '#16c7ec' },
  pink: { border: 'border-[#e344a7]/55', glow: 'shadow-[0_0_28px_rgba(227,68,167,.12)]', icon: 'text-[#f56bc1]', line: '#df3ba9' },
}

const STREAMS = [
  { id: 'science', label: 'বিজ্ঞান', labelEn: 'Science', icon: '🔬' },
  { id: 'commerce', label: 'বাণিজ্য', labelEn: 'Business Studies', icon: '💼' },
  { id: 'humanities', label: 'মানবিক', labelEn: 'Humanities', icon: '📖' },
] as const

function classBand(n: number): 'primary' | 'junior' | 'ssc_hsc' | 'other' {
  if (n >= 1 && n <= 5) return 'primary'
  if (n >= 6 && n <= 8) return 'junior'
  if (n >= 9 && n <= 12) return 'ssc_hsc'
  return 'other'
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 210 34" className="mt-4 h-9 w-full overflow-visible" aria-hidden="true">
      <path d="M1 24 L16 24 L27 24 L39 24 L50 24 L64 24 L75 24 L86 24 L99 23 L110 24 L122 18 L132 19 L143 11 L154 14 L165 13 L177 25 L188 18 L199 19 L209 10" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">{children}</span>
}

const actionItems = [
  { title: 'Import PDF', subtitle: 'Extract + Commit structure', Icon: Upload, color: 'blue', href: '/dashboard/admin/curriculum/import' },
  { title: 'Learning Analytics', subtitle: 'Students · sessions · weak', Icon: BarChart3, color: 'cyan', href: '/dashboard/admin/learning-analytics' },
  { title: 'Chapters', subtitle: 'Chapter management', Icon: ClipboardList, color: 'orange', href: '/dashboard/admin/curriculum/chapters' },
  { title: 'Lessons', subtitle: 'Review → Generate → Publish', Icon: Target, color: 'cyan', href: '/dashboard/admin/curriculum/lessons' },
  { title: 'AI Lesson', subtitle: 'Generate student study', Icon: Bot, color: 'pink', href: '/dashboard/admin/curriculum/lessons', badge: 'AI' },
  { title: 'Subjects', subtitle: 'Manage subjects', Icon: BookOpen, color: 'purple', href: '/dashboard/admin/curriculum/subjects' },
  { title: 'Classes', subtitle: 'Manage classes', Icon: GraduationCap, color: 'green', href: '/dashboard/admin/curriculum/classes' },
  { title: 'Versions', subtitle: 'Curriculum versions', Icon: FilePlus2, color: 'blue', href: '/dashboard/admin/curriculum/versions' },
] as const

export default function CurriculumDashboardClient({ stats, activeVersion, classes, subjects, sources }: Props) {
  const [query, setQuery] = useState('')
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root', 'band-primary', 'band-junior', 'band-ssc']))

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
        setSeedMsg(data.error || 'Seed ব্যর্থ')
        return
      }
      const s = data.summary
      setSeedMsg(`✅ Seed সম্পন্ন — Class ${s?.classes ?? 0}, Subject ${s?.subjects ?? 0}, Chapter ${s?.chapters ?? 0}, Lesson ${s?.lessons ?? 0}। পেজ রিফ্রেশ করো।`)
    } catch {
      setSeedMsg('Server error — আবার চেষ্টা করো')
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

  const draft = Math.max(0, stats.lessons - stats.published)
  const topStats = [
    ['Curriculum Versions', stats.versions || 1, LibraryBig, 'blue'],
    ['Classes', stats.classes, GraduationCap, 'green'],
    ['Subjects', stats.subjects, BookOpen, 'purple'],
    ['Lessons', stats.lessons, Target, 'orange'],
  ] as const

  const primary = visibleClasses.filter((c) => classBand(c.class_number) === 'primary').sort((a, b) => a.class_number - b.class_number)
  const junior = visibleClasses.filter((c) => classBand(c.class_number) === 'junior').sort((a, b) => a.class_number - b.class_number)
  const sscHsc = visibleClasses.filter((c) => classBand(c.class_number) === 'ssc_hsc').sort((a, b) => a.class_number - b.class_number)
  const other = visibleClasses.filter((c) => classBand(c.class_number) === 'other')

  const renderClass = (grade: ClassRow, stream?: (typeof STREAMS)[number]) => {
    const classSubjects = subjectsByClass.get(grade.id) ?? []
    const key = stream ? `${stream.id}-${grade.id}` : grade.id
    const label = stream ? `${grade.name} · ${stream.label}` : grade.name
    return (
      <div key={key}>
        <TreeRow
          open={expanded.has(key)}
          onToggle={() => toggle(key)}
          icon="🏫"
          label={label}
          meta={`${classSubjects.length} subjects`}
          href={stream ? `/dashboard/admin/curriculum/subjects?class=${grade.id}&stream=${stream.id}` : '/dashboard/admin/curriculum/subjects'}
        />
        {expanded.has(key) && (
          <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">
            {classSubjects.length === 0 ? (
              <p className="py-2 text-xs text-slate-500">No subjects{stream ? ` · ${stream.label}` : ''}</p>
            ) : (
              classSubjects.map((subject) => (
                <TreeRow
                  key={`${key}-${subject.id}`}
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
  }

  return (
    <main className="min-h-screen bg-[#030711] px-3 py-5 font-sans text-[#f7f7ff] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/admin"
              className="inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-600/80 bg-[#080d1b] px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:border-fuchsia-500/40 hover:text-pink-300"
            >
              ← Admin Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl border border-fuchsia-500/60 bg-linear-to-br from-fuchsia-900/50 to-slate-950 shadow-[0_0_25px_rgba(223,50,206,.25)]">
                <LibraryBig className="size-6 text-pink-300" />
              </div>
              <div>
                <h1 className="text-[clamp(1.65rem,3vw,2.55rem)] font-extrabold tracking-tight">
                  Curriculum <span className="bg-linear-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Management</span>
                </h1>
                <p className="mt-0.5 text-sm text-slate-400">১–৮ সাধারণ · ৯–১২ তিন শাখা (বিজ্ঞান · বাণিজ্য · মানবিক)</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/admin/learning-analytics" className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-200">
              <BarChart3 className="size-4" /> Analytics
            </Link>
            <button type="button" disabled={seedLoading} onClick={() => void runSeed(false)} className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-200 disabled:opacity-50">
              <Sparkles className="size-4" />{seedLoading ? 'Seeding…' : 'Seed Baseline'}
            </button>
            <Link href="/dashboard/admin/curriculum/import" className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold">
              <Wand2 className="size-4" /> Import PDF
            </Link>
          </div>
        </header>

        {(stats.classes === 0 || seedMsg) && (
          <div className={`rounded-xl border p-4 text-sm ${seedMsg?.startsWith('✅') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-100'}`}>
            {seedMsg ? <p>{seedMsg}</p> : <p>Curriculum DB খালি। Seed Baseline দিয়ে class যোগ করো।</p>}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topStats.map(([label, value, Icon, color]) => {
            const tone = colors[color]
            return (
              <article key={label} className={`rounded-xl border bg-linear-to-br from-[#0d1425] to-[#070b16] p-5 ${tone.border}`}>
                <div className={`grid size-14 place-items-center rounded-xl border ${tone.border} ${tone.icon}`}><Icon className="size-7" /></div>
                <p className="mt-4 text-xs text-slate-300">{label}</p>
                <p className="mt-1 text-4xl font-extrabold">{value}</p>
                <Sparkline color={tone.line} />
              </article>
            )
          })}
        </section>

        <section className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><span>🚀</span> Quick Actions</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {actionItems.map(({ title, subtitle, Icon, color, href, ...rest }) => {
              const tone = colors[color]
              const badge = 'badge' in rest ? (rest as { badge?: string }).badge : null
              return (
                <Link key={title} href={href} className={`group relative min-h-36 rounded-lg border bg-linear-to-br from-[#10192b] to-[#080c16] p-4 transition hover:-translate-y-1 ${tone.border}`}>
                  <div className={`mx-auto grid size-14 place-items-center rounded-2xl bg-white/4 ${tone.icon}`}><Icon className="size-8" /></div>
                  {badge && <span className="absolute right-3 top-3 rounded bg-pink-400/20 px-1.5 py-0.5 text-[10px] font-bold text-pink-200">{badge}</span>}
                  <h3 className="mt-3 text-center font-bold">{title}</h3>
                  <p className="mt-1 text-center text-xs text-slate-400">{subtitle}</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15]">
          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold"><FolderOpen className="size-5 text-sky-300" /> Curriculum Structure</h2>
              <p className="mt-1 text-xs text-slate-400">প্রাইমারি · জুনিয়র · ৯–১২ তিন শাখা</p>
            </div>
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="h-10 w-48 rounded-lg border border-slate-600 bg-[#0a1020] pl-9 pr-3 text-sm outline-none focus:border-violet-400" />
            </label>
          </div>

          <div className="px-5 pb-5">
            <TreeRow open={expanded.has('root')} onToggle={() => toggle('root')} icon="📚" label={activeVersion || 'NCTB Curriculum'} meta={`${stats.classes} classes`} root />
            {expanded.has('root') && (
              <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">
                {visibleClasses.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">No classes found</p>
                ) : (
                  <>
                    {primary.length > 0 && (
                      <div className="mb-1">
                        <TreeRow open={expanded.has('band-primary')} onToggle={() => toggle('band-primary')} icon="📚" label="প্রাইমারি (১–৫)" meta={`${primary.length} classes`} />
                        {expanded.has('band-primary') && <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">{primary.map((c) => renderClass(c))}</div>}
                      </div>
                    )}
                    {junior.length > 0 && (
                      <div className="mb-1">
                        <TreeRow open={expanded.has('band-junior')} onToggle={() => toggle('band-junior')} icon="🎯" label="জুনিয়র মাধ্যমিক (৬–৮)" meta={`${junior.length} classes`} />
                        {expanded.has('band-junior') && <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">{junior.map((c) => renderClass(c))}</div>}
                      </div>
                    )}
                    {sscHsc.length > 0 && (
                      <div className="mb-1">
                        <TreeRow open={expanded.has('band-ssc')} onToggle={() => toggle('band-ssc')} icon="🏫" label="নবম–দ্বাদশ · তিন শাখা" meta={`${sscHsc.length} classes · ৩ শাখা`} />
                        {expanded.has('band-ssc') && (
                          <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">
                            {STREAMS.map((stream) => (
                              <div key={stream.id}>
                                <TreeRow open={expanded.has(`stream-${stream.id}`)} onToggle={() => toggle(`stream-${stream.id}`)} icon={stream.icon} label={`${stream.label} (${stream.labelEn})`} meta="Class 9–12" />
                                {expanded.has(`stream-${stream.id}`) && (
                                  <div className="ml-5 border-l border-dotted border-slate-600/70 pl-3">
                                    {sscHsc.map((grade) => renderClass(grade, stream))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {other.map((c) => renderClass(c))}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {sources.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-linear-to-br from-[#0b1223] to-[#070b15]">
            <div className="flex items-center justify-between border-b border-slate-700/70 px-5 py-4">
              <h2 className="flex items-center gap-2 font-bold"><FileText className="size-5 text-emerald-300" /> PDF Sources</h2>
              <Link href="/dashboard/admin/curriculum/import" className="text-xs font-semibold text-violet-300">Import →</Link>
            </div>
            <div className="divide-y divide-slate-800/90">
              {sources.slice(0, 5).map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.source_status} · {s.workflow_status}</p>
                  </div>
                  <StatusPill>{s.workflow_status}</StatusPill>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total Lessons', String(stats.lessons), 'All curriculum lessons', '⚡', 'blue'],
            ['Published', String(stats.published), 'Live for students', '✓', 'green'],
            ['Draft / pipeline', String(draft), 'Not yet published', '✎', 'orange'],
            ['Ready to generate', String(stats.reviewed), 'Reviewed status', '✹', 'purple'],
          ].map(([title, value, subtitle, symbol, color]) => {
            const tone = colors[color as string]
            return (
              <Link key={String(title)} href="/dashboard/admin/curriculum/lessons" className={`overflow-hidden rounded-xl border bg-linear-to-br from-[#10192b] to-[#080c16] ${tone.border}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className={`grid size-12 place-items-center rounded-xl border text-xl ${tone.border} ${tone.icon}`}>{symbol}</div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-2xl font-extrabold">{value}</p>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                  </div>
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
  open, onToggle, icon, label, meta, root, leaf, href,
}: {
  open: boolean
  onToggle: () => void
  icon: string
  label: string
  meta: string
  root?: boolean
  leaf?: boolean
  href?: string
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${root ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}>
      {!leaf ? (
        <button type="button" onClick={onToggle} className="grid size-6 place-items-center text-slate-400">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      ) : (
        <span className="size-6" />
      )}
      <span className="text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${root ? 'text-white' : 'text-slate-100'}`}>{label}</p>
        <p className="truncate text-[11px] text-slate-500">{meta}</p>
      </div>
      {href && (
        <Link href={href} className="text-[11px] font-semibold text-violet-300 hover:text-violet-200">Open</Link>
      )}
    </div>
  )
}
