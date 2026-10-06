'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { reportClientError } from '@/lib/report-client-error'

/**
 * Segment error boundary — reports to /api/errors (+ optional Sentry).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportClientError({
      message: error.message || 'Route error',
      stack: error.stack,
      digest: error.digest,
      level: 'error',
    })
  }, [error])

  const short =
    (error?.message || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || null

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[#060612] px-6 py-16 text-center text-white">
      <p className="text-4xl">😕</p>
      <h2 className="text-lg font-bold">এই পেজ লোড করা যায়নি</h2>
      <p className="max-w-md text-sm text-gray-400">
        একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন — সমস্যা থাকলে কিছুক্ষণ পর ফিরে আসুন।
      </p>
      {short && (
        <p className="max-w-md rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-rose-300/90">
          {short}
        </p>
      )}
      {error.digest && (
        <p className="font-mono text-[11px] text-gray-600">ref: {error.digest}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-400"
        >
          আবার চেষ্টা
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10"
        >
          ড্যাশবোর্ড
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10"
        >
          হোম
        </Link>
      </div>
    </div>
  )
}
