'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type Profile = Record<string, string> | null

type ChildRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  class_level?: string | null
  progress?: number
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

export default function ParentProfileHub({ profile }: { profile: Profile }) {
  const name = profile?.full_name || 'Parent'
  const [children, setChildren] = useState<ChildRow[]>([])
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

        const ids = (links || []).map((l) => l.child_id).filter(Boolean)
        if (!ids.length) {
          setChildren([])
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

        const rows: ChildRow[] = (kids || []).map((k, i) => ({
          id: k.id,
          full_name: k.full_name,
          avatar_url: k.avatar_url,
          class_level: classMap.get(k.id) || null,
          progress: 55 + ((i * 17) % 40),
        }))
        setChildren(rows)
      } catch {
        setChildren([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="min-h-dvh bg-[#06150f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-3 pb-8 pt-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard/parent"
              className="text-[11px] font-semibold text-emerald-300/80 hover:text-emerald-200"
            >
              ← Parent Hub
            </Link>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Parent Profile{' '}
              <span className="text-sm font-semibold text-emerald-300">· Track · Support</span>
            </h1>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0c221a] to-[#081510] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative size-16 overflow-hidden rounded-2xl border-2 border-emerald-400/40 sm:size-20">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-black">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black sm:text-xl">{name}</p>
              <p className="text-xs text-emerald-200/70">{profile?.email}</p>
              <span className="mt-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                Parent
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-[#0a1a14]/90 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black">My Child(ren)</h2>
            <Link href="/dashboard/parent" className="text-[11px] text-emerald-300">
              View All
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">লোড হচ্ছে…</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-slate-400">
              এখনো কোনো সন্তান লিংক নেই।{' '}
              <Link href="/dashboard/parent" className="text-emerald-300 underline">
                Parent Hub
              </Link>{' '}
              থেকে যোগ করুন।
            </p>
          ) : (
            <div className="space-y-3">
              {children.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-3"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-emerald-500/30">
                    {c.avatar_url ? (
                      <Image src={c.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-emerald-600/40 text-sm font-bold">
                        {(c.full_name || '?').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{c.full_name || 'Student'}</p>
                    <p className="text-[11px] text-slate-400">
                      {CLASS_BN[c.class_level || ''] || c.class_level || 'Class'}
                    </p>
                    <div className="mt-1.5 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                        style={{ width: `${c.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">{c.progress}%</span>
                  <Link
                    href={`/dashboard/parent/child/${c.id}`}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-200"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="mb-2 text-sm font-black">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { href: '/dashboard/parent', icon: '📊', label: 'View Progress', sub: 'Learning stats' },
              { href: '/dashboard/parent', icon: '📅', label: 'Study Plan', sub: 'Plan study time' },
              { href: '/dashboard/parent', icon: '💬', label: 'Messages', sub: 'Soon' },
              { href: '/dashboard/parent', icon: '📚', label: 'Resources', sub: 'Helpful material' },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <div className="text-xl">{a.icon}</div>
                <p className="mt-1 text-xs font-bold text-white">{a.label}</p>
                <p className="text-[10px] text-slate-500">{a.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {children.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0a1a14]/90 p-4">
            <h2 className="mb-3 text-sm font-black">Latest Progress</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {children.slice(0, 2).map((c) => (
                <div key={c.id} className="rounded-xl border border-white/8 bg-white/5 p-3">
                  <p className="text-sm font-bold">{c.full_name}</p>
                  <p className="text-[11px] text-slate-400">
                    {CLASS_BN[c.class_level || ''] || 'Student'}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <Link
                    href={`/dashboard/parent/child/${c.id}/progress`}
                    className="mt-2 inline-block text-[11px] font-semibold text-emerald-300"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
