import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ParentChildReportPanel from '@/components/parent/ParentChildReportPanel'

export default async function ParentChildHubPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'parent') redirect('/dashboard')

  const { data: relation } = await supabase
    .from('parent_children')
    .select('id')
    .eq('parent_id', user.id)
    .eq('child_id', childId)
    .maybeSingle()
  if (!relation) redirect('/dashboard/parent')

  const [{ data: child }, { data: student }, { data: progress }, { data: sessions }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', childId)
        .maybeSingle(),
      supabase
        .from('student_profiles')
        .select('class_level')
        .eq('user_id', childId)
        .maybeSingle(),
      supabase
        .from('learning_progress')
        .select('status, score, updated_at, completed_at')
        .eq('user_id', childId),
      supabase
        .from('user_sessions')
        .select('login_at, duration_minutes')
        .eq('user_id', childId)
        .order('login_at', { ascending: false })
        .limit(5),
    ])

  const completed = (progress ?? []).filter((p) => p.status === 'completed').length
  const tracked = (progress ?? []).length
  const scored = (progress ?? []).filter(
    (p) => typeof p.score === 'number' && p.score != null,
  )
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((s, p) => s + Number(p.score), 0) / scored.length)
      : null

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekCompleted = (progress ?? []).filter((p) => {
    if (p.status !== 'completed') return false
    const tm = p.completed_at || p.updated_at
    return tm && new Date(tm) >= weekAgo
  }).length
  const quizFails = scored.filter((p) => Number(p.score) < 60).length
  const streakDays = (() => {
    const days = new Set<string>()
    for (const p of progress ?? []) {
      const tm = p.completed_at || p.updated_at
      if (tm) days.add(new Date(tm).toISOString().slice(0, 10))
    }
    let s = 0
    const d = new Date()
    for (let i = 0; i < 30; i++) {
      const key = d.toISOString().slice(0, 10)
      if (days.has(key)) {
        s++
        d.setDate(d.getDate() - 1)
      } else if (i === 0) {
        d.setDate(d.getDate() - 1)
        continue
      } else break
    }
    return s
  })()

  const name = child?.full_name || 'সন্তান'
  const classLabel = student?.class_level?.replace(/_/g, ' ') || '—'

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(139,92,246,0.16),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.06),transparent_50%)]" />

      <div className="relative mx-auto max-w-2xl space-y-5 px-4 py-8">
        <Link
          href="/dashboard/parent"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          ← Parent Hub
        </Link>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 via-[#12122a]/95 to-fuchsia-600/10 p-5 shadow-[0_0_40px_-16px_rgba(139,92,246,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-black shadow-lg shadow-violet-500/30">
              {name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300/70">
                Child Hub · সন্তান
              </p>
              <h1 className="truncate text-xl font-black sm:text-2xl">{name}</h1>
              <p className="truncate text-xs text-slate-400">{child?.email}</p>
              <p className="mt-1.5 inline-flex rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-bold text-violet-200">
                🏫 {classLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Snapshot stats */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {[
            {
              value: String(completed),
              label: 'সম্পন্ন পাঠ',
              tone: 'text-emerald-400',
              border: 'border-white/8',
            },
            {
              value: String(weekCompleted),
              label: 'এই সপ্তাহে',
              tone: 'text-sky-400',
              border: 'border-white/8',
            },
            {
              value: avgScore != null ? `${avgScore}%` : '—',
              label: 'গড় স্কোর',
              tone: 'text-amber-400',
              border: 'border-white/8',
            },
            {
              value: String(quizFails),
              label: 'কুইজ <৬০%',
              tone: 'text-rose-300',
              border: 'border-rose-500/20 bg-rose-500/10',
            },
            {
              value: streakDays > 0 ? `🔥${streakDays}` : '0',
              label: 'স্ট্রিক (দিন)',
              tone: 'text-amber-200',
              border: 'border-amber-500/20 bg-amber-500/10',
            },
            {
              value: String(tracked),
              label: 'ট্র্যাকড',
              tone: 'text-violet-300',
              border: 'border-white/8',
            },
          ].map((c) => (
            <div
              key={c.label}
              className={`rounded-2xl border bg-white/[0.03] p-3.5 text-center backdrop-blur-sm ${c.border}`}
            >
              <p className={`text-2xl font-black ${c.tone}`}>{c.value}</p>
              <p className="text-[11px] text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Shikho-style guardian report */}
        <ParentChildReportPanel childId={childId} fallbackName={name} />

        <p className="text-center text-[11px] text-slate-500">
          শুধু এই সন্তানের ক্লাস ({classLabel}) এর অগ্রগতি · Guardian report
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/dashboard/parent/child/${childId}/progress`}
            className="rounded-3xl border border-violet-500/25 bg-[#100a1a] p-5 transition hover:bg-violet-500/10"
          >
            <p className="text-2xl">📈</p>
            <p className="mt-2 font-black">অগ্রগতি বিস্তারিত</p>
            <p className="mt-1 text-xs text-slate-400">পাঠ, স্কোর ও completion</p>
          </Link>
          <Link
            href={`/dashboard/parent/child/${childId}/sessions`}
            className="rounded-3xl border border-sky-500/25 bg-[#0a1220] p-5 transition hover:bg-sky-500/10"
          >
            <p className="text-2xl">⏱️</p>
            <p className="mt-2 font-black">লগইন সেশন</p>
            <p className="mt-1 text-xs text-slate-400">সময় ও ব্যবহারের ধরন</p>
          </Link>
        </div>

        {sessions && sessions.length > 0 && (
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="mb-3 text-sm font-black">সাম্প্রতিক সেশন</p>
            <ul className="space-y-2 text-sm text-slate-300">
              {sessions.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b border-white/5 py-2 text-xs last:border-0"
                >
                  <span>
                    {s.login_at
                      ? new Date(s.login_at).toLocaleString('bn-BD')
                      : '—'}
                  </span>
                  <span className="text-slate-500">
                    {s.duration_minutes != null
                      ? `${s.duration_minutes} মি.`
                      : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
