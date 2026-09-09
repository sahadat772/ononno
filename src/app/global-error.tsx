'use client'

import { useEffect } from 'react'
import { reportClientError } from '@/lib/report-client-error'

/**
 * Root global error boundary (replaces root layout on critical failure).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportClientError({
      message: error.message || 'Global application error',
      stack: error.stack,
      digest: error.digest,
      level: 'fatal',
      route: '/global-error',
    })
  }, [error])

  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#060612] text-white antialiased">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-5xl">⚠️</p>
          <h1 className="text-xl font-black">কিছু একটা ভুল হয়েছে</h1>
          <p className="text-sm text-gray-400">
            অ্যাপ্লিকেশনে একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা হোমে ফিরে যান।
          </p>
          {error.digest && (
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-gray-500">
              ref: {error.digest}
            </p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-400"
            >
              আবার চেষ্টা
            </button>
            <a
              href="/"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              হোমে যান
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
