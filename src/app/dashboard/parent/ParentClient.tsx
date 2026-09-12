'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/shared/LogoutButton'
import ParentSoftLaunchCard from '@/components/parent/ParentSoftLaunchCard'
import ParentPriorityPanel from '@/components/parent/ParentPriorityPanel'
import RelatedChildrenSuggestions from '@/components/parent/RelatedChildrenSuggestions'
import { createClient } from '@/lib/supabase'

interface ChildData {
  id: string
  child_id: string
  profiles: { id: string; full_name: string; email: string; avatar_url: string | null }
  class_level: string
  lastSession: { login_at: string; duration_minutes?: number | null } | null
  completedLessons: number
  totalLessons: number
  weekCompleted?: number
}

interface Props {
  profile: Record<string, string> | null
  childrenData: ChildData[]
}

function formatClass(level: string) {
  const map: Record<string, string> = {
    nursery: 'নার্সারি', kg: 'কেজি', class_1: 'ক্লাস ১', class_2: 'ক্লাস ২',
    class_3: 'ক্লাস ৩', class_4: 'ক্লাস ৪', class_5: 'ক্লাস ৫', class_6: 'ক্লাস ৬',
    class_7: 'ক্লাস ৭', class_8: 'ক্লাস ৮', class_9: 'ক্লাস ৯', class_10: 'ক্লাস ১০',
    class_11: 'ক্লাস ১১', class_12: 'ক্লাস ১২', general: 'সাধারণ',
  }
  if (!level || level === 'Unknown') return 'ক্লাস সেট নেই'
  return map[level] || level.replace(/_/g, ' ')
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function ParentClient({ profile, childrenData }: Props) {
  const [showProfile, setShowProfile] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [childEmail, setChildEmail] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkMsg, setLinkMsg] = useState<string | null>(null)
  const [linkErr, setLinkErr] = useState<string | null>(null)

  const firstName = profile?.full_name?.split(' ')[0] || 'অভিভাবক'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা'
  const totalCompleted = childrenData.reduce((s, c) => s + c.completedLessons, 0)
  const weekCompleted = childrenData.reduce((s, c) => s + (c.weekCompleted ?? 0), 0)
  const activeKids = childrenData.filter((c) => c.lastSession).length

  const linkExistingChild = async () => {
    setLinking(true); setLinkMsg(null); setLinkErr(null)
    try {
      const supabase = createClient()
      const email = childEmail.trim().toLowerCase()
      if (!email) { setLinkErr('ইমেইল লিখুন'); return }
      const { data: childProfile } = await supabase.from('profiles').select('id, role, full_name').eq('email', email).maybeSingle()
      if (!childProfile) { setLinkErr('এই ইমেইলে অ্যাকাউন্ট নেই'); return }
      if (childProfile.role !== 'student') { setLinkErr('শুধু student লিংক করা যায়'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLinkErr('লগইন নেই'); return }
      const { error } = await supabase.from('parent_children').insert({ parent_id: user.id, child_id: childProfile.id })
      if (error) {
        setLinkErr(/duplicate|unique/i.test(error.message) ? 'ইতিমধ্যে লিংক আছে' : error.message)
        return
      }
      setLinkMsg('লিংক সফল — রিফ্রেশ হচ্ছে…')
      setTimeout(() => window.location.reload(), 1000)
    } catch (e) {
      setLinkErr(e instanceof Error ? e.message : 'ব্যর্থ')
    } finally { setLinking(false) }
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_55%)]" />

      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard/parent" className="flex items-center gap-2.5">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
            <div>
              <p className="text-sm font-black leading-tight">অনন্য</p>
              <p className="hidden text-[10px] font-semibold text-violet-300 sm:block">Parent Hub</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/parent/notifications" className="hidden rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 sm:inline-flex">🔔 নোটিশ</Link>
            <Link href="/dashboard/parent/create-child" className="hidden rounded-xl border border-violet-500/30 bg-violet-600/20 px-2.5 py-1.5 text-xs font-semibold text-violet-200 sm:inline-flex">➕ সন্তান</Link>
            <div className="relative">
              <button type="button" onClick={() => setShowProfile((v) => !v)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold">{firstName.charAt(0)}</div>
                <span className="hidden text-xs font-semibold md:inline">{firstName}</span>
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-[#12122a] p-4 shadow-2xl">
                    <p className="truncate text-sm font-bold">{profile?.full_name}</p>
                    <p className="truncate text-xs text-slate-400">{profile?.email}</p>
                    <span className="mt-1 inline-block rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-300">👨‍👩‍👧 অভিভাবক</span>
                    <Link href="/dashboard/parent/profile" className="mt-3 block rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs">প্রোফাইল</Link>
                    <Link href="/dashboard/parent/create-child" className="mt-2 block rounded-xl border border-violet-500/30 bg-violet-500/15 py-2 text-center text-xs font-semibold text-violet-200">➕ নতুন child</Link>
                    <button type="button" onClick={() => { setShowProfile(false); setShowAddChild(true) }} className="mt-2 w-full rounded-xl border border-white/10 py-2 text-xs text-slate-300">🔗 ইমেইল লিংক</button>
                    <div className="mt-2"><LogoutButton /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showAddChild && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAddChild(false)}>
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12122a] p-5">
              <h3 className="text-lg font-bold">ইমেইল দিয়ে সন্তান লিংক</h3>
              <p className="mt-1 text-xs text-slate-400">Student অ্যাকাউন্টের ইমেইল</p>
              <input type="email" value={childEmail} onChange={(e) => setChildEmail(e.target.value)} placeholder="child@email.com" className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-violet-500/50" />
              {linkErr && <p className="mt-2 text-xs text-rose-300">{linkErr}</p>}
              {linkMsg && <p className="mt-2 text-xs text-emerald-300">{linkMsg}</p>}
              <div className="mt-4 flex gap-2">
                <button type="button" disabled={linking} onClick={() => void linkExistingChild()} className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-bold disabled:opacity-50">{linking ? '…' : 'লিংক করো'}</button>
                <button type="button" onClick={() => setShowAddChild(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm">বাতিল</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-20 md:pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-[#12122a] to-fuchsia-500/10 p-4 sm:rounded-3xl sm:p-5 md:p-7">
          <p className="text-sm text-slate-400">{greeting} · {new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">আস-সালামু আলাইকুম, <span className="bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">{firstName}</span></h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">সন্তানের পড়াশোনা, অগ্রগতি ও সেশন — একাডেমিক + ইসলামিক শেখার সাথে তাল মিলিয়ে দেখুন।</p>
        </motion.div>

        <ParentSoftLaunchCard />
        <ParentPriorityPanel />
        <RelatedChildrenSuggestions />

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'লিংকড সন্তান', value: childrenData.length, icon: '👨‍👩‍👧', color: 'text-violet-300' },
            { label: 'সম্পন্ন পাঠ', value: totalCompleted, icon: '✅', color: 'text-emerald-300' },
            { label: 'এই সপ্তাহে', value: weekCompleted, icon: '📅', color: 'text-sky-300' },
            { label: 'সাম্প্রতিক সক্রিয়', value: activeKids, icon: '🟢', color: 'text-amber-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-[#12122a]/80 p-4">
              <div className="mb-1 text-lg">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value.toLocaleString('bn-BD')}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/dashboard/parent/create-child" className="rounded-xl border border-violet-500/30 bg-violet-500/15 px-3.5 py-2.5 text-xs font-semibold text-violet-200">➕ নতুন child</Link>
          <button type="button" onClick={() => setShowAddChild(true)} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300">🔗 ইমেইল লিংক</button>
          <Link href="/dashboard/parent/notifications" className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300">🔔 নোটিশ</Link>
          <Link href="/dashboard/parent/profile" className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300">👤 প্রোফাইল</Link>
        </div>

        <h2 id="children" className="mb-1 scroll-mt-24 text-lg font-bold">আমার <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">সন্তান</span></h2>
        <p className="mb-4 text-xs text-slate-500">অগ্রগতি, সেশন ও ক্লাস এক নজরে</p>

        {childrenData.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-violet-500/30 bg-violet-500/5 p-8 text-center">
            <p className="text-4xl">👨‍👩‍👧</p>
            <h3 className="mt-3 text-lg font-bold">কোনো সন্তান লিংক নেই</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">নতুন student অ্যাকাউন্ট তৈরি করুন বা ইমেইল দিয়ে লিংক করুন।</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/dashboard/parent/create-child" className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold">অ্যাকাউন্ট তৈরি</Link>
              <button type="button" onClick={() => setShowAddChild(true)} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold">ইমেইল লিংক</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {childrenData.map((child, i) => {
              const total = Math.max(child.totalLessons, 1)
              const pct = Math.min(100, Math.round((child.completedLessons / total) * 100))
              return (
                <motion.div key={child.child_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl border border-white/10 bg-[#12122a] p-4 hover:border-violet-500/35">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg font-bold">{child.profiles.full_name?.charAt(0) || '?'}</div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{child.profiles.full_name || 'সন্তান'}</p>
                      <p className="truncate text-[11px] text-slate-500">{child.profiles.email}</p>
                      <span className="mt-1 inline-block rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-200">{formatClass(child.class_level)}</span>
                    </div>
                  </div>
                  <div className="mb-1 flex justify-between text-[11px] text-slate-400"><span>অগ্রগতি</span><span>{child.completedLessons}/{total} · {pct}%</span></div>
                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${pct}%` }} /></div>
                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-white/8 bg-white/5 p-2.5"><p className="text-slate-500">সম্পন্ন</p><p className="text-lg font-bold text-emerald-400">{child.completedLessons}</p></div>
                    <div className="rounded-xl border border-white/8 bg-white/5 p-2.5"><p className="text-slate-500">এই সপ্তাহ</p><p className="text-lg font-bold text-sky-400">{child.weekCompleted ?? 0}</p></div>
                  </div>
                  {child.lastSession && <p className="mb-3 text-[11px] text-slate-500">শেষ সেশন: {formatTime(child.lastSession.login_at)}{child.lastSession.duration_minutes != null ? ` · ${child.lastSession.duration_minutes} মি.` : ''}</p>}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/parent/child/${child.child_id}`} className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-center text-xs font-bold">বিস্তারিত</Link>
                    <Link href={`/dashboard/parent/child/${child.child_id}/progress`} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300">অগ্রগতি</Link>
                    <Link href={`/dashboard/parent/child/${child.child_id}/sessions`} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300">সেশন</Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-slate-600">© {new Date().getFullYear()} অনন্য · Parent Hub</p>
      </div>
    </main>
  )
}
