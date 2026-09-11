'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  ADMIN_PERMISSIONS,
  PERMISSION_META,
  type AdminPermission,
  normalizePermissions,
} from '@/lib/admin-access'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  class_level?: string
  is_active?: boolean
  admin_permissions?: string[] | null
}

const roleColors: Record<string, string> = {
  student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  teacher: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  parent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admin: 'bg-fuchsia-500/20 text-pink-300 border-fuchsia-500/40',
  sub_admin: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  adult: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const roleLabels: Record<string, string> = {
  student: '🎓 শিক্ষার্থী',
  teacher: '👨‍🏫 শিক্ষক',
  parent: '👨‍👩‍👧 অভিভাবক',
  admin: '⚙️ Super Admin',
  sub_admin: '🛡️ Sub Admin',
  adult: '👤 প্রাপ্তবয়স্ক',
}

const ASSIGN_ROLES = ['student', 'teacher', 'parent', 'adult', 'sub_admin'] as const

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actorRole, setActorRole] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editRole, setEditRole] = useState('student')
  const [editPerms, setEditPerms] = useState<AdminPermission[]>([])
  const [stats, setStats] = useState({
    total: 0, students: 0, teachers: 0, parents: 0, adults: 0, subAdmins: 0,
  })

  const isSuper = actorRole === 'admin'

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setActorRole(me?.role ?? null)
      }

      // Service-role API — client RLS often returns 0 other users
      const res = await fetch('/api/admin/users', { credentials: 'include' })
      const json = (await res.json()) as {
        users?: User[]
        stats?: { total: number; students: number; teachers: number; parents: number; adults: number; subAdmins: number }
        error?: string
        warning?: string | null
        detail?: string
      }

      if (!res.ok) {
        setMessage({ type: 'err', text: json.error || json.detail || 'Users load ব্যর্থ' })
        setUsers([])
        return
      }

      const list = json.users ?? []
      setUsers(list)
      if (json.stats) {
        setStats({
          total: json.stats.total ?? list.length,
          students: json.stats.students ?? 0,
          teachers: json.stats.teachers ?? 0,
          parents: json.stats.parents ?? 0,
          adults: json.stats.adults ?? 0,
          subAdmins: json.stats.subAdmins ?? 0,
        })
      } else {
        setStats({
          total: list.length,
          students: list.filter((u) => u.role === 'student').length,
          teachers: list.filter((u) => u.role === 'teacher').length,
          parents: list.filter((u) => u.role === 'parent').length,
          adults: list.filter((u) => u.role === 'adult').length,
          subAdmins: list.filter((u) => u.role === 'sub_admin').length,
        })
      }
      if (json.warning) setMessage({ type: 'err', text: json.warning })
    } catch (e) {
      setMessage({ type: 'err', text: e instanceof Error ? e.message : 'Users load ব্যর্থ' })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchUsers() }, [fetchUsers])

  const openEdit = (u: User) => {
    setSelectedUser(u)
    setEditRole(u.role === 'admin' ? 'admin' : u.role)
    setEditPerms(normalizePermissions(u.admin_permissions))
    setMessage(null)
  }

  const togglePerm = (p: AdminPermission) => {
    setEditPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  const saveRole = async () => {
    if (!selectedUser || !isSuper) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole,
          permissions: editRole === 'sub_admin' ? editPerms : [],
        }),
      })
      const json = (await res.json()) as { error?: string; message?: string }
      if (!res.ok) {
        setMessage({ type: 'err', text: json.error || 'সেভ হয়নি' })
        return
      }
      setMessage({ type: 'ok', text: json.message || 'সেভ হয়েছে' })
      await fetchUsers()
      setSelectedUser((prev) =>
        prev
          ? { ...prev, role: editRole, admin_permissions: editRole === 'sub_admin' ? editPerms : [] }
          : null,
      )
    } catch {
      setMessage({ type: 'err', text: 'নেটওয়ার্ক এরর' })
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch && (selectedRole === 'all' || u.role === selectedRole)
  })

  return (
    <div className="min-h-screen bg-[#030711] px-3 py-5 font-sans text-[#f7f7ff] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <Link href="/dashboard/admin" className="mb-2 inline-flex rounded-md border border-slate-600/80 bg-[#080d1b] px-2 py-0.5 text-[10px] text-slate-400 hover:text-pink-300">
            ← Admin Dashboard
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl border border-blue-500/50 bg-gradient-to-br from-blue-900/50 to-slate-950 text-2xl">👥</div>
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                ব্যবহারকারী <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ব্যবস্থাপনা</span>
              </h1>
              <p className="text-sm text-slate-400">মোট {stats.total} · Sub-admin {stats.subAdmins}{!isSuper && ' · Role change: Super Admin only'}</p>
            </div>
          </div>
        </header>

        {message && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === 'ok' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/40 bg-rose-500/10 text-rose-300'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[ ['মোট', stats.total, '👥'], ['শিক্ষার্থী', stats.students, '🎓'], ['শিক্ষক', stats.teachers, '👨‍🏫'], ['অভিভাবক', stats.parents, '👨‍👩‍👧'], ['Adult', stats.adults, '👤'], ['Sub Admin', stats.subAdmins, '🛡️'] ].map(([label, value, icon]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-700/70 bg-[#080d1b] p-3 text-center">
              <div className="text-xl">{icon}</div>
              <div className="text-xl font-black">{value}</div>
              <div className="text-[11px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="নাম বা ইমেইল…" className="flex-1 rounded-xl border border-slate-600 bg-[#080d1b] px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
          <div className="flex flex-wrap gap-1.5">
            {['all', 'student', 'teacher', 'parent', 'adult', 'sub_admin', 'admin'].map((role) => (
              <button key={role} type="button" onClick={() => setSelectedRole(role)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${selectedRole === role ? 'border border-blue-500/40 bg-blue-500/20 text-blue-200' : 'border border-slate-700 bg-[#080d1b] text-slate-400'}`}>
                {role === 'all' ? '🌐 সব' : roleLabels[role] || role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-slate-500">লোড…</p>
        ) : filteredUsers.length === 0 ? (
          <p className="py-12 text-center text-slate-500">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-slate-700/70 bg-[#080d1b] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold">{(user.full_name || '?').charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{user.full_name || '—'}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleColors[user.role] || 'border-slate-600 text-slate-400'}`}>{roleLabels[user.role] || user.role}</span>
                  <button type="button" onClick={() => (selectedUser?.id === user.id ? setSelectedUser(null) : openEdit(user))} className="rounded-xl border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-blue-500/40">
                    {selectedUser?.id === user.id ? 'বন্ধ' : isSuper ? 'Role / Access' : 'বিস্তারিত'}
                  </button>
                </div>

                <AnimatePresence>
                  {selectedUser?.id === user.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-4 border-t border-slate-800 pt-4">
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-xs">
                        <div className="rounded-xl border border-slate-700 bg-[#030711] p-2"><p className="text-slate-500">ID</p><p className="truncate">{user.id.slice(0, 8)}…</p></div>
                        <div className="rounded-xl border border-slate-700 bg-[#030711] p-2"><p className="text-slate-500">Joined</p><p>{new Date(user.created_at).toLocaleDateString('bn-BD')}</p></div>
                        <div className="rounded-xl border border-slate-700 bg-[#030711] p-2"><p className="text-slate-500">Class</p><p>{user.class_level || 'N/A'}</p></div>
                        <div className="rounded-xl border border-slate-700 bg-[#030711] p-2"><p className="text-slate-500">Perms</p><p className="truncate">{user.role === 'admin' ? 'সব' : (user.admin_permissions || []).join(', ') || '—'}</p></div>
                      </div>

                      {isSuper && user.role !== 'admin' && (
                        <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-4">
                          <p className="mb-3 text-sm font-bold text-orange-100">🛡️ Role ও Access</p>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {ASSIGN_ROLES.map((r) => (
                              <button key={r} type="button" onClick={() => setEditRole(r)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${editRole === r ? 'border border-orange-400/50 bg-orange-500/20 text-orange-100' : 'border border-slate-700 bg-[#030711] text-slate-400'}`}>
                                {roleLabels[r]}
                              </button>
                            ))}
                          </div>
                          {editRole === 'sub_admin' && (
                            <div className="mb-3 grid gap-2 sm:grid-cols-2">
                              {ADMIN_PERMISSIONS.map((p) => {
                                const meta = PERMISSION_META[p]
                                const on = editPerms.includes(p)
                                return (
                                  <button key={p} type="button" onClick={() => togglePerm(p)} className={`flex items-start gap-2 rounded-xl border p-3 text-left ${on ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-[#030711]'}`}>
                                    <span>{meta.icon}</span>
                                    <span className="flex-1"><span className="block text-xs font-bold">{meta.labelBn}</span><span className="block text-[10px] text-slate-500">{meta.desc}</span></span>
                                    <span className="text-xs">{on ? '✅' : '○'}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                          <button type="button" disabled={saving} onClick={() => void saveRole()} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                            {saving ? '⏳…' : '✅ Role সেভ করো'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-slate-700/70 bg-[#080d1b] p-4 text-xs text-slate-400">
          <p className="mb-1 font-bold text-slate-300">কীভাবে</p>
          <p><strong className="text-pink-300">Super Admin</strong> — সব + role assign</p>
          <p><strong className="text-orange-300">Sub Admin</strong> — শুধু permission অনুযায়ী module</p>
          <p>প্রথমবার Supabase-এ <code className="text-slate-300">20260910_sub_admin_permissions.sql</code> চালান</p>
          <p className="mt-1 text-slate-500">Vercel-এ <code className="text-slate-400">SUPABASE_SERVICE_ROLE_KEY</code> থাকতে হবে</p>
        </div>
      </div>
    </div>
  )
}
