import Link from 'next/link'
import BanglaSpellCheckerPanel from '@/components/bangla/BanglaSpellCheckerPanel'
import { SPELL_MAX_CHARS_ADMIN } from '@/lib/bangla-spell'

export default function AdminSpellCheckPage() {
  return (
    <div className="min-h-screen bg-[#030711] text-white">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            ← Admin
          </Link>
          <Link
            href="/dashboard/admin/curriculum"
            className="inline-flex items-center gap-1 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-2 text-sm text-fuchsia-200"
          >
            Curriculum
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight">বাংলা বানান চেকার</h1>
          <p className="mt-1 text-sm text-slate-400">
            Lesson content, শব্দার্থ, বা admin নোট — generate-এর আগে/পরে বানান যাচাই করুন।
          </p>
        </div>

        <BanglaSpellCheckerPanel
          variant="admin"
          maxHint={SPELL_MAX_CHARS_ADMIN}
          placeholder="পাঠের overview, main_content বা যেকোনো বাংলা টেক্সট পেস্ট করুন…"
        />

        <p className="text-center text-xs text-slate-600">
          ONONNO · Admin tools · AI spell assist
        </p>
      </div>
    </div>
  )
}
