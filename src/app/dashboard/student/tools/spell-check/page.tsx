'use client'

import Link from 'next/link'
import BanglaSpellCheckerPanel from '@/components/bangla/BanglaSpellCheckerPanel'
import { SPELL_MAX_CHARS_STUDENT } from '@/lib/bangla-spell'

export default function StudentSpellCheckPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
          >
            ← Dashboard
          </Link>
          <Link
            href="/dashboard/student/academic"
            className="inline-flex items-center gap-1 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-200"
          >
            একাডেমিক
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-black">✍️ আমার বানান চেকার</h1>
          <p className="mt-1 text-sm text-slate-400">
            হোমওয়ার্ক, অনুচ্ছেদ বা নোট লিখে বানান ঠিক করো — শেখার সাথে সাথে শুদ্ধ লেখা অভ্যাস।
          </p>
        </div>

        <BanglaSpellCheckerPanel
          variant="student"
          maxHint={SPELL_MAX_CHARS_STUDENT}
          placeholder="তোমার লেখা এখানে লিখো বা পেস্ট করো…"
        />

        <p className="text-center text-xs text-slate-600">অনন্য · শিক্ষার্থী টুল</p>
      </div>
    </div>
  )
}
