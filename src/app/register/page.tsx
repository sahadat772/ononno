'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { ClassLevel, UserRole } from '@/types/database'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'

const roles = [
  { value: 'student', label: '🎓 শিক্ষার্থী', desc: 'Nursery থেকে ১২' },
  { value: 'parent', label: '👨‍👩‍👧 অভিভাবক', desc: 'Progress দেখো' },
  { value: 'teacher', label: '👨‍🏫 শিক্ষক', desc: 'শিক্ষার্থী পরিচালনা' },
  { value: 'skill_learner', label: '💻 Skill', desc: 'দক্ষতা অর্জন' },
]

const classLevels = [
  { value: 'nursery', label: 'নার্সারি' },
  { value: 'kg', label: 'কেজি' },
  { value: 'class_1', label: 'শ্রেণি ১' },
  { value: 'class_2', label: 'শ্রেণি ২' },
  { value: 'class_3', label: 'শ্রেণি ৩' },
  { value: 'class_4', label: 'শ্রেণি ৪' },
  { value: 'class_5', label: 'শ্রেণি ৫' },
  { value: 'class_6', label: 'শ্রেণি ৬' },
  { value: 'class_7', label: 'শ্রেণি ৭' },
  { value: 'class_8', label: 'শ্রেণি ৮' },
  { value: 'class_9', label: 'শ্রেণি ৯' },
  { value: 'class_10', label: 'শ্রেণি ১০' },
  { value: 'class_11', label: 'শ্রেণি ১১' },
  { value: 'class_12', label: 'শ্রেণি ১২' },
  { value: 'university', label: 'বিশ্ববিদ্যালয়' },
  { value: 'masters', label: 'মাস্টার্স' },
]

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500/50 focus:bg-white/[0.07]'

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
    religion: 'muslim',
    class_level: 'class_1' as ClassLevel,
    gender: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            religion: formData.religion,
          },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          religion: formData.religion,
        })
        if (formData.role === 'student') {
          await supabase.from('student_profiles').insert({
            user_id: data.user.id,
            class_level: formData.class_level,
            gender: formData.gender || null,
          })
        }
        if (formData.role === 'parent') {
          await supabase.from('parent_profiles').insert({
            user_id: data.user.id,
            gender: formData.gender || null,
          })
        }
      }
      router.push('/auth/redirect')
      router.refresh()
    } catch {
      setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।')
    } finally {
      setLoading(false)
    }
  }

  function nextStep() {
    if (step === 1) {
      if (!formData.full_name.trim() || !formData.email.trim() || formData.password.length < 6) {
        setError('নাম, ইমেইল ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দাও')
        return
      }
    }
    setError('')
    setStep(2)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#071428] via-[#0a0a1a] to-[#04050d]" />
      <div className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full bg-violet-500/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/icons/logo-icon.png"
              alt="অনন্য"
              width={44}
              height={44}
              className="rounded-2xl"
            />
            <div className="text-left">
              <p className="text-xl font-black text-white">অনন্য</p>
              <p className="text-[10px] font-semibold text-emerald-400">নতুন অ্যাকাউন্ট</p>
            </div>
          </Link>
        </motion.div>

        {/* Steps */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`grid size-8 place-items-center rounded-full text-xs font-black ${
                  step >= s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                {s}
              </div>
              {s === 1 && <div className="h-px w-8 bg-white/15" />}
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
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-black text-white">মূল তথ্য</h2>
                    <p className="text-xs text-slate-400">নাম ও লগইন তথ্য</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">পূর্ণ নাম</label>
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="তোমার পুরো নাম"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">ইমেইল</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">পাসওয়ার্ড</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        required
                        minLength={6}
                        className={inputCls + ' pr-11'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        aria-label="Toggle password"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">
                      মোবাইল (ঐচ্ছিক)
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20"
                  >
                    পরবর্তী <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-black text-white">ভূমিকা বেছে নাও</h2>
                    <p className="text-xs text-slate-400">তুমি কীভাবে অনন্য ব্যবহার করবে</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, role: r.value as UserRole }))
                        }
                        className={`rounded-xl border p-3 text-left transition ${
                          formData.role === r.value
                            ? 'border-emerald-400/50 bg-emerald-500/15'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                        }`}
                      >
                        <p className="text-sm font-bold text-white">{r.label}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{r.desc}</p>
                      </button>
                    ))}
                  </div>

                  {formData.role === 'student' && (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-400">
                        শ্রেণি
                      </label>
                      <select
                        name="class_level"
                        value={formData.class_level}
                        onChange={handleChange}
                        className={inputCls}
                        aria-label="class level"
                      >
                        {classLevels.map((c) => (
                          <option key={c.value} value={c.value} className="bg-[#0a0a1a]">
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-400">
                      লিঙ্গ (ঐচ্ছিক)
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={inputCls}
                      aria-label="gender"
                    >
                      <option value="" className="bg-[#0a0a1a]">
                        নির্বাচন করো
                      </option>
                      <option value="male" className="bg-[#0a0a1a]">
                        পুরুষ
                      </option>
                      <option value="female" className="bg-[#0a0a1a]">
                        নারী
                      </option>
                      <option value="other" className="bg-[#0a0a1a]">
                        অন্যান্য
                      </option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError('')
                        setStep(1)
                      }}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/5"
                    >
                      <ArrowLeft className="h-4 w-4" /> পেছনে
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> তৈরি হচ্ছে…
                        </>
                      ) : (
                        <>
                          অ্যাকাউন্ট তৈরি <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            আগে থেকে আছো?{' '}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300">
              লগইন
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
