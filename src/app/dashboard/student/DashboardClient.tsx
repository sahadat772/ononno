'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/shared/LogoutButton'
import NurseryDashboard from './levels/NurseryDashboard'
import GeneralDashboard from './levels/GeneralDashboard'
import PushPermission from '@/components/notification/PushPermission'
import PWAInstallBanner from '@/components/notification/PWAInstallBanner'
import CompleteProfileBanner from '@/components/shared/CompleteProfileBanner'
import SoftLaunchBanner from '@/components/student/SoftLaunchBanner'
import ContinueLearningCard from '@/components/student/ContinueLearningCard'
import StudentMobileNav from '@/components/student/StudentMobileNav'

interface Props {
  profile: Record<string, string> | null
  studentProfile: Record<string, string> | null
}

const CLASS_BN: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'প্রথম শ্রেণী',
  class_2: 'দ্বিতীয় শ্রেণী',
  class_3: 'তৃতীয় শ্রেণী',
  class_4: 'চতুর্থ শ্রেণী',
  class_5: 'পঞ্চম শ্রেণী',
  class_6: 'ষষ্ঠ শ্রেণী',
  class_7: 'সপ্তম শ্রেণী',
  class_8: 'অষ্টম শ্রেণী',
  class_9: 'নবম শ্রেণী',
  class_10: 'দশম শ্রেণী',
  class_11: 'একাদশ শ্রেণী',
  class_12: 'দ্বাদশ শ্রেণী',
  university: 'বিশ্ববিদ্যালয়',
  masters: 'মাস্টার্স',
  general: 'সাধারণ',
}

export default function DashboardClient({ profile, studentProfile }: Props) {
  const classLevel = studentProfile?.class_level || 'general'
  const isNurseryLevel = ['nursery', 'kg', 'class_1', 'class_2'].includes(classLevel)
  const classLabel = CLASS_BN[classLevel] || classLevel.replace(/_/g, ' ')
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
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা'

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_55%)]" />

      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/10 bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4">
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
              <p className="hidden text-[10px] font-semibold text-violet-300 sm:block">
                Student Hub
              </p>
            </div>
            {isNurseryLevel && (
              <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200 sm:inline">
                Kids
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/dashboard/student/academic"
              className="hidden rounded-xl border border-violet-500/30 bg-violet-600/20 px-2.5 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-600/30 sm:inline-flex"
            >
              📚 পড়া
            </Link>
            <Link
              href="/dashboard/student/islamic"
              className="hidden rounded-xl border border-emerald-500/30 bg-emerald-600/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-600/25 md:inline-flex"
            >
              🕌 ইসলামিক
            </Link>
            <Link
              href="/dashboard/student/tools/spell-check"
              className="hidden rounded-xl border border-pink-500/30 bg-pink-600/15 px-2.5 py-1.5 text-xs font-semibold text-pink-300 transition hover:bg-pink-600/25 lg:inline-flex"
            >
              ✍️ বানান
            </Link>
            <Link
              href="/dashboard/student/profile"
              className="size-8 shrink-0 overflow-hidden rounded-full border-2 border-violet-500/40 transition hover:border-fuchsia-400/60"
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
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold">
                  {profile?.full_name?.charAt(0) || '?'}
                </div>
              )}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-16 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-[#12122a] to-fuchsia-500/10 p-4 sm:rounded-3xl sm:p-6"
        >
          <p className="text-sm text-slate-400">
            {greeting} ·{' '}
            {new Date().toLocaleDateString('bn-BD', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">
            আস-সালামু আলাইকুম,{' '}
            <span className="bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-200">
              🏫 {classLabel}
            </span>
            <Link
              href="/dashboard/student/learning-path"
              className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20"
            >
              📅 আজকের Plan
            </Link>
            <Link
              href="/dashboard/student/performance"
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              📈 অগ্রগতি
            </Link>
          </div>
        </motion.div>

        <PWAInstallBanner />
        <CompleteProfileBanner
          profile={profile}
          studentExtra={studentProfile as { class_level?: string; gender?: string } | null}
          href="/dashboard/student/profile"
        />
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

        {isNurseryLevel ? (
          <NurseryDashboard profile={profile} studentProfile={studentProfile} />
        ) : (
          <GeneralDashboard profile={profile} studentProfile={studentProfile} />
        )}

        <p className="mt-10 text-center text-[11px] text-slate-600">
          © {new Date().getFullYear()} অনন্য · Student Hub
        </p>
      </div>

      <StudentMobileNav />
    </main>
  )
}
