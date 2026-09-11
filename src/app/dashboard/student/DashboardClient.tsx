'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/shared/LogoutButton'
import NurseryDashboard from './levels/NurseryDashboard'
import GeneralDashboard from './levels/GeneralDashboard'
import PushPermission from '@/components/notification/PushPermission'
import SoftLaunchBanner from '@/components/student/SoftLaunchBanner'
import ContinueLearningCard from '@/components/student/ContinueLearningCard'

interface Props {
  profile: Record<string, string> | null
  studentProfile: Record<string, string> | null
}

export default function DashboardClient({ profile, studentProfile }: Props) {
  const classLevel = studentProfile?.class_level || 'general'
  const isNurseryLevel = ['nursery', 'kg', 'class_1', 'class_2'].includes(classLevel)
  const [announcements, setAnnouncements] = useState<
    { id: string; title: string; message: string }[]
  >([])

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {})
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || 'বন্ধু'

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_50%)]" />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard/student" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/icons/logo-icon.png"
              alt="অনন্য"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-tight">অনন্য</p>
              <p className="hidden text-[10px] font-semibold text-emerald-400 sm:block">
                Student Hub
              </p>
            </div>
            {isNurseryLevel && (
              <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 sm:inline">
                ছোটদের শিক্ষা
              </span>
            )}
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden max-w-[100px] truncate text-xs text-slate-400 md:inline">
              👋 {firstName}
            </span>
            <Link
              href="/dashboard/student/learning-path"
              className="flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-600/20 px-2.5 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-600/30"
            >
              📅 <span className="hidden sm:inline">আজকের Plan</span>
            </Link>
            <Link
              href="/dashboard/student/academic"
              className="hidden items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-600/20 px-2.5 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-600/30 sm:flex"
            >
              📚 একাডেমিক
            </Link>
            <Link
              href="/dashboard/student/tools/spell-check"
              className="hidden items-center gap-1 rounded-xl border border-pink-500/30 bg-pink-600/20 px-2.5 py-1.5 text-xs font-semibold text-pink-300 transition hover:bg-pink-600/30 sm:inline-flex"
            >
              ✍️ বানান
            </Link>
            <Link
              href="/dashboard/student/profile"
              className="size-8 shrink-0 overflow-hidden rounded-full border-2 border-white/20 transition hover:border-emerald-400/50"
            >
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold">
                  {profile?.full_name?.charAt(0) || '?'}
                </div>
              )}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-2">
        <PushPermission variant="student" showWhenGranted />
        <SoftLaunchBanner />
        <ContinueLearningCard />
        {announcements.length > 0 && (
          <div className="mb-4 space-y-2">
            {announcements.map((ann) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
              >
                <span className="text-xl">📢</span>
                <div>
                  <p className="text-sm font-bold text-amber-300">{ann.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{ann.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10">
        {isNurseryLevel ? (
          <NurseryDashboard profile={profile} studentProfile={studentProfile} />
        ) : (
          <GeneralDashboard profile={profile} studentProfile={studentProfile} />
        )}
      </div>
    </main>
  )
}
