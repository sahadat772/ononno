'use client'

import Link from 'next/link'
import { useAccess } from '@/hooks/useAccess'
import { SOFT_LAUNCH, freeLessonsRemaining } from '@/lib/soft-launch'

/**
 * Student hub soft-launch status + free tier + continue learning.
 */
export default function SoftLaunchBanner() {
  const { loading, isPaid, planType, todayLessonsCount, canDoLesson } = useAccess()

  if (loading) {
    return (
      <div className="mb-4 h-24 animate-pulse rounded-2xl border border-white/8 bg-white/5" />
    )
  }

  const remaining = freeLessonsRemaining(todayLessonsCount)

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-violet-500/10 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              {SOFT_LAUNCH.taglineBn}
            </span>
            {isPaid ? (
              <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                {planType || 'paid'} · সক্রিয়
              </span>
            ) : (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                ফ্রি প্ল্যান
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-white">
            {isPaid
              ? 'পূর্ণ অ্যাক্সেস চালু — শেখা চালিয়ে যাও'
              : canDoLesson
                ? `আজকের ফ্রি পাঠ বাকি: ${remaining} / ${SOFT_LAUNCH.freeLessonsPerDay}`
                : 'আজকের ফ্রি পাঠ শেষ — কাল আবার চেষ্টা করো বা সাবস্ক্রাইব করো'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {isPaid
              ? 'একাডেমিক · ইসলামিক · Kids Zone — সব খোলা'
              : SOFT_LAUNCH.freeHintBn}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/student/academic"
            className="rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
          >
            📚 একাডেমিক
          </Link>
          {!isPaid && (
            <Link
              href="/dashboard/student/subscription"
              className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
            >
              💳 সাবস্ক্রিপশন
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
