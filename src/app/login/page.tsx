'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthAdventurePanel from '@/components/auth/AuthAdventurePanel'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(
          /confirm|verify/i.test(authError.message)
            ? 'ইমেইল verify করুন — inbox চেক করুন'
            : 'ইমেইল বা পাসওয়ার্ড সঠিক নয়',
        )
        return
      }
      router.push('/auth/redirect')
      router.refresh()
    } catch {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/redirect`,
        },
      })
      if (oauthError) {
        setError('Google login এখনো সেটআপ হয়নি — ইমেইল দিয়ে লগইন করুন')
      }
    } catch {
      setError('Google login ব্যর্থ')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh bg-white text-slate-800">
      <div className="hidden lg:block lg:w-[42%]">
        <AuthAdventurePanel variant="login" />
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src="/icons/logo-icon.png" alt="ONONNO" width={40} height={40} className="rounded-xl" />
            <div>
              <p className="text-lg font-black">ONONNO</p>
              <p className="text-[10px] font-semibold text-slate-500">Learn · Explore · Achieve</p>
            </div>
          </div>

          <div className="mb-2 hidden items-center justify-center gap-2 lg:flex">
            <Image src="/icons/logo-icon.png" alt="" width={36} height={36} className="rounded-xl" />
            <span className="text-sm font-black text-slate-700">ONONNO</span>
          </div>

          <h1 className="text-center text-2xl font-black text-slate-900 sm:text-3xl">Welcome Back 👋</h1>
          <p className="mt-1 text-center text-sm text-slate-500">Login to continue your learning journey</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <label className="block text-xs font-bold text-slate-600">
              Email or Phone Number
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Password
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-bold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Login →
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <span className="text-base font-black text-red-500">G</span>}
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Register
            </Link>
          </p>

          <p className="mt-6 text-center text-[10px] text-slate-400">
            Session → role-based dashboard (Student / Parent / Admin)
          </p>
        </div>
      </div>
    </main>
  )
}
