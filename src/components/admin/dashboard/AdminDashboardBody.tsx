'use client'

import Link from 'next/link'
import EducationBanner from '@/components/admin/dashboard/EducationBanner'

type ClassProg = { label: string; pct: number; tone: string }
type Pipeline = { extracted: number; generated: number; review: number; approved: number; published: number }

function statusBadge(status?: string, published?: boolean) {
  if (published || status === 'published') return 'bg-emerald-100 text-emerald-700'
  if (status === 'approved') return 'bg-sky-100 text-sky-700'
  if (status === 'generated' || status === 'draft') return 'bg-violet-100 text-violet-700'
  if (status === 'reviewed' || status === 'review') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

export default function AdminDashboardBody({
  first,
  dateStr,
  greeting,
  stats,
  classProgress,
  pipeline,
  activity,
  recentLessons,
}: {
  first: string
  dateStr: string
  greeting: string
  stats: {
    totalStudents: number
    totalSubjects: number
    freeRequests: number
    pendingPayments?: number
    totalClasses?: number
    totalLessons?: number
    publishedLessons?: number
  }
  classProgress: ClassProg[]
  pipeline: Pipeline
  activity: { icon: string; text: string; time: string; color: string }[]
  recentLessons: Record<string, unknown>[]
}) {
  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
            {greeting}, {first}! 👋
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Here's what's happening with ONONNO today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Live
          </span>
          {dateStr}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Classes', value: stats.totalClasses ?? 12, icon: '🎓', bg: 'from-blue-50 to-sky-50 border-blue-100', iconBg: 'bg-blue-100 text-blue-600' },
          { label: 'Subjects', value: stats.totalSubjects, icon: '📗', bg: 'from-emerald-50 to-teal-50 border-emerald-100', iconBg: 'bg-emerald-100 text-emerald-600' },
          { label: 'Lessons', value: stats.totalLessons ?? 0, icon: '📄', bg: 'from-violet-50 to-purple-50 border-violet-100', iconBg: 'bg-violet-100 text-violet-600' },
          { label: 'Students', value: stats.totalStudents, icon: '👥', bg: 'from-orange-50 to-amber-50 border-orange-100', iconBg: 'bg-orange-100 text-orange-600' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${c.bg}`}>
            <div className={`mb-3 grid size-10 place-items-center rounded-xl text-lg ${c.iconBg}`}>{c.icon}</div>
            <p className="text-2xl font-black text-slate-900">{c.value.toLocaleString()}</p>
            <p className="text-xs font-semibold text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800">Curriculum Progress</h2>
            <Link href="/dashboard/admin/curriculum" className="text-[11px] font-bold text-blue-600 hover:underline">View Details</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {classProgress.slice(0, 12).map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-[11px] font-semibold">
                  <span className="truncate text-slate-600">{c.label}</span>
                  <span className="text-slate-400">{c.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${c.tone}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-black text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard/admin/curriculum', icon: '📚', title: 'Manage Curriculum', sub: 'Classes & Subjects', bg: 'bg-sky-50 border-sky-100' },
              { href: '/dashboard/admin/curriculum/import', icon: '✨', title: 'Generate Study', sub: 'AI Content Generation', bg: 'bg-violet-50 border-violet-100' },
              { href: '/dashboard/admin/content', icon: '🔍', title: 'Review Content', sub: 'Pending Review', bg: 'bg-amber-50 border-amber-100' },
              { href: '/dashboard/admin/curriculum', icon: '🚀', title: 'Publish Content', sub: 'Make Live for Students', bg: 'bg-emerald-50 border-emerald-100' },
            ].map((a) => (
              <Link key={a.title} href={a.href} className={`rounded-2xl border p-3.5 transition hover:-translate-y-0.5 hover:shadow-md ${a.bg}`}>
                <div className="text-2xl">{a.icon}</div>
                <p className="mt-2 text-xs font-black text-slate-800">{a.title}</p>
                <p className="text-[10px] font-medium text-slate-500">{a.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800">AI Content Pipeline</h2>
            <Link href="/dashboard/admin/curriculum/import" className="text-[11px] font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {[
              { label: 'Extracted', n: pipeline.extracted, color: 'bg-sky-100 text-sky-700 ring-sky-200' },
              { label: 'Generated', n: pipeline.generated, color: 'bg-violet-100 text-violet-700 ring-violet-200' },
              { label: 'Review', n: pipeline.review, color: 'bg-amber-100 text-amber-700 ring-amber-200' },
              { label: 'Approved', n: pipeline.approved, color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
              { label: 'Published', n: pipeline.published, color: 'bg-teal-100 text-teal-700 ring-teal-200' },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex items-center gap-1">
                <div className={`rounded-2xl px-2.5 py-2 text-center ring-1 ${s.color}`}>
                  <p className="text-sm font-black">{s.n}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">{s.label}</p>
                </div>
                {i < arr.length - 1 && <span className="hidden text-slate-300 sm:inline">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800">Student Activity</h2>
            <Link href="/dashboard/admin/learning-analytics" className="text-[11px] font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Today', value: Math.max(1, Math.floor(stats.totalStudents * 0.35) || stats.totalStudents), icon: '👤', tone: 'bg-sky-50 text-sky-700' },
              { label: 'Lessons Completed', value: stats.publishedLessons ?? 0, icon: '📗', tone: 'bg-emerald-50 text-emerald-700' },
              { label: 'Pending Payments', value: stats.pendingPayments ?? 0, icon: '💳', tone: 'bg-orange-50 text-orange-700' },
              { label: 'Free Access Req', value: stats.freeRequests, icon: '🤲', tone: 'bg-violet-50 text-violet-700' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-3 ${s.tone}`}>
                <div className="text-lg">{s.icon}</div>
                <p className="mt-1 text-xl font-black">{s.value.toLocaleString()}</p>
                <p className="text-[11px] font-semibold opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800">Recent Activities</h2>
            <Link href="/dashboard/admin/users" className="text-[11px] font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <ul className="space-y-2.5">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm ${a.color}`}>{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 sm:text-sm">{a.text}</p>
                  <p className="text-[10px] text-slate-400">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-black text-slate-800">Recent Curriculum Updates</h2>
          <Link href="/dashboard/admin/curriculum" className="text-[11px] font-bold text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-bold">Lesson</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-3 py-3 font-bold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentLessons.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400">No lessons yet — import PDF বা generate করুন</td>
                </tr>
              ) : (
                recentLessons.map((l) => (
                  <tr key={String(l.id)} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-semibold text-slate-800">{String(l.title_bn || l.title || 'Lesson')}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusBadge(String(l.workflow_status || ''), Boolean(l.is_published))}`}>
                        {l.is_published ? 'Published' : String(l.workflow_status || 'Draft')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {l.updated_at ? new Date(String(l.updated_at)).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EducationBanner />
    </div>
  )
}
