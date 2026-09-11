import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  const name = child?.full_name || 'সন্তান'
  const classLabel = student?.class_level?.replace(/_/g, ' ') || '—'

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <Link
          href="/dashboard/parent"
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
        >
          ← Parent Hub
        </Link>

        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-[#12122a] to-fuchsia-500/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-black">
              {name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black">{name}</h1>
              <p className="text-xs text-slate-400">{child?.email}</p>
              <p className="mt-1 text-xs font-semibold text-violet-300">{classLabel}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#12122a] p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">{completed}</p>
            <p className="text-[11px] text-slate-500">সম্পন্ন পাঠ</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#12122a] p-4 text-center">
            <p className="text-2xl font-black text-sky-400">{tracked}</p>
            <p className="text-[11px] text-slate-500">ট্র্যাকড</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#12122a] p-4 text-center">
            <p className="text-2xl font-black text-amber-400">
              {avgScore != null ? `${avgScore}%` : '—'}
            </p>
            <p className="text-[11px] text-slate-500">গড় স্কোর</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/dashboard/parent/child/${childId}/progress`}
            className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-5 transition hover:bg-violet-500/15"
          >
            <p className="text-2xl">📈</p>
            <p className="mt-2 font-bold">অগ্রগতি বিস্তারিত</p>
            <p className="mt-1 text-xs text-slate-400">পাঠ, স্কোর ও completion</p>
          </Link>
          <Link
            href={`/dashboard/parent/child/${childId}/sessions`}
            className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-5 transition hover:bg-sky-500/15"
          >
            <p className="text-2xl">⏱️</p>
            <p className="mt-2 font-bold">লগইন সেশন</p>
            <p className="mt-1 text-xs text-slate-400">সময় ও ব্যবহারের ধরন</p>
          </Link>
        </div>

        {sessions && sessions.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#12122a] p-4">
            <p className="mb-3 text-sm font-bold">সাম্প্রতিক সেশন</p>
            <ul className="space-y-2 text-sm text-slate-300">
              {sessions.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b border-white/5 py-2 text-xs"
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
