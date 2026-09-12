'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthAdventurePanel from '@/components/auth/AuthAdventurePanel'
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'

type UserRole = 'student' | 'parent' | 'teacher'

const CLASS_OPTIONS = [
  { value: 'nursery', label: 'Nursery' },
  { value: 'kg', label: 'KG' },
  { value: 'class_1', label: 'Class 1' },
  { value: 'class_2', label: 'Class 2' },
  { value: 'class_3', label: 'Class 3' },
  { value: 'class_4', label: 'Class 4' },
  { value: 'class_5', label: 'Class 5' },
  { value: 'class_6', label: 'Class 6' },
  { value: 'class_7', label: 'Class 7' },
  { value: 'class_8', label: 'Class 8' },
  { value: 'class_9', label: 'Class 9' },
  { value: 'class_10', label: 'Class 10' },
  { value: 'class_11', label: 'Class 11' },
  { value: 'class_12', label: 'Class 12' },
]

/** Public registration — Student / Parent / Teacher only. Admin is invite-only. */
export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'student' as UserRole,
    class_level: 'class_5',
  })

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.full_name.trim().length < 2) {
      setError('পূর্ণ নাম দিন')
      return
    }
    if (!form.email.includes('@')) {
      setError('সঠিক ইমেইল দিন')
      return
    }
    if (form.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর')
      return
    }
    if (form.password !== form.confirm) {
      setError('পাসওয়ার্ড মিলছে না')
      return
    }
    if (!['student', 'parent', 'teacher'].includes(form.role)) {
      setError('অবৈধ রোল')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.full_name.trim(),
            role: form.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/redirect`,
        },
      })
      if (signUpError) {
        setError(
          /already|registered|exists/i.test(signUpError.message)
            ? 'এই ইমেইল দিয়ে আগে অ্যাকাউন্ট আছে — লগইন করুন'
            : signUpError.message,
        )
        return
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          role: form.role,
        })

        if (form.role === 'student') {
          await supabase.from('student_profiles').upsert({
            user_id: data.user.id,
            class_level: form.class_level,
            unlocked_class_level: form.class_level,
          })
        }
        if (form.role === 'parent') {
          await supabase.from('parent_profiles').upsert({
            user_id: data.user.id,
          })
        }
      }

      if (data.session) {
        router.push(`/auth/welcome?role=${form.role}`)
        router.refresh()
      } else {
        router.push('/login?registered=1')
      }
    } catch {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh bg-white text-slate-800">
      <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:order-1 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
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

          <h1 className="text-center text-2xl font-black text-slate-900 sm:text-3xl">Create Your Account</h1>
          <p className="mt-1 text-center text-sm text-slate-500">Join ONONNO and start your learning adventure!</p>

          <form onSubmit={handleRegister} className="mt-7 space-y-3.5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">{error}</div>
            )}

            <label className="block text-xs font-bold text-slate-600">
              Full Name
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Enter your full name" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
              </div>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Email
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
              </div>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Password
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a strong password" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </label>

            <label className="block text-xs font-bold text-slate-600">
              Confirm Password
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input type={showConfirm ? 'text' : 'password'} required autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm your password" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </label>

            <fieldset>
              <legend className="text-xs font-bold text-slate-600">I am a:</legend>
              <div className="mt-2 flex flex-wrap gap-3">
                {([{ value: 'student', label: 'Student' }, { value: 'parent', label: 'Parent' }, { value: 'teacher', label: 'Teacher' }] as const).map((r) => (
                  <label key={r.value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${form.role === r.value ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={() => setForm({ ...form, role: r.value })} className="size-4 text-emerald-600 focus:ring-emerald-500" />
                    {r.label}
                  </label>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">Admin accounts are invite-only — public register-এ Admin নেই।</p>
            </fieldset>

            {form.role === 'student' && (
              <label className="block text-xs font-bold text-slate-600">
                Class
                <select value={form.class_level} onChange={(e) => setForm({ ...form, class_level: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white">
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">শুধু এই ক্লাস আনলক থাকবে; পাস করলে পরের ক্লাস খুলবে।</p>
              </label>
            )}

            <button type="submit" disabled={loading} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-60">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Create Account →
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:order-2 lg:block lg:w-[42%]">
        <AuthAdventurePanel variant="register" />
      </div>
    </main>
  )
}
