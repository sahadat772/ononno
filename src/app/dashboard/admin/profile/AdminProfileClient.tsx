"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Profile = Record<string, string> | null

export default function AdminProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    bio: profile?.bio || "",
    date_of_birth: profile?.date_of_birth || "",
  })

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError("ছবির size ২MB এর বেশি হবে না।")
      return
    }
    setUploading(true)
    setError("")
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split(".").pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path)
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)
      setAvatarUrl(publicUrl + "?t=" + Date.now())
      setSuccess("ছবি সফলভাবে আপলোড হয়েছে!")
      setTimeout(() => setSuccess(""), 3000)
    } catch {
      setError("ছবি আপলোড হয়নি। আবার চেষ্টা করো।")
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { error: err } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          bio: form.bio,
          date_of_birth: form.date_of_birth || null,
        })
        .eq("id", user.id)
      if (err) throw err
      setSuccess("প্রোফাইল সফলভাবে আপডেট হয়েছে!")
      setEditing(false)
      setTimeout(() => {
        setSuccess("")
        router.refresh()
      }, 2000)
    } catch {
      setError("আপডেট হয়নি। আবার চেষ্টা করো।")
    } finally {
      setSaving(false)
    }
  }

  const fieldCls =
    "w-full rounded-xl border border-slate-600 bg-[#030711] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
  const readCls =
    "rounded-xl border border-slate-700/80 bg-[#030711] px-4 py-3 text-sm text-white"

  return (
    <div className="min-h-screen bg-[#030711] px-3 py-5 font-sans text-[#f7f7ff] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-900/50 to-slate-950 shadow-[0_0_25px_rgba(223,50,206,.25)]">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <Link
                href="/dashboard/admin"
                className="mb-0.5 inline-flex items-center gap-1 rounded-md border border-slate-600/80 bg-[#080d1b] px-2 py-0.5 text-[10px] text-slate-400 hover:text-pink-300"
              >
                ← Admin Dashboard
              </Link>
              <h1 className="text-[clamp(1.35rem,2.5vw,1.9rem)] font-extrabold tracking-tight">
                আমার{" "}
                <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  প্রোফাইল
                </span>
              </h1>
              <p className="text-sm text-slate-400">⚙️ অ্যাডমিন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (editing ? void handleSave() : setEditing(true))}
            disabled={saving}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50 ${
              editing
                ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-[0_8px_24px_rgba(168,85,247,.3)]"
                : "border border-slate-600/80 bg-[#080d1b] text-slate-300 hover:border-fuchsia-500/40"
            }`}
          >
            {saving ? "⏳ সংরক্ষণ…" : editing ? "✅ সংরক্ষণ" : "✏️ সম্পাদনা"}
          </button>
        </header>

        <AnimatePresence>
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              ✅ {success}
            </motion.div>
          ) : null}
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              <span>⚠️ {error}</span>
              <button type="button" onClick={() => setError("")}>
                ✕
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-fuchsia-500/35 bg-[#080d1b] p-6 text-center shadow-[0_0_28px_rgba(223,50,206,.08)]">
            <div className="relative mb-4 inline-block">
              <div className="mx-auto size-32 overflow-hidden rounded-full border-4 border-white/15 shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-fuchsia-500 to-violet-600 text-5xl font-black">
                    {profile?.full_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 grid size-10 place-items-center rounded-full border border-white/20 bg-[#030711]/90 text-sm hover:border-fuchsia-400/50"
              >
                {uploading ? "⚙️" : "📷"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="hidden"
              />
            </div>
            <h2 className="text-xl font-bold">{profile?.full_name || "নাম নেই"}</h2>
            <p className="mt-1 truncate text-sm text-slate-400">{profile?.email}</p>
            <span className="mt-3 inline-block rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold">
              ⚙️ অ্যাডমিন
            </span>
            <p className="mt-4 text-[11px] text-slate-500">📷 ছবি বদলাও · সর্বোচ্চ ২MB</p>

            <div className="mt-6 space-y-3 border-t border-slate-800 pt-5 text-left">
              {[
                [
                  "📅",
                  "যোগ দিয়েছেন",
                  profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("bn-BD")
                    : "N/A",
                ],
                ["📞", "ফোন", profile?.phone || "যোগ করা হয়নি"],
                ["📍", "ঠিকানা", profile?.address || "যোগ করা হয়নি"],
              ].map(([icon, label, val]) => (
                <div key={String(label)} className="flex gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg border border-slate-700 bg-[#030711] text-sm">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500">{label}</p>
                    <p className="text-sm text-slate-200">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/admin/curriculum"
                className="rounded-lg border border-slate-600/80 bg-[#030711] px-2 py-2 text-[11px] font-semibold text-slate-300 hover:border-fuchsia-500/40"
              >
                Curriculum
              </Link>
              <Link
                href="/dashboard/admin/readiness"
                className="rounded-lg border border-slate-600/80 bg-[#030711] px-2 py-2 text-[11px] font-semibold text-slate-300 hover:border-cyan-500/40"
              >
                Readiness
              </Link>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-700/80 bg-[#080d1b] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-bold">ব্যক্তিগত তথ্য</h3>
                {editing ? (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                    সম্পাদনা মোড
                  </span>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">
                    পূর্ণ নাম
                  </label>
                  {editing ? (
                    <input
                      className={fieldCls}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    />
                  ) : (
                    <p className={readCls}>{form.full_name || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">
                    ইমেইল
                  </label>
                  <p className={`${readCls} text-slate-400`}>{profile?.email}</p>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">
                    ফোন
                  </label>
                  {editing ? (
                    <input
                      className={fieldCls}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="০১XXXXXXXXX"
                    />
                  ) : (
                    <p className={readCls}>{form.phone || "যোগ করা হয়নি"}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">
                    জন্ম তারিখ
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      className={fieldCls}
                      value={form.date_of_birth}
                      onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    />
                  ) : (
                    <p className={readCls}>
                      {form.date_of_birth
                        ? new Date(form.date_of_birth).toLocaleDateString("bn-BD")
                        : "যোগ করা হয়নি"}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">
                    ঠিকানা
                  </label>
                  {editing ? (
                    <input
                      className={fieldCls}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="জেলা, উপজেলা"
                    />
                  ) : (
                    <p className={readCls}>{form.address || "যোগ করা হয়নি"}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">
                    নিজের সম্পর্কে
                  </label>
                  {editing ? (
                    <textarea
                      rows={3}
                      className={`${fieldCls} resize-none`}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  ) : (
                    <p className={`${readCls} min-h-[80px]`}>{form.bio || "কিছু লেখা হয়নি"}</p>
                  )}
                </div>
              </div>
              {editing ? (
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 rounded-xl border border-slate-600/80 bg-[#030711] py-3 text-sm text-slate-400"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {saving ? "⏳…" : "✅ সংরক্ষণ করো"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-[#080d1b] p-5 sm:p-6">
              <h3 className="mb-4 text-base font-bold">অ্যাকাউন্ট তথ্য</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  ["🔑", "User ID", profile?.id ? profile.id.slice(0, 8) + "…" : "—"],
                  ["👤", "Role", "⚙️ অ্যাডমিন"],
                  ["📊", "Status", "🟢 সক্রিয়"],
                  [
                    "📅",
                    "Joined",
                    profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("bn-BD")
                      : "N/A",
                  ],
                  ["🚀", "Platform", "Ononno"],
                  ["🏠", "Console", "Admin"],
                ].map(([icon, label, val]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-slate-700/60 bg-[#030711] p-3"
                  >
                    <p className="mb-1 text-[10px] text-slate-500">
                      {icon} {label}
                    </p>
                    <p className="truncate text-sm font-semibold">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
              <h3 className="mb-2 text-base font-bold text-rose-300">⚠️ বিপদজনক অঞ্চল</h3>
              <p className="mb-4 text-sm text-slate-400">এই কাজ সহজে ফেরানো যায় না।</p>
              <button
                type="button"
                className="rounded-xl border border-rose-500/35 bg-rose-500/15 px-4 py-2.5 text-sm font-semibold text-rose-300"
              >
                🗑️ অ্যাকাউন্ট মুছে ফেলো
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
