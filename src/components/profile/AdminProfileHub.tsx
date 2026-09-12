'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type Profile = Record<string, string> | null

type Counts = {
  classes: number
  subjects: number
  chapters: number
  lessons: number
  published: number
  users: number
}

export default function AdminProfileHub({ profile }: { profile: Profile }) {
  const name = profile?.full_name || 'Admin'
  const [counts, setCounts] = useState<Counts>({
    classes: 0,
    subjects: 0,
    chapters: 0,
    lessons: 0,
    published: 0,
    users: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [c, s, ch, l, p, u] = await Promise.all([
          supabase.from('curriculum_classes').select('id', { count: 'exact', head: true }),
          supabase.from('curriculum_subjects').select('id', { count: 'exact', head: true }),
          supabase.from('curriculum_chapters').select('id', { count: 'exact', head: true }),
          supabase.from('curriculum_lessons').select('id', { count: 'exact', head: true }),
          supabase
            .from('curriculum_lessons')
            .select('id', { count: 'exact', head: true })
            .eq('is_published', true),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ])
        setCounts({
          classes: c.count ?? 0,
          subjects: s.count ?? 0,
          chapters: ch.count ?? 0,
          lessons: l.count ?? 0,
          published: p.count ?? 0,
          users: u.count ?? 0,
        })
      } catch {
        /* ignore */
      }
    }
    void load()
  }, [])

  const pubPct =
    counts.lessons > 0 ? Math.round((counts.published / counts.lessons) * 100) : 0
  const pendingPct = Math.max(0, 100 - pubPct)

  const quick = [
    {
      href: '/dashboard/admin/curriculum/import',
      icon: '📥',
      label: 'Import Curriculum',
      sub: 'From Google Drive',
      color: 'border-sky-500/30 bg-sky-500/10',
    },
    {
      href: '/dashboard/admin/curriculum/lessons',
      icon: '🤖',
      label: 'AI Generation',
      sub: 'Generate study content',
      color: 'border-violet-500/30 bg-violet-500/10',
    },
    {
      href: '/dashboard/admin/curriculum/lessons',
      icon: '✅',
      label: 'Review Content',
      sub: 'Check & approve',
      color: 'border-amber-500/30 bg-amber-500/10',
    },
    {
      href: '/dashboard/admin/curriculum',
      icon: '🚀',
      label: 'Publish Content',
      sub: 'Make live for students',
      color: 'border-rose-500/30 bg-rose-500/10',
    },
  ]

  return (
    <div className="min-h-dvh bg-[#030711] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.1),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-3 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard/admin"
              className="text-[11px] font-semibold text-fuchsia-300/80 hover:text-fuchsia-200"
            >
              ← Admin Dashboard
            </Link>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Admin Profile{' '}
              <span className="text-sm font-semibold text-fuchsia-300">
                · Manage · Monitor · Impact
              </span>
            </h1>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-[#12081f] to-[#080d1b] p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative size-16 overflow-hidden rounded-2xl border-2 border-fuchsia-400/40 sm:size-20">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-fuchsia-500 to-violet-600 text-2xl font-black">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black sm:text-xl">{name}</p>
              <p className="text-xs text-slate-400">{profile?.email}</p>
              <span className="mt-2 inline-flex rounded-full border border-fuchsia-500/30 bg-fuchsia-500/15 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-200">
                Admin · Super access
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Total Classes', value: counts.classes, icon: '🏫' },
              { label: 'Subjects', value: counts.subjects, icon: '📚' },
              { label: 'Chapters', value: counts.chapters, icon: '📖' },
              { label: 'Lessons', value: counts.lessons, icon: '📝' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center"
              >
                <div className="text-lg">{s.icon}</div>
                <p className="text-xl font-black text-fuchsia-100">{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="mb-2 text-sm font-black">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {quick.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className={`rounded-xl border p-3 transition hover:scale-[1.01] ${q.color}`}
              >
                <div className="text-xl">{q.icon}</div>
                <p className="mt-1 text-xs font-bold text-white">{q.label}</p>
                <p className="text-[10px] text-slate-400">{q.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#080d1b] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-black">Content Overview</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="relative size-28 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(#22c55e 0% ${pubPct}%, #f59e0b ${pubPct}% ${Math.min(100, pubPct + pendingPct * 0.4)}%, #64748b ${Math.min(100, pubPct + pendingPct * 0.4)}% 100%)`,
                }}
              >
                <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-[#080d1b] text-center">
                  <p className="text-lg font-black">{counts.lessons}</p>
                  <p className="text-[9px] text-slate-500">Total</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Published · {counts.published} ({pubPct}%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Other / draft · {Math.max(0, counts.lessons - counts.published)}
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-slate-500" />
                  Users · {counts.users}
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#080d1b] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black">Shortcuts</h2>
              <Link href="/dashboard/admin/readiness" className="text-[11px] text-fuchsia-300">
                Readiness
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard/admin/curriculum"
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 hover:bg-white/8"
                >
                  <span>📚 Curriculum</span>
                  <span className="text-slate-500">→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/users"
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 hover:bg-white/8"
                >
                  <span>👥 Users</span>
                  <span className="text-slate-500">→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/subscriptions"
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 hover:bg-white/8"
                >
                  <span>💳 Payments</span>
                  <span className="text-slate-500">→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/announcements"
                  className="flex justify-between rounded-xl bg-white/5 px-3 py-2 hover:bg-white/8"
                >
                  <span>📢 Announcements</span>
                  <span className="text-slate-500">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/15 to-violet-500/10 p-4 sm:p-5">
          <p className="text-sm font-black text-white">Build a Better Learning Future</p>
          <p className="mt-1 text-xs text-slate-400">
            Your work helps thousands of students learn, explore and grow.
          </p>
        </div>
      </div>
    </div>
  )
}
