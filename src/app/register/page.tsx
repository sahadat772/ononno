'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ClassLevel, UserRole } from '@/types/database'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Check } from 'lucide-react'

const roles = [
  { value: 'student', label: 'শিক্ষার্থী', emoji: '🎓', desc: 'ক্লাস অনুযায়ী পড়াশোনা' },
  { value: 'parent', label: 'অভিভাবক', emoji: '👨‍👩‍👧', desc: 'সন্তানের অগ্রগতি ট্র্যাক' },
  { value: 'teacher', label: 'শিক্ষক', emoji: '👨‍🏫', desc: 'শিক্ষার্থী পরিচালনা' },
] as const

const classLevels = [
  { value: 'nursery', label: 'নার্সারি', group: 'প্রাথমিক' },
  { value: 'kg', label: 'কেজি', group: 'প্রাথমিক' },
  { value: 'class_1', label: 'শ্রেণি ১', group: 'প্রাথমিক' },
  { value: 'class_2', label: 'শ্রেণি ২', group: 'প্রাথমিক' },
  { value: 'class_3', label: 'শ্রেণি ৩', group: 'প্রাথমিক' },
  { value: 'class_4', label: 'শ্রেণি ৪', group: 'প্রাথমিক' },
  { value: 'class_5', label: 'শ্রেণি ৫', group: 'প্রাথমিক' },
  { value: 'class_6', label: 'শ্রেণি ৬', group: 'মাধ্যমিক' },
  { value: 'class_7', label: 'শ্রেণি ৭', group: 'মাধ্যমিক' },
  { value: 'class_8', label: 'শ্রেণি ৮', group: 'মাধ্যমিক' },
  { value: 'class_9', label: 'শ্রেণি ৯', group: 'মাধ্যমিক' },
  { value: 'class_10', label: 'শ্রেণি ১০', group: 'মাধ্যমিক' },
  { value: 'class_11', label: 'শ্রেণি ১১', group: 'উচ্চ মাধ্যমিক' },
  { value: 'class_12', label: 'শ্রেণি ১২', group: 'উচ্চ মাধ্যমিক' },
]

const inputCls =
  'w-full rounded-xl border border-white/10 bg-[#141428] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student' as UserRole,
    class_level: 'class_6' as ClassLevel,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function validateStep1() {
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setError('পূর্ণ নাম দিন (কমপক্ষে ২ অক্ষর)')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('সঠিক ইমেইল দিন')
      return false
    }
    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর')
      return false
    }
    return true
  }

  function validateStep2() {
    if (formData.role === 'student' && !formData.class_level) {
      setError('তোমার শ্রেণি বেছে নাও')
      return false
    }
    if (
      formData.role === 'parent' &&
      formData.phone &&
      formData.phone.replace(/\D/g, '').length < 10
    ) {
      setError('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)')
      return false
    }
    return true
  }

  function nextStep() {
    setError('')
    if (step === 1 && !validateStep1()) return
    setStep(2)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateStep1() || !validateStep2()) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name.trim(),
            phone: formData.phone || null,
            role: formData.role,
          },
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
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          role: formData.role,
        })

        if (formData.role === 'student') {
          await supabase.from('student_profiles').upsert({
            user_id: data.user.id,
            class_level: formData.class_level,
          })
        }
        if (formData.role === 'parent') {
          await supabase.from('parent_profiles').upsert({
            user_id: data.user.id,
          })
        }
      }

      router.push('/auth/redirect')
      router.refresh()
    } catch {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0c0720] via-[#0a0a1a] to-[#04050d]" />
      <div className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/icons/logo-icon.png"
              alt="অনন্য"
              width={40}
              height={40}
              className="rounded-xl shadow-lg shadow-violet-500/20"
            />
            <div>
              <p className="text-lg font-black text-white">অনন্য</p>
              <p className="text-[10px] font-semibold text-violet-300">নতুন অ্যাকাউন্ট</p>
            </div>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-slate-400 transition hover:text-white">
            আগে থেকে আছে? লগইন
          </Link>
        </motion.div>

        <div className="mb-5 flex items-center justify-center gap-2">
          {[
            { n: 1, t: 'অ্যাকাউন্ট' },
            { n: 2, t: 'ভূমিকা' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  step >= s.n
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                    : 'bg-white/8 text-slate-500'
                }`}
              >
                {step > s.n ? <Check className="size-3.5" /> : s.n}
                <span className="hidden sm:inline">{s.t}</span>
              </div>
              {i === 0 && <div className="h-px w-6 bg-white/15" />}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <form onSubmit={handleRegister} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-black text-white">মূল তথ্য</h2>
                    <p className="text-xs text-slate-400">
                      শুধু প্রয়োজনীয় তথ্য — বাকি পরে প্রোফাইল থেকে পূরণ করবেন
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">
                      পূর্ণ নাম <span className="text-rose-400">*</span>
                    </label>
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="আপনার পুরো নাম"
                      autoComplete="name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">
                      ইমেইল <span className="text-rose-400">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      autoComplete="email"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">
                      পাসওয়ার্ড <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        autoComplete="new-password"
                        className={`${inputCls} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-black text-white">আপনি কে?</h2>
                    <p className="text-xs text-slate-400">ভূমিকা অনুযায়ী ড্যাশবোর্ড ও সুবিধা আলাদা হবে</p>
                  </div>

                  <div className="grid gap-2.5">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, role: r.value as UserRole }))}
                        className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                          formData.role === r.value
                            ? 'border-violet-400/50 bg-violet-500/15 ring-2 ring-violet-500/25'
                            : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white">{r.label}</p>
                          <p className="text-[11px] text-slate-500">{r.desc}</p>
                        </div>
                        {formData.role === r.value && (
                          <span className="grid size-6 place-items-center rounded-full bg-violet-500 text-white">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {formData.role === 'student' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-400">
                        আপনার শ্রেণি <span className="text-rose-400">*</span>
                      </label>
                      <p className="mb-2 text-[11px] text-slate-500">শুধু এই শ্রেণির পাঠ ও ড্যাশবোর্ড দেখাবে</p>
                      <select
                        name="class_level"
                        value={formData.class_level}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        {classLevels.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label} · {c.group}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(formData.role === 'parent' || formData.role === 'teacher') && (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-400">
                        মোবাইল নম্বর{' '}
                        <span className="font-normal text-slate-600">(ঐচ্ছিক · পরেও দিতে পারবেন)</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        className={inputCls}
                      />
                    </div>
                  )}

                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-violet-200/90">
                    রেজিস্ট্রেশনের পর প্রোফাইল health দেখতে পাবেন। ঠিকানা, ছবি, জন্মতারিখ ইত্যাদি{' '}
                    <strong>প্রোফাইল সম্পূর্ণ করুন</strong> থেকে পূরণ করবেন।
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setStep(1)
                  }}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  <ArrowLeft className="size-4" /> পিছনে
                </button>
              )}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110"
                >
                  পরবর্তী <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> তৈরি হচ্ছে…
                    </>
                  ) : (
                    'অ্যাকাউন্ট তৈরি করুন'
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          রেজিস্টার করে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন · অনন্য শিক্ষা
        </p>
      </div>
    </main>
  )
}
