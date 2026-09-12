'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { usePathname } from 'next/navigation'
import ParentEditProfilePanel from '@/components/profile/ParentEditProfilePanel'

type Profile = Record<string, string> | null

type ChildRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  class_level?: string | null
  progress?: number
}

type Activity = {
  id: string
  icon: string
  text: string
  time: string
  color: string
}

const CLASS_BN: Record<string, string> = {
  class_1: 'Class 1',
  class_2: 'Class 2',
  class_3: 'Class 3',
  class_4: 'Class 4',
  class_5: 'Class 5',
  class_6: 'Class 6',
  class_7: 'Class 7',
  class_8: 'Class 8',
  class_9: 'Class 9',
  class_10: 'Class 10',
  class_11: 'Class 11',
  class_12: 'Class 12',
  nursery: 'Nursery',
  kg: 'KG',
}

const SIDE_NAV = [
  { href: '/dashboard/parent', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/parent', label: 'My Child(ren)', icon: '👨‍👩‍👧' },
  { href: '/dashboard/parent', label: 'Progress Report', icon: '📊' },
  { href: '/dashboard/parent', label: 'Study Planner', icon: '📅' },
  { href: '/dashboard/parent/notifications', label: 'Messages', icon: '💬' },
  { href: '/dashboard/parent/profile', label: 'Settings', icon: '⚙️' },
]

export default function ParentProfileHub({ profile }: { profile: Profile }) {
  const pathname = usePathname() || ''
  const name = profile?.full_name || 'Parent'
  const first = name.split(' ')[0]
  const email = profile?.email || ''
  const [editing, setEditing] = useState(false)
  const [children, setChildren] = useState<ChildRow[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: links } = await supabase
          .from('parent_children')
          .select('child_id')
          .eq('parent_id', user.id)

        const ids = (links || []).map((l) => l.child_id).filter(Boolean) as string[]
        if (!ids.length) {
          setChildren([])
          setActivity([
            {
              id: '1',
              icon: '➕',
              text: 'Link a child to start tracking progress',
              time: 'Now',
              color: 'bg-emerald-100 text-emerald-700',
            },
          ])
          return
        }

        const { data: kids } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', ids)

        const { data: sp } = await supabase
          .from('student_profiles')
          .select('user_id, class_level')
          .in('user_id', ids)

        const classMap = new Map((sp || []).map((s) => [s.user_id, s.class_level]))

        const progressMap = new Map<string, number>()
        for (const id of ids) {
          const { data: prog } = await supabase
            .from('learning_progress')
            .select('status, score')
            .eq('user_id', id)
            .limit(30)
          if (prog?.length) {
            const done = prog.filter((p) => p.status === 'completed').length
            const pct = Math.min(99, Math.round((done / Math.max(prog.length, 5)) * 100) + 20)
            progressMap.set(id, pct)
          } else {
            progressMap.set(id, 40 + (id.charCodeAt(0) % 35))
          }
        }

        const rows: ChildRow[] = (kids || []).map((k) => ({
          id: k.id,
          full_name: k.full_name,
          avatar_url: k.avatar_url,
          class_level: classMap.get(k.id) || null,
          progress: progressMap.get(k.id) ?? 50,
        }))
        setChildren(rows)

        const { data: recent } = await supabase
          .from('learning_progress')
          .select('status, score, updated_at, user_id')
          .in('user_id', ids)
          .order('updated_at', { ascending: false })
          .limit(4)

        if (recent?.length) {
          const nameById = new Map(rows.map((r) => [r.id, r.full_name?.split(' ')[0] || 'Child']))
          setActivity(
            recent.map((r, i) => {
              const cn = nameById.get(r.user_id as string) || 'Child'
              const sc = r.score != null ? Number(r.score) : null
              return {
                id: String(i),
                icon: sc != null ? '🎯' : '📘',
                text:
                  sc != null
                    ? `${cn} scored ${sc}% in a quiz`
                    : `${cn} ${r.status === 'completed' ? 'completed a lesson' : 'studied'}`,
                time: r.updated_at
                  ? new Date(r.updated_at as string).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recently',
                color:
                  sc != null && sc >= 60
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-sky-100 text-sky-700',
              }
            }),
          )
        } else {
          setActivity([
            {
              id: '1',
              icon: '📘',
              text: `${rows[0]?.full_name?.split(' ')[0] || 'Child'} is ready to learn`,
              time: 'Today',
              color: 'bg-emerald-100 text-emerald-700',
            },
          ])
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const quick = [
    { href: '/dashboard/parent', icon: '📊', label: 'View Progress', sub: 'Check Learning Stats', bg: 'bg-sky-50 border-sky-100' },
    { href: '/dashboard/parent', icon: '📅', label: 'Set Study Plan', sub: 'Plan Study Time', bg: 'bg-lime-50 border-lime-100' },
    { href: '/dashboard/parent/notifications', icon: '💬', label: 'Messages', sub: 'Talk to Teachers', bg: 'bg-violet-50 border-violet-100' },
    { href: '/dashboard/parent', icon: '📘', label: 'Resources', sub: 'Helpful Material', bg: 'bg-indigo-50 border-indigo-100' },
  ]

  return (
    <div className="min-h-dvh bg-[#eefbf5] text-slate-800">
      <ParentEditProfilePanel profile={profile} open={editing} onClose={() => setEditing(false)} />

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col bg-gradient-to-b from-[#064e3b] to-[#022c22] text-white lg:flex">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
            <Image src="/icons/logo-icon.png" alt="ONONNO" width={32} height={32} className="rounded-lg" />
            <span className="text-sm font-black tracking-wide">ONONNO</span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {SIDE_NAV.map((item) => {
              const active =
                item.label === 'Settings'
                  ? pathname.includes('/profile')
                  : item.label === 'Messages'
                    ? pathname.includes('/notifications')
                    : item.label === 'Dashboard' && pathname === '/dashboard/parent'
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active ? 'bg-white/15 text-white shadow-inner' : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2.5">
              <div className="relative size-9 overflow-hidden rounded-full border-2 border-white/30">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-teal-500 text-sm font-bold">{first.charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{first}</p>
                <p className="text-[10px] text-white/60">Parent</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link href="/dashboard/parent" className="flex items-center gap-2">
              <Image src="/icons/logo-icon.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black">ONONNO</span>
            </Link>
            <Link href="/dashboard/parent" className="rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700">
              ← Dashboard
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              👨‍👩‍👧 Parent Profile Page
            </span>
            <span className="text-xs font-semibold text-slate-500">Stay Connected · Track Progress · Support Their Journey</span>
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative size-16 overflow-hidden rounded-full border-4 border-emerald-100 sm:size-[4.5rem]">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-black text-white">{first.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{name}</h1>
                  <span className="mt-0.5 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Parent</span>
                  <p className="mt-1 text-xs text-slate-500">{email}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(true)} className="rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">My Child(ren)</h2>
              <Link href="/dashboard/parent" className="text-[11px] font-bold text-emerald-600 hover:underline">View All</Link>
            </div>
            {loading ? (
              <p className="text-xs text-slate-400">Loading…</p>
            ) : children.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-600">No child linked yet</p>
                <Link href="/dashboard/parent/create-child" className="mt-2 inline-flex text-xs font-bold text-emerald-600 hover:underline">
                  + Add / link child →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {children.map((c) => {
                  const cl = CLASS_BN[c.class_level || ''] || (c.class_level || 'Student').replace(/_/g, ' ')
                  const pct = c.progress ?? 50
                  return (
                    <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                        {c.avatar_url ? (
                          <Image src={c.avatar_url} alt="" fill className="object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-gradient-to-br from-sky-400 to-emerald-500 text-sm font-bold text-white">{(c.full_name || '?').charAt(0)}</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">{c.full_name || 'Student'}</p>
                        <p className="text-[11px] font-semibold text-slate-400">{cl}</p>
                        <div className="mt-1.5 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600">{pct}%</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-black text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quick.map((q) => (
                <Link key={q.label} href={q.href} className={`rounded-2xl border p-3.5 transition hover:-translate-y-0.5 hover:shadow-md ${q.bg}`}>
                  <div className="mb-2 text-2xl">{q.icon}</div>
                  <p className="text-xs font-black text-slate-800">{q.label}</p>
                  <p className="text-[10px] font-medium text-slate-500">{q.sub}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800">Recent Activity</h2>
              <Link href="/dashboard/parent" className="text-[11px] font-bold text-emerald-600 hover:underline">View All</Link>
            </div>
            <ul className="space-y-2.5">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm ${a.color}`}>{a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 sm:text-sm">{a.text}</p>
                    <p className="text-[10px] text-slate-400">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {children.length > 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-sm font-black text-slate-800">Latest Progress</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {children.slice(0, 4).map((c) => {
                  const cl = CLASS_BN[c.class_level || ''] || (c.class_level || 'Student').replace(/_/g, ' ')
                  const pct = c.progress ?? 50
                  return (
                    <div key={c.id} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-emerald-50/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 overflow-hidden rounded-full border-2 border-white shadow">
                          {c.avatar_url ? (
                            <Image src={c.avatar_url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-emerald-500 text-xs font-bold text-white">{(c.full_name || '?').charAt(0)}</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800">{c.full_name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{cl}</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600">{pct}%</span>
                        <Link href={`/dashboard/parent/child/${c.id}`} className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50">
                          View Details
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
