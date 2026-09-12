'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Profile = Record<string, string> | null

export default function AdminEditProfilePanel({
  profile,
  open,
  onClose,
}: {
  profile: Profile
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
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
  })

  if (!open) return null

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('ছবির size ২MB এর বেশি হবে না।')
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
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatarUrl(publicUrl + '?t=' + Date.now())
      setSuccess('ছবি সফলভাবে আপলোড হয়েছে!')
      setTimeout(() => setSuccess(''), 3000)
      router.refresh()
    } catch {
      setError('ছবি আপলোড হয়নি। আবার চেষ্টা করো।')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
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
          full_name: form.full_name,
          phone: form.phone || null,
          address: form.address || null,
          bio: form.bio || null,
        })
        .eq('id', user.id)
      if (err) throw err
      setSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে!')
      setTimeout(() => {
        setSuccess('')
        onClose()
        router.refresh()
      }, 1200)
    } catch {
      setError('আপডেট হয়নি। আবার চেষ্টা করো।')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
            <p className="text-xs text-slate-500">নাম, ফোন, ঠিকানা ও ছবি আপডেট করুন</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative size-16 overflow-hidden rounded-full border-4 border-sky-100">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-black text-white">
                {(form.full_name || 'A').charAt(0)}
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatar}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : '📷 Change photo'}
            </button>
            <p className="mt-1 text-[10px] text-slate-400">Max 2MB · JPG/PNG</p>
          </div>
        </div>

        {(success || error) && (
          <div
            className={`mb-3 rounded-xl px-3 py-2 text-xs font-semibold ${
              success
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {success || error}
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-600">
            Full name
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              placeholder="Your name"
            />
          </label>
          <label className="block text-xs font-bold text-slate-600">
            Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              placeholder="01XXXXXXXXX"
            />
          </label>
          <label className="block text-xs font-bold text-slate-600">
            Address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              placeholder="City / area"
            />
          </label>
          <label className="block text-xs font-bold text-slate-600">
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-sky-400 focus:bg-white"
              placeholder="Short bio…"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || !form.full_name.trim()}
            onClick={() => void handleSave()}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
