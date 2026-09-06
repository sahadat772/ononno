'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়')
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#071428] via-[#0a0a1a] to-[#04050d]" />
      <div className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full bg-cyan-500/15 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/icons/logo-icon.png"
              alt="অনন্য"
              width={48}
              height={48}
              className="rounded-2xl shadow-lg shadow-emerald-500/20"
            />
            <div className="text-left">
              <p className="text-2xl font-black tracking-tight text-white">অনন্য</p>
              <p className="text-xs font-semibold text-emerald-400">ONONNO · NCTB Learning</p>
            </div>
          </Link>
          <h1 className="mt-8 text-2xl font-black text-white sm:text-3xl">আবার স্বাগতম</h1>
          <p className="mt-2 text-sm text-slate-400">তোমার শেখার যাত্রা চালিয়ে যাও</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-400">
                ইমেইল
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/50 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-400">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/50 focus:bg-white/[0.07]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> প্রবেশ হচ্ছে…
                </>
              ) : (
                <>
                  লগইন <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300">
              রেজিস্ট্রেশন করো
            </Link>
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-600">
          <Link href="/" className="hover:text-slate-400">
            ← হোমে ফিরে যাও
          </Link>
        </p>
      </div>
    </main>
  )
}
