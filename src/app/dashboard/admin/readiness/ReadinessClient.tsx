'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Check = {
  id: string
  label: string
  ok: boolean
  detail: string
}

type Readiness = {
  phase: string
  ready: boolean
  blocking: string[]
  checks: Check[]
  counts: Record<string, number>
  env: {
    ai: string
    app_url: string | null
    sentry: boolean
    payment_mode: string
    supabase_url: boolean
    supabase_anon: boolean
    service_role: boolean
  }
  actions: Record<string, string>
  time: string
}

export default function ReadinessClient({ adminName }: { adminName: string }) {
  const [data, setData] = useState<Readiness | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null)
  const [grantMsg, setGrantMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/readiness', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Readiness load failed')
        setData(null)
        return
      }
      setData(json)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function runBackfill() {
    setBusy(true)
    setBackfillMsg(null)
    try {
      const res = await fetch('/api/admin/curriculum/backfill-contents', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) setBackfillMsg(json.error || 'Backfill failed')
      else {
        const s = json.summary
        setBackfillMsg(
          `✅ Filled ${s?.filled ?? 0} · skipped ${s?.skipped ?? 0} · failed ${s?.failed ?? 0}`,
        )
        await load()
      }
    } catch {
      setBackfillMsg('Server error')
    } finally {
      setBusy(false)
    }
  }

  async function runExpandNctb() {
    setBusy(true)
    setBackfillMsg(null)
    try {
      const res = await fetch('/api/admin/curriculum/expand-nctb', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) setBackfillMsg(json.error || 'NCTB expand failed')
      else {
        const s = json.summary
        setBackfillMsg(
          `✅ NCTB Expand · +Class ${s?.classesCreated ?? 0} · +Subject ${s?.subjectsAdded ?? 0} · +Chapter ${s?.chaptersAdded ?? 0} · +Lesson ${s?.lessonsAdded ?? 0}`,
        )
        await load()
      }
    } catch {
      setBackfillMsg('Server error')
    } finally {
      setBusy(false)
    }
  }

  const runGrantFull = async () => {
    setBusy(true)
    setGrantMsg(null)
    try {
      const res = await fetch('/api/admin/grant-full-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const j = await res.json()
      if (!res.ok) setGrantMsg(`❌ ${j.error || res.statusText}`)
      else setGrantMsg(`✅ ${j.message || 'Full access granted'}`)
    } catch (e) {
      setGrantMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060612] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#060612]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:text-white"
            >
              ← Admin
            </Link>
            <div>
              <p className="text-sm font-bold">Soft-launch readiness</p>
              <p className="text-[10px] text-gray-500">Step 6 · {adminName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 md:px-6">
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-6 md:p-8 ${
                data.ready
                  ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-[#0c0c1c] to-transparent'
                  : 'border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-[#0c0c1c] to-transparent'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{data.phase}</p>
                  <h1 className="mt-1 text-2xl font-black md:text-3xl">
                    {data.ready ? 'Ready for soft launch' : 'Action needed before soft launch'}
                  </h1>
                  <p className="mt-2 text-sm text-gray-400">
                    {data.ready
                      ? 'Core checks passed. Limited beta users চালু রাখতে পারো।'
                      : `${data.blocking.length} check(s) still blocking — নিচের list দেখো।`}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border px-4 py-3 text-center ${
                    data.ready
                      ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/15 text-amber-200'
                  }`}
                >
                  <p className="text-3xl font-black">{data.ready ? '✅' : '⚠️'}</p>
                  <p className="mt-1 text-xs font-semibold">
                    {data.checks.filter((c) => c.ok).length}/{data.checks.length} OK
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <h2 className="mb-3 text-sm font-bold">Quick actions</h2>
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard/admin/curriculum"
                  className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
                >
                  📚 Curriculum · Seed Baseline
                </Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runGrantFull()}
                  className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2.5 text-left text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20 disabled:opacity-50"
                >
                  {busy ? 'Granting…' : '🔓 Admin · Full free access (seed)'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runExpandNctb()}
                  className="rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-left text-sm font-semibold text-lime-200 hover:bg-lime-500/20 disabled:opacity-50"
                >
                  {busy ? 'Expanding…' : '📚 Expand NCTB · Class 1–8'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runBackfill()}
                  className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-left text-sm font-semibold text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
                >
                  {busy ? 'Backfilling…' : '📝 Backfill empty lesson bodies'}
                </button>
                <Link
                  href="/dashboard/admin/free-access"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
                >
                  🤲 Free access queue ({data.counts.free_pending})
                </Link>
                <Link
                  href="/dashboard/admin/subscriptions"
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/20"
                >
                  💳 Pending payments ({data.counts.payment_pending})
                </Link>
              </div>
              {backfillMsg && <p className="mt-3 text-xs text-gray-400">{backfillMsg}</p>}
              {grantMsg && <p className="mt-2 text-xs text-fuchsia-300">{grantMsg}</p>}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
