'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'

type Suggestion = {
  id: string
  full_name: string
  first_name: string
  avatar_url: string | null
  class_level: string | null
  reason: string
}

const CLASS_BN: Record<string, string> = {
  nursery: 'নার্সারি',
  kg: 'কেজি',
  class_1: 'ক্লাস ১',
  class_2: 'ক্লাস ২',
  class_3: 'ক্লাস ৩',
  class_4: 'ক্লাস ৪',
  class_5: 'ক্লাস ৫',
  class_6: 'ক্লাস ৬',
  class_7: 'ক্লাস ৭',
  class_8: 'ক্লাস ৮',
  class_9: 'ক্লাস ৯',
  class_10: 'ক্লাস ১০',
  class_11: 'ক্লাস ১১',
  class_12: 'ক্লাস ১২',
}

export default function RelatedChildrenSuggestions() {
  const [items, setItems] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/parent/related-suggestions', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.suggestions)) setItems(d.suggestions)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const link = async (childId: string) => {
    setLinking(childId)
    setMsg(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setMsg('লগইন নেই')
        return
      }
      const { error } = await supabase.from('parent_children').insert({
        parent_id: user.id,
        child_id: childId,
      })
      if (error) {
        setMsg(/duplicate|unique/i.test(error.message) ? 'আগেই লিংক আছে' : error.message)
        return
      }
      setItems((prev) => prev.filter((x) => x.id !== childId))
      setMsg('লিংক সফল')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'ব্যর্থ')
    } finally {
      setLinking(null)
    }
  }

  if (loading || items.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-[#0c0c1c] to-violet-500/10 p-4"
    >
      <h3 className="text-sm font-bold text-white">একই শ্রেণির সাজেশন</h3>
      <p className="mt-0.5 text-[11px] text-slate-400">
        তোমার সন্তানের ক্লাসের অন্য শিক্ষার্থী — চাইলে লিংক করে প্রগ্রেস দেখো
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{s.first_name}</p>
              <p className="text-[11px] text-slate-500">
                {CLASS_BN[s.class_level || ''] || s.class_level || '—'} · {s.reason}
              </p>
            </div>
            <button
              type="button"
              disabled={linking === s.id}
              onClick={() => void link(s.id)}
              className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-500/15 px-2.5 py-1.5 text-[11px] font-bold text-sky-200 disabled:opacity-50"
            >
              {linking === s.id ? '…' : 'লিংক'}
            </button>
          </li>
        ))}
      </ul>
      {msg && <p className="mt-2 text-xs text-slate-400">{msg}</p>}
    </motion.section>
  )
}
