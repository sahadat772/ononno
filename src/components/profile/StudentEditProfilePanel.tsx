'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Profile = Record<string, string> | null

export default function StudentEditProfilePanel({
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
      setSuccess('ছবি আপলোড হয়েছে!')
      setTimeout(() => setSuccess(''), 2500)
      router.refresh()
    } catch {
      setError('ছবি আপলোড হয়নি।')
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
          bio: form.bio || null,
        })
        .eq('id', user.id)
      if (err) throw err
      setSuccess('প্রোফাইল আপডেট হয়েছে!')
      setTimeout(() => {
        setSuccess('')
        onClose()
        router.refresh()
      }, 1000)
    } catch {
      setError('সেভ হয়নি। আবার চেষ্টা করো।')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-violet-100 bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
            <p className="text-xs text-slate-500">নাম ও ছবি আপডেট করো</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm font-bold text-slate-500"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative size-14 overflow-hidden rounded-full border-4 border-violet-100">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg font-black text-white">
                {(form.full_name || 'S').charAt(0)}
              </div>
            )}
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700"
            >
              {uploading ? 'Uploading…' : '📷 Change photo'}
            </button>
          </div>
        </div>

        {(success || error) && (
          <div
            className={`mb-3 rounded-xl px-3 py-2 text-xs font-semibold ${
              success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {success || error}
          </div>
        )}

        <label className="mb-3 block text-xs font-bold text-slate-600">
          Full name
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
        </label>
        <label className="mb-3 block text-xs font-bold text-slate-600">
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            placeholder="01XXXXXXXXX"
          />
        </label>
        <label className="mb-4 block text-xs font-bold text-slate-600">
          Bio / motto
          <input
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
            placeholder="Dream Big · Learn More · Be a Hero"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving || !form.full_name.trim()}
            onClick={() => void handleSave()}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
