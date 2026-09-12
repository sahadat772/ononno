'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  buildProfileHealthItems,
  scoreProfileHealth,
  type ProfileLike,
  type StudentExtra,
} from '@/lib/profile-health'

type Props = {
  profile: ProfileLike | null
  studentExtra?: StudentExtra | null
  href?: string
}

export default function CompleteProfileBanner({
  profile,
  studentExtra,
  href = '/dashboard/student/profile',
}: Props) {
  const items = buildProfileHealthItems(profile, studentExtra)
  const { score, label, filled, total } = scoreProfileHealth(items)

  if (score >= 90) return null

  const missing = items.filter((i) => !i.done).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/15 via-[#12122a] to-violet-500/10 p-4"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative grid size-14 place-items-center">
          <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="url(#ph)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${score} 100`}
            />
            <defs>
              <linearGradient id="ph" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-xs font-black text-white">{score}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">প্রোফাইল সম্পূর্ণ করুন</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Profile health: <span className="font-semibold text-amber-200">{label}</span> · {filled}/{total}{' '}
            সম্পন্ন
          </p>
          {missing.length > 0 && (
            <p className="mt-1 text-[11px] text-slate-500">
              বাকি: {missing.map((m) => m.label).join(' · ')}
            </p>
          )}
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition hover:brightness-110"
        >
          সম্পূর্ণ করুন →
        </Link>
      </div>
    </motion.div>
  )
}
