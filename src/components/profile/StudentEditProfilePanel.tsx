'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { StudentExtra } from '@/lib/profile-health'

type Profile = Record<string, string> | null

const CLASS_OPTIONS = [
  { value: 'nursery', label: 'নার্সারি' },
  { value: 'kg', label: 'কেজি' },
  { value: 'class_1', label: 'প্রথম শ্রেণি' },
  { value: 'class_2', label: 'দ্বিতীয় শ্রেণি' },
  { value: 'class_3', label: 'তৃতীয় শ্রেণি' },
  { value: 'class_4', label: 'চতুর্থ শ্রেণি' },
  { value: 'class_5', label: 'পঞ্চম শ্রেণি' },
  { value: 'class_6', label: 'ষষ্ঠ শ্রেণি' },
  { value: 'class_7', label: 'সপ্তম শ্রেণি' },
  { value: 'class_8', label: 'অষ্টম শ্রেণি' },
  { value: 'class_9', label: 'নবম শ্রেণি' },
  { value: 'class_10', label: 'দশম শ্রেণি' },
  { value: 'class_11', label: 'একাদশ শ্রেণি' },
  { value: 'class_12', label: 'দ্বাদশ শ্রেণি' },
  { value: 'general', label: 'সাধারণ' },
]

const MOTTO_PRESETS = [
  'স্বপ্ন দেখো · শেখো · এগিয়ে যাও',
  'Dream Big · Learn More · Be a Hero',
  'প্রতিদিন একটু শেখা',
  'মজার সাথে শেখা',
]

const inputCls =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100'

export default function StudentEditProfilePanel({
  profile,
  studentExtra,
  open,
  onClose,
}: {
  profile: Profile
  studentExtra?: StudentExtra | null
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'basic' | 'school'>('basic')

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    address: profile?.address || '',
    date_of_birth: profile?.date_of_birth || '',
    class_level: studentExtra?.class_level || '',
    gender: studentExtra?.gender || '',
    school_name: studentExtra?.school_name || '',
  })

  useEffect(() => {
    if (!open) return
    setForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      address: profile?.address || '',
      date_of_birth: profile?.date_of_birth || '',
      class_level: studentExtra?.class_level || '',
      gender: studentExtra?.gender || '',
      school_name: studentExtra?.school_name || '',
    })
    setAvatarUrl(profile?.avatar_url || '')
    setError('')
    setSuccess('')
    setTab('basic')
  }, [open, profile, studentExtra])

  if (!open) return null

  const filledCount = [
    form.full_name.trim().length >= 2,
    !!(profile?.email && profile.email.includes('@')),
    form.phone.replace(/\D/g, '').length >= 10,
    !!avatarUrl,
    !!form.date_of_birth,
    form.address.trim().length >= 4,
    form.bio.trim().length >= 8,
    !!form.class_level,
    !!form.gender,
  ].filter(Boolean).length
  const healthPct = Math.round((filledCount / 9) * 100)

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('শুধু ছবি আপলোড করো (JPG, PNG)।')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('ছবির সাইজ ২MB এর বেশি হবে না।')
      return
    }
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatarUrl(publicUrl + '?t=' + Date.now())
      setSuccess('প্রোফাইল ছবি আপডেট হয়েছে!')
      setTimeout(() => setSuccess(''), 2500)
      router.refresh()
    } catch {
      setError('ছবি আপলোড হয়নি। Storage permission চেক করো।')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!form.full_name.trim()) {
      setError('নাম লিখতে হবে।')
      setTab('basic')
      return
    }
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error: err } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          bio: form.bio.trim() || null,
          address: form.address.trim() || null,
          date_of_birth: form.date_of_birth || null,
        })
        .eq('id', user.id)
      if (err) throw err

      const studentPayload = {
        user_id: user.id,
        class_level: form.class_level || null,
        gender: form.gender || null,
        school_name: form.school_name.trim() || null,
      }
      const { error: spErr } = await supabase.from('student_profiles').upsert(studentPayload, {
        onConflict: 'user_id',
      })
      if (spErr) {
        // fallback: update only if row exists
        await supabase
          .from('student_profiles')
          .update({
            class_level: form.class_level || null,
            gender: form.gender || null,
            school_name: form.school_name.trim() || null,
          })
          .eq('user_id', user.id)
      }

      setSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে!')
      setTimeout(() => {
        setSuccess('')
        onClose()
        router.refresh()
      }, 900)
    } catch {
      setError('সেভ হয়নি। আবার চেষ্টা করো।')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-labelledby="edit-profile-title"
        className="flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-violet-100 bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 px-5 pb-6 pt-5 text-white">
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-10 size-16 rounded-full bg-white/5" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-100">প্রোফাইল সম্পাদনা</p>
              <h2 id="edit-profile-title" className="mt-0.5 text-xl font-black">
                নিজেকে আপডেট করো
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-xl bg-white/15 text-lg font-bold transition hover:bg-white/25"
              aria-label="বন্ধ"
            >
              ✕
            </button>
          </div>

          {/* Completeness */}
          <div className="relative mt-4 rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
              <span>প্রোফাইল সম্পূর্ণতা</span>
              <span>{healthPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-lime-300 transition-all duration-500"
                style={{ width: `${healthPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Avatar strip */}
        <div className="-mt-5 flex shrink-0 flex-col items-center px-5">
          <div className="relative">
            <div className="relative size-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-3xl font-black text-white">
                  {(form.full_name || 'S').charAt(0)}
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full border-2 border-white bg-violet-600 text-sm text-white shadow-md transition hover:bg-violet-500 disabled:opacity-60"
              aria-label="ছবি বদলাও"
            >
              {uploading ? '…' : '📷'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs font-bold text-violet-600 hover:underline disabled:opacity-50"
          >
            {uploading ? 'আপলোড হচ্ছে…' : 'প্রোফাইল ছবি বদলাও'}
          </button>
          {profile?.email && (
            <p className="mt-1 text-[11px] font-medium text-slate-400">{profile.email}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-3 flex shrink-0 gap-1 px-5">
          {(
            [
              { id: 'basic' as const, label: '👤 মৌলিক তথ্য' },
              { id: 'school' as const, label: '🏫 স্কুল ও শ্রেণি' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                tab === t.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {(success || error) && (
            <div
              className={`mb-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                success ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {success || error}
            </div>
          )}

          {tab === 'basic' && (
            <div className="space-y-3.5">
              <label className="block text-xs font-bold text-slate-600">
                পূর্ণ নাম <span className="text-rose-500">*</span>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputCls}
                  placeholder="তোমার নাম"
                  autoComplete="name"
                />
              </label>

              <label className="block text-xs font-bold text-slate-600">
                মোবাইল নম্বর
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                  placeholder="01XXXXXXXXX"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="block text-xs font-bold text-slate-600">
                জন্ম তারিখ
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className={inputCls}
                />
              </label>

              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-600">লিঙ্গ</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: 'ছেলে', emoji: '👦' },
                    { value: 'female', label: 'মেয়ে', emoji: '👧' },
                    { value: 'other', label: 'অন্যান্য', emoji: '🧑' },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g.value })}
                      className={`rounded-xl border-2 py-2.5 text-center text-xs font-bold transition ${
                        form.gender === g.value
                          ? 'border-violet-500 bg-violet-50 text-violet-800'
                          : 'border-slate-150 border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200'
                      }`}
                    >
                      <span className="block text-base">{g.emoji}</span>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-xs font-bold text-slate-600">
                ঠিকানা
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputCls}
                  placeholder="জেলা / এলাকা"
                  autoComplete="street-address"
                />
              </label>

              <label className="block text-xs font-bold text-slate-600">
                বায়ো / মোটো
                <input
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className={inputCls}
                  placeholder="স্বপ্ন দেখো · শেখো · এগিয়ে যাও"
                  maxLength={80}
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOTTO_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, bio: m })}
                    className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    {m.length > 28 ? m.slice(0, 26) + '…' : m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'school' && (
            <div className="space-y-3.5">
              <label className="block text-xs font-bold text-slate-600">
                শ্রেণি / ক্লাস
                <select
                  value={form.class_level}
                  onChange={(e) => setForm({ ...form, class_level: e.target.value })}
                  className={inputCls}
                >
                  <option value="">— বেছে নাও —</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-bold text-slate-600">
                স্কুলের নাম
                <input
                  value={form.school_name}
                  onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                  className={inputCls}
                  placeholder="তোমার স্কুলের নাম"
                />
              </label>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
                <p className="text-xs font-bold text-violet-800">💡 টিপস</p>
                <p className="mt-1 text-[11px] leading-relaxed text-violet-700/90">
                  সঠিক শ্রেণি সিলেক্ট করলে Kids Zone বা Academic পাঠ সেই লেভেল অনুযায়ী দেখাবে।
                  নার্সারি/কেজি হলে Kids Zone-এ নিয়ে যাবে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving || !form.full_name.trim()}
              onClick={() => void handleSave()}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  সেভ হচ্ছে…
                </>
              ) : (
                <>💾 সেভ করো</>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              বাতিল
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
