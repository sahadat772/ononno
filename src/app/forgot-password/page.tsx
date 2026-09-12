'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/redirect`,
      })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setDone(true)
    } catch {
      setError('পাঠানো যায়নি। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <Image src="/icons/logo-icon.png" alt="" width={36} height={36} className="rounded-xl" />
          <span className="font-black text-slate-800">ONONNO</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900">Forgot Password?</h1>
        <p className="mt-1 text-sm text-slate-500">
          ইমেইলে password reset লিংক পাঠানো হবে (Supabase Auth)।
        </p>

        {done ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            চেক করুন আপনার inbox — reset লিংক পাঠানো হয়েছে।
            <Link href="/login" className="mt-3 block font-bold text-blue-600 hover:underline">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}
            <label className="block text-xs font-bold text-slate-600">
              Email
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Send reset link
            </button>
            <Link href="/login" className="block text-center text-sm font-bold text-blue-600 hover:underline">
              ← Login
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}
