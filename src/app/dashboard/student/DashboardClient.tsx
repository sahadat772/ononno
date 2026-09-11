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
  announcements?: { id: string; title: string; body?: string; created_at?: string }[]
}

export default function DashboardClient({
  profile,
  studentProfile,
  announcements = [],
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const firstName = profile?.full_name?.split(' ')[0] || 'শিক্ষার্থী'
  const level = studentProfile?.class_level || 'general'

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard/student" className="flex items-center gap-2.5">
            <Image src="/icons/logo-icon.png" alt="অনন্য" width={36} height={36} className="rounded-xl" />
            <div>
              <p className="text-sm font-black leading-tight">অনন্য</p>
              <p className="hidden text-[10px] font-semibold text-emerald-300 sm:block">Student</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 sm:inline">{firstName}</span>
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
              <div
                key={ann.id}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <p className="font-semibold">{ann.title}</p>
                {ann.body && <p className="text-xs text-slate-400">{ann.body}</p>}
              </div>
            ))}
          </div>
        )}

        {mounted && (level === 'nursery' || level === 'kg' ? (
          <NurseryDashboard profile={profile} studentProfile={studentProfile} />
        ) : (
          <GeneralDashboard profile={profile} studentProfile={studentProfile} />
        ))}
      </div>
    </main>
  )
}
