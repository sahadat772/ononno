'use client'

import { useState } from 'react'
import { ADMIN_PERMISSIONS, type AdminPermission } from '@/lib/admin-access'

type Props = {
  isSuper: boolean
  onInvited?: () => void
}

export default function InviteUserPanel({ isSuper, onInvited }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    role: 'student',
    class_level: 'class_5',
    password: '',
    send_invite_email: true,
    admin_permissions: [] as AdminPermission[],
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email.trim(),
          full_name: form.full_name.trim() || undefined,
          role: form.role,
          class_level: form.role === 'student' ? form.class_level : null,
          password: form.password.trim() || undefined,
          send_invite_email: form.send_invite_email && !form.password.trim(),
          admin_permissions: form.role === 'sub_admin' ? form.admin_permissions : [],
        }),
      })
      const json = (await res.json()) as {
        error?: string
        message?: string
        temporary_password?: string | null
      }
      if (!res.ok) {
        setError(json.error || 'Invite ব্যর্থ')
        return
      }
      let msg = json.message || 'OK'
      if (json.temporary_password) {
        msg += ` · Temp password: ${json.temporary_password}`
      }
      setResult(msg)
      setForm({
        email: '',
        full_name: '',
        role: 'student',
        class_level: 'class_5',
        password: '',
        send_invite_email: true,
        admin_permissions: [],
      })
      onInvited?.()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500"
      >
        {open ? '✕ Close invite' : '+ Invite / Create user'}
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="mt-3 space-y-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4"
        >
          <p className="text-xs text-violet-200/90">
            Service role দিয়ে controlled account — public register-এ Admin নেই।
          </p>
          {(error || result) && (
            <div
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                error ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'
              }`}
            >
              {error || result}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] font-bold text-slate-300">
              Email *
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-300">
              Full name
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-300">
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="adult">Adult</option>
                <option value="sub_admin">Sub Admin</option>
                {isSuper && <option value="admin">Admin (super)</option>}
              </select>
            </label>
            {form.role === 'student' && (
              <label className="text-[11px] font-bold text-slate-300">
                Class
                <select
                  value={form.class_level}
                  onChange={(e) => setForm({ ...form, class_level: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {['nursery', 'kg', ...Array.from({ length: 12 }, (_, i) => `class_${i + 1}`)].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </label>
            )}
            <label className="text-[11px] font-bold text-slate-300 sm:col-span-2">
              Temp password (optional)
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave empty to invite by email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          {form.role === 'sub_admin' && (
            <div className="flex flex-wrap gap-2">
              {ADMIN_PERMISSIONS.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={form.admin_permissions.includes(p)}
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        admin_permissions: f.admin_permissions.includes(p)
                          ? f.admin_permissions.filter((x) => x !== p)
                          : [...f.admin_permissions, p],
                      }))
                    }
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={form.send_invite_email && !form.password}
              disabled={!!form.password}
              onChange={(e) => setForm({ ...form, send_invite_email: e.target.checked })}
            />
            Send invite email (SMTP থাকলে)
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create / Invite'}
          </button>
        </form>
      )}
    </div>
  )
}
